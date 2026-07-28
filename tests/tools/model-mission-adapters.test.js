import test from "node:test";
import assert from "node:assert/strict";

import {
  adaptLegacyMissionResult,
  generateSynchronousMissionResult,
} from "../../lib/tools/ml-generator/model-mission/adapters.js";
import {
  createDefaultProjectConfig,
} from "../../lib/tools/ml-generator/workbench/project-config.js";

test("classification and regression return one shared result contract", () => {
  const cases = [
    {
      taskId: "classification",
      model: { model: "logistic-regression" },
      expectedEstimator: "LogisticRegression",
    },
    {
      taskId: "regression",
      model: { model: "ridge" },
      expectedEstimator: "Ridge",
    },
  ];

  for (const item of cases) {
    const result = generateSynchronousMissionResult({
      ...createDefaultProjectConfig(),
      taskId: item.taskId,
      model: item.model,
    });

    assert.match(result.filename, /\.py$/);
    assert.match(result.code, /train_test_split/);
    assert.match(result.code, new RegExp(item.expectedEstimator));
    assert.ok(result.dependencies.includes("scikit-learn"));
    assert.deepEqual(result.validationErrors, {});
  }
});

test("neural output uses the same result contract", () => {
  const result = generateSynchronousMissionResult({
    ...createDefaultProjectConfig(),
    taskId: "neural-network",
    model: {
      framework: "keras",
      preset: "sensor-lstm",
    },
    training: {
      epochs: 12,
      batchSize: 16,
      learningRate: 0.001,
    },
  });

  assert.match(result.filename, /\.py$/);
  assert.match(result.code, /keras/);
  assert.match(result.code, /layers\.LSTM/);
  assert.ok(result.dependencies.includes("tensorflow"));
  assert.deepEqual(result.validationErrors, {});
});

test("invalid neural architecture blocks generated code with a field error", () => {
  const result = generateSynchronousMissionResult({
    ...createDefaultProjectConfig(),
    taskId: "neural-network",
    model: {
      framework: "keras",
      preset: "image-cnn",
      inputShape: [64, 64, 3],
      layers: [
        {
          id: "lstm-on-image",
          type: "lstm",
          units: 32,
          returnSequences: false,
        },
      ],
    },
  });

  assert.equal(result.code, "");
  assert.match(result.validationErrors.architecture, /expects/i);
});

test("legacy dependencies flatten without losing warnings or summary", () => {
  const result = adaptLegacyMissionResult({
    filename: "train.py",
    code: "print('ready')\n",
    dependencies: [
      { package: "torch", version: "2", purpose: "training" },
      { package: "pandas", version: "2", purpose: "data" },
    ],
    warnings: ["Check the dataset path."],
    validationErrors: {},
    dataset: { title: "Sensor CSV" },
    metrics: ["F1"],
    deployment: ["TorchScript"],
  });

  assert.deepEqual(result.dependencies, ["torch", "pandas"]);
  assert.deepEqual(result.warnings, ["Check the dataset path."]);
  assert.equal(result.summary, "Sensor CSV · F1 · TorchScript");
  assert.equal(result.code, "print('ready')\n");
});

test("unsupported synchronous tasks return a blocking task error", () => {
  const result = generateSynchronousMissionResult({
    ...createDefaultProjectConfig(),
    taskId: "object-detection",
  });

  assert.equal(result.code, "");
  assert.equal(
    result.validationErrors.taskId,
    "The selected task requires its lazy recipe adapter.",
  );
});
