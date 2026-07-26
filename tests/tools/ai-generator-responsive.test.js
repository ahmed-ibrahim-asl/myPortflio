import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  child.kill("SIGTERM");
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 45_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before the test route was ready (${child.exitCode}).`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The dev server has not opened its socket yet.
    }

    await delay(200);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function serverIsReady(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function startChrome(chromePath, userDataDir) {
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-gpu",
      "--no-first-run",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    },
  );

  const browserDebuggerUrl = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(
      () => reject(new Error(`Chrome did not expose a debugging endpoint.\n${output}`)),
      15_000,
    );

    chrome.stderr.on("data", (chunk) => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/);

      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });

    chrome.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited before startup (${code}).\n${output}`));
    });
  });

  const debuggerPort = new URL(browserDebuggerUrl).port;
  return { chrome, debuggerPort };
}

async function createPageClient(debuggerPort, pageUrl) {
  const targetResponse = await fetch(
    `http://127.0.0.1:${debuggerPort}/json/new?${encodeURIComponent(pageUrl)}`,
    { method: "PUT" },
  );
  const target = await targetResponse.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const eventWaiters = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }

    const waiters = eventWaiters.get(message.method);
    if (waiters?.length) {
      eventWaiters.delete(message.method);
      waiters.forEach((resolve) => resolve(message.params));
    }
  });

  function send(method, params = {}) {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  function waitForEvent(method) {
    return new Promise((resolve) => {
      const waiters = eventWaiters.get(method) ?? [];
      waiters.push(resolve);
      eventWaiters.set(method, waiters);
    });
  }

  return { socket, send, waitForEvent };
}

test(
  "AI generator controls stay inside their panel at the reported scaled viewport size",
  { timeout: 70_000 },
  async (t) => {
    const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
    if (!chromePath) {
      t.skip("Chrome or Edge is required for the responsive layout regression.");
      return;
    }

    const existingRouteUrl =
      process.env.AI_GENERATOR_TEST_URL ??
      "http://127.0.0.1:3000/tools/ai-script-generator/";
    const useExistingServer = await serverIsReady(existingRouteUrl);
    const port = 31_000 + Math.floor(Math.random() * 4_000);
    const routeUrl = useExistingServer
      ? existingRouteUrl
      : `http://127.0.0.1:${port}/tools/ai-script-generator/`;
    const appCommand =
      process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
    const appArguments =
      process.platform === "win32"
        ? [
            "/d",
            "/s",
            "/c",
            "npm.cmd",
            "run",
            "dev",
            "--",
            "--hostname",
            "127.0.0.1",
            "--port",
            String(port),
          ]
        : [
            "run",
            "dev",
            "--",
            "--hostname",
            "127.0.0.1",
            "--port",
            String(port),
          ];
    const app = useExistingServer
      ? null
      : spawn(appCommand, appArguments, {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });
    const userDataDir = mkdtempSync(join(tmpdir(), "ai-generator-responsive-"));
    let chrome;
    let client;

    try {
      if (app) await waitForServer(routeUrl, app);
      const chromeSession = await startChrome(chromePath, userDataDir);
      chrome = chromeSession.chrome;
      client = await createPageClient(chromeSession.debuggerPort, routeUrl);

      await client.send("Page.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 900,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false,
      });

      const loaded = client.waitForEvent("Page.loadEventFired");
      await client.send("Page.navigate", { url: routeUrl });
      await loaded;

      const semanticsEvaluation = await client.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `({
          page: Boolean(document.querySelector(".ml-generator-page")),
          config: Boolean(document.querySelector(".ml-generator-config-panel")),
          output: Boolean(document.querySelector(".ml-generator-output-panel")),
          runtimeLabel: [...document.querySelectorAll("label")]
            .some((label) => label.textContent.includes("Runtime target"))
        })`,
      });
      const semantics = semanticsEvaluation.result.value;
      assert.equal(semantics.page, true, "generator page landmark should render");
      assert.equal(semantics.config, true, "generator configuration panel should render");
      assert.equal(semantics.output, true, "generator output panel should render");
      assert.equal(semantics.runtimeLabel, true, "runtime target label should render");

      const evaluation = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const choose = async (name, value) => {
            const select = document.querySelector('select[name="' + name + '"]');
            if (!select) throw new Error("Missing select: " + name);
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 0));
          };

          for (let attempt = 0; attempt < 40; attempt += 1) {
            const panelWidth = document
              .querySelector(".tool-controls")
              ?.getBoundingClientRect().width;
            if (panelWidth > 0) break;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          await choose("task", "object_detection");
          await choose("environment", "colab");
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );

          const controls = document.querySelector(".tool-controls")?.getBoundingClientRect();
          const results = document.querySelector(".tool-grid > :nth-child(2)")?.getBoundingClientRect();
          const selects = [...document.querySelectorAll(".tool-controls select")].map((select) => {
            const rect = select.getBoundingClientRect();
            return { left: rect.left, right: rect.right, width: rect.width };
          });

          return {
            controls: controls && { left: controls.left, right: controls.right, width: controls.width },
            results: results && { left: results.left, right: results.right, width: results.width },
            selects,
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: document.documentElement.scrollWidth
          };
        })()`,
      });
      const layout = evaluation.result.value;

      assert.ok(layout.controls, "configuration panel should render");
      assert.ok(layout.results, "result column should render");
      assert.ok(layout.selects.length > 0, "configuration selects should render");
      assert.equal(
        layout.documentWidth,
        layout.viewportWidth,
        `page should not create horizontal overflow: ${JSON.stringify(layout)}`,
      );

      for (const select of layout.selects) {
        assert.ok(
          select.right <= layout.controls.right + 1,
          `select should remain inside the configuration panel: ${JSON.stringify(layout)}`,
        );
      }
    } finally {
      client?.socket.close();
      stopProcessTree(chrome);
      stopProcessTree(app);
      await delay(250);
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  },
);
