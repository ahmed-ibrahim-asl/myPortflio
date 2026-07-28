import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecipeResult } from "../../lib/tools/ml-generator/engine.js";
import { recipe as yoloDetectionRecipe } from "../../lib/tools/ml-generator/recipes/applied/yolo-detection-training.js";
import { recipe as yoloSegmentationRecipe } from "../../lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js";
import {
  buildMlGeneratorResult,
  getDefaultConfig,
} from "../../lib/tools/ml-templates.js";

const YOLO_OUTPUT_HASHES = {
  "yolo-detection-training/starter":
    "ce7c3929251ecdcb1fff3d34f8ac18af690045385cc0ee64f80db08994c05723",
  "yolo-detection-training/production":
    "3f57cab004c5a5abb5f571081bc052e71453dfbcacf4e95093381715a97c1784",
  "yolo-segmentation-training/starter":
    "39d8552f7e797174404b34343ee80889bdc3799928692709be9e2f41b5e54c30",
  "yolo-segmentation-training/production":
    "c1b4813329aca2bd2a56ef0fc62af75bbea3f16347a8462542df87aef3bb273d",
};

const YOLO_RECIPES = [
  yoloDetectionRecipe,
  yoloSegmentationRecipe,
];

function hash(code) {
  return createHash("sha256").update(code).digest("hex");
}

test("extracted YOLO recipes preserve compatibility output and metadata", () => {
  for (const recipe of YOLO_RECIPES) {
    for (const mode of ["starter", "production"]) {
      const defaults = getDefaultConfig(recipe.id, mode);
      const compatibilityResult = buildMlGeneratorResult(
        recipe.id,
        defaults,
        mode,
      );
      const extractedResult = buildRecipeResult(
        recipe,
        recipe.id,
        defaults,
        mode,
      );

      assert.equal(
        hash(compatibilityResult.code),
        YOLO_OUTPUT_HASHES[`${recipe.id}/${mode}`],
      );
      assert.equal(extractedResult.code, compatibilityResult.code);
      assert.equal(extractedResult.filename, compatibilityResult.filename);
      assert.deepEqual(
        extractedResult.validationErrors,
        compatibilityResult.validationErrors,
      );
      assert.deepEqual(extractedResult.config, compatibilityResult.config);
      assert.deepEqual(
        extractedResult.dependencies,
        compatibilityResult.dependencies,
      );
      assert.deepEqual(extractedResult.dataset, compatibilityResult.dataset);
      assert.deepEqual(extractedResult.metrics, compatibilityResult.metrics);
      assert.deepEqual(extractedResult.hardware, compatibilityResult.hardware);
      assert.deepEqual(
        extractedResult.deployment,
        compatibilityResult.deployment,
      );
      assert.deepEqual(extractedResult.notes, compatibilityResult.notes);
      assert.deepEqual(extractedResult.warnings, compatibilityResult.warnings);
    }
  }
});

test("automatic YOLO optimizer does not apply a manual learning rate", () => {
  const result = buildMlGeneratorResult("yolo-detection-training", {
    optimizer: "auto",
    learningRate: 0.007,
  }, "starter");

  assert.match(result.code, /"optimizer": "auto"/);
  assert.doesNotMatch(result.code, /"learning_rate": 0\.007/);
  assert.match(result.warnings.join("\n"), /chooses its own learning rate/i);
});

test("explicit YOLO optimizer applies its selected learning rate", () => {
  const result = buildMlGeneratorResult("yolo-detection-training", {
    optimizer: "AdamW",
    learningRate: 0.0007,
    validationConfidence: 0.001,
    predictionConfidence: 0.35,
  }, "production");

  assert.match(result.code, /optimizer=str\(CONFIG\["optimizer"\]\)/);
  assert.match(result.code, /lr0=float\(CONFIG\["learning_rate"\]\)/);
  assert.match(result.code, /conf=float\(CONFIG\["validation_confidence"\]\)/);
  assert.match(result.code, /conf=float\(CONFIG\["prediction_confidence"\]\)/);
});

test("YOLO migration preserves a saved confidence threshold for prediction", () => {
  const result = buildMlGeneratorResult("yolo-detection-training", {
    confidenceThreshold: 0.42,
  }, "production");

  assert.equal(result.config.predictionConfidence, 0.42);
  assert.match(result.code, /"prediction_confidence": 0\.42/);
  assert.doesNotMatch(result.code, /"confidence_threshold"/);
});

test("YOLO advanced controls map to Ultralytics training and inference arguments", () => {
  const result = buildMlGeneratorResult("yolo-detection-training", {
    optimizer: "SGD",
    weightDecay: 0.002,
    momentum: 0.91,
    warmupEpochs: 2,
    freezeLayers: 3,
    iouThreshold: 0.6,
    deterministic: false,
  }, "production");

  assert.deepEqual(result.validationErrors, {});
  assert.match(result.code, /weight_decay=float\(CONFIG\["weight_decay"\]\)/);
  assert.match(result.code, /momentum=float\(CONFIG\["momentum"\]\)/);
  assert.match(result.code, /warmup_epochs=float\(CONFIG\["warmup_epochs"\]\)/);
  assert.match(result.code, /freeze=int\(CONFIG\["freeze_layers"\]\)/);
  assert.match(result.code, /deterministic=bool\(CONFIG\["deterministic"\]\)/);
  assert.match(result.code, /iou=float\(CONFIG\["iou_threshold"\]\)/);
});

test("YOLO validates advanced controls and separate confidence bounds", () => {
  const result = buildMlGeneratorResult("yolo-detection-training", {
    validationConfidence: -0.01,
    predictionConfidence: 1.01,
    weightDecay: -0.001,
    warmupEpochs: -1,
    freezeLayers: -1,
    iouThreshold: 1.01,
  }, "production");

  assert.deepEqual(result.validationErrors, {
    validationConfidence: "Validation confidence must be between 0 and 1.",
    predictionConfidence: "Prediction confidence must be between 0 and 1.",
    weightDecay: "Weight decay must be at least 0.",
    warmupEpochs: "Warmup epochs must be at least 0.",
    freezeLayers: "Freeze layers must be at least 0.",
    iouThreshold: "IoU threshold must be between 0 and 1.",
  });
});
