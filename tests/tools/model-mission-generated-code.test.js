import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MODEL_MISSION_TASKS,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";
import {
  adaptLegacyMissionResult,
  generateSynchronousMissionResult,
} from "../../lib/tools/ml-generator/model-mission/adapters.js";
import {
  createProjectForTask,
} from "../../lib/tools/ml-generator/model-mission/state.js";
import {
  buildRecipeResult,
  getRecipeDefaultConfig,
} from "../../lib/tools/ml-generator/engine.js";
import {
  loadRecipe,
} from "../../lib/tools/ml-generator/load-recipe.js";

async function generateTask(task) {
  if (task.adapterId !== "legacy") {
    return generateSynchronousMissionResult(
      createProjectForTask(task.id),
    );
  }
  const recipe = await loadRecipe(task.recipeId);
  const defaults = getRecipeDefaultConfig(recipe, "starter");
  return adaptLegacyMissionResult(
    buildRecipeResult(
      recipe,
      task.recipeId,
      defaults,
      "starter",
    ),
  );
}

test("every Model Mission task produces complete parseable Python", async () => {
  for (const task of MODEL_MISSION_TASKS) {
    const result = await generateTask(task);
    assert.match(result.filename, /\.py$/, task.id);
    assert.ok(result.code.length > 0, `${task.id} generated no code`);
    assert.deepEqual(
      result.validationErrors,
      {},
      `${task.id} default configuration is invalid`,
    );
    assert.doesNotMatch(
      result.code,
      /\b(?:TODO|TBD)\b|\{\{[^}]+\}\}/,
      `${task.id} contains an unresolved placeholder`,
    );
    const parsed = spawnSync(
      "python",
      ["-c", "import ast,sys; ast.parse(sys.stdin.read())"],
      { input: result.code, encoding: "utf8" },
    );
    assert.equal(
      parsed.status,
      0,
      `${task.id}: ${parsed.stderr}`,
    );
  }
});

test("mission generation surfaces known multiclass threshold errors before execution", () => {
  const project = createProjectForTask("classification");
  const result = generateSynchronousMissionResult({
    ...project,
    data: { ...project.data, dataset: "wine" },
    evaluation: { ...project.evaluation, decisionThreshold: 0.65 },
  });

  assert.deepEqual(result.validationErrors, {
    decisionThreshold: "Decision thresholds require a binary classification dataset.",
  });
});
