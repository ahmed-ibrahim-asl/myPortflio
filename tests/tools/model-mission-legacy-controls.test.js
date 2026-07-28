import test from "node:test";
import assert from "node:assert/strict";

import {
  getMissionControls,
} from "../../lib/tools/ml-generator/model-mission/control-registry.js";
import {
  MODEL_MISSION_STEPS,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";

const LEGACY_TASKS = [
  "sensor-classification",
  "image-classification",
  "object-detection",
  "instance-segmentation",
];

const REQUIRED_TRAINING_CONTROLS = ["epochs", "batchSize", "learningRate"];
const EXPLANATION_KEYS = [
  "what",
  "why",
  "useWhen",
  "avoidWhen",
  "tradeoff",
  "codeEffect",
];

function controlsFor(taskId, learningLevel) {
  return MODEL_MISSION_STEPS.flatMap(({ id: stepId }) => getMissionControls({
    taskId,
    stepId,
    learningLevel,
    project: {},
  }));
}

test("legacy tasks disclose cumulative controls with complete explanations", () => {
  for (const taskId of LEGACY_TASKS) {
    const guided = controlsFor(taskId, "guided");
    const customize = controlsFor(taskId, "customize");
    const advanced = controlsFor(taskId, "advanced");

    assert.ok(
      customize.length > guided.length,
      `${taskId} exposes more Customize than Guided controls`,
    );
    assert.ok(
      advanced.length > customize.length,
      `${taskId} exposes more Advanced than Customize controls`,
    );
    assert.deepEqual(
      advanced
        .filter(({ step }) => step === "train")
        .map(({ id }) => id)
        .filter((id) => REQUIRED_TRAINING_CONTROLS.includes(id))
        .sort(),
      [...REQUIRED_TRAINING_CONTROLS].sort(),
      `${taskId} keeps epochs, batchSize, and learningRate in Advanced`,
    );
    for (const control of advanced) {
      for (const key of EXPLANATION_KEYS) {
        assert.equal(
          typeof control.explanation[key],
          "string",
          `${taskId}:${control.id} has explanation.${key}`,
        );
        assert.notEqual(
          control.explanation[key].trim(),
          "",
          `${taskId}:${control.id} has nonempty explanation.${key}`,
        );
      }
    }
  }
});