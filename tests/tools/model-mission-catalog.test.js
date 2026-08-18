import test from "node:test";
import assert from "node:assert/strict";

import {
  MODEL_MISSION_STEPS,
  MODEL_MISSION_TASKS,
  getLegacyFieldsForStep,
  getModelMissionTask,
  getModelMissionTasksByLevel,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";
import {
  MISSION_CONTROL_DEFINITIONS,
} from "../../lib/tools/ml-generator/model-mission/control-definitions.js";

test("tasks are ordered from simplest to most advanced", () => {
  assert.deepEqual(
    MODEL_MISSION_TASKS.map(({ id }) => id),
    [
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
  );
  assert.deepEqual(
    MODEL_MISSION_STEPS.map(({ id }) => id),
    [
      "goal",
      "data",
      "inspect",
      "split",
      "prepare",
      "model",
      "train",
      "evaluate",
      "generate",
    ],
  );
});

test("task lookup and level grouping preserve catalog records", () => {
  assert.equal(getModelMissionTask("regression")?.technicalTerm, "Regression");
  assert.deepEqual(
    getModelMissionTasksByLevel("intermediate").map(({ id }) => id),
    ["sensor-classification", "image-classification"],
  );
  assert.equal(getModelMissionTask("missing-task"), null);
});

test("every legacy field belongs to exactly one workflow step", () => {
  const fieldsByRecipe = {
    "yolo-detection-training": [
      "task",
      "modelFamily",
      "modelSize",
      "environment",
      "datasetYaml",
      "sourcePath",
      "imageSize",
      "epochs",
      "batchSize",
      "device",
      "optimizer",
      "learningRate",
      "weightDecay",
      "momentum",
      "warmupEpochs",
      "freezeLayers",
      "deterministic",
      "validationConfidence",
      "predictionConfidence",
      "iouThreshold",
      "patience",
      "workers",
      "seed",
      "exportFormat",
      "runName",
      "projectDirectory",
      "cacheDataset",
      "useAmp",
      "exportInt8",
    ],
    "sensor-timeseries-classification": [
      "task",
      "model",
      "modelSize",
      "environment",
      "datasetPath",
      "featureColumns",
      "labelColumn",
      "windowSize",
      "windowStride",
      "epochs",
      "batchSize",
      "learningRate",
      "validationFraction",
      "testFraction",
      "patience",
      "dropout",
      "device",
      "seed",
      "workers",
      "exportFormat",
      "checkpointPath",
      "sampleRateHz",
    ],
    "edge-image-classification": [
      "task",
      "model",
      "environment",
      "datasetDirectory",
      "inputSize",
      "exportFormat",
      "epochs",
      "batchSize",
      "learningRate",
      "validationFraction",
      "patience",
      "dropout",
      "seed",
      "fineTuneLayers",
      "representativeSamples",
      "artifactDirectory",
      "sampleImagePath",
    ],
  };

  for (const [recipeId, expectedFields] of Object.entries(fieldsByRecipe)) {
    const assigned = MODEL_MISSION_STEPS.flatMap(({ id }) =>
      getLegacyFieldsForStep(recipeId, id)
    );
    assert.equal(
      assigned.length,
      new Set(assigned).size,
      `${recipeId} must not assign one field to multiple steps`,
    );
    assert.deepEqual(
      [...assigned].sort(),
      [...expectedFields].sort(),
      `${recipeId} must assign every field`,
    );
  }

  assert.deepEqual(
    getLegacyFieldsForStep("unknown-recipe", "model"),
    [],
  );
});

test("YOLO learning-rate control is disabled while automatic optimization is selected", () => {
  const learningRateControl = MISSION_CONTROL_DEFINITIONS.find((control) =>
    control.id === "learningRate" && control.taskIds.includes("object-detection")
  );
  const optimizerControl = MISSION_CONTROL_DEFINITIONS.find((control) =>
    control.id === "optimizer" && control.taskIds.includes("object-detection")
  );

  assert.equal(optimizerControl?.level, "guided");
  assert.deepEqual(learningRateControl?.enabledWhen, {
    path: "training.optimizer",
    operator: "not-equals",
    value: "auto",
    reason: "Automatic optimizer selection may choose its own learning rate.",
  });
});
