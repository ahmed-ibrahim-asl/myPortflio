import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CLASSICAL_DATASETS,
  CLASSICAL_MODELS,
  generateClassicalScript,
  normalizeClassicalConfig,
} from "../../lib/tools/ml-generator/workbench/classical-generator.js";

test("classical registries expose classification and regression choices", () => {
  assert.ok(CLASSICAL_MODELS.classification.length >= 6);
  assert.ok(CLASSICAL_MODELS.regression.length >= 8);
  assert.ok(CLASSICAL_DATASETS.classification.length >= 3);
  assert.ok(CLASSICAL_DATASETS.regression.length >= 3);
});

test("classification generator creates a leakage-safe SMOTE pipeline", () => {
  const result = generateClassicalScript({
    task: "classification",
    dataset: "breast-cancer",
    splitStrategy: "train-validation-test",
    testRatio: 0.15,
    validationRatio: 0.15,
    stratify: true,
    numericImputer: "median",
    categoricalImputer: "most_frequent",
    scaling: "standard",
    encoding: "onehot",
    balance: "smote",
    model: "logistic-regression",
    randomSeed: 42,
    showHead: true,
    showMissing: true,
    showTarget: true,
  });

  assert.equal(result.filename, "classification_pipeline.py");
  assert.match(result.code, /from imblearn\.pipeline import Pipeline/);
  assert.match(result.code, /from imblearn\.over_sampling import SMOTE/);
  assert.match(result.code, /\("preprocess", preprocessor\),\s+\("balance", SMOTE/);
  assert.match(result.code, /\("model", LogisticRegression/);
  assert.match(result.code, /stratify=y/);
  assert.match(result.code, /stratify=y_development/);
  assert.match(result.code, /pipeline\.fit\(X_train, y_train\)/);
  assert.match(result.code, /pipeline\.fit\(X_development, y_development\)/);
  assert.doesNotMatch(
    result.code.slice(0, result.code.indexOf("train_test_split(")),
    /fit_resample|fit_transform/,
  );
  assert.deepEqual(
    result.dependencies,
    ["pandas", "numpy", "scikit-learn", "imbalanced-learn", "joblib"],
  );
});

test("regression generator includes configurable Ridge and regression metrics", () => {
  const result = generateClassicalScript({
    task: "regression",
    dataset: "diabetes",
    splitStrategy: "train-test",
    testRatio: 0.2,
    numericImputer: "mean",
    categoricalImputer: "most_frequent",
    scaling: "robust",
    encoding: "onehot",
    model: "ridge",
    alpha: 2.5,
    randomSeed: 7,
    showHead: true,
    showStatistics: true,
  });

  assert.equal(result.filename, "regression_pipeline.py");
  assert.match(result.code, /from sklearn\.linear_model import Ridge/);
  assert.match(result.code, /Ridge\(alpha=2\.5\)/);
  assert.match(result.code, /RobustScaler/);
  assert.match(result.code, /mean_absolute_error/);
  assert.match(result.code, /mean_squared_error/);
  assert.match(result.code, /r2_score/);
  assert.doesNotMatch(result.code, /stratify=/);
  assert.doesNotMatch(result.code, /SMOTE/);
});

test("custom CSV values are escaped and ratios are normalized", () => {
  const normalized = normalizeClassicalConfig({
    task: "regression",
    dataset: "custom-csv",
    dataPath: "data/it's-ready.csv",
    targetColumn: "remaining_life",
    testRatio: 0.7,
    validationRatio: 0.7,
  });

  assert.equal(normalized.testRatio, 0.2);
  assert.equal(normalized.validationRatio, 0.15);

  const result = generateClassicalScript(normalized);
  assert.match(result.code, /DATA_PATH = "data\/it's-ready\.csv"/);
  assert.match(result.code, /TARGET_COLUMN = "remaining_life"/);
  assert.match(result.code, /pd\.read_csv\(DATA_PATH\)/);
});

test("model-specific configuration is emitted without unresolved placeholders", () => {
  const result = generateClassicalScript({
    task: "regression",
    dataset: "diabetes",
    model: "random-forest",
    nEstimators: 240,
    maxDepth: 12,
    randomSeed: 11,
  });

  assert.match(
    result.code,
    /RandomForestRegressor\(n_estimators=240, max_depth=12, random_state=11, n_jobs=-1\)/,
  );
  assert.doesNotMatch(result.code, /\{\{|\}\}|TODO|REPLACE_ME/);
});

test("advanced scalers remain inside the training pipeline", () => {
  for (const [scaling, expectedImport] of [
    ["maxabs", "MaxAbsScaler"],
    ["power", "PowerTransformer"],
    ["quantile", "QuantileTransformer"],
  ]) {
    const result = generateClassicalScript({
      task: "regression",
      dataset: "diabetes",
      model: "ridge",
      scaling,
    });
    assert.match(result.code, new RegExp(expectedImport));
    assert.ok(
      result.code.indexOf("train_test_split(")
      < result.code.indexOf(`("scaler", ${expectedImport}`),
      `${scaling} must be fitted after the split`,
    );
  }
});

test("group and time splits reserve a final untouched test set", () => {
  const groupResult = generateClassicalScript({
    task: "classification",
    dataset: "custom-csv",
    splitStrategy: "group",
    groupColumn: "customer_id",
  });
  const timeResult = generateClassicalScript({
    task: "regression",
    dataset: "custom-csv",
    splitStrategy: "time",
    timeColumn: "event_time",
  });

  assert.match(groupResult.code, /from sklearn\.model_selection import GroupShuffleSplit/);
  assert.match(groupResult.code, /GROUP_COLUMN = "customer_id"/);
  assert.match(groupResult.code, /GroupShuffleSplit\(n_splits=1, test_size=TEST_RATIO, random_state=RANDOM_SEED\)/);
  assert.match(groupResult.code, /X_train, X_test = X\.iloc\[train_index\], X\.iloc\[test_index\]/);
  assert.match(timeResult.code, /TIME_COLUMN = "event_time"/);
  assert.match(timeResult.code, /dataframe = dataframe\.sort_values\(TIME_COLUMN\)/);
  assert.match(timeResult.code, /split_index = int\(len\(X\) \* \(1 - TEST_RATIO\)\)/);
  assert.match(timeResult.code, /X_train, X_test = X\.iloc\[:split_index\], X\.iloc\[split_index:\]/);
});

test("advanced split strategies require their configured columns", () => {
  const groupResult = generateClassicalScript({
    task: "classification",
    dataset: "custom-csv",
    splitStrategy: "group",
  });
  const timeResult = generateClassicalScript({
    task: "regression",
    dataset: "custom-csv",
    splitStrategy: "time",
  });

  assert.equal(groupResult.validationErrors.groupColumn, "Choose a group column for a group split.");
  assert.equal(timeResult.validationErrors.timeColumn, "Choose a time column for a time split.");
});

test("cross-validation and randomized search are emitted only when selected", () => {
  const crossValidation = generateClassicalScript({
    task: "classification",
    dataset: "breast-cancer",
    splitStrategy: "cross-validation",
    cvFolds: 4,
    searchStrategy: "randomized",
  });
  const randomSplit = generateClassicalScript({
    task: "classification",
    dataset: "breast-cancer",
    splitStrategy: "random",
  });

  assert.match(crossValidation.code, /from sklearn\.model_selection import RandomizedSearchCV, cross_validate, train_test_split/);
  assert.match(crossValidation.code, /cross_validate\(pipeline, X_train, y_train, cv=4/);
  assert.match(crossValidation.code, /RandomizedSearchCV\(pipeline, param_distributions=PARAMETER_DISTRIBUTIONS, n_iter=10, cv=4/);
  assert.doesNotMatch(randomSplit.code, /cross_validate|RandomizedSearchCV/);
});

test("randomized search uses Linear Regression parameters that the estimator accepts", () => {
  const result = generateClassicalScript({
    task: "regression",
    dataset: "diabetes",
    model: "linear-regression",
    splitStrategy: "cross-validation",
    searchStrategy: "randomized",
  });

  assert.match(result.code, /PARAMETER_DISTRIBUTIONS = \{"model__fit_intercept": \[True, False\]\}/);
  assert.doesNotMatch(result.code, /"model__max_depth"/);
  assert.deepEqual(result.validationErrors, {});
});

test("known multiclass datasets reject binary decision thresholds before training", () => {
  const result = generateClassicalScript({
    task: "classification",
    dataset: "iris",
    decisionThreshold: 0.7,
  });

  assert.equal(
    result.validationErrors.decisionThreshold,
    "Decision thresholds require a binary classification dataset.",
  );
  assert.match(result.code, /Decision thresholds require a binary classifier/);
});

test("calibration and binary thresholds only apply to compatible classification workflows", () => {
  const classification = generateClassicalScript({
    task: "classification",
    dataset: "breast-cancer",
    calibration: "sigmoid",
    decisionThreshold: 0.7,
  });
  const regression = generateClassicalScript({
    task: "regression",
    dataset: "diabetes",
    calibration: "sigmoid",
    decisionThreshold: 0.7,
  });

  assert.match(classification.code, /from sklearn\.calibration import CalibratedClassifierCV/);
  assert.match(classification.code, /CalibratedClassifierCV\(pipeline, method="sigmoid", cv=5\)/);
  assert.match(classification.code, /if len\(model\.classes_\) != 2:/);
  assert.match(classification.code, /probabilities = model\.predict_proba\(features\)\[:, 1\]/);
  assert.equal(regression.validationErrors.calibration, "Calibration is available only for classification.");
  assert.equal(regression.validationErrors.decisionThreshold, "Decision thresholds are available only for binary classification probabilities.");
  assert.doesNotMatch(regression.code, /CalibratedClassifierCV|predict_proba/);
});

test("saved artifact names identify the task pipeline", () => {
  assert.match(
    generateClassicalScript({ task: "classification", dataset: "breast-cancer" }).code,
    /MODEL_PATH = "classification_pipeline\.joblib"/,
  );
  assert.match(
    generateClassicalScript({ task: "regression", dataset: "diabetes" }).code,
    /MODEL_PATH = "regression_pipeline\.joblib"/,
  );
});
