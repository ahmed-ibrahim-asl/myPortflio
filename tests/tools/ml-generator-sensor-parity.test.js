import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecipeResult } from "../../lib/tools/ml-generator/engine.js";
import { recipe as sensorRecipe } from "../../lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js";
import {
  buildMlGeneratorResult,
  getDefaultConfig,
} from "../../lib/tools/ml-templates.js";

const SENSOR_OUTPUT_HASHES = {
  starter:
    "90f9e5bfa7f7fe5057ed792108cab64587e461d31032dd300bf07dc7bf1a9a86",
  production:
    "73895e5606d3dae718be3f9c4adeeb80677465c50e78d3f1290b18dc165af584",
};

function hash(code) {
  return createHash("sha256").update(code).digest("hex");
}

test("the extracted sensor recipe preserves compatibility output and metadata", () => {
  for (const mode of ["starter", "production"]) {
    const defaults = getDefaultConfig(sensorRecipe.id, mode);
    const compatibilityResult = buildMlGeneratorResult(
      sensorRecipe.id,
      defaults,
      mode,
    );
    const extractedResult = buildRecipeResult(
      sensorRecipe,
      sensorRecipe.id,
      defaults,
      mode,
    );

    assert.equal(hash(compatibilityResult.code), SENSOR_OUTPUT_HASHES[mode]);
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
});
