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
    "d3d2098772330d29436e6c4333e0423660191dd6273c3e5289621d6bc9dac785",
  "yolo-detection-training/production":
    "8c696fc21989a5e9cc902af146531b565c97034318a24b707d2482a52a76e364",
  "yolo-segmentation-training/starter":
    "fd9cd10d6beadee8472ffccd596023395a4c2e9b719ae41cae61d758d599514e",
  "yolo-segmentation-training/production":
    "816580261a30b30f25d8fab5903fbc047dbedd4a7efae38d6ab7a09ba566d6b7",
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
