import { test } from "node:test";
import assert from "node:assert/strict";

import {
  legacyConfigFromProject,
  legacyDefaultsToSections,
  resolveMissionGeneration,
} from "../../lib/tools/ml-generator/model-mission/legacy-bridge.js";
import {
  createProjectForTask,
} from "../../lib/tools/ml-generator/model-mission/state.js";
import {
  getModelMissionTask,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";

test("legacy defaults are distributed into the shared workflow sections", () => {
  const sections = legacyDefaultsToSections(
    "yolo-detection-training",
    {
      datasetYaml: "data.yaml",
      modelSize: "n",
      epochs: 50,
      exportFormat: "onnx",
    },
  );

  assert.deepEqual(sections.data, { datasetYaml: "data.yaml" });
  assert.deepEqual(sections.model, { modelSize: "n" });
  assert.deepEqual(sections.training, { epochs: 50 });
  assert.deepEqual(sections.output, { exportFormat: "onnx" });
});

test("legacy configuration is reconstructed without a second state object", () => {
  const project = createProjectForTask("sensor-classification");
  project.data.datasetPath = "sensor.csv";
  project.split.testFraction = 0.2;
  project.training.epochs = 30;

  assert.deepEqual(
    legacyConfigFromProject(
      project,
      "sensor-timeseries-classification",
    ),
    {
      datasetPath: "sensor.csv",
      testFraction: 0.2,
      epochs: 30,
    },
  );
});

test("generation resolver rejects a stale legacy recipe result", () => {
  const task = getModelMissionTask("object-detection");
  const project = createProjectForTask("object-detection");
  const stale = resolveMissionGeneration({
    task,
    project,
    legacy: {
      recipeId: "sensor-timeseries-classification",
      status: "ready",
      result: {
        templateId: "sensor-timeseries-classification",
        filename: "sensor.py",
        code: "print('stale')\n",
      },
    },
  });

  assert.equal(stale.status, "loading");
  assert.equal(stale.result, null);
});

test("synchronous and active legacy tasks share one result contract", () => {
  const regression = resolveMissionGeneration({
    task: getModelMissionTask("regression"),
    project: createProjectForTask("regression"),
    legacy: { recipeId: "", status: "idle", result: null },
  });
  assert.equal(regression.status, "ready");
  assert.match(regression.result.filename, /\.py$/);

  const detection = resolveMissionGeneration({
    task: getModelMissionTask("object-detection"),
    project: createProjectForTask("object-detection"),
    legacy: {
      recipeId: "yolo-detection-training",
      status: "ready",
      result: {
        templateId: "yolo-detection-training",
        filename: "train_yolo.py",
        code: "print('ready')\n",
        dependencies: [{ package: "ultralytics" }],
        warnings: [],
        validationErrors: {},
      },
    },
  });
  assert.equal(detection.status, "ready");
  assert.equal(detection.result.filename, "train_yolo.py");
  assert.deepEqual(detection.result.dependencies, ["ultralytics"]);
});
