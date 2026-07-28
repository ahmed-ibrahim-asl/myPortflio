const TASKS = new Set(["classification", "regression"]);
const SPLIT_STRATEGIES = new Set([
  "train-test",
  "train-validation-test",
  "random",
  "group",
  "time",
  "cross-validation",
]);
const SCALERS = new Set([
  "none",
  "standard",
  "robust",
  "minmax",
  "maxabs",
  "power",
  "quantile",
]);
const IMPUTERS = new Set(["mean", "median", "most_frequent", "constant"]);
const ENCODERS = new Set(["onehot", "ordinal"]);
const BALANCE_OPTIONS = new Set(["none", "class-weight", "smote"]);
const CALIBRATION_METHODS = new Set(["none", "sigmoid", "isotonic"]);
const SEARCH_STRATEGIES = new Set(["none", "randomized"]);

export const CLASSICAL_MODELS = Object.freeze({
  classification: Object.freeze([
    {
      id: "logistic-regression",
      label: "Logistic Regression",
      family: "Linear baseline",
      description: "A strong, explainable baseline for binary and multiclass targets.",
      supportsClassWeight: true,
    },
    {
      id: "random-forest",
      label: "Random Forest",
      family: "Tree ensemble",
      description: "A robust nonlinear model that handles mixed feature effects.",
      supportsClassWeight: true,
    },
    {
      id: "gradient-boosting",
      label: "Gradient Boosting",
      family: "Boosted trees",
      description: "Sequential trees that focus on previous prediction errors.",
      supportsClassWeight: false,
    },
    {
      id: "support-vector-machine",
      label: "Support Vector Machine",
      family: "Kernel method",
      description: "A margin-based model suited to small and medium datasets.",
      supportsClassWeight: true,
    },
    {
      id: "knn",
      label: "K-Nearest Neighbors",
      family: "Distance based",
      description: "Predicts from nearby examples and makes scaling especially important.",
      supportsClassWeight: false,
    },
    {
      id: "decision-tree",
      label: "Decision Tree",
      family: "Interpretable tree",
      description: "Readable decision rules with configurable depth control.",
      supportsClassWeight: true,
    },
    {
      id: "hist-gradient-boosting",
      label: "Histogram Gradient Boosting",
      family: "Efficient boosted trees",
      description: "An efficient nonlinear model for larger tabular datasets.",
      supportsClassWeight: true,
    },
  ]),
  regression: Object.freeze([
    {
      id: "linear-regression",
      label: "Linear Regression",
      family: "Linear baseline",
      description: "A simple baseline for approximately linear relationships.",
    },
    {
      id: "ridge",
      label: "Ridge Regression",
      family: "Regularized linear",
      description: "Linear regression with L2 regularization for stable coefficients.",
    },
    {
      id: "lasso",
      label: "Lasso Regression",
      family: "Regularized linear",
      description: "L1 regularization that can shrink some coefficients to zero.",
    },
    {
      id: "elastic-net",
      label: "Elastic Net",
      family: "Regularized linear",
      description: "Combines L1 and L2 regularization.",
    },
    {
      id: "random-forest",
      label: "Random Forest Regressor",
      family: "Tree ensemble",
      description: "A robust nonlinear ensemble with little feature preparation.",
    },
    {
      id: "gradient-boosting",
      label: "Gradient Boosting Regressor",
      family: "Boosted trees",
      description: "Fits sequential trees to reduce prediction error.",
    },
    {
      id: "support-vector-regression",
      label: "Support Vector Regression",
      family: "Kernel method",
      description: "A margin-based regressor for small and medium datasets.",
    },
    {
      id: "knn",
      label: "K-Nearest Neighbors Regressor",
      family: "Distance based",
      description: "Predicts a value from nearby training examples.",
    },
    {
      id: "decision-tree",
      label: "Decision Tree Regressor",
      family: "Interpretable tree",
      description: "Nonlinear decision rules controlled by maximum depth.",
    },
    {
      id: "hist-gradient-boosting",
      label: "Histogram Gradient Boosting Regressor",
      family: "Efficient boosted trees",
      description: "Efficient gradient boosting for larger tabular datasets.",
    },
  ]),
});

export const CLASSICAL_DATASETS = Object.freeze({
  classification: Object.freeze([
    {
      id: "breast-cancer",
      label: "Breast Cancer Wisconsin",
      difficulty: "Beginner",
      source: "Scikit-learn / UCI",
      sourceUrl: "https://archive.ics.uci.edu/dataset/17/breast",
      lesson: "Binary classification, scaling, and careful metric selection.",
    },
    {
      id: "iris",
      label: "Iris",
      difficulty: "Beginner",
      source: "Scikit-learn / UCI",
      sourceUrl: "https://archive.ics.uci.edu/dataset/53/iris",
      lesson: "Small multiclass classification and visual feature exploration.",
    },
    {
      id: "wine",
      label: "Wine",
      difficulty: "Beginner",
      source: "Scikit-learn / UCI",
      sourceUrl: "https://archive.ics.uci.edu/dataset/109/winedataset",
      lesson: "Multiclass classification, scaling, and feature importance.",
    },
    {
      id: "custom-csv",
      label: "My CSV file",
      difficulty: "Any",
      source: "Local file",
      sourceUrl: "",
      lesson: "Apply the workflow to your own tabular dataset.",
    },
  ]),
  regression: Object.freeze([
    {
      id: "diabetes",
      label: "Diabetes Progression",
      difficulty: "Beginner",
      source: "Scikit-learn",
      sourceUrl: "https://scikit-learn.org/stable/datasets/toy_dataset.html#diabetes-dataset",
      lesson: "Continuous targets, regression baselines, MAE, RMSE, and R².",
    },
    {
      id: "california-housing",
      label: "California Housing",
      difficulty: "Intermediate",
      source: "Scikit-learn / StatLib",
      sourceUrl: "https://scikit-learn.org/stable/datasets/real_world.html#california-housing-dataset",
      lesson: "Larger regression data, skewed features, and generalization.",
    },
    {
      id: "custom-csv",
      label: "My CSV file",
      difficulty: "Any",
      source: "Local file",
      sourceUrl: "",
      lesson: "Predict a continuous target from your own columns.",
    },
  ]),
});

const DEFAULTS = Object.freeze({
  task: "classification",
  dataset: "breast-cancer",
  dataPath: "data/dataset.csv",
  targetColumn: "target",
  splitStrategy: "train-validation-test",
  testRatio: 0.15,
  validationRatio: 0.15,
  groupColumn: "",
  timeColumn: "",
  cvFolds: 5,
  searchStrategy: "none",
  stratify: true,
  numericImputer: "median",
  categoricalImputer: "most_frequent",
  scaling: "standard",
  encoding: "onehot",
  balance: "none",
  calibration: "none",
  decisionThreshold: null,
  model: "logistic-regression",
  randomSeed: 42,
  alpha: 1,
  l1Ratio: 0.5,
  c: 1,
  kernel: "rbf",
  nEstimators: 200,
  maxDepth: 8,
  neighbors: 5,
  learningRate: 0.05,
  showHead: true,
  showShape: true,
  showStatistics: true,
  showMissing: true,
  showTarget: true,
});

function clampNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function clampInteger(value, fallback, minimum, maximum) {
  return Math.round(clampNumber(value, fallback, minimum, maximum));
}

function pythonString(value) {
  return JSON.stringify(String(value));
}

function getDataset(task, datasetId) {
  return CLASSICAL_DATASETS[task].find(({ id }) => id === datasetId)
    ?? CLASSICAL_DATASETS[task][0];
}

function getModel(task, modelId) {
  return CLASSICAL_MODELS[task].find(({ id }) => id === modelId)
    ?? CLASSICAL_MODELS[task][0];
}

export function normalizeClassicalConfig(input = {}) {
  const task = TASKS.has(input.task) ? input.task : DEFAULTS.task;
  const requestedDataset = String(input.dataset ?? "");
  const dataset = getDataset(task, requestedDataset).id;
  const requestedModel = String(input.model ?? "");
  const fallbackModel = task === "classification"
    ? DEFAULTS.model
    : "ridge";
  const model = getModel(task, requestedModel || fallbackModel).id;
  const splitStrategy = SPLIT_STRATEGIES.has(input.splitStrategy)
    ? input.splitStrategy
    : DEFAULTS.splitStrategy;
  let testRatio = clampNumber(input.testRatio, DEFAULTS.testRatio, 0.1, 0.4);
  let validationRatio = clampNumber(
    input.validationRatio,
    DEFAULTS.validationRatio,
    0.1,
    0.3,
  );

  if (testRatio + validationRatio > 0.5) {
    testRatio = 0.2;
    validationRatio = 0.15;
  }

  return {
    ...DEFAULTS,
    ...input,
    task,
    dataset,
    model,
    splitStrategy,
    testRatio,
    validationRatio,
    groupColumn: String(input.groupColumn ?? DEFAULTS.groupColumn).trim(),
    timeColumn: String(input.timeColumn ?? DEFAULTS.timeColumn).trim(),
    cvFolds: clampInteger(input.cvFolds, DEFAULTS.cvFolds, 2, 10),
    searchStrategy: SEARCH_STRATEGIES.has(input.searchStrategy)
      ? input.searchStrategy
      : DEFAULTS.searchStrategy,
    dataPath: String(input.dataPath ?? DEFAULTS.dataPath),
    targetColumn: String(input.targetColumn ?? DEFAULTS.targetColumn),
    stratify: task === "classification"
      ? input.stratify !== false
      : false,
    numericImputer: IMPUTERS.has(input.numericImputer)
      ? input.numericImputer
      : DEFAULTS.numericImputer,
    categoricalImputer: IMPUTERS.has(input.categoricalImputer)
      ? input.categoricalImputer
      : DEFAULTS.categoricalImputer,
    scaling: SCALERS.has(input.scaling) ? input.scaling : DEFAULTS.scaling,
    encoding: ENCODERS.has(input.encoding) ? input.encoding : DEFAULTS.encoding,
    balance: task === "classification" && BALANCE_OPTIONS.has(input.balance)
      ? input.balance
      : "none",
    calibration: CALIBRATION_METHODS.has(input.calibration)
      ? input.calibration
      : DEFAULTS.calibration,
    decisionThreshold: input.decisionThreshold !== null
      && input.decisionThreshold !== ""
      && Number.isFinite(Number(input.decisionThreshold))
      ? clampNumber(input.decisionThreshold, 0.5, 0.01, 0.99)
      : null,
    randomSeed: clampInteger(input.randomSeed, DEFAULTS.randomSeed, 0, 999999),
    alpha: clampNumber(input.alpha, DEFAULTS.alpha, 0.0001, 10000),
    l1Ratio: clampNumber(input.l1Ratio, DEFAULTS.l1Ratio, 0, 1),
    c: clampNumber(input.c, DEFAULTS.c, 0.0001, 10000),
    nEstimators: clampInteger(
      input.nEstimators,
      DEFAULTS.nEstimators,
      10,
      2000,
    ),
    maxDepth: clampInteger(input.maxDepth, DEFAULTS.maxDepth, 1, 100),
    neighbors: clampInteger(input.neighbors, DEFAULTS.neighbors, 1, 100),
    learningRate: clampNumber(
      input.learningRate,
      DEFAULTS.learningRate,
      0.0001,
      1,
    ),
    showHead: input.showHead !== false,
    showShape: input.showShape !== false,
    showStatistics: input.showStatistics !== false,
    showMissing: input.showMissing !== false,
    showTarget: input.showTarget !== false,
  };
}

function buildDatasetSection(config) {
  if (config.dataset === "custom-csv") {
    const lines = [
      `DATA_PATH = ${pythonString(config.dataPath)}`,
      `TARGET_COLUMN = ${pythonString(config.targetColumn)}`,
      "",
      "dataframe = pd.read_csv(DATA_PATH)",
      "if TARGET_COLUMN not in dataframe.columns:",
      "    raise ValueError(f\"Target column {TARGET_COLUMN!r} was not found.\")",
    ];
    if (config.splitStrategy === "group") {
      lines.push(
        `GROUP_COLUMN = ${pythonString(config.groupColumn)}`,
        "if GROUP_COLUMN not in dataframe.columns:",
        "    raise ValueError(f\"Group column {GROUP_COLUMN!r} was not found.\")",
        "groups = dataframe[GROUP_COLUMN].copy()",
        "X = dataframe.drop(columns=[TARGET_COLUMN, GROUP_COLUMN])",
      );
    } else if (config.splitStrategy === "time") {
      lines.push(
        `TIME_COLUMN = ${pythonString(config.timeColumn)}`,
        "if TIME_COLUMN not in dataframe.columns:",
        "    raise ValueError(f\"Time column {TIME_COLUMN!r} was not found.\")",
        "dataframe = dataframe.sort_values(TIME_COLUMN)",
        "X = dataframe.drop(columns=[TARGET_COLUMN, TIME_COLUMN])",
      );
    } else {
      lines.push("X = dataframe.drop(columns=[TARGET_COLUMN])");
    }
    lines.push("y = dataframe[TARGET_COLUMN].copy()");
    return lines;
  }

  const loaders = {
    "breast-cancer": {
      importLine: "from sklearn.datasets import load_breast_cancer",
      loadLine: "dataset = load_breast_cancer(as_frame=True)",
    },
    iris: {
      importLine: "from sklearn.datasets import load_iris",
      loadLine: "dataset = load_iris(as_frame=True)",
    },
    wine: {
      importLine: "from sklearn.datasets import load_wine",
      loadLine: "dataset = load_wine(as_frame=True)",
    },
    diabetes: {
      importLine: "from sklearn.datasets import load_diabetes",
      loadLine: "dataset = load_diabetes(as_frame=True)",
    },
    "california-housing": {
      importLine: "from sklearn.datasets import fetch_california_housing",
      loadLine: "dataset = fetch_california_housing(as_frame=True)",
    },
  };
  const loader = loaders[config.dataset];

  const lines = [
    loader.importLine,
    "",
    loader.loadLine,
    "X = dataset.data.copy()",
    "y = dataset.target.copy()",
    "y.name = getattr(y, \"name\", None) or \"target\"",
  ];
  if (config.splitStrategy === "group") {
    lines.push(
      `GROUP_COLUMN = ${pythonString(config.groupColumn)}`,
      "if GROUP_COLUMN not in X.columns:",
      "    raise ValueError(f\"Group column {GROUP_COLUMN!r} was not found.\")",
      "groups = X[GROUP_COLUMN].copy()",
      "X = X.drop(columns=[GROUP_COLUMN])",
    );
  } else if (config.splitStrategy === "time") {
    lines.push(
      `TIME_COLUMN = ${pythonString(config.timeColumn)}`,
      "if TIME_COLUMN not in X.columns:",
      "    raise ValueError(f\"Time column {TIME_COLUMN!r} was not found.\")",
      "ordered_index = X.sort_values(TIME_COLUMN).index",
      "X = X.loc[ordered_index].drop(columns=[TIME_COLUMN])",
      "y = y.loc[ordered_index]",
    );
  }
  return lines;
}

function buildInspectionSection(config) {
  const lines = ["", "# Inspect the data before transforming it"];
  if (config.showHead) {
    lines.push("print(\"\\nFeature preview:\")", "print(X.head())");
  }
  if (config.showShape) {
    lines.push("print(\"\\nShapes:\", X.shape, y.shape)");
    lines.push("print(\"\\nColumn types:\")", "print(X.dtypes)");
  }
  if (config.showStatistics) {
    lines.push("print(\"\\nFeature statistics:\")", "print(X.describe(include=\"all\").T)");
  }
  if (config.showMissing) {
    lines.push(
      "print(\"\\nMissing values:\")",
      "print(pd.concat([X, y.rename(\"__target__\")], axis=1).isna().sum())",
    );
  }
  if (config.showTarget) {
    if (config.task === "classification") {
      lines.push(
        "print(\"\\nTarget distribution:\")",
        "print(y.value_counts(dropna=False, normalize=True).sort_index())",
      );
    } else {
      lines.push("print(\"\\nTarget statistics:\")", "print(y.describe())");
    }
  }
  return lines;
}

function buildSplitSection(config) {
  const lines = [
    "",
    "# Split before fitting imputers, encoders, scalers, or samplers",
    `RANDOM_SEED = ${config.randomSeed}`,
    `TEST_RATIO = ${config.testRatio}`,
  ];
  const firstStratify = config.task === "classification"
    ? ", stratify=y if STRATIFY else None"
    : "";

  if (config.task === "classification") {
    lines.push(`STRATIFY = ${config.stratify ? "True" : "False"}`);
  }

  if (config.splitStrategy === "group") {
    lines.push(
      "group_splitter = GroupShuffleSplit(n_splits=1, test_size=TEST_RATIO, random_state=RANDOM_SEED)",
      "train_index, test_index = next(group_splitter.split(X, y, groups=groups))",
      "X_train, X_test = X.iloc[train_index], X.iloc[test_index]",
      "y_train, y_test = y.iloc[train_index], y.iloc[test_index]",
    );
  } else if (config.splitStrategy === "time") {
    lines.push(
      "split_index = int(len(X) * (1 - TEST_RATIO))",
      "X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]",
      "y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]",
    );
  } else if (config.splitStrategy === "train-validation-test") {
    lines.push(
      `VALIDATION_RATIO = ${config.validationRatio}`,
      "X_development, X_test, y_development, y_test = train_test_split(",
      "    X, y, test_size=TEST_RATIO, random_state=RANDOM_SEED"
        + firstStratify + ",",
      ")",
      "validation_share = VALIDATION_RATIO / (1.0 - TEST_RATIO)",
    );
    const secondStratify = config.task === "classification"
      ? ", stratify=y_development if STRATIFY else None"
      : "";
    lines.push(
      "X_train, X_validation, y_train, y_validation = train_test_split(",
      "    X_development, y_development, test_size=validation_share,"
        + " random_state=RANDOM_SEED" + secondStratify + ",",
      ")",
    );
  } else {
    lines.push(
      "X_train, X_test, y_train, y_test = train_test_split(",
      "    X, y, test_size=TEST_RATIO, random_state=RANDOM_SEED"
        + firstStratify + ",",
      ")",
    );
  }

  return lines;
}

function buildPreprocessorSection(config) {
  const scalerImports = {
    none: "",
    standard: "StandardScaler",
    robust: "RobustScaler",
    minmax: "MinMaxScaler",
    maxabs: "MaxAbsScaler",
    power: "PowerTransformer",
    quantile: "QuantileTransformer",
  };
  const scalerConstructors = {
    standard: "StandardScaler()",
    robust: "RobustScaler()",
    minmax: "MinMaxScaler()",
    maxabs: "MaxAbsScaler()",
    power: "PowerTransformer()",
    quantile: "QuantileTransformer(random_state=RANDOM_SEED)",
  };
  const numericSteps = [
    `("imputer", SimpleImputer(strategy=${pythonString(config.numericImputer)}))`,
  ];
  if (config.scaling !== "none") {
    numericSteps.push(`("scaler", ${scalerConstructors[config.scaling]})`);
  }
  const encoder = config.encoding === "ordinal"
    ? "OrdinalEncoder(handle_unknown=\"use_encoded_value\", unknown_value=-1)"
    : "OneHotEncoder(handle_unknown=\"ignore\", sparse_output=False)";

  const lines = [
    "",
    "# Learn preprocessing from training data only",
    "numeric_pipeline = SklearnPipeline(steps=[",
    ...numericSteps.map((step) => `    ${step},`),
    "])",
    "categorical_pipeline = SklearnPipeline(steps=[",
    `    ("imputer", SimpleImputer(strategy=${pythonString(config.categoricalImputer)})),`,
    `    ("encoder", ${encoder}),`,
    "])",
    "preprocessor = ColumnTransformer(",
    "    transformers=[",
    "        (\"numeric\", numeric_pipeline, make_column_selector(dtype_include=np.number)),",
    "        (\"categorical\", categorical_pipeline, make_column_selector(dtype_exclude=np.number)),",
    "    ],",
    "    remainder=\"drop\",",
    ")",
  ];

  return {
    lines,
    scalerImport: scalerImports[config.scaling] ?? "",
  };
}

function buildModel(config) {
  const classWeight = config.balance === "class-weight"
    ? "\"balanced\""
    : "None";

  const classification = {
    "logistic-regression": {
      importLine: "from sklearn.linear_model import LogisticRegression",
      expression: `LogisticRegression(C=${config.c}, max_iter=1000, class_weight=${classWeight})`,
    },
    "random-forest": {
      importLine: "from sklearn.ensemble import RandomForestClassifier",
      expression: `RandomForestClassifier(n_estimators=${config.nEstimators}, max_depth=${config.maxDepth}, class_weight=${classWeight}, random_state=${config.randomSeed}, n_jobs=-1)`,
    },
    "gradient-boosting": {
      importLine: "from sklearn.ensemble import GradientBoostingClassifier",
      expression: `GradientBoostingClassifier(n_estimators=${config.nEstimators}, learning_rate=${config.learningRate}, max_depth=${config.maxDepth}, random_state=${config.randomSeed})`,
    },
    "support-vector-machine": {
      importLine: "from sklearn.svm import SVC",
      expression: `SVC(C=${config.c}, kernel=${pythonString(config.kernel)}, probability=True, class_weight=${classWeight}, random_state=${config.randomSeed})`,
    },
    knn: {
      importLine: "from sklearn.neighbors import KNeighborsClassifier",
      expression: `KNeighborsClassifier(n_neighbors=${config.neighbors})`,
    },
    "decision-tree": {
      importLine: "from sklearn.tree import DecisionTreeClassifier",
      expression: `DecisionTreeClassifier(max_depth=${config.maxDepth}, class_weight=${classWeight}, random_state=${config.randomSeed})`,
    },
    "hist-gradient-boosting": {
      importLine: "from sklearn.ensemble import HistGradientBoostingClassifier",
      expression: `HistGradientBoostingClassifier(learning_rate=${config.learningRate}, max_depth=${config.maxDepth}, class_weight=${classWeight}, random_state=${config.randomSeed})`,
    },
  };

  const regression = {
    "linear-regression": {
      importLine: "from sklearn.linear_model import LinearRegression",
      expression: "LinearRegression()",
    },
    ridge: {
      importLine: "from sklearn.linear_model import Ridge",
      expression: `Ridge(alpha=${config.alpha})`,
    },
    lasso: {
      importLine: "from sklearn.linear_model import Lasso",
      expression: `Lasso(alpha=${config.alpha}, max_iter=10000, random_state=${config.randomSeed})`,
    },
    "elastic-net": {
      importLine: "from sklearn.linear_model import ElasticNet",
      expression: `ElasticNet(alpha=${config.alpha}, l1_ratio=${config.l1Ratio}, max_iter=10000, random_state=${config.randomSeed})`,
    },
    "random-forest": {
      importLine: "from sklearn.ensemble import RandomForestRegressor",
      expression: `RandomForestRegressor(n_estimators=${config.nEstimators}, max_depth=${config.maxDepth}, random_state=${config.randomSeed}, n_jobs=-1)`,
    },
    "gradient-boosting": {
      importLine: "from sklearn.ensemble import GradientBoostingRegressor",
      expression: `GradientBoostingRegressor(n_estimators=${config.nEstimators}, learning_rate=${config.learningRate}, max_depth=${config.maxDepth}, random_state=${config.randomSeed})`,
    },
    "support-vector-regression": {
      importLine: "from sklearn.svm import SVR",
      expression: `SVR(C=${config.c}, kernel=${pythonString(config.kernel)})`,
    },
    knn: {
      importLine: "from sklearn.neighbors import KNeighborsRegressor",
      expression: `KNeighborsRegressor(n_neighbors=${config.neighbors})`,
    },
    "decision-tree": {
      importLine: "from sklearn.tree import DecisionTreeRegressor",
      expression: `DecisionTreeRegressor(max_depth=${config.maxDepth}, random_state=${config.randomSeed})`,
    },
    "hist-gradient-boosting": {
      importLine: "from sklearn.ensemble import HistGradientBoostingRegressor",
      expression: `HistGradientBoostingRegressor(learning_rate=${config.learningRate}, max_depth=${config.maxDepth}, random_state=${config.randomSeed})`,
    },
  };

  return config.task === "classification"
    ? classification[config.model]
    : regression[config.model];
}

function buildEvaluationFunction(config) {
  if (config.task === "classification") {
    return [
      "",
      "def evaluate(model, features, target, split_name):",
      ...(config.decisionThreshold === null
        ? ["    predictions = model.predict(features)"]
        : [
          "    if len(model.classes_) != 2:",
          "        raise ValueError(\"Decision thresholds require a binary classifier.\")",
          "    probabilities = model.predict_proba(features)[:, 1]",
          `    predictions = np.where(probabilities >= ${config.decisionThreshold}, model.classes_[1], model.classes_[0])`,
        ]),
      "    print(f\"\\n{split_name} accuracy: {accuracy_score(target, predictions):.4f}\")",
      "    print(f\"{split_name} balanced accuracy: {balanced_accuracy_score(target, predictions):.4f}\")",
      "    print(f\"{split_name} weighted F1: {f1_score(target, predictions, average='weighted'):.4f}\")",
      "    print(\"\\nClassification report:\")",
      "    print(classification_report(target, predictions, zero_division=0))",
      "    print(\"Confusion matrix:\")",
      "    print(confusion_matrix(target, predictions))",
      "    return predictions",
    ];
  }

  return [
    "",
    "def evaluate(model, features, target, split_name):",
    "    predictions = model.predict(features)",
    "    mae = mean_absolute_error(target, predictions)",
    "    rmse = mean_squared_error(target, predictions) ** 0.5",
    "    r2 = r2_score(target, predictions)",
    "    print(f\"\\n{split_name} MAE: {mae:.4f}\")",
    "    print(f\"{split_name} RMSE: {rmse:.4f}\")",
    "    print(f\"{split_name} R2: {r2:.4f}\")",
    "    return predictions",
  ];
}

function searchParameters(config) {
  if (["logistic-regression", "support-vector-machine", "support-vector-regression"].includes(config.model)) {
    return '{"model__C": [0.1, 1.0, 10.0]}';
  }
  if (["ridge", "lasso", "elastic-net"].includes(config.model)) {
    return '{"model__alpha": [0.01, 0.1, 1.0, 10.0]}';
  }
  if (config.model === "knn") {
    return '{"model__n_neighbors": [3, 5, 9, 15]}';
  }
  return '{"model__max_depth": [3, 5, 8, 12]}';
}

function buildTrainingSection(config, modelExpression) {
  const pipelineClass = config.balance === "smote"
    ? "ImbalancedPipeline"
    : "SklearnPipeline";
  const lines = [
    "",
    "# Keep preprocessing, optional balancing, and the model in one pipeline",
    "pipeline_steps = [",
    "    (\"preprocess\", preprocessor),",
  ];
  if (config.balance === "smote") {
    lines.push(`    ("balance", SMOTE(random_state=${config.randomSeed})),`);
  }
  lines.push(
    `    ("model", ${modelExpression}),`,
    "]",
    `pipeline = ${pipelineClass}(steps=pipeline_steps)`,
    "",
  );

  if (config.splitStrategy === "cross-validation") {
    lines.push(
      `cross_validation_results = cross_validate(pipeline, X_train, y_train, cv=${config.cvFolds}, scoring="accuracy" if ${pythonString(config.task)} == "classification" else "neg_mean_absolute_error")`,
      "print(\"Cross-validation scores:\", cross_validation_results[\"test_score\"])",
      "",
    );
    if (config.searchStrategy === "randomized") {
      lines.push(
        `PARAMETER_DISTRIBUTIONS = ${searchParameters(config)}`,
        `pipeline = RandomizedSearchCV(pipeline, param_distributions=PARAMETER_DISTRIBUTIONS, n_iter=10, cv=${config.cvFolds}, random_state=RANDOM_SEED, n_jobs=-1)`,
        "",
      );
    }
  }

  if (config.calibration !== "none" && config.task === "classification") {
    lines.push(
      `pipeline = CalibratedClassifierCV(pipeline, method=${pythonString(config.calibration)}, cv=5)`,
      "",
    );
  }

  lines.push("pipeline.fit(X_train, y_train)");

  if (config.splitStrategy === "train-validation-test") {
    lines.push(
      "evaluate(pipeline, X_validation, y_validation, \"Validation\")",
      "",
      "# After configuration decisions, refit on train + validation",
      "X_development = pd.concat([X_train, X_validation], axis=0)",
      "y_development = pd.concat([y_train, y_validation], axis=0)",
      "pipeline.fit(X_development, y_development)",
    );
  }

  lines.push(
    "test_predictions = evaluate(pipeline, X_test, y_test, \"Final test\")",
    "",
    `MODEL_PATH = ${pythonString(`${config.task}_pipeline.joblib`)}`,
    "joblib.dump(pipeline, MODEL_PATH)",
    "print(f\"\\nSaved fitted pipeline to {MODEL_PATH}\")",
    "",
    "# Run inference with the same fitted preprocessing",
    "sample_prediction = pipeline.predict(X_test.iloc[[0]])",
    "print(\"Sample prediction:\", sample_prediction[0])",
    "print(\"Sample target:\", y_test.iloc[0])",
  );
  return lines;
}

export function generateClassicalScript(input = {}) {
  const config = normalizeClassicalConfig(input);
  const dataset = getDataset(config.task, config.dataset);
  const model = buildModel(config);
  const preprocessor = buildPreprocessorSection(config);
  const modelSelectionImport = config.splitStrategy === "group"
    ? "from sklearn.model_selection import GroupShuffleSplit"
    : config.splitStrategy === "cross-validation"
      ? "from sklearn.model_selection import RandomizedSearchCV, cross_validate, train_test_split"
      : "from sklearn.model_selection import train_test_split";
  const imports = [
    "import joblib",
    "import numpy as np",
    "import pandas as pd",
    "",
    "from sklearn.compose import ColumnTransformer, make_column_selector",
    "from sklearn.impute import SimpleImputer",
    modelSelectionImport,
    "from sklearn.pipeline import Pipeline as SklearnPipeline",
    config.encoding === "ordinal"
      ? "from sklearn.preprocessing import OrdinalEncoder"
      : "from sklearn.preprocessing import OneHotEncoder",
  ];
  if (preprocessor.scalerImport) {
    imports.push(`from sklearn.preprocessing import ${preprocessor.scalerImport}`);
  }
  imports.push(model.importLine);
  if (config.task === "classification") {
    imports.push(
      "from sklearn.metrics import (",
      "    accuracy_score, balanced_accuracy_score, classification_report,",
      "    confusion_matrix, f1_score,",
      ")",
    );
  } else {
    imports.push(
      "from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score",
    );
  }
  if (config.balance === "smote") {
    imports.push(
      "from imblearn.over_sampling import SMOTE",
      "from imblearn.pipeline import Pipeline as ImbalancedPipeline",
    );
  }
  if (config.calibration !== "none" && config.task === "classification") {
    imports.push("from sklearn.calibration import CalibratedClassifierCV");
  }

  const modelMetadata = getModel(config.task, config.model);
  const warnings = [];
  const validationErrors = {};
  if (
    config.task === "classification"
    && config.balance === "class-weight"
    && !modelMetadata.supportsClassWeight
  ) {
    warnings.push(
      `${modelMetadata.label} does not expose class_weight; choose SMOTE or another model if balancing is required.`,
    );
  }
  if (config.dataset === "custom-csv") {
    warnings.push(
      "Confirm the CSV path and target column before running the script.",
    );
  }
  if (config.balance === "smote") {
    warnings.push(
      "SMOTE is applied only inside the training pipeline; validation and test distributions remain untouched.",
    );
  }
  if (config.splitStrategy === "group" && !config.groupColumn) {
    validationErrors.groupColumn = "Choose a group column for a group split.";
  }
  if (config.splitStrategy === "time" && !config.timeColumn) {
    validationErrors.timeColumn = "Choose a time column for a time split.";
  }
  if (config.task !== "classification" && config.calibration !== "none") {
    validationErrors.calibration = "Calibration is available only for classification.";
  }
  if (config.task !== "classification" && config.decisionThreshold !== null) {
    validationErrors.decisionThreshold = "Decision thresholds are available only for binary classification probabilities.";
  }

  const code = [
    `"""Configurable ${config.task} workflow generated by the AI Script Generator."""`,
    "",
    ...imports,
    "",
    ...buildDatasetSection(config),
    ...buildInspectionSection(config),
    ...buildSplitSection(config),
    ...preprocessor.lines,
    ...buildEvaluationFunction(config),
    ...buildTrainingSection(config, model.expression),
    "",
  ].join("\n");

  const dependencies = [
    "pandas",
    "numpy",
    "scikit-learn",
    ...(config.balance === "smote" ? ["imbalanced-learn"] : []),
    "joblib",
  ];

  return {
    filename: `${config.task}_pipeline.py`,
    code,
    dependencies,
    warnings,
    validationErrors,
    config,
    dataset,
    model: modelMetadata,
    summary: `${modelMetadata.label} for ${dataset.label}, using ${config.splitStrategy.replaceAll("-", " ")} and ${config.scaling} scaling.`,
  };
}
