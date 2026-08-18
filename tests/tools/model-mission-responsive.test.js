import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const EXPECTED_MISSION_PROJECT_PATHS = [
  ".gitignore",
  "README.md",
  "data/README.md",
  "model_mission.json",
  "requirements.txt",
  "src/predict.py",
  "src/train.py",
  "tests/test_generated_project.py",
];
const AUDIT_EVIDENCE_ENABLED =
  process.env.MODEL_MISSION_AUDIT_EVIDENCE === "1";

function assertExactMissionProjectPaths(entries) {
  assert.deepEqual(
    entries.map(({ name }) => name).sort(),
    EXPECTED_MISSION_PROJECT_PATHS,
  );
}

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

test("archive path assertion rejects an unexpected eighth entry", () => {
  const tamperedEntries = [
    ".gitignore",
    "README.md",
    "model_mission.json",
    "requirements.txt",
    "src/predict.py",
    "src/train.py",
    "tests/test_generated_project.py",
    "unexpected.txt",
  ].map((name) => ({ name }));

  assert.throws(
    () => assertExactMissionProjectPaths(tamperedEntries),
    (error) =>
      error instanceof assert.AssertionError
      && /data\/README\.md/u.test(error.message)
      && /unexpected\.txt/u.test(error.message),
  );
});

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
    const auditEvidence = {
      schemaVersion: 1,
      widths: [],
      contracts: {
        advancedExceedsCustomize: false,
        downloadsAreLocalAndComplete: false,
        explanationsContained: false,
        hiddenValuesPreserved: false,
        mobileTabsPreserveState: false,
        noComputedGradients: false,
      },
    };

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
            const panel = document.querySelector(
              "[data-mission-code-panel]"
            );
            if (
              document.querySelector("[data-model-mission]")
              && panel?.getAttribute("data-load-state") === "ready"
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
          const objectDetectionCard = document.querySelector(
            '[data-mission-task="object-detection"]'
          );
          const missionTaskCards = [...document.querySelectorAll(
            "[data-mission-task]"
          )];
          const taskBodyFont = parseFloat(getComputedStyle(
            objectDetectionCard.querySelector("p")
          ).fontSize);
          const maxTaskHeight = Math.max(...missionTaskCards.map(
            (item) => item.getBoundingClientRect().height
          ));
          const repeatedTaskExamples = document.querySelectorAll(
            "[data-mission-task-examples]"
          ).length;
          const initialSelectedDetail = document.querySelector(
            "[data-selected-task-detail]"
          );
          const arrowCtas = [...document.querySelectorAll("a, button")]
            .filter((item) => /[←→↗]/.test(item.textContent ?? ""))
            .map((item) => item.textContent.trim());
          document.querySelector('[data-mission-task="regression"]').click();
          await pause();
          [...document.querySelectorAll("[data-mission-workflow] button")]
            .find((item) => item.textContent.includes("Model")).click();
          await pause();
          document.querySelector('[data-model-id="random-forest"]').click();
          await pause();
          return {
            tasks,
            taskBodyFont,
            taskCardsAreCompact: maxTaskHeight <= 230,
            repeatedTaskExamples,
            hasSelectedTaskDetail: Boolean(initialSelectedDetail),
            selectedDetailExampleCount: initialSelectedDetail
              ?.querySelectorAll("[data-selected-task-example]").length ?? 0,
            arrowCtas,
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
          "open-vocabulary-detection",
          "monocular-depth",
          "semantic-segmentation",
          "neural-network",
        ],
        taskBodyFont: 16,
        taskCardsAreCompact: true,
        repeatedTaskExamples: 0,
        hasSelectedTaskDetail: true,
        selectedDetailExampleCount: 3,
        arrowCtas: [],
        selectedModel: "random-forest",
        hasRegressor: true,
      });

      const downloads = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const originalCreateObjectURL = URL.createObjectURL;
          const originalRevokeObjectURL = URL.revokeObjectURL;
          const originalAnchorClick = HTMLAnchorElement.prototype.click;
          const originalFetch = window.fetch;
          const blobs = [];
          const clicks = [];
          const revoked = [];
          let fetchCalls = 0;
          try {
            URL.createObjectURL = (blob) => {
              const url = "blob:model-mission-" + blobs.length;
              blobs.push(blob);
              return url;
            };
            URL.revokeObjectURL = (url) => revoked.push(url);
            HTMLAnchorElement.prototype.click = function () {
              clicks.push({
                download: this.download,
                href: this.href,
              });
            };
            window.fetch = (...args) => {
              fetchCalls += 1;
              return originalFetch(...args);
            };
            const buttons = [...document.querySelectorAll(
              "[data-mission-code-panel] header button"
            )];
            const pythonButton = buttons.find(
              (button) => button.textContent.trim() === "Download Python"
            );
            const projectButton = buttons.find(
              (button) =>
                button.textContent.trim() === "Download project (.zip)"
            );
            const initial = {
              pythonDisabled: pythonButton?.disabled,
              projectDisabled: projectButton?.disabled,
            };
            pythonButton.click();
            projectButton.click();
            const payloads = await Promise.all(blobs.map(async (blob) => ({
              type: blob.type,
              bytes: new Uint8Array(await blob.arrayBuffer()),
            })));
            const python = new TextDecoder().decode(payloads[0].bytes);
            const zipBytes = payloads[1].bytes;
            const zipView = new DataView(
              zipBytes.buffer,
              zipBytes.byteOffset,
              zipBytes.byteLength,
            );
            const eocd = zipBytes.byteLength - 22;
            if (zipView.getUint32(eocd, true) !== 0x06054b50) {
              throw new Error("Project download is not a ZIP archive.");
            }
            const count = zipView.getUint16(eocd + 10, true);
            let offset = zipView.getUint32(eocd + 16, true);
            const entries = [];
            for (let index = 0; index < count; index += 1) {
              if (zipView.getUint32(offset, true) !== 0x02014b50) {
                throw new Error("Invalid central directory record.");
              }
              const size = zipView.getUint32(offset + 24, true);
              const nameLength = zipView.getUint16(offset + 28, true);
              const extraLength = zipView.getUint16(offset + 30, true);
              const commentLength = zipView.getUint16(offset + 32, true);
              const localOffset = zipView.getUint32(offset + 42, true);
              const name = new TextDecoder().decode(
                zipBytes.slice(offset + 46, offset + 46 + nameLength)
              );
              const localNameLength =
                zipView.getUint16(localOffset + 26, true);
              const localExtraLength =
                zipView.getUint16(localOffset + 28, true);
              const dataOffset =
                localOffset + 30 + localNameLength + localExtraLength;
              entries.push({
                name,
                text: name === "src/train.py"
                  ? new TextDecoder().decode(
                      zipBytes.slice(dataOffset, dataOffset + size)
                    )
                  : "",
              });
              offset += 46 + nameLength + extraLength + commentLength;
            }
            return {
              initial,
              types: payloads.map(({ type }) => type),
              clicks,
              revoked,
              fetchCalls,
              python,
              zipSignature: zipView.getUint32(0, true),
              entries,
            };
          } finally {
            URL.createObjectURL = originalCreateObjectURL;
            URL.revokeObjectURL = originalRevokeObjectURL;
            HTMLAnchorElement.prototype.click = originalAnchorClick;
            window.fetch = originalFetch;
          }
        })()`,
      });
      assert.equal(
        downloads.exceptionDetails,
        undefined,
        JSON.stringify(downloads.exceptionDetails),
      );
      const downloadResult = downloads.result.value;
      assert.deepEqual(downloadResult.initial, {
        pythonDisabled: false,
        projectDisabled: false,
      });
      assert.deepEqual(downloadResult.types, [
        "text/x-python;charset=utf-8",
        "application/zip",
      ]);
      assert.deepEqual(
        downloadResult.clicks.map(({ href }) => href),
        ["blob:model-mission-0", "blob:model-mission-1"],
      );
      assert.match(downloadResult.clicks[0].download, /\.py$/);
      assert.equal(
        downloadResult.clicks[1].download,
        "model-mission-project.zip",
      );
      assert.deepEqual(downloadResult.revoked, [
        "blob:model-mission-0",
        "blob:model-mission-1",
      ]);
      assert.equal(downloadResult.fetchCalls, 0);
      assert.equal(downloadResult.zipSignature, 0x04034b50);
      assertExactMissionProjectPaths(downloadResult.entries);
      assert.equal(
        downloadResult.entries.find(({ name }) => name === "src/train.py")
          .text,
        downloadResult.python,
      );
      auditEvidence.contracts.downloadsAreLocalAndComplete = true;

      const progressiveControls = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          const workflowButton = (label) => [...document.querySelectorAll(
            "[data-mission-workflow] button"
          )].find((button) => button.textContent.includes(label));
          workflowButton("Train").click();
          await pause();
          const levelButton = (label) => [...document.querySelectorAll(
            '[aria-label="Explanation level"] button'
          )].find((button) => button.textContent.includes(label));
          const visibleCount = () => [...document.querySelectorAll(
            "[data-control-level]"
          )].filter((element) => element.getClientRects().length > 0).length;

          levelButton("Guided").click();
          await pause();
          const guidedCount = visibleCount();
          levelButton("Customize").click();
          await pause();
          const customizeCount = visibleCount();
          levelButton("Advanced").click();
          await pause();
          const advancedCount = visibleCount();
          const advancedOnly = document.querySelector(
            '[data-control-id="maxDepth"] input'
          );
          const setInputValue = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
          ).set;
          setInputValue.call(advancedOnly, "12");
          advancedOnly.dispatchEvent(new Event("input", { bubbles: true }));
          advancedOnly.dispatchEvent(new Event("change", { bubbles: true }));
          await pause();
          levelButton("Guided").click();
          await pause();
          levelButton("Advanced").click();
          await pause();
          const advancedOnlyValue = document.querySelector(
            '[data-control-id="maxDepth"] input'
          )?.value;
          workflowButton("Model").click();
          await pause();

          return {
            guidedCount,
            customizeCount,
            advancedCount,
            advancedOnlyValue,
          };
        })()`,
      });
      assert.equal(
        progressiveControls.exceptionDetails,
        undefined,
        JSON.stringify(progressiveControls.exceptionDetails),
      );
      const {
        guidedCount,
        customizeCount,
        advancedCount,
        advancedOnlyValue,
      } = progressiveControls.result.value;
      assert.ok(customizeCount > guidedCount);
      assert.ok(advancedCount > customizeCount);
      assert.equal(advancedOnlyValue, "12");
      auditEvidence.contracts.advancedExceedsCustomize = true;
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
            const workspaceTabs = document.querySelector(
              "[data-mission-mobile-tabs]"
            );
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
              tabsVisible: visible(workspaceTabs),
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
          viewport.width <= 1100 ? 1 : 2,
          `correct responsive workspace at ${context}`,
        );
        assert.equal(
          layout.tabsVisible,
          viewport.width <= 1100,
          `workspace tabs match the tablet breakpoint at ${context}`,
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
        auditEvidence.widths.push({
          width: viewport.width,
          height: viewport.height,
          layout: {
            passed:
              layout.documentWidth === layout.viewportWidth
              && layout.visiblePanels === (
                viewport.width <= 1100 ? 1 : 2
              )
              && layout.tabsVisible === (viewport.width <= 1100)
              && layout.panelOverlap === false
              && layout.shellRailOverlap === false
              && layout.controlsInside === true
              && layout.code?.overflowX === "auto"
              && layout.code?.whiteSpace === "pre",
            noPageOverflow:
              layout.documentWidth === layout.viewportWidth,
            correctPanelCount:
              layout.visiblePanels === (
                viewport.width <= 1100 ? 1 : 2
              ),
            tabsMatchBreakpoint:
              layout.tabsVisible === (viewport.width <= 1100),
            panelsDoNotOverlap: layout.panelOverlap === false,
            railDoesNotOverlap: layout.shellRailOverlap === false,
            controlsContained: layout.controlsInside === true,
            codeOwnsHorizontalScroll:
              layout.code?.overflowX === "auto"
              && layout.code?.whiteSpace === "pre",
          },
          neuralEditor: {
            passed: false,
            noPageOverflow: false,
            controlsContained: false,
          },
        });
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
      auditEvidence.contracts.mobileTabsPreserveState = true;

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
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            const loadingPanel = document.querySelector(
              '[data-mission-code-panel][data-load-state="loading"]'
            );
            if (loadingPanel) {
              const downloadButtons = [...loadingPanel.querySelectorAll(
                "button"
              )].filter((button) =>
                button.textContent.includes("Download")
              );
              loadingDownloadsDisabled =
                downloadButtons.length === 2
                && downloadButtons.every((button) => button.disabled);
            }
          };
          let loadingDownloadsDisabled = false;
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
            loadingDownloadsDisabled,
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
        loadingDownloadsDisabled: true,
        recovered: true,
      });

      const neuralInputShape = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          const setValue = (element, value) => {
            const setter = Object.getOwnPropertyDescriptor(
              element instanceof HTMLSelectElement
                ? HTMLSelectElement.prototype
                : HTMLInputElement.prototype,
              "value",
            ).set;
            setter.call(element, value);
            element.dispatchEvent(new Event("input", { bubbles: true }));
            element.dispatchEvent(new Event("change", { bubbles: true }));
          };
          const workflowButton = (label) => [...document.querySelectorAll(
            "[data-mission-workflow] button"
          )].find((button) => button.textContent.includes(label));
          workflowButton("Goal").click();
          await pause();
          document.querySelector('[data-mission-task="neural-network"]').click();
          await pause();
          workflowButton("Prepare").click();
          await pause();
          setValue(
            document.querySelector('[data-control-id="preset"] select'),
            "sequence-conv1d",
          );
          await pause();
          workflowButton("Data").click();
          await pause();
          setValue(
            document.querySelector('[data-control-id="inputShape"] input'),
            "24, 6",
          );
          for (let attempt = 0; attempt < 100; attempt += 1) {
            const code = document.querySelector("[data-mission-code-panel] pre")?.textContent;
            if (code?.includes("INPUT_SHAPE = (24, 6)")) {
              return { inputShape: [24, 6], code };
            }
            await new Promise((resolve) => setTimeout(resolve, 35));
          }
          return {
            inputShape: document.querySelector(
              '[data-control-id="inputShape"] input'
            )?.value,
            code: document.querySelector("[data-mission-code-panel] pre")?.textContent,
          };
        })()`,
      });
      assert.equal(
        neuralInputShape.exceptionDetails,
        undefined,
        JSON.stringify(neuralInputShape.exceptionDetails),
      );
      assert.deepEqual(neuralInputShape.result.value.inputShape, [24, 6]);
      assert.match(neuralInputShape.result.value.code, /INPUT_SHAPE = \(24, 6\)/);

      const neuralControls = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const pause = () => new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          );
          const workflowButton = (label) => [...document.querySelectorAll(
            "[data-mission-workflow] button"
          )].find((button) => button.textContent.includes(label));
          const levelButton = (label) => [...document.querySelectorAll(
            '[aria-label="Explanation level"] button'
          )].find((button) => button.textContent.includes(label));
          const ids = () => [...document.querySelectorAll("[data-control-id]")]
            .filter((element) => element.getClientRects().length > 0)
            .map((element) => element.getAttribute("data-control-id"));
          const setValue = (element, value) => {
            const setter = Object.getOwnPropertyDescriptor(
              element instanceof HTMLSelectElement
                ? HTMLSelectElement.prototype
                : HTMLInputElement.prototype,
              "value",
            ).set;
            setter.call(element, value);
            element.dispatchEvent(new Event("input", { bubbles: true }));
            element.dispatchEvent(new Event("change", { bubbles: true }));
          };

          workflowButton("Prepare").click();
          await pause();
          setValue(
            document.querySelector('[data-control-id="framework"] select'),
            "pytorch",
          );
          await pause();
          workflowButton("Train").click();
          levelButton("Guided").click();
          await pause();
          const guided = ids();
          levelButton("Customize").click();
          await pause();
          const customize = ids();
          levelButton("Advanced").click();
          await pause();
          const advanced = ids();
          const optimizer = document.querySelector(
            '[data-control-id="optimizer"] select'
          );
          setValue(optimizer, "adamw");
          await pause();
          levelButton("Guided").click();
          await pause();
          levelButton("Advanced").click();
          await pause();
          const optimizerRestored = document.querySelector(
            '[data-control-id="optimizer"] select'
          )?.value;

          workflowButton("Prepare").click();
          await pause();
          setValue(
            document.querySelector('[data-control-id="preset"] select'),
            "sequence-lstm",
          );
          await pause();
          workflowButton("Model").click();
          await pause();
          const advancedInitializer = document.querySelector(
            '[data-layer-field="initializer"]'
          );
          setValue(advancedInitializer, "orthogonal");
          await pause();
          levelButton("Customize").click();
          await pause();
          const customizeLayerFields = {
            initializerVisible: Boolean(document.querySelector(
              '[data-layer-field="initializer"]'
            )),
            normalizationVisible: Boolean(document.querySelector(
              '[data-layer-field="normalization"]'
            )),
          };
          levelButton("Advanced").click();
          await pause();
          const restoredInitializer = document.querySelector(
            '[data-layer-field="initializer"]'
          )?.value;
          const initializerExplanation = document.querySelector(
            '[data-layer-explanation="initializer"]'
          );
          initializerExplanation?.querySelector("button")?.click();
          if (initializerExplanation) await pause();
          const initializerExplanationText =
            initializerExplanation?.textContent ?? "";
          const explanationButton =
            initializerExplanation?.querySelector("button");
          const explanationPanelId =
            explanationButton?.getAttribute("aria-controls");
          const initializerExplanationA11y = {
            expanded: explanationButton?.getAttribute("aria-expanded"),
            controlsVisible: Boolean(
              explanationPanelId
              && document.getElementById(explanationPanelId)
                ?.getClientRects().length
            ),
          };
          const installCommand = document.querySelector(
            "[data-mission-code-panel] code"
          )?.textContent?.trim();
          const layerCards = [...document.querySelectorAll(
            '[data-control-id="layers"] article'
          )];
          const layerEvidence = {
            count: layerCards.length,
            shapes: layerCards.map((card) =>
              card.querySelector("[data-layer-shape]")?.textContent
            ),
            dropout: Boolean(document.querySelector(
              '[data-layer-field="dropout-rate"]'
            )),
            returnSequences: Boolean(document.querySelector(
              '[data-layer-field="return-sequences"]'
            )),
            initializerEditable: Boolean(document.querySelector(
              '[data-layer-field="initializer"]:not([disabled])'
            )),
            normalizationEditable: Boolean(document.querySelector(
              '[data-layer-field="normalization"]:not([disabled])'
            )),
            unsafeRemovalBlocked: [...layerCards[0].querySelectorAll("button")]
              .find((button) => button.textContent.includes("Remove"))
              ?.disabled === true,
          };
          setValue(
            layerCards[0].querySelector("select"),
            "conv2d",
          );
          let invalidDownloadBlocked = false;
          for (let attempt = 0; attempt < 100; attempt += 1) {
            const editor = document.querySelector(
              '[data-control-id="layers"] [data-architecture-valid]'
            );
            const codeButtons = [...document.querySelectorAll(
              "[data-mission-code-panel] header button"
            )];
            if (
              editor?.getAttribute("data-architecture-valid") === "false"
              && codeButtons.length > 0
              && codeButtons.every((button) => button.disabled)
            ) {
              invalidDownloadBlocked = true;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 35));
          }
          return {
            guided,
            customize,
            advanced,
            optimizerRestored,
            customizeLayerFields,
            restoredInitializer,
            initializerExplanationText,
            initializerExplanationA11y,
            installCommand,
            layerEvidence,
            invalidDownloadBlocked,
          };
        })()`,
      });
      assert.equal(
        neuralControls.exceptionDetails,
        undefined,
        JSON.stringify(neuralControls.exceptionDetails),
      );
      const neuralControlResult = neuralControls.result.value;
      for (const id of ["epochs", "batchSize"]) {
        assert.ok(neuralControlResult.guided.includes(id), id);
      }
      for (const id of ["optimizer", "neuralLearningRate", "patience"]) {
        assert.equal(neuralControlResult.guided.includes(id), false, id);
        assert.ok(neuralControlResult.customize.includes(id), id);
      }
      for (const id of [
        "scheduler",
        "weightDecay",
        "momentum",
        "minimumDelta",
        "gradientClip",
        "mixedPrecision",
        "device",
        "workers",
        "deterministic",
      ]) {
        assert.equal(neuralControlResult.customize.includes(id), false, id);
        assert.ok(neuralControlResult.advanced.includes(id), id);
      }
      assert.ok(
        neuralControlResult.advanced.length
          > neuralControlResult.customize.length,
      );
      assert.equal(neuralControlResult.optimizerRestored, "adamw");
      assert.deepEqual(
        neuralControlResult.customizeLayerFields,
        {
          initializerVisible: false,
          normalizationVisible: true,
        },
      );
      assert.equal(neuralControlResult.restoredInitializer, "orthogonal");
      for (const heading of [
        "What it is:",
        "Why it matters:",
        "Use it when:",
        "Avoid it when:",
        "Trade-off:",
        "Python effect:",
      ]) {
        assert.match(
          neuralControlResult.initializerExplanationText,
          new RegExp(heading),
        );
      }
      assert.deepEqual(
        neuralControlResult.initializerExplanationA11y,
        { expanded: "true", controlsVisible: true },
      );
      assert.match(neuralControlResult.installCommand, /^pip install \S+( \S+)*$/);
      assert.doesNotMatch(neuralControlResult.installCommand, /\s{2,}/);
      assert.ok(neuralControlResult.layerEvidence.count > 0);
      assert.equal(
        neuralControlResult.layerEvidence.shapes.every((shape) =>
          /\[[\d, ]+\].*\[[\d, ]+\]/.test(shape)
        ),
        true,
      );
      assert.deepEqual(
        {
          dropout: neuralControlResult.layerEvidence.dropout,
          returnSequences: neuralControlResult.layerEvidence.returnSequences,
          initializerEditable:
            neuralControlResult.layerEvidence.initializerEditable,
          normalizationEditable:
            neuralControlResult.layerEvidence.normalizationEditable,
          unsafeRemovalBlocked:
            neuralControlResult.layerEvidence.unsafeRemovalBlocked,
        },
        {
          dropout: true,
          returnSequences: true,
          initializerEditable: true,
          normalizationEditable: true,
          unsafeRemovalBlocked: true,
        },
      );
      assert.equal(neuralControlResult.invalidDownloadBlocked, true);
      auditEvidence.contracts.hiddenValuesPreserved =
        advancedOnlyValue === "12"
        && neuralControlResult.optimizerRestored === "adamw"
        && neuralControlResult.restoredInitializer === "orthogonal";

      const computedPresentation = await client.send("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => {
          const root = document.querySelector("[data-model-mission]");
          const explanation = document.querySelector(
            '[data-layer-explanation="initializer"] [id$="-explanation"]'
          );
          const card = explanation?.closest("article");
          const explanationRect = explanation?.getBoundingClientRect();
          const cardRect = card?.getBoundingClientRect();
          const explanationContained = Boolean(
            explanationRect
            && cardRect
            && explanationRect.left >= cardRect.left - 1
            && explanationRect.right <= cardRect.right + 1
            && explanationRect.top >= cardRect.top - 1
            && explanationRect.bottom <= cardRect.bottom + 1
          );
          const gradientElements = root
            ? [root, ...root.querySelectorAll("*")]
              .filter((element) =>
                getComputedStyle(element).backgroundImage.includes("gradient")
              )
              .map((element) => element.tagName)
            : [];
          return {
            explanationContained,
            gradientElements,
          };
        })()`,
      });
      assert.deepEqual(computedPresentation.result.value, {
        explanationContained: true,
        gradientElements: [],
      });
      auditEvidence.contracts.explanationsContained = true;
      auditEvidence.contracts.noComputedGradients = true;

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
        const neuralLayout = await client.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => {
            const visible = (element) =>
              element && element.getClientRects().length > 0
              && getComputedStyle(element).display !== "none";
            const config = document.querySelector(
              "[data-mission-config-panel]"
            );
            const configRect = visible(config)
              ? config.getBoundingClientRect()
              : null;
            const controls = visible(config)
              ? [...config.querySelectorAll(
                  '[data-control-id="layers"] input, '
                  + '[data-control-id="layers"] select, '
                  + '[data-control-id="layers"] button'
                )]
                .filter(visible)
                .map((element) => element.getBoundingClientRect())
              : [];
            return {
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
              controlsInside: !configRect || controls.every((control) =>
                control.left >= configRect.left - 1
                && control.right <= configRect.right + 1
              ),
            };
          })()`,
        });
        const layout = neuralLayout.result.value;
        assert.equal(
          layout.documentWidth,
          layout.viewportWidth,
          `neural editor has no page overflow at ${viewport.width}px`,
        );
        assert.equal(
          layout.controlsInside,
          true,
          `neural controls stay contained at ${viewport.width}px`,
        );
        const widthEvidence = auditEvidence.widths.find(
          (row) => row.width === viewport.width,
        );
        assert.ok(widthEvidence, `audit width ${viewport.width}px exists`);
        widthEvidence.neuralEditor = {
          passed:
            layout.documentWidth === layout.viewportWidth
            && layout.controlsInside === true,
          noPageOverflow:
            layout.documentWidth === layout.viewportWidth,
          controlsContained: layout.controlsInside === true,
        };
      }
      if (AUDIT_EVIDENCE_ENABLED) {
        console.log(
          "MODEL_MISSION_AUDIT_EVIDENCE="
            + JSON.stringify(auditEvidence),
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
