import test from "node:test";
import assert from "node:assert/strict";

import {
  getMissionControl,
  getMissionControls,
  MODEL_MISSION_CONTROLS,
  validateMissionControlRegistry,
} from "../../lib/tools/ml-generator/model-mission/control-registry.js";
import {
  createProjectForTask,
} from "../../lib/tools/ml-generator/model-mission/state.js";

test("control registry is valid and levels are cumulative", () => {
  assert.deepEqual(validateMissionControlRegistry(), []);

  const project = createProjectForTask("classification");
  const guided = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "guided",
    project,
  });
  const customize = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "customize",
    project,
  });
  const advanced = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "advanced",
    project,
  });

  assert.ok(guided.some(({ id }) => id === "scaling"));
  assert.ok(customize.length > guided.length);
  assert.ok(advanced.length > customize.length);
  assert.ok(guided.every(({ id }) =>
    customize.some((item) => item.id === id)
  ));
  assert.ok(customize.every(({ id }) =>
    advanced.some((item) => item.id === id)
  ));
});

test("controls have complete specific explanations and validation rejects omissions", () => {
  for (const control of MODEL_MISSION_CONTROLS) {
    assert.notEqual(
      control.explanation.what,
      `${control.label} is a project setting.`,
    );
    for (const key of [
      "what",
      "why",
      "useWhen",
      "avoidWhen",
      "tradeoff",
      "codeEffect",
    ]) {
      assert.equal(typeof control.explanation[key], "string");
      assert.ok(control.explanation[key].trim().length > 0);
    }
  }

  const [first] = MODEL_MISSION_CONTROLS;
  const errors = validateMissionControlRegistry([
    {
      ...first,
      explanation: {
        ...first.explanation,
        avoidWhen: "",
      },
    },
  ]);

  assert.ok(errors.some((error) => error.includes("explanation.avoidWhen")));
});

test("control IDs identify their task-specific definitions and freeze nested values", () => {
  const neuralLearningRate = getMissionControl("neuralLearningRate");
  assert.equal(neuralLearningRate?.defaultValue, 0.001);
  assert.equal(neuralLearningRate?.level, "customize");

  const neuralProject = createProjectForTask("neural-network");
  const customizeTraining = getMissionControls({
    taskId: "neural-network",
    stepId: "train",
    learningLevel: "customize",
    project: neuralProject,
  });
  const advancedTraining = getMissionControls({
    taskId: "neural-network",
    stepId: "train",
    learningLevel: "advanced",
    project: neuralProject,
  });
  assert.ok(
    customizeTraining.some(({ id }) => id === "neuralLearningRate"),
  );
  assert.ok(
    advancedTraining.some(({ id }) => id === "neuralLearningRate"),
  );
  assert.ok(advancedTraining.length > customizeTraining.length);

  const inputShape = getMissionControl("inputShape");
  const alpha = getMissionControl("alpha");
  assert.throws(() => inputShape.defaultValue.push(99), TypeError);
  assert.throws(() => alpha.visibleWhen.in.push("ridge-plus"), TypeError);
});

test("YOLO learning-rate control follows the automatic optimizer rule", () => {
  const project = createProjectForTask("object-detection");
  const automaticControls = getMissionControls({
    taskId: "object-detection",
    stepId: "train",
    learningLevel: "advanced",
    project: {
      ...project,
      training: { ...project.training, optimizer: "auto" },
    },
  });
  const explicitControls = getMissionControls({
    taskId: "object-detection",
    stepId: "train",
    learningLevel: "advanced",
    project: {
      ...project,
      training: { ...project.training, optimizer: "AdamW" },
    },
  });

  assert.equal(
    automaticControls.find(({ id }) => id === "learningRate")?.disabledReason,
    "Automatic optimizer selection may choose its own learning rate.",
  );
  assert.equal(
    explicitControls.find(({ id }) => id === "learningRate")?.disabledReason,
    "",
  );
});

test("new YOLO controls explain why each setting matters", () => {
  const expectedKeywords = {
    optimizer: "optimizer",
    learningRate: "learning rate",
    validationConfidence: "validation",
    predictionConfidence: "prediction",
    weightDecay: "regularization",
    momentum: "momentum",
    warmupEpochs: "warmup",
    freezeLayers: "frozen",
    iouThreshold: "overlapping",
    deterministic: "repeatable",
  };

  for (const [id, keyword] of Object.entries(expectedKeywords)) {
    const control = MODEL_MISSION_CONTROLS.find((item) =>
      item.id === id && item.taskIds.includes("object-detection")
    );
    assert.ok(control, `${id} must be defined for object detection`);
    assert.match(control.explanation.why, new RegExp(keyword, "i"));
    assert.doesNotMatch(control.explanation.why, /^Configure .*workflow\.$/i);
  }
});
