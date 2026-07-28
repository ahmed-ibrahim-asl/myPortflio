import { test } from "node:test";
import assert from "node:assert/strict";

import {
  NeuralConfigurationError,
  NEURAL_PRESETS,
  buildNeuralDataSection,
  generateNeuralScript,
  inferLayerShapes,
  normalizeNeuralConfig,
} from "../../lib/tools/ml-generator/workbench/neural-generator.js";

test("neural presets cover tabular, image, and sequence learning", () => {
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "tabular-mlp"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "image-cnn"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "sequence-conv1d"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "sequence-lstm"));
});

test("shape inference explains every valid layer transition", () => {
  const config = normalizeNeuralConfig({
    preset: "image-cnn",
    task: "image-classification",
    inputShape: [64, 64, 3],
    numClasses: 5,
  });

  const inference = inferLayerShapes(config.inputShape, config.layers);

  assert.deepEqual(inference.errors, []);
  assert.equal(inference.steps.length, config.layers.length);
  assert.deepEqual(inference.steps[0].inputShape, [64, 64, 3]);
  assert.deepEqual(inference.steps.at(-1).outputShape, [64]);
});

test("shape inference blocks incompatible recurrent layers", () => {
  const inference = inferLayerShapes(
    [32],
    [{ id: "layer-1", type: "lstm", units: 64, returnSequences: false }],
  );

  assert.equal(inference.errors.length, 1);
  assert.match(inference.errors[0], /LSTM expects \[timesteps, features\]/);
});

test("neural normalization resolves a complete tabular training contract", () => {
  const config = normalizeNeuralConfig({
    framework: "pytorch",
    preset: "tabular-mlp",
    task: "tabular-classification",
    dataSource: "breast-cancer",
    splitStrategy: "train-validation-test",
    validationRatio: 0.15,
    testRatio: 0.15,
    scaling: "standard",
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    weightDecay: 0.0001,
    patience: 8,
    gradientClip: 1,
    mixedPrecision: true,
    device: "auto",
    workers: 2,
    randomSeed: 42,
  });

  assert.equal(config.dataContract, "tabular");
  assert.equal(config.dataSource, "breast-cancer");
  assert.equal(config.optimizer, "adamw");
  assert.equal(config.scheduler, "reduce-on-plateau");
  assert.equal(config.checkpointPath, "artifacts/best_neural_network.pt");
  assert.equal(config.artifactPath, "artifacts/neural_network.pt");
  assert.equal(config.minimumDelta, 0);
  assert.equal(config.momentum, 0.9);
});

test("neural normalization derives image-folder and sequence-array contracts", () => {
  const image = normalizeNeuralConfig({
    preset: "image-cnn",
    task: "image-classification",
    dataPath: "data/images",
  });
  const sequence = normalizeNeuralConfig({
    preset: "sequence-lstm",
    task: "sequence-classification",
    dataPath: "data/sensor_windows.npz",
  });

  assert.equal(image.dataContract, "image-folder");
  assert.equal(sequence.dataContract, "sequence-array");
  assert.match(buildNeuralDataSection(image, "keras").join("\n"), /image-folder/);
  assert.match(buildNeuralDataSection(sequence, "pytorch").join("\n"), /sequence-array/);
});

test("neural contracts reject unsafe paths and invalid split totals with typed errors", () => {
  assert.throws(
    () => normalizeNeuralConfig({ dataPath: "../private/dataset.csv" }),
    (error) => error instanceof NeuralConfigurationError && error.section === "data",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      testRatio: 0.6,
      validationRatio: 0.5,
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "split",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      artifactPath: "C:\\models\\network.keras",
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
});

test("neural contracts reject Windows traversal and UNC paths before normalizing them", () => {
  const cases = [
    { dataPath: "data\\..\\secret.csv", section: "data" },
    { checkpointPath: "artifacts\\..\\best_neural_network.keras", section: "architecture" },
    { artifactPath: "artifacts\\..\\neural_network.keras", section: "architecture" },
    { dataPath: "\\\\server\\share\\dataset.csv", section: "data" },
  ];

  for (const item of cases) {
    assert.throws(
      () => normalizeNeuralConfig(item),
      (error) => error instanceof NeuralConfigurationError
        && error.section === item.section,
    );
  }
});

test("neural contracts reject incompatible preset, data, and output combinations", () => {
  assert.throws(
    () => normalizeNeuralConfig({
      preset: "image-cnn",
      task: "tabular-classification",
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      preset: "tabular-regression-mlp",
      task: "tabular-regression",
      numClasses: 3,
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      preset: "tabular-mlp",
      task: "tabular-classification",
      numClasses: 1,
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
});

test("Keras generator emits an editable multiclass CNN", () => {
  const result = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    task: "image-classification",
    inputShape: [32, 32, 3],
    numClasses: 10,
    epochs: 20,
    batchSize: 64,
    learningRate: 0.001,
  });

  assert.equal(result.filename, "keras_image_classification_network.py");
  assert.match(result.code, /keras\.Sequential/);
  assert.match(result.code, /layers\.Conv2D\(32/);
  assert.match(result.code, /layers\.GlobalAveragePooling2D/);
  assert.match(result.code, /layers\.Dense\(num_classes\)/);
  assert.match(result.code, /SparseCategoricalCrossentropy\(from_logits=True\)/);
  assert.match(result.code, /epochs=20/);
});

test("PyTorch generator emits a sequence LSTM and training skeleton", () => {
  const result = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    task: "sequence-classification",
    inputShape: [128, 6],
    numClasses: 4,
    epochs: 15,
    batchSize: 32,
    learningRate: 0.0005,
  });

  assert.equal(result.filename, "pytorch_sequence_classification_network.py");
  assert.match(result.code, /class ConfigurableNetwork\(nn\.Module\)/);
  assert.match(result.code, /nn\.LSTM\(input_size=6, hidden_size=64, batch_first=True/);
  assert.match(result.code, /x, _ = self\.layer_0\(x\)/);
  assert.match(result.code, /x = x\[:, -1, :\]/);
  assert.match(result.code, /CrossEntropyLoss/);
  assert.match(result.code, /learning_rate = 0\.0005/);
});

test("invalid neural architecture refuses to generate code", () => {
  assert.throws(
    () => generateNeuralScript({
      framework: "keras",
      task: "tabular-classification",
      inputShape: [12],
      layers: [
        { id: "bad-layer", type: "conv2d", filters: 32, kernelSize: 3 },
      ],
    }),
    /Conv2D expects \[height, width, channels\]/,
  );
});
