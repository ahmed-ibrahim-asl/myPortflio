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
  "Model Mission stays contained and preserves one project across responsive tabs",
  { timeout: 120_000 },
  async (t) => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) {
      t.skip("Chrome or Edge is required.");
      return;
    }

    const existingUrl =
      process.env.AI_GENERATOR_TEST_URL
      ?? "http://127.0.0.1:3000/tools/ai-script-generator/";
    const useExisting = await serverReady(existingUrl);
    const port = 31_000 + Math.floor(Math.random() * 4_000);
    const routeUrl = useExisting
      ? existingUrl
      : `http://127.0.0.1:${port}/tools/ai-script-generator/`;
    const testUrl = new URL(routeUrl);
    testUrl.searchParams.set("recipeLoadDelay", "200");
    testUrl.searchParams.set(
      "recipeLoadFailOnce",
      "edge-image-classification",
    );
    const command =
      process.platform === "win32"
        ? process.env.ComSpec || "cmd.exe"
        : "npm";
    const args =
      process.platform === "win32"
        ? [
            "/d", "/s", "/c", "npm.cmd", "run", "dev", "--",
            "--hostname", "127.0.0.1", "--port", String(port),
          ]
        : [
            "run", "dev", "--", "--hostname", "127.0.0.1",
            "--port", String(port),
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
      join(tmpdir(), "model-mission-responsive-"),
    );
    let chrome;
    let client;

    try {
      if (app) await waitForServer(routeUrl, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, testUrl.toString());
      await client.send("Page.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const loaded = client.waitForEvent("Page.loadEventFired");
      await client.send("Page.navigate", { url: testUrl.toString() });
      await loaded;
      const ready = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          for (let attempt = 0; attempt < 100; attempt += 1) {
            if (
              document.querySelector("[data-model-mission]")
              && document.querySelector(
                '[data-mission-code-panel][data-load-state="ready"]'
              )
            ) return true;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          throw new Error("Model Mission did not reach ready state.");
        })()`,
      });
      assert.equal(ready.exceptionDetails, undefined);
      await delay(500);

      const configured = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            setTimeout(resolve, 100)
          );
          const tasks = [...document.querySelectorAll("[data-mission-task]")]
            .map((item) => item.getAttribute("data-mission-task"));
          document.querySelector('[data-mission-task="regression"]').click();
          await pause();
          [...document.querySelectorAll("[data-mission-workflow] button")]
            .find((item) => item.textContent.includes("Model")).click();
          await pause();
          document.querySelector('[data-model-id="random-forest"]').click();
          await pause();
          return {
            tasks,
            selectedTask: document.querySelector(
              '[data-mission-task][aria-pressed="true"]'
            )?.getAttribute("data-mission-task"),
            selectedModel: document.querySelector(
              '[data-model-id][aria-pressed="true"]'
            )?.getAttribute("data-model-id"),
            hasRegressor: document.querySelector(
              "[data-mission-code-panel] pre"
            )?.textContent.includes("RandomForestRegressor"),
          };
        })()`,
      });
      assert.equal(
        configured.exceptionDetails,
        undefined,
        JSON.stringify(configured.exceptionDetails),
      );
      assert.deepEqual(configured.result.value, {
        tasks: [
          "classification",
          "regression",
          "sensor-classification",
          "image-classification",
          "object-detection",
          "instance-segmentation",
          "neural-network",
        ],
        selectedModel: "random-forest",
        hasRegressor: true,
      });

      for (const viewport of [
        { width: 320, height: 700 },
        { width: 360, height: 760 },
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
              element && element.getClientRects().length > 0
              && getComputedStyle(element).display !== "none";
            const root = document.querySelector("[data-model-mission]");
            const shell = root.firstElementChild;
            const config = document.querySelector(
              "[data-mission-config-panel]"
            );
            const codePanel = document.querySelector(
              "[data-mission-code-panel]"
            );
            const code = codePanel?.querySelector("pre");
            const rail = document.querySelector(".mission-rail");
            const rect = (element) => {
              const box = element.getBoundingClientRect();
              return {
                left: box.left, right: box.right,
                top: box.top, bottom: box.bottom,
              };
            };
            const overlaps = (first, second) =>
              first.left < second.right
              && first.right > second.left
              && first.top < second.bottom
              && first.bottom > second.top;
            const configRect = visible(config) ? rect(config) : null;
            const codeRect = visible(codePanel) ? rect(codePanel) : null;
            const shellRect = rect(shell);
            const railRect = visible(rail) ? rect(rail) : null;
            const controls = visible(config)
              ? [...config.querySelectorAll("input, select, button")]
                .filter(visible)
                .map((control) => rect(control))
              : [];
            const codeStyle = code ? getComputedStyle(code) : null;
            return {
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              visiblePanels: [config, codePanel].filter(visible).length,
              configRect,
              codeRect,
              shellRailOverlap:
                railRect ? overlaps(shellRect, railRect) : false,
              panelOverlap:
                configRect && codeRect
                  ? overlaps(configRect, codeRect)
                  : false,
              controlsInside: controls.every((control) =>
                control.left >= configRect.left - 1
                && control.right <= configRect.right + 1
              ),
              code: code && {
                overflowX: codeStyle.overflowX,
                whiteSpace: codeStyle.whiteSpace,
              },
            };
          })()`,
        });
        const layout = measured.result.value;
        const context =
          `${viewport.width}x${viewport.height}: ${JSON.stringify(layout)}`;
        assert.equal(
          layout.documentWidth,
          layout.viewportWidth,
          `no page overflow at ${context}`,
        );
        assert.equal(
          layout.visiblePanels,
          viewport.width <= 960 ? 1 : 2,
          `correct responsive workspace at ${context}`,
        );
        assert.equal(
          layout.panelOverlap,
          false,
          `workspace panels do not overlap at ${context}`,
        );
        assert.equal(
          layout.shellRailOverlap,
          false,
          `global mission rail does not cover the builder at ${context}`,
        );
        assert.equal(
          layout.controlsInside,
          true,
          `controls remain contained at ${context}`,
        );
        assert.deepEqual(
          layout.code,
          { overflowX: "auto", whiteSpace: "pre" },
          `code owns horizontal scrolling at ${context}`,
        );
      }

      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      const tabs = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          const buttons = [...document.querySelectorAll(
            "[data-mission-mobile-tabs] button"
          )];
          buttons.find((button) => button.textContent.trim() === "Code").click();
          await pause();
          const codeVisible = document.querySelector(
            "[data-mission-code-panel]"
          ).getClientRects().length > 0;
          buttons.find(
            (button) => button.textContent.trim() === "Configure"
          ).click();
          await pause();
          return {
            codeVisible,
            model: document.querySelector(
              '[data-model-id][aria-pressed="true"]'
            )?.getAttribute("data-model-id"),
            hasRegressor: document.querySelector(
              "[data-mission-code-panel] pre"
            )?.textContent.includes("RandomForestRegressor"),
          };
        })()`,
      });
      assert.deepEqual(tabs.result.value, {
        codeVisible: true,
        model: "random-forest",
        hasRegressor: true,
      });

      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1024,
        height: 768,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const legacyRecovery = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const waitFor = async (selector, predicate = () => true) => {
            for (let attempt = 0; attempt < 100; attempt += 1) {
              const element = document.querySelector(selector);
              if (element && predicate(element)) return element;
              await new Promise((resolve) => setTimeout(resolve, 35));
            }
            throw new Error("Timed out waiting for " + selector);
          };
          const goToGoal = async () => {
            [...document.querySelectorAll("[data-mission-workflow] button")]
              .find((button) => button.textContent.includes("Goal")).click();
            await waitFor("[data-mission-task]");
          };
          const chooseTask = async (taskId) => {
            await goToGoal();
            document.querySelector(
              '[data-mission-task="' + taskId + '"]'
            ).click();
          };
          await chooseTask("object-detection");
          await chooseTask("sensor-classification");
          await chooseTask("object-detection");
          const yoloPanel = await waitFor(
            '[data-mission-code-panel][data-load-state="ready"]',
            (panel) => panel.textContent.includes("train_yolo_detection.py")
          );
          const yoloReady = yoloPanel.textContent.includes(
            "train_yolo_detection.py"
          );

          await chooseTask("image-classification");
          const failed = await waitFor(
            '[data-mission-code-panel][data-load-state="error"]'
          );
          const friendlyError =
            failed.textContent.includes("did not load")
            && !/ChunkLoadError|dynamic import/i.test(failed.textContent);
          [...failed.querySelectorAll("button")]
            .find((button) => button.textContent.includes("Retry"))
            .click();
          const recovered = await waitFor(
            '[data-mission-code-panel][data-load-state="ready"]',
            (panel) => panel.textContent.includes(
              "train_edge_image_classifier.py"
            )
          );
          return {
            yoloReady,
            friendlyError,
            recovered: recovered.textContent.includes(
              "train_edge_image_classifier.py"
            ),
          };
        })()`,
      });
      assert.equal(
        legacyRecovery.exceptionDetails,
        undefined,
        JSON.stringify(legacyRecovery.exceptionDetails),
      );
      assert.deepEqual(legacyRecovery.result.value, {
        yoloReady: true,
        friendlyError: true,
        recovered: true,
      });
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
