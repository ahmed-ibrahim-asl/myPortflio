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
  "AI generator remains contained and scrollable at all required viewports",
  { timeout: 90_000 },
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

    const viewports = [
      { width: 320, height: 700 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 900, height: 900 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    try {
      if (app) await waitForServer(routeUrl, app);
      const chromeSession = await startChrome(chromePath, userDataDir);
      chrome = chromeSession.chrome;
      client = await createPageClient(chromeSession.debuggerPort, routeUrl);

      await client.send("Page.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const loaded = client.waitForEvent("Page.loadEventFired");
      await client.send("Page.navigate", { url: routeUrl });
      await loaded;

      const configured = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          for (let attempt = 0; attempt < 60; attempt += 1) {
            if (document.querySelector('.ml-generator-config-panel select[name="templateId"]')) break;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          for (let attempt = 0; attempt < 60; attempt += 1) {
            if (document.querySelector('.ml-generator-code-panel[data-load-state="ready"]')) break;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          if (!document.querySelector('.ml-generator-code-panel[data-load-state="ready"]')) {
            throw new Error("Generator recipe did not reach the ready state.");
          }

          const choose = async (name, value) => {
            let select;
            let option;
            for (let attempt = 0; attempt < 40; attempt += 1) {
              select = document.querySelector('.ml-generator-config-panel select[name="' + name + '"]');
              option = select && [...select.options].find((item) => item.value === value);
              if (select && option) break;
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (!select) throw new Error("Missing select after render wait: " + name);
            if (!option) throw new Error("Missing option " + value + " for " + name);
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            await pause();
          };

          const type = async (name, value) => {
            const input = document.querySelector('.ml-generator-config-panel input[name="' + name + '"]');
            if (!input) throw new Error("Missing input: " + name);
            const setter = Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              "value",
            ).set;
            setter.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            await pause();
          };

          const setMode = async (label) => {
            for (let attempt = 0; attempt < 40; attempt += 1) {
              const button = [...document.querySelectorAll(".ml-generator-mode button")]
                .find((item) => item.textContent.trim() === label);
              if (button?.getAttribute("aria-pressed") === "true") return;
              button?.click();
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            throw new Error("Mode did not become active: " + label);
          };

          await choose("templateId", "yolo-detection-training");
          await setMode("Production-oriented");
          await choose("task", "train-export");
          await choose("modelSize", "extra-large");
          await choose("environment", "raspberry-pi");
          await choose("imageSize", "1280");
          await choose("exportFormat", "openvino");
          await type("runName", "extra_large_raspberry_pi_detection_export");
          await type(
            "projectDirectory",
            "./artifacts/field_deployment/raspberry_pi/object_detection/production_runs",
          );
          return true;
        })()`,
      });
      assert.equal(
        configured.exceptionDetails,
        undefined,
        `configuration script should not throw: ${JSON.stringify(configured.exceptionDetails)}`,
      );
      assert.equal(configured.result.value, true, "long-value configuration should apply");

      const semanticsEvaluation = await client.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `({
          page: Boolean(document.querySelector(".ml-generator-page")),
          config: Boolean(document.querySelector(".ml-generator-config-panel")),
          output: Boolean(document.querySelector(".ml-generator-output-panel")),
          loadState: document.querySelector(".ml-generator-code-panel")
            ?.getAttribute("data-load-state") ?? null,
          runtimeLabel: [...document.querySelectorAll("label")]
            .some((label) => label.textContent.includes("Runtime target"))
        })`,
      });
      assert.deepEqual(
        semanticsEvaluation.result.value,
        {
          page: true,
          config: true,
          output: true,
          loadState: "ready",
          runtimeLabel: true,
        },
      );

      for (const viewport of viewports) {
        await client.send("Emulation.setDeviceMetricsOverride", {
          ...viewport,
          deviceScaleFactor: 1,
          mobile: viewport.width < 600,
        });

        const evaluation = await client.send("Runtime.evaluate", {
          awaitPromise: true,
          returnByValue: true,
          expression: `(async () => {
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            const panel = document.querySelector(".ml-generator-config-panel");
            const output = document.querySelector(".ml-generator-output-panel");
            const code = document.querySelector(".ml-generator-code");
            const panelRect = panel?.getBoundingClientRect();
            const outputRect = output?.getBoundingClientRect();
            const controls = panel
              ? [...panel.querySelectorAll("input, select, button")]
                .filter((control) => control.getClientRects().length > 0)
                .map((control) => {
                  const rect = control.getBoundingClientRect();
                  return {
                    name: control.getAttribute("name") || control.textContent.trim(),
                    left: rect.left,
                    right: rect.right,
                    width: rect.width,
                  };
                })
              : [];
            const codeStyle = code ? getComputedStyle(code) : null;
            return {
              panel: panelRect && {
                left: panelRect.left,
                right: panelRect.right,
                width: panelRect.width,
              },
              output: outputRect && {
                left: outputRect.left,
                right: outputRect.right,
                width: outputRect.width,
              },
              controls,
              code: code && {
                clientWidth: code.clientWidth,
                scrollWidth: code.scrollWidth,
                overflowX: codeStyle.overflowX,
                whiteSpace: codeStyle.whiteSpace,
              },
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
            };
          })()`,
        });
        const layout = evaluation.result.value;
        const context = `${viewport.width}x${viewport.height}: ${JSON.stringify(layout)}`;

        assert.ok(layout.panel, `configuration panel should render at ${context}`);
        assert.ok(layout.output, `output panel should render at ${context}`);
        assert.ok(layout.controls.length > 0, `configuration controls should render at ${context}`);
        assert.equal(
          layout.documentWidth,
          layout.viewportWidth,
          `page should not create horizontal overflow at ${context}`,
        );
        for (const control of layout.controls) {
          assert.ok(
            control.left >= layout.panel.left - 1 &&
              control.right <= layout.panel.right + 1,
            `control should remain inside the configuration panel at ${context}`,
          );
        }
        assert.ok(layout.code, `generated code should render at ${context}`);
        assert.ok(
          ["auto", "scroll"].includes(layout.code.overflowX),
          `code should own horizontal scrolling at ${context}`,
        );
        assert.equal(layout.code.whiteSpace, "pre", `code should not wrap at ${context}`);
        assert.ok(
          layout.code.scrollWidth >= layout.code.clientWidth,
          `code viewport should contain its long lines at ${context}`,
        );
      }
    } finally {
      client?.socket.close();
      stopProcessTree(chrome);
      stopProcessTree(app);
      await delay(250);
      rmSync(userDataDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 100,
      });
    }
  },
);
