import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ML_RECIPE_CATALOG,
  getRecipeManifest,
  searchRecipeCatalog,
} from "../../lib/tools/ml-generator/catalog.js";
import {
  validateRecipeManifest,
  validateSourceRecord,
} from "../../lib/tools/ml-generator/schema.js";
import { ML_SOURCES } from "../../lib/tools/ml-generator/sources.js";
import {
  ML_DATA_PROFILES,
  ML_DOMAINS,
  ML_FRAMEWORKS,
  ML_PIPELINE_STAGES,
  ML_TASKS,
} from "../../lib/tools/ml-generator/taxonomy.js";

test("the lightweight catalog preserves all existing recipe IDs", () => {
  assert.deepEqual(
    ML_RECIPE_CATALOG.map(({ id }) => id),
    [
      "yolo-detection-training",
      "yolo-segmentation-training",
      "sensor-timeseries-classification",
      "edge-image-classification",
    ],
  );
});

test("every manifest resolves its taxonomy and source references", () => {
  const domainIds = new Set(ML_DOMAINS.map(({ id }) => id));
  const taskIds = new Set(ML_TASKS.map(({ id }) => id));
  const dataProfileIds = new Set(ML_DATA_PROFILES.map(({ id }) => id));
  const frameworkIds = new Set(ML_FRAMEWORKS.map(({ id }) => id));
  const stageIds = new Set(ML_PIPELINE_STAGES.map(({ id }) => id));
  const sourceIds = new Set(ML_SOURCES.map(({ id }) => id));

  for (const manifest of ML_RECIPE_CATALOG) {
    assert.deepEqual(validateRecipeManifest(manifest), {});
    assert.equal(domainIds.has(manifest.domainId), true);
    assert.equal(taskIds.has(manifest.taskId), true);
    assert.equal(frameworkIds.has(manifest.frameworkId), true);
    assert.equal(
      manifest.supportedDataProfileIds.every((id) => dataProfileIds.has(id)),
      true,
    );
    assert.equal(
      manifest.pipelineStages.every((id) => stageIds.has(id)),
      true,
    );
    assert.equal(
      manifest.sourceRefs.every((id) => sourceIds.has(id)),
      true,
    );
  }
});

test("every source record exposes auditable license status", () => {
  for (const source of ML_SOURCES) {
    assert.deepEqual(validateSourceRecord(source), {});
    assert.match(source.url, /^https:\/\//);
    assert.match(source.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("catalog search is local, case-insensitive, and returns stable order", () => {
  assert.deepEqual(
    searchRecipeCatalog("YOLO").map(({ id }) => id),
    ["yolo-detection-training", "yolo-segmentation-training"],
  );
  assert.equal(
    getRecipeManifest("sensor-timeseries-classification")?.frameworkId,
    "pytorch",
  );
  assert.equal(getRecipeManifest("missing"), null);
});
