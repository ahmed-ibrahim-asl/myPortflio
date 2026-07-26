import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecipeResult } from "../../lib/tools/ml-generator/engine.js";
import { recipe as edgeRecipe } from "../../lib/tools/ml-generator/recipes/deployment/edge-image-classification.js";
import {
  buildMlGeneratorResult,
  getDefaultConfig,
} from "../../lib/tools/ml-templates.js";

const EDGE_OUTPUT_HASHES = {
  starter:
    "a61a5735046dc004367930da431127c0998d4a373a38d0d5e49bb22be01420fe",
  production:
    "8d34bc8122ea625162f126880b484ca6d27cf739b89540eb7ff3ba3b1a47ef40",
};

function hash(code) {
  return createHash("sha256").update(code).digest("hex");
}

test("the extracted edge recipe preserves compatibility output and metadata", () => {
  for (const mode of ["starter", "production"]) {
    const defaults = getDefaultConfig(edgeRecipe.id, mode);
    const compatibilityResult = buildMlGeneratorResult(
      edgeRecipe.id,
      defaults,
      mode,
    );
    const extractedResult = buildRecipeResult(
      edgeRecipe,
      edgeRecipe.id,
      defaults,
      mode,
    );

    assert.equal(hash(compatibilityResult.code), EDGE_OUTPUT_HASHES[mode]);
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
