import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getMissionRecommendation,
} from "../../lib/tools/ml-generator/model-mission/recommendations.js";

test("scaling recommendations follow model behavior without changing explicit choices", () => {
  const treeRecommendation = getMissionRecommendation("scaling", {
    taskId: "regression",
    model: { model: "random-forest" },
    preparation: { scaling: "standard" },
  });
  const linearRecommendation = getMissionRecommendation("scaling", {
    taskId: "classification",
    model: { model: "logistic-regression" },
    preparation: { scaling: "none" },
  });

  assert.deepEqual(treeRecommendation, {
    recommendedValue: "none",
    label: "No scaling recommended",
    reason: "Tree-based models split on feature order, so scaling usually does not change their decisions.",
  });
  assert.deepEqual(linearRecommendation, {
    recommendedValue: "standard",
    label: "Standard scaling recommended",
    reason: "This model is sensitive to feature scale, so standard scaling gives features comparable influence.",
  });
});

test("unrelated controls do not receive scaling recommendations", () => {
  assert.equal(
    getMissionRecommendation("numericImputer", {
      taskId: "classification",
      model: { model: "logistic-regression" },
    }),
    null,
  );
});
