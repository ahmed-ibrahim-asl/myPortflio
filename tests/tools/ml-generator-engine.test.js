import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildRecipeResult,
  getRecipeDefaultConfig,
} from "../../lib/tools/ml-generator/engine.js";
import {
  ensureMode,
  normalizeSelectValue,
} from "../../lib/tools/ml-generator/validation.js";

const ENGINE_FIXTURE_RECIPE = {
  id: "fixture-recipe",
  filename: () => "fixture.py",
  fields: [
    {
      id: "exportFormat",
      label: "Export format",
      inputType: "select",
      helpText: "Choose an artifact format.",
      modes: ["starter", "production"],
      options: [
        { value: "onnx", label: "ONNX" },
        { value: "torchscript", label: "TorchScript" },
      ],
    },
    {
      id: "epochs",
      label: "Epochs",
      inputType: "number",
      helpText: "Training passes.",
      modes: ["starter", "production"],
      min: 1,
      max: 100,
      step: 1,
    },
  ],
  defaults: {
    starter: { exportFormat: "onnx", epochs: 3 },
    production: { exportFormat: "torchscript", epochs: 10 },
  },
  normalize(config, mode) {
    const defaults = this.defaults[ensureMode(mode)];
    return {
      ...defaults,
      ...config,
      exportFormat: normalizeSelectValue(
        config?.exportFormat,
        this.fields[0].options,
        defaults.exportFormat,
      ),
      epochs: Number(config?.epochs ?? defaults.epochs),
    };
  },
  validate(config) {
    return config.epochs >= 1
      ? {}
      : { epochs: "Epochs must be at least 1." };
  },
  generate(config) {
    return `print("${config.exportFormat}:${config.epochs}")\n\n`;
  },
  dependencies: [
    { package: "fixture", version: ">=1,<2", purpose: "Test execution" },
  ],
  dataset: {
    title: "Fixture data",
    summary: "A controlled fixture.",
    structure: "fixture/",
    examplePaths: ["./fixture"],
    labelFormat: "One label.",
  },
  metrics: ["Accuracy"],
  artifacts: ["fixture.py", "fixture.onnx"],
  hardware: {
    minimum: "CPU",
    recommended: "GPU",
    edge: "Benchmark the target.",
  },
  deployment: ["Fallback deployment"],
  notes: ["Base note."],
  warnings: ["Base warning."],
  getWarnings(config) {
    return config.epochs > 5 ? ["Long fixture run."] : [];
  },
  getReadiness(config) {
    return {
      configuration: "ready",
      data: config.epochs > 0 ? "ready" : "blocked",
    };
  },
};

test("the shared engine normalizes mode, options, metadata, and newlines", () => {
  assert.deepEqual(
    getRecipeDefaultConfig(ENGINE_FIXTURE_RECIPE, "unsupported-mode"),
    { exportFormat: "onnx", epochs: 3 },
  );

  const result = buildRecipeResult(
    ENGINE_FIXTURE_RECIPE,
    "fixture-recipe",
    { exportFormat: "invalid", epochs: 8 },
    "production",
  );

  assert.deepEqual(result.validationErrors, {});
  assert.deepEqual(result.config, { exportFormat: "torchscript", epochs: 8 });
  assert.equal(result.filename, "fixture.py");
  assert.equal(result.code, 'print("torchscript:8")\n');
  assert.deepEqual(result.deployment, ["ONNX", "TorchScript"]);
  assert.deepEqual(result.artifacts, ["fixture.py", "fixture.onnx"]);
  assert.deepEqual(result.notes, ["Base note."]);
  assert.deepEqual(result.warnings, ["Base warning.", "Long fixture run."]);
  assert.deepEqual(result.readiness, {
    configuration: "ready",
    data: "ready",
  });
});

test("the shared engine returns no code when validation blocks generation", () => {
  const result = buildRecipeResult(
    ENGINE_FIXTURE_RECIPE,
    "fixture-recipe",
    { exportFormat: "onnx", epochs: 0 },
    "starter",
  );

  assert.equal(result.code, "");
  assert.deepEqual(result.validationErrors, {
    epochs: "Epochs must be at least 1.",
  });
  assert.deepEqual(result.readiness, {
    configuration: "ready",
    data: "blocked",
  });
});
