import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Model Mission sources use progressive controls and accessible explanations", async () => {
  const [stepPanelSource, fieldSource, shellSource] = await Promise.all([
    readFile(new URL("../../components/tools/model-mission/MissionStepPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/MissionField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/ModelMissionShell.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(stepPanelSource, /getMissionControls/);
  assert.match(stepPanelSource, /MissionControlRenderer/);
  assert.match(fieldSource, /Learn this choice/);
  assert.match(fieldSource, /aria-expanded/);
  assert.match(shellSource, /data-learning-level/);
});

test("the public AI generator route renders one Model Mission builder", async (t) => {
  const routeUrl =
    process.env.AI_GENERATOR_TEST_URL
    ?? "http://127.0.0.1:3000/tools/ai-script-generator/";
  let response;
  try {
    response = await fetch(routeUrl);
  } catch {
    t.skip("Run the portfolio server to exercise the live route contract.");
    return;
  }

  assert.equal(response.ok, true);
  const html = await response.text();
  assert.match(html, /data-model-mission/);
  assert.match(html, /Model Mission/);
  assert.match(
    html,
    /From problem to Python, one decision at a time\./,
  );
  assert.match(html, /Predict a category/);
  assert.match(html, /Predict a number/);
  assert.doesNotMatch(html, /AI \/ ML Learning Workbench/);
  assert.doesNotMatch(
    html,
    /Sequential Neural Network Designer/,
  );
});
