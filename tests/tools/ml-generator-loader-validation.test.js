import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createRecipeLoader,
} from "../../lib/tools/ml-generator/load-recipe.js";
import {
  validateLoadedRecipe,
} from "../../lib/tools/ml-generator/schema.js";
import { recipe as detectionRecipe } from "../../lib/tools/ml-generator/recipes/applied/yolo-detection-training.js";

test("loaded recipe validation rejects missing executable contracts", () => {
  const errors = validateLoadedRecipe({
    id: "broken-recipe",
    title: "Broken recipe",
  });

  assert.match(errors.normalize, /required/i);
  assert.match(errors.validate, /required/i);
  assert.match(errors.generate, /required/i);
  assert.match(errors.filename, /required/i);
  assert.match(errors.fields, /at least one/i);
});

test("a malformed module is evicted so a corrected retry can load", async () => {
  let attempts = 0;
  const correctedRecipe = {
    ...detectionRecipe,
    id: "retry-recipe",
    generatorModuleId: "retry-recipe",
  };
  const loader = createRecipeLoader({
    "retry-recipe": async () => {
      attempts += 1;
      return attempts === 1
        ? { recipe: { id: "retry-recipe" } }
        : { recipe: correctedRecipe };
    },
  });

  await assert.rejects(
    loader.loadRecipe("retry-recipe"),
    /Invalid ML recipe module: retry-recipe/,
  );
  assert.equal((await loader.loadRecipe("retry-recipe")).id, "retry-recipe");
  assert.equal(attempts, 2);
});
