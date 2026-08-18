import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRecipeResult, getRecipeDefaultConfig } from "../../lib/tools/ml-generator/engine.js";
import { loadRecipe } from "../../lib/tools/ml-generator/load-recipe.js";
import { MODEL_MISSION_TASKS } from "../../lib/tools/ml-generator/model-mission/catalog.js";

function assertParseablePython(code, label) {
  const parsed = spawnSync(
    "python",
    ["-c", "import ast,sys; compile(ast.parse(sys.stdin.read()), '<generated>', 'exec')"],
    { input: code, encoding: "utf8" },
  );
  assert.equal(parsed.status, 0, `${label}: ${parsed.stderr}`);
}

test("vision catalog exposes current guided missions and concrete examples", () => {
  const byId = Object.fromEntries(MODEL_MISSION_TASKS.map((task) => [task.id, task]));

  for (const id of [
    "object-detection",
    "instance-segmentation",
    "open-vocabulary-detection",
    "monocular-depth",
    "semantic-segmentation",
  ]) {
    assert.ok(byId[id], `${id} is available`);
    assert.ok(byId[id].examples.length >= 4, `${id} offers at least four examples`);
  }

  assert.equal(byId["monocular-depth"].technicalTerm, "Monocular Depth Estimation");
  assert.match(byId["semantic-segmentation"].description, /U-Net/i);
});

test("YOLO detection defaults to YOLO26 and retains YOLO11 and YOLOv8 choices", async () => {
  const recipe = await loadRecipe("yolo-detection-training");
  const defaults = getRecipeDefaultConfig(recipe, "starter");
  const family = recipe.fields.find(({ id }) => id === "modelFamily");

  assert.equal(defaults.modelFamily, "yolo26");
  assert.deepEqual(family.options.map(({ value }) => value), [
    "yolo26",
    "yolo11",
    "yolov8",
  ]);

  for (const [modelFamily, expectedWeight] of [
    ["yolo26", "yolo26n.pt"],
    ["yolo11", "yolo11n.pt"],
    ["yolov8", "yolov8n.pt"],
  ]) {
    const result = buildRecipeResult(recipe, recipe.id, {
      ...defaults,
      modelFamily,
    }, "starter");
    assert.deepEqual(result.validationErrors, {});
    assert.match(result.code, new RegExp(expectedWeight.replace(".", "\\.")));
    assertParseablePython(result.code, modelFamily);
  }
});

test("modern vision recipes produce complete runnable Python", async () => {
  const cases = [
    {
      id: "yoloe-open-vocabulary",
      required: [/from ultralytics import YOLOE/, /set_classes/, /workshop helmet/, /predict/],
    },
    {
      id: "yolo26-monocular-depth",
      required: [/yolo26n-depth\.pt/, /result\.depth\.data/, /colorize_depth/, /camera/],
    },
    {
      id: "unet-semantic-segmentation",
      required: [/class UNet\(/, /class SegmentationDataset\(/, /def train_epoch\(/, /def predict_mask\(/],
    },
  ];

  for (const item of cases) {
    const recipe = await loadRecipe(item.id);
    const defaults = getRecipeDefaultConfig(recipe, "starter");
    const result = buildRecipeResult(recipe, recipe.id, defaults, "starter");
    assert.deepEqual(result.validationErrors, {}, item.id);
    for (const pattern of item.required) assert.match(result.code, pattern, item.id);
    assert.doesNotMatch(result.code, /\b(?:TODO|TBD)\b|\{\{[^}]+\}\}/, item.id);
    assertParseablePython(result.code, item.id);
  }
});
