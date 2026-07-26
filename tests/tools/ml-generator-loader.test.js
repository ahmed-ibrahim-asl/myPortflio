import { test } from "node:test";
import assert from "node:assert/strict";

import { ML_RECIPE_CATALOG } from "../../lib/tools/ml-generator/catalog.js";
import {
  hasRecipeLoader,
  loadRecipe,
  prefetchRecipe,
} from "../../lib/tools/ml-generator/load-recipe.js";
import { validateRecipeManifest } from "../../lib/tools/ml-generator/schema.js";

test("every catalog recipe has a valid lazy loader", async () => {
  for (const manifest of ML_RECIPE_CATALOG) {
    assert.equal(hasRecipeLoader(manifest.id), true);
    const recipe = await loadRecipe(manifest.id);
    assert.equal(recipe.id, manifest.id);
    assert.deepEqual(validateRecipeManifest(recipe), {});
  }
});

test("concurrent loads share one cached promise", async () => {
  const firstLoad = loadRecipe("yolo-detection-training");
  const secondLoad = loadRecipe("yolo-detection-training");

  assert.equal(firstLoad, secondLoad);
  assert.equal((await firstLoad).id, "yolo-detection-training");
});

test("prefetch warms a recipe without loading the whole catalog", async () => {
  assert.equal(prefetchRecipe("sensor-timeseries-classification"), undefined);
  assert.equal(
    (await loadRecipe("sensor-timeseries-classification")).id,
    "sensor-timeseries-classification",
  );
});

test("unknown recipe IDs reject with a useful error", async () => {
  assert.equal(hasRecipeLoader("missing"), false);
  await assert.rejects(
    loadRecipe("missing"),
    /Unknown ML recipe: missing/,
  );
});
