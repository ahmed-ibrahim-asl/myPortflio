import test from "node:test";
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
    {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    },
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
  return {
    chrome,
    port: new URL(debuggerUrl).port,
  };
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
  "Security Mission completes a command journey and stays contained at every viewport",
  { timeout: 120_000 },
  async (t) => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) {
      t.skip("Chrome or Edge is required.");
      return;
    }

    const existingUrl =
      process.env.SECURITY_MISSION_TEST_URL
      ?? "http://127.0.0.1:3000/tools/security-command-builder/";
    const useExisting = await serverReady(existingUrl);
    const port = 35_000 + Math.floor(Math.random() * 3_000);
    const routeUrl = useExisting
      ? existingUrl
      : `http://127.0.0.1:${port}/tools/security-command-builder/`;
    const command = process.platform === "win32"
      ? process.env.ComSpec || "cmd.exe"
      : "npm";
    const args = process.platform === "win32"
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
    const app = useExisting
      ? null
      : spawn(command, args, {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });
    const userDataDir = mkdtempSync(
      join(tmpdir(), "security-mission-responsive-"),
    );
    let chrome;
    let client;

    try {
      if (app) await waitForServer(routeUrl, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, routeUrl);
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const loaded = client.waitForEvent("Page.loadEventFired");
      await client.send("Page.navigate", { url: routeUrl });
      await loaded;

      const journey = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const frame = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          const waitFor = async (selector) => {
            for (let attempt = 0; attempt < 120; attempt += 1) {
              const element = document.querySelector(selector);
              if (element) return element;
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            throw new Error(
              "Missing element: " + selector
              + " | current="
              + document.querySelector('[aria-current="step"]')
                ?.getAttribute("data-step-id")
              + " | panel="
              + document.querySelector(
                '[data-security-workspace-panel="configure"]'
              )?.textContent.slice(0, 240)
            );
          };
          const setValue = (input, value) => {
            const setter = Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              "value",
            ).set;
            setter.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          };

          await waitFor('[data-security-mission][data-ready="true"]');
          (await waitFor("[data-step-continue]")).click();
          await frame();
          (await waitFor(
            '[data-objective-id="host-discovery-port-scanning"]'
          )).click();
          await frame();
          const search = await waitFor("[data-tool-search]");
          setValue(search, "nmap");
          await frame();
          const resultCount = document.querySelector(
            "[data-tool-result-count]"
          )?.textContent;
          (await waitFor('[data-tool-id="nmap"]')).click();
          await frame();
          (await waitFor('[data-action-id="nmap-host-discovery"]')).click();
          await frame();
          const target = await waitFor(
            '[data-control-path="target.network"] input'
          );
          setValue(target, "10.20.30.0/24");
          await frame();
          const command = document.querySelector("[data-command-output]")
            ?.textContent.trim();
          const commandStep = document.querySelector('[aria-current="step"]')
            ?.getAttribute("data-step-id");

          document.querySelector('[data-step-id="objective"]').click();
          await frame();
          (await waitFor('[data-entry-mode="tool"]')).click();
          await frame();
          const toolFirstSearch = await waitFor("[data-tool-search]");
          setValue(toolFirstSearch, "nmap");
          await frame();
          (await waitFor('[data-tool-id="nmap"]')).click();
          await frame();
          const toolFirstStep = document.querySelector('[aria-current="step"]')
            ?.getAttribute("data-step-id");
          (await waitFor(
            '[data-objective-id="host-discovery-port-scanning"]'
          )).click();
          await frame();
          const toolFirstActionStep = document.querySelector(
            '[aria-current="step"]'
          )?.getAttribute("data-step-id");

          document.querySelector('[data-step-id="objective"]').click();
          await frame();
          (await waitFor('[data-entry-mode="workflow"]')).click();
          await frame();
          const workflowSearch = await waitFor("[data-workflow-search]");
          setValue(workflowSearch, "host discovery");
          await frame();
          const workflowResultCount = document.querySelector(
            "[data-workflow-result-count]"
          )?.textContent;
          (await waitFor('[data-workflow-id="host-discovery"]')).click();
          await frame();

          return {
            command,
            resultCount,
            step: commandStep,
            toolFirstStep,
            toolFirstActionStep,
            workflowResultCount,
            workflowStep: document.querySelector('[aria-current="step"]')
              ?.getAttribute("data-step-id"),
            workflowCommands: document.querySelectorAll(
              '[data-security-workspace-panel="command"] ol > li'
            ).length,
            activeWorkflowStep: document.querySelector(
              '[role="tab"][data-active="true"]'
            )?.textContent,
            errorBoundary: Boolean(document.querySelector(
              "[data-error-boundary]"
            )),
          };
        })()`,
      });
      assert.equal(
        journey.exceptionDetails,
        undefined,
        JSON.stringify(journey.exceptionDetails),
      );
      assert.match(
        journey.result.value.command,
        /nmap -sn '10\.20\.30\.0\/24'/,
      );
      assert.match(journey.result.value.resultCount, /1 tool/i);
      assert.equal(journey.result.value.step, "target");
      assert.equal(journey.result.value.toolFirstStep, "objective");
      assert.equal(journey.result.value.toolFirstActionStep, "action");
      assert.match(journey.result.value.workflowResultCount, /\d+ workflows?/i);
      assert.equal(journey.result.value.workflowStep, "target");
      assert.equal(journey.result.value.workflowCommands, 2);
      assert.match(
        journey.result.value.activeWorkflowStep,
        /nmap host discovery/i,
      );
      assert.equal(journey.result.value.errorBoundary, false);

      for (const viewport of [
        { width: 320, height: 700 },
        { width: 360, height: 800 },
        { width: 390, height: 844 },
        { width: 768, height: 1024 },
        { width: 900, height: 900 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
      ]) {
        await client.send("Emulation.setDeviceMetricsOverride", {
          ...viewport,
          deviceScaleFactor: 1,
          mobile: viewport.width < 600,
        });
        const measured = await client.send("Runtime.evaluate", {
          awaitPromise: true,
          returnByValue: true,
          expression: `(async () => {
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            const visible = (element) =>
              element
              && element.getClientRects().length > 0
              && getComputedStyle(element).display !== "none";
            const root = document.querySelector("[data-security-mission]");
            const panels = [...document.querySelectorAll(
              "[data-security-workspace-panel]"
            )].filter(visible);
            const gradientElements = root
              ? [root, ...root.querySelectorAll("*")].filter((element) =>
                  getComputedStyle(element).backgroundImage.includes("gradient"))
              : [];
            const controls = root
              ? [...root.querySelectorAll(
                  "input, select, button:not([data-step-id]):not([data-workflow-step])"
                )].filter(visible)
              : [];
            const railRect = document.querySelector(
              'nav[aria-label="Security Mission progress"]'
            )?.getBoundingClientRect();
            const workflowRailRect = document.querySelector(
              "[data-workflow-step-rail]"
            )?.getBoundingClientRect();
            const overflowingControls = controls
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                  label: element.getAttribute("aria-label")
                    || element.textContent?.trim().slice(0, 60)
                    || element.getAttribute("data-step-id")
                    || element.tagName,
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                };
              })
              .filter((rect) =>
                rect.left < -1
                || rect.right > document.documentElement.clientWidth + 1
              )
              .slice(0, 8);
            return {
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              visiblePanels: panels.length,
              gradients: gradientElements.length,
              controlsContained: overflowingControls.length === 0,
              overflowingControls,
              railContained: !railRect
                || (
                  railRect.left >= -1
                  && railRect.right
                    <= document.documentElement.clientWidth + 1
                ),
              workflowRailContained: !workflowRailRect
                || (
                  workflowRailRect.left >= -1
                  && workflowRailRect.right
                    <= document.documentElement.clientWidth + 1
                ),
            };
          })()`,
        });
        const layout = measured.result.value;
        assert.equal(
          layout.documentWidth,
          layout.viewportWidth,
          `no page overflow at ${viewport.width}px`,
        );
        assert.equal(
          layout.visiblePanels,
          viewport.width < 960 ? 1 : 2,
          `workspace panel count at ${viewport.width}px`,
        );
        assert.equal(layout.gradients, 0, `no gradients at ${viewport.width}px`);
        assert.equal(
          layout.railContained,
          true,
          `step rail contained at ${viewport.width}px`,
        );
        assert.equal(
          layout.workflowRailContained,
          true,
          `workflow rail contained at ${viewport.width}px`,
        );
        assert.equal(
          layout.controlsContained,
          true,
          `controls contained at ${viewport.width}px: ${
            JSON.stringify(layout.overflowingControls)
          }`,
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
