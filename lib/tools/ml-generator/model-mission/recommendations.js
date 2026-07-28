const SCALE_SENSITIVE_MODELS = new Set([
  "logistic-regression",
  "support-vector-machine",
  "support-vector-regression",
  "knn",
  "linear-regression",
  "ridge",
  "lasso",
  "elastic-net",
]);

const TREE_MODELS = new Set([
  "decision-tree",
  "random-forest",
  "gradient-boosting",
  "hist-gradient-boosting",
]);

export function getMissionRecommendation(controlId, project = {}) {
  if (controlId !== "scaling") return null;

  const model = project.model?.model;
  if (TREE_MODELS.has(model)) {
    return {
      recommendedValue: "none",
      label: "No scaling recommended",
      reason: "Tree-based models split on feature order, so scaling usually does not change their decisions.",
    };
  }
  if (SCALE_SENSITIVE_MODELS.has(model)) {
    return {
      recommendedValue: "standard",
      label: "Standard scaling recommended",
      reason: "This model is sensitive to feature scale, so standard scaling gives features comparable influence.",
    };
  }
  return null;
}
