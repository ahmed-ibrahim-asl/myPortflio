import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ML_TEMPLATES,
  buildMlGeneratorResult,
  generateMlScript,
  getDefaultConfig,
  normalizeTemplateConfig,
  validateTemplateConfig,
} from "../../lib/tools/ml-templates.js";

test("registry starts with the YOLO detection template", () => {
  assert.ok(
    ML_TEMPLATES.some((template) => template.id === "yolo-detection-training"),
  );
});

test("detection defaults normalize and validate in both modes", () => {
  for (const mode of ["starter", "production"]) {
    const defaults = getDefaultConfig("yolo-detection-training", mode);
    const normalized = normalizeTemplateConfig(
      "yolo-detection-training",
      defaults,
      mode,
    );
    assert.deepEqual(
      validateTemplateConfig(
        "yolo-detection-training",
        normalized,
        mode,
      ),
      {},
    );
  }
});

test("detection model size changes generated weights", () => {
  const config = {
    ...getDefaultConfig("yolo-detection-training", "production"),
    modelSize: "large",
  };
  const code = generateMlScript(
    "yolo-detection-training",
    config,
    "production",
  );
  assert.match(code, /"model_weights": "yolov8l\.pt"/);
  assert.doesNotMatch(code, /-seg\.pt/);
});

test("Jetson normalizes an incompatible export format", () => {
  const normalized = normalizeTemplateConfig(
    "yolo-detection-training",
    {
      ...getDefaultConfig("yolo-detection-training", "production"),
      environment: "jetson",
      exportFormat: "openvino",
    },
    "production",
  );
  assert.ok(["onnx", "engine"].includes(normalized.exportFormat));
});

test("every result is a Python script without notebook magic", () => {
  const result = buildMlGeneratorResult(
    "yolo-detection-training",
    getDefaultConfig("yolo-detection-training", "production"),
    "production",
  );
  assert.match(result.filename, /\.py$/);
  assert.doesNotMatch(result.filename, /\.ipynb$/);
  assert.doesNotMatch(result.code, /^!/m);
  assert.equal(result.code.endsWith("\n"), true);
  assert.equal(result.code.endsWith("\n\n"), false);
});

test("segmentation uses segmentation weights", () => {
  const config = {
    ...getDefaultConfig("yolo-segmentation-training", "production"),
    modelSize: "small",
  };
  const code = generateMlScript(
    "yolo-segmentation-training",
    config,
    "production",
  );
  assert.match(code, /"model_weights": "yolov8s-seg\.pt"/);
});

test("YOLO templates reuse unique field definitions", () => {
  for (const templateId of [
    "yolo-detection-training",
    "yolo-segmentation-training",
  ]) {
    const template = ML_TEMPLATES.find((item) => item.id === templateId);
    const ids = template.fields.map((field) => field.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("sensor defaults generate a complete CNN script", () => {
  const result = buildMlGeneratorResult(
    "sensor-timeseries-classification",
    getDefaultConfig("sensor-timeseries-classification", "starter"),
    "starter",
  );
  assert.deepEqual(result.validationErrors, {});
  assert.match(result.code, /class CNN1D\(nn\.Module\):/);
  assert.match(result.code, /macro_f1/);
  assert.match(result.code, /torch\.onnx\.export|torch\.jit\.script/);
});

test("sensor split fractions cannot consume the dataset", () => {
  const errors = validateTemplateConfig(
    "sensor-timeseries-classification",
    {
      ...getDefaultConfig("sensor-timeseries-classification", "production"),
      validationFraction: 0.4,
      testFraction: 0.4,
    },
    "production",
  );
  assert.match(errors.validationFraction, /total less than 0\.8/i);
});

test("sensor label column cannot also be a feature", () => {
  const errors = validateTemplateConfig(
    "sensor-timeseries-classification",
    {
      ...getDefaultConfig("sensor-timeseries-classification", "starter"),
      featureColumns: "ax,label",
      labelColumn: "label",
    },
    "starter",
  );
  assert.match(errors.featureColumns, /label column/i);
});
