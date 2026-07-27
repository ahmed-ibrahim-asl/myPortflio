import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ML_TEMPLATES,
  buildMlGeneratorResult,
  getDefaultConfig,
  normalizeTemplateConfig,
  validateTemplateConfig,
} from "../../lib/tools/ml-templates.js";

const BASELINE_COMMIT = "23ef28c";

const BASELINE_HASHES = Object.freeze({
  "yolo-detection-training/manifest":
    "bac70166ef21eb386b76ace6e2e82127e0cd0a016ec70692585a7a7f000a1d05",
  "yolo-detection-training/starter/contract":
    "3a9516e92e66c2ec415f411eda4d43d74ab1bd5e9785cff033112afe251e526a",
  "yolo-detection-training/production/contract":
    "a12dd0275da38b6ced6c733ed7e786ad7b61b0c1e8a278fc386d21c5086cc6f7",
  "yolo-segmentation-training/manifest":
    "e76327ae59cbaa49e5588925e96571a5060b83c8bf203474b7ac266503030194",
  "yolo-segmentation-training/starter/contract":
    "d286719ab41e591e1e628be2a298289ae00abf13466e831705218b3ae1e809ae",
  "yolo-segmentation-training/production/contract":
    "9b7592a7cf60d0b4f635ab07b7e8d9bf6f898080e9e623584065f9feb613344f",
  "sensor-timeseries-classification/manifest":
    "985008d3c0a1e7258708dc67572a723dec8e5939969517914a5b66ed8035ea39",
  "sensor-timeseries-classification/starter/contract":
    "86c1d5c079efc3376d690d073e44f461728d36a865a8132f4d7bbd1dc9cf8c66",
  "sensor-timeseries-classification/production/contract":
    "f916bc91fac896accc7988f4cbf785912ea2a30847fe157a97d73081d8844316",
  "edge-image-classification/manifest":
    "2648a3fb55933efea257ee668c1faa5b5d660b06acda1a91f78314f8be0d6288",
  "edge-image-classification/starter/contract":
    "a3f21e8ec5572b1345cec7e4b82f40e1661e4d1505a51b4e9db0375fa7bcb2e7",
  "edge-image-classification/production/contract":
    "fce1af34810a1460e628c1cc6d07c85667b9755ce956d524681b5750b82c043b",
  "scenario/detection-jetson":
    "8f5e54edfd2488050a16361318ba8eb1077cb6d8cac33bf4d9ffa51aa8ea31c6",
  "scenario/sensor-splits":
    "4f8a537e12263c86801fbcbee93b9e7591bf9f10a6a78dda28c6e87c405e76aa",
  "scenario/sensor-columns":
    "0e90936456958abeead43313a275f72f1a90dc0d5d53b3bc1433ecb8b6a290e6",
  "scenario/edge-coral":
    "601cdc751dc0507e25c1ce2cc6d7d34cc8a7eba2445655b07541e2a2f7531469",
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stable(value[key])]),
    );
  }
  return value;
}

function hash(value) {
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}

function resultContract(result) {
  const { code, artifacts, readiness, ...contract } = result;
  return contract;
}

function templateContract(template) {
  return {
    id: template.id,
    name: template.name,
    shortDescription: template.shortDescription,
    category: template.category,
    fields: template.fields.map((field) => ({
      id: field.id,
      label: field.label,
      inputType: field.inputType,
      helpText: field.helpText,
      modes: field.modes,
      min: field.min,
      max: field.max,
      step: field.step,
      options: field.options,
    })),
    defaults: template.defaults,
    dependencies: template.dependencies,
    dataset: template.dataset,
    metrics: template.metrics,
    hardware: template.hardware,
    deployment: template.deployment,
    notes: template.notes,
    warnings: template.warnings,
  };
}

test(`recipe contracts match pre-refactor baseline ${BASELINE_COMMIT}`, () => {
  for (const template of ML_TEMPLATES) {
    assert.equal(
      hash(templateContract(template)),
      BASELINE_HASHES[`${template.id}/manifest`],
      `${template.id} manifest drifted from the pre-refactor baseline`,
    );

    for (const mode of ["starter", "production"]) {
      const defaults = getDefaultConfig(template.id, mode);
      const contract = {
        defaults,
        result: resultContract(
          buildMlGeneratorResult(template.id, defaults, mode),
        ),
        validation: validateTemplateConfig(template.id, defaults, mode),
      };
      assert.equal(
        hash(contract),
        BASELINE_HASHES[`${template.id}/${mode}/contract`],
        `${template.id}/${mode} contract drifted from the pre-refactor baseline`,
      );
    }
  }
});

test(`dependent and invalid configurations match baseline ${BASELINE_COMMIT}`, () => {
  const scenarios = {
    "scenario/detection-jetson": {
      templateId: "yolo-detection-training",
      mode: "production",
      config: {
        ...getDefaultConfig("yolo-detection-training", "production"),
        environment: "jetson",
        exportFormat: "openvino",
      },
    },
    "scenario/sensor-splits": {
      templateId: "sensor-timeseries-classification",
      mode: "production",
      config: {
        ...getDefaultConfig("sensor-timeseries-classification", "production"),
        validationFraction: 0.4,
        testFraction: 0.4,
      },
    },
    "scenario/sensor-columns": {
      templateId: "sensor-timeseries-classification",
      mode: "starter",
      config: {
        ...getDefaultConfig("sensor-timeseries-classification", "starter"),
        featureColumns: "ax,label",
        labelColumn: "label",
      },
    },
    "scenario/edge-coral": {
      templateId: "edge-image-classification",
      mode: "production",
      config: {
        ...getDefaultConfig("edge-image-classification", "production"),
        environment: "coral",
        exportFormat: "tflite-fp16",
      },
    },
  };

  for (const [scenarioId, scenario] of Object.entries(scenarios)) {
    const contract = {
      normalized: normalizeTemplateConfig(
        scenario.templateId,
        scenario.config,
        scenario.mode,
      ),
      validation: validateTemplateConfig(
        scenario.templateId,
        scenario.config,
        scenario.mode,
      ),
    };
    assert.equal(
      hash(contract),
      BASELINE_HASHES[scenarioId],
      `${scenarioId} drifted from the pre-refactor baseline`,
    );
  }
});
