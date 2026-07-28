import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getMissionRecommendation,
} from "../../lib/tools/ml-generator/model-mission/recommendations.js";
import {
  MISSION_CONTROL_DEFINITIONS,
} from "../../lib/tools/ml-generator/model-mission/control-definitions.js";

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

test("canonical support-vector and histogram models receive scaling guidance", () => {
  assert.equal(
    getMissionRecommendation("scaling", {
      taskId: "classification",
      model: { model: "support-vector-machine" },
    })?.recommendedValue,
    "standard",
  );
  assert.equal(
    getMissionRecommendation("scaling", {
      taskId: "classification",
      model: { model: "hist-gradient-boosting" },
    })?.recommendedValue,
    "none",
  );
});

test("advanced workflow controls explain their concrete safety trade-offs", () => {
  const controls = new Map(
    MISSION_CONTROL_DEFINITIONS.map((control) => [control.id, control]),
  );
  for (const id of [
    "groupColumn",
    "timeColumn",
    "cvFolds",
    "searchStrategy",
    "calibration",
    "decisionThreshold",
  ]) {
    const explanation = controls.get(id)?.explanation;
    assert.ok(explanation, `${id} must have an explanation`);
    assert.doesNotMatch(explanation.what, /recipe setting/i);
    assert.doesNotMatch(explanation.codeEffect, /sets .*selected value/i);
    assert.ok(explanation.avoidWhen.length > 30);
    assert.ok(explanation.tradeoff.length > 30);
  }
});
