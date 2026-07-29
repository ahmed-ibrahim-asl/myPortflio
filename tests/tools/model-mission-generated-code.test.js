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
import {
  generateNeuralScript,
} from "../../lib/tools/ml-generator/workbench/neural-generator.js";

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

test("representative Keras workflows compile without executing training", () => {
  const cases = [
    {
      framework: "keras",
      preset: "tabular-mlp",
      dataSource: "custom-csv",
      numClasses: 2,
    },
    {
      framework: "keras",
      preset: "image-cnn",
      dataSource: "image-folder",
      numClasses: 6,
    },
    {
      framework: "keras",
      preset: "sequence-conv1d",
      dataSource: "sequence-array",
      numClasses: 4,
    },
    {
      framework: "keras",
      preset: "tabular-regression-mlp",
      dataSource: "diabetes",
    },
  ];

  for (const config of cases) {
    const result = generateNeuralScript(config);
    for (const functionName of [
      "load_data",
      "build_model",
      "train_model",
      "evaluate_model",
      "predict_sample",
      "main",
    ]) {
      assert.match(
        result.code,
        new RegExp(`def ${functionName}\\(`),
        `${config.preset} omitted ${functionName}`,
      );
    }
    const parsed = spawnSync(
      "python",
      ["-c", "import ast,sys; compile(ast.parse(sys.stdin.read()), '<generated>', 'exec')"],
      { input: result.code, encoding: "utf8" },
    );
    assert.equal(parsed.status, 0, `${config.preset}: ${parsed.stderr}`);
  }
});

test("YOLO mission code keeps validation and prediction confidence separate", async () => {
  const recipe = await loadRecipe("yolo-detection-training");
  const result = buildRecipeResult(recipe, recipe.id, {
    optimizer: "AdamW",
    validationConfidence: 0.01,
    predictionConfidence: 0.4,
  }, "production");

  assert.deepEqual(result.validationErrors, {});
  assert.match(result.code, /"validation_confidence": 0\.01/);
  assert.match(result.code, /"prediction_confidence": 0\.4/);
  assert.match(result.code, /model\.val\([\s\S]*conf=float\(CONFIG\["validation_confidence"\]\)/);
  assert.match(result.code, /model\.predict\([\s\S]*conf=float\(CONFIG\["prediction_confidence"\]\)/);
  const parsed = spawnSync(
    "python",
    ["-c", "import ast,sys; ast.parse(sys.stdin.read())"],
    { input: result.code, encoding: "utf8" },
  );
  assert.equal(parsed.status, 0, parsed.stderr);
});
