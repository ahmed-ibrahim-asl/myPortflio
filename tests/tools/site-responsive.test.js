import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Sitewide horizontal-overflow check across every real route, at the four breakpoints the
// archived design-system checklist (design-system/ahmed-asl-portfolio/MASTER.md) already
// specifies but nothing ever ran: 375 (mobile), 768 (tablet), 1024 (small desktop), 1440
// (desktop). This complements the per-tool responsive tests (which drive full interaction
// journeys on one tool each) by covering breadth across the whole site in one pass.

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const VIEWPORTS = [
  { width: 375, height: 812, label: "375 (mobile)" },
  { width: 768, height: 1024, label: "768 (tablet)" },
  { width: 1024, height: 800, label: "1024 (small desktop)" },
  { width: 1440, height: 900, label: "1440 (desktop)" },
];

const ROUTES = [
  "/",
  "/work/",
  "/about/",
  "/writing/",
  "/writing/welcome-to-field-notes/",
  "/contact/",
  "/tools/",
  "/tools/battery-estimator/",
  "/tools/pid-simulator/",
  "/tools/sensor-code-generator/",
  "/tools/ai-script-generator/",
  "/tools/security-command-builder/",
];

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
  } else {
    child.kill("SIGTERM");
  }
}

async function serverReady(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before startup (${child.exitCode}).`);
    }
    if (await serverReady(url)) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
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
    { stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
  );
  const debuggerUrl = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(
      () => reject(new Error(`Chrome did not start.\n${output}`)),
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
      reject(new Error(`Chrome exited during startup (${code}).`));
    });
  });
  return { chrome, port: new URL(debuggerUrl).port };
}

async function createClient(port, url) {
  const response = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" },
  );
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handlers.reject(new Error(message.error.message));
      else handlers.resolve(message.result);
      return;
    }
    const waiters = events.get(message.method);
    if (waiters) {
      events.delete(message.method);
      waiters.forEach((resolve) => resolve(message.params));
    }
  });

  const send = (method, params = {}) => {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  };
  const waitForEvent = (method) => new Promise((resolve) => {
    const waiters = events.get(method) ?? [];
    waiters.push(resolve);
    events.set(method, waiters);
  });

  return { socket, send, waitForEvent };
}

test(
  "every route stays free of horizontal overflow at 375/768/1024/1440",
  { timeout: 180_000 },
  async (t) => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) {
      t.skip("Chrome or Edge is required for the sitewide responsive sweep.");
      return;
    }

    const existingRoot = process.env.SITE_RESPONSIVE_BASE_URL ?? "http://127.0.0.1:3000";
    const useExisting = await serverReady(`${existingRoot}/`);
    const port = 32_000 + Math.floor(Math.random() * 3_000);
    const baseUrl = useExisting ? existingRoot : `http://127.0.0.1:${port}`;

    const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
    const args = process.platform === "win32"
      ? ["/d", "/s", "/c", "npm.cmd", "run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)]
      : ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)];
    const app = useExisting
      ? null
      : spawn(command, args, {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });

    const userDataDir = mkdtempSync(join(tmpdir(), "site-responsive-"));
    let chrome;
    let client;
    const failures = [];

    try {
      if (app) await waitForServer(`${baseUrl}/`, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, "about:blank");
      await client.send("Page.enable");
      await client.send("Runtime.enable");

      for (const route of ROUTES) {
        for (const viewport of VIEWPORTS) {
          await client.send("Emulation.setDeviceMetricsOverride", {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: viewport.width < 500,
          });
          const loaded = client.waitForEvent("Page.loadEventFired");
          await client.send("Page.navigate", { url: `${baseUrl}${route}` });
          await loaded;

          const result = await client.send("Runtime.evaluate", {
            awaitPromise: true,
            returnByValue: true,
            expression: `(async () => {
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
              );
              const doc = document.documentElement;
              const overflowPx = doc.scrollWidth - doc.clientWidth;
              let worstSelector = null;
              let worstRight = doc.clientWidth;
              if (overflowPx > 1) {
                const all = document.querySelectorAll("body *");
                for (const el of all) {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > worstRight + 1 && rect.width > 0) {
                    worstRight = rect.right;
                    worstSelector = el.tagName.toLowerCase()
                      + (el.className && typeof el.className === "string"
                        ? "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".")
                        : "");
                  }
                }
              }
              return { overflowPx, clientWidth: doc.clientWidth, worstSelector, worstRight };
            })()`,
          });

          const { overflowPx, worstSelector, worstRight } = result.result.value;
          if (overflowPx > 1) {
            failures.push(
              `${route} @ ${viewport.label}: overflows by ${overflowPx.toFixed(0)}px`
              + (worstSelector ? ` (worst offender: ${worstSelector}, right edge ${worstRight.toFixed(0)}px)` : ""),
            );
          }
        }
      }
    } finally {
      if (client?.socket) client.socket.close();
      if (chrome) stopProcessTree(chrome);
      if (app) stopProcessTree(app);
    }

    assert.deepStrictEqual(
      failures,
      [],
      `horizontal overflow found:\n${failures.join("\n")}`,
    );
  },
);
