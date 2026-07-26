import { test } from "node:test";
import { spawnSync } from "node:child_process";
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

test("registry contains exactly the four approved templates", () => {
  assert.deepEqual(
    ML_TEMPLATES.map((template) => template.id),
    [
      "yolo-detection-training",
      "yolo-segmentation-training",
      "sensor-timeseries-classification",
      "edge-image-classification",
    ],
  );
});

test("Coral forces INT8 TFLite export", () => {
  const normalized = normalizeTemplateConfig(
    "edge-image-classification",
    {
      ...getDefaultConfig("edge-image-classification", "production"),
      environment: "coral",
      exportFormat: "tflite-fp16",
    },
    "production",
  );
  assert.equal(normalized.exportFormat, "tflite-int8");
});

test("edge classifier changes the generated backbone", () => {
  const code = generateMlScript(
    "edge-image-classification",
    {
      ...getDefaultConfig("edge-image-classification", "production"),
      model: "efficientnet-v2-b0",
    },
    "production",
  );
  assert.match(code, /EfficientNetV2B0/);
});

test("all registered default scripts parse as Python", () => {
  for (const template of ML_TEMPLATES) {
    for (const mode of ["starter", "production"]) {
      const code = generateMlScript(
        template.id,
        getDefaultConfig(template.id, mode),
        mode,
      );
      assert.ok(code.length > 0, `${template.id}/${mode} generated no code`);
      const parsed = spawnSync(
        "python",
        ["-c", "import ast,sys; ast.parse(sys.stdin.read())"],
        { input: code, encoding: "utf8" },
      );
      assert.equal(
        parsed.status,
        0,
        `${template.id}/${mode}: ${parsed.stderr}`,
      );
    }
  }
});

test("every template has complete metadata and valid defaults", () => {
  for (const template of ML_TEMPLATES) {
    assert.ok(template.dependencies.length > 0);
    assert.ok(template.dataset.summary);
    assert.ok(template.dataset.structure);
    assert.ok(template.metrics.length > 0);
    assert.ok(template.hardware.minimum);
    assert.ok(template.hardware.recommended);
    assert.ok(template.deployment.length > 0);
    for (const mode of ["starter", "production"]) {
      const config = getDefaultConfig(template.id, mode);
      assert.deepEqual(validateTemplateConfig(template.id, config, mode), {});
    }
  }
});
