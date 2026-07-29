import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getMissionControls,
} from "../../lib/tools/ml-generator/model-mission/control-registry.js";
import {
  createModelMissionState,
  modelMissionReducer,
} from "../../lib/tools/ml-generator/model-mission/state.js";

const MISSION_STEPS = [
  "data",
  "inspect",
  "split",
  "prepare",
  "model",
  "train",
  "evaluate",
  "generate",
];

function neuralControlsAt(level) {
  const project = modelMissionReducer(
    createModelMissionState(),
    { type: "choose-task", taskId: "neural-network" },
  ).project;
  return MISSION_STEPS.flatMap((stepId) =>
    getMissionControls({
      taskId: "neural-network",
      stepId,
      learningLevel: level,
      project: { ...project, learningLevel: level },
    })
  );
}

test("neural controls expand from essentials to production settings", () => {
  const guided = neuralControlsAt("guided");
  const customize = neuralControlsAt("customize");
  const advanced = neuralControlsAt("advanced");
  const ids = (controls) => new Set(controls.map(({ id }) => id));

  for (const id of ["preset", "framework", "epochs", "batchSize"]) {
    assert.equal(ids(guided).has(id), true, `Guided exposes ${id}`);
  }
  for (const id of [
    "optimizer",
    "neuralLearningRate",
    "patience",
    "layers",
  ]) {
    assert.equal(ids(customize).has(id), true, `Customize exposes ${id}`);
    assert.equal(ids(guided).has(id), false, `Guided hides ${id}`);
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
    "checkpointPath",
  ]) {
    assert.equal(ids(advanced).has(id), true, `Advanced exposes ${id}`);
    assert.equal(ids(customize).has(id), false, `Customize hides ${id}`);
  }
  assert.ok(advanced.length > customize.length);

  const explanationKeys = [
    "what",
    "why",
    "useWhen",
    "avoidWhen",
    "tradeoff",
    "codeEffect",
  ];
  for (const control of advanced.filter(({ level }) => level === "advanced")) {
    for (const key of explanationKeys) {
      assert.equal(
        typeof control.explanation[key] === "string"
          && control.explanation[key].trim().length > 0,
        true,
        `${control.id} has executable explanation.${key} metadata`,
      );
    }
  }
});

test("changing explanation levels preserves a selected neural optimizer", () => {
  let state = modelMissionReducer(
    createModelMissionState(),
    { type: "choose-task", taskId: "neural-network" },
  );
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "advanced",
  });
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "training",
    patch: { optimizer: "adamw" },
  });
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "guided",
  });
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "advanced",
  });

  assert.equal(state.project.training.optimizer, "adamw");
});

test("Model Mission sources expose advanced classical choices and model-aware recommendations", async () => {
  const [stepPanelSource, rendererSource, recommendationSource, fieldSource, shellSource] = await Promise.all([
    readFile(new URL("../../components/tools/model-mission/MissionStepPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/MissionControlRenderer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/MissionRecommendation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/MissionField.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../components/tools/model-mission/ModelMissionShell.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(stepPanelSource, /getMissionControls/);
  assert.match(stepPanelSource, /MissionControlRenderer/);
  assert.match(stepPanelSource, /model-mission\/recommendations/);
  assert.match(stepPanelSource, /getMissionRecommendation\(control\.id, project\)/);
  for (const value of [
    "group",
    "time",
    "cross-validation",
    "maxabs",
    "power",
    "quantile",
    "randomized",
    "sigmoid",
    "isotonic",
  ]) {
    assert.match(rendererSource, new RegExp(`"${value}"`));
  }
  assert.match(rendererSource, /control\.id === "searchStrategy"/);
  assert.match(rendererSource, /control\.id === "calibration"/);
  assert.match(recommendationSource, /recommendation\.label/);
  assert.match(recommendationSource, /recommendation\.reason/);
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
