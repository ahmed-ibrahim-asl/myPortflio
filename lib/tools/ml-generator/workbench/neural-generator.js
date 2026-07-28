const FRAMEWORKS = new Set(["keras", "pytorch"]);
const TASKS = new Set([
  "tabular-classification",
  "tabular-regression",
  "image-classification",
  "sequence-classification",
]);
const SPLIT_STRATEGIES = new Set(["train-test", "train-validation-test"]);
const SCALERS = new Set(["none", "standard", "minmax", "robust"]);
const OPTIMIZERS = new Set(["adam", "adamw", "sgd", "rmsprop"]);
const SCHEDULERS = new Set(["none", "reduce-on-plateau", "cosine"]);
const DEVICES = new Set(["auto", "cpu", "cuda", "mps"]);
const DATA_SOURCES = Object.freeze({
  tabular: new Set(["breast-cancer", "iris", "wine", "diabetes", "custom-csv"]),
  "image-folder": new Set(["image-folder", "custom-image-folder"]),
  "sequence-array": new Set(["sequence-array", "custom-npz"]),
});

export class NeuralConfigurationError extends Error {
  constructor(section, message) {
    super(message);
    this.name = "NeuralConfigurationError";
    this.section = section;
  }
}

export const NEURAL_LAYER_TYPES = Object.freeze([
  {
    id: "dense",
    label: "Dense",
    expects: "[features]",
    purpose: "Learns combinations of every input feature.",
  },
  {
    id: "conv1d",
    label: "Conv1D",
    expects: "[timesteps, channels]",
    purpose: "Finds local patterns across a sequence or sensor window.",
  },
  {
    id: "conv2d",
    label: "Conv2D",
    expects: "[height, width, channels]",
    purpose: "Finds spatial patterns such as edges, shapes, and textures.",
  },
  {
    id: "maxpool1d",
    label: "MaxPool1D",
    expects: "[timesteps, channels]",
    purpose: "Shortens a sequence while keeping strong local responses.",
  },
  {
    id: "maxpool2d",
    label: "MaxPool2D",
    expects: "[height, width, channels]",
    purpose: "Reduces image resolution and computation.",
  },
  {
    id: "global-average-pool1d",
    label: "Global Average Pooling 1D",
    expects: "[timesteps, channels]",
    purpose: "Summarizes every channel without a large flattened layer.",
  },
  {
    id: "global-average-pool2d",
    label: "Global Average Pooling 2D",
    expects: "[height, width, channels]",
    purpose: "Summarizes spatial feature maps with few parameters.",
  },
  {
    id: "flatten",
    label: "Flatten",
    expects: "Any multi-dimensional feature shape",
    purpose: "Converts feature maps into one feature vector.",
  },
  {
    id: "lstm",
    label: "LSTM",
    expects: "[timesteps, features]",
    purpose: "Learns dependencies across ordered sequence steps.",
  },
  {
    id: "gru",
    label: "GRU",
    expects: "[timesteps, features]",
    purpose: "A compact recurrent alternative to LSTM.",
  },
  {
    id: "dropout",
    label: "Dropout",
    expects: "Any shape",
    purpose: "Randomly hides activations during training to reduce overfitting.",
  },
]);

export const NEURAL_PRESETS = Object.freeze([
  {
    id: "tabular-mlp",
    label: "Tabular MLP",
    task: "tabular-classification",
    description: "A readable dense network for rows of numeric features.",
    inputShape: [20],
    layers: [
      { id: "dense-1", type: "dense", units: 64, activation: "relu" },
      { id: "dropout-1", type: "dropout", rate: 0.2 },
      { id: "dense-2", type: "dense", units: 32, activation: "relu" },
    ],
  },
  {
    id: "tabular-regression-mlp",
    label: "Tabular Regression MLP",
    task: "tabular-regression",
    description: "Dense layers ending in one continuous output.",
    inputShape: [20],
    layers: [
      { id: "dense-1", type: "dense", units: 64, activation: "relu" },
      { id: "dropout-1", type: "dropout", rate: 0.15 },
      { id: "dense-2", type: "dense", units: 32, activation: "relu" },
    ],
  },
  {
    id: "image-cnn",
    label: "Image CNN",
    task: "image-classification",
    description: "Convolution and pooling blocks followed by a compact head.",
    inputShape: [64, 64, 3],
    layers: [
      {
        id: "conv2d-1",
        type: "conv2d",
        filters: 32,
        kernelSize: 3,
        activation: "relu",
      },
      { id: "pool2d-1", type: "maxpool2d", poolSize: 2 },
      {
        id: "conv2d-2",
        type: "conv2d",
        filters: 64,
        kernelSize: 3,
        activation: "relu",
      },
      { id: "pool2d-2", type: "maxpool2d", poolSize: 2 },
      {
        id: "global-pool2d",
        type: "global-average-pool2d",
      },
      { id: "dense-1", type: "dense", units: 64, activation: "relu" },
      { id: "dropout-1", type: "dropout", rate: 0.25 },
    ],
  },
  {
    id: "sequence-conv1d",
    label: "Sensor Conv1D",
    task: "sequence-classification",
    description: "Local temporal filters for fixed sensor windows.",
    inputShape: [128, 6],
    layers: [
      {
        id: "conv1d-1",
        type: "conv1d",
        filters: 64,
        kernelSize: 5,
        activation: "relu",
      },
      { id: "pool1d-1", type: "maxpool1d", poolSize: 2 },
      {
        id: "conv1d-2",
        type: "conv1d",
        filters: 128,
        kernelSize: 3,
        activation: "relu",
      },
      {
        id: "global-pool1d",
        type: "global-average-pool1d",
      },
      { id: "dense-1", type: "dense", units: 64, activation: "relu" },
      { id: "dropout-1", type: "dropout", rate: 0.25 },
    ],
  },
  {
    id: "sequence-lstm",
    label: "Sensor LSTM",
    task: "sequence-classification",
    description: "A recurrent model for ordered sensor or event sequences.",
    inputShape: [128, 6],
    layers: [
      {
        id: "lstm-1",
        type: "lstm",
        units: 64,
        returnSequences: false,
      },
      { id: "dropout-1", type: "dropout", rate: 0.25 },
      { id: "dense-1", type: "dense", units: 32, activation: "relu" },
    ],
  },
]);

const DEFAULTS = Object.freeze({
  framework: "keras",
  preset: "tabular-mlp",
  task: "tabular-classification",
  inputShape: [20],
  numClasses: 2,
  layers: NEURAL_PRESETS[0].layers,
  epochs: 20,
  batchSize: 32,
  learningRate: 0.001,
  splitStrategy: "train-validation-test",
  validationRatio: 0.15,
  testRatio: 0.15,
  scaling: "standard",
  optimizer: "adam",
  scheduler: "none",
  weightDecay: 0,
  momentum: 0.9,
  patience: 5,
  minimumDelta: 0,
  gradientClip: 0,
  mixedPrecision: false,
  device: "auto",
  workers: 0,
  randomSeed: 42,
});

function positiveInteger(value, fallback, maximum = 100000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(1, Math.round(number)));
}

function finiteNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function requiredNumber(value, fallback, minimum, maximum, section, label) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new NeuralConfigurationError(
      section,
      `${label} must be between ${minimum} and ${maximum}.`,
    );
  }
  return number;
}

function requiredInteger(value, fallback, minimum, maximum, section, label) {
  return Math.round(requiredNumber(value, fallback, minimum, maximum, section, label));
}

function safeRelativePath(value, fallback, section, label) {
  const path = String(value ?? fallback).trim().replaceAll("\\\\", "/");
  if (
    !path
    || path.startsWith("/")
    || path.startsWith("\\")
    || /^[A-Za-z]:/.test(path)
    || path.split("/").some((part) => part === "..")
  ) {
    throw new NeuralConfigurationError(
      section,
      `${label} must be a safe relative path.`,
    );
  }
  return path.replaceAll("\\", "/");
}

function dataContractForPreset(preset) {
  if (preset.task === "image-classification") return "image-folder";
  if (preset.task === "sequence-classification") return "sequence-array";
  return "tabular";
}

function defaultDataSource(task, dataContract) {
  if (dataContract === "image-folder") return "image-folder";
  if (dataContract === "sequence-array") return "sequence-array";
  return task === "tabular-regression" ? "diabetes" : "breast-cancer";
}

function defaultDataPath(dataContract) {
  if (dataContract === "image-folder") return "data/images";
  if (dataContract === "sequence-array") return "data/sequences.npz";
  return "data/dataset.csv";
}

function optimizerExpression(config, framework) {
  if (framework === "keras") {
    if (config.optimizer === "adamw") {
      return `keras.optimizers.AdamW(learning_rate=LEARNING_RATE, weight_decay=${config.weightDecay})`;
    }
    if (config.optimizer === "sgd") {
      return `keras.optimizers.SGD(learning_rate=LEARNING_RATE, momentum=${config.momentum})`;
    }
    if (config.optimizer === "rmsprop") {
      return `keras.optimizers.RMSprop(learning_rate=LEARNING_RATE, momentum=${config.momentum})`;
    }
    return `keras.optimizers.Adam(learning_rate=LEARNING_RATE, weight_decay=${config.weightDecay})`;
  }
  if (config.optimizer === "adamw") {
    return "torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=weight_decay)";
  }
  if (config.optimizer === "sgd") {
    return "torch.optim.SGD(model.parameters(), lr=learning_rate, momentum=momentum, weight_decay=weight_decay)";
  }
  if (config.optimizer === "rmsprop") {
    return "torch.optim.RMSprop(model.parameters(), lr=learning_rate, momentum=momentum, weight_decay=weight_decay)";
  }
  return "torch.optim.Adam(model.parameters(), lr=learning_rate, weight_decay=weight_decay)";
}

function cloneLayers(layers) {
  return layers.map((layer, index) => ({
    ...layer,
    id: String(layer.id ?? `layer-${index + 1}`),
    type: String(layer.type ?? "dense"),
    units: positiveInteger(layer.units, 64, 8192),
    filters: positiveInteger(layer.filters, 32, 2048),
    kernelSize: positiveInteger(layer.kernelSize, 3, 31),
    poolSize: positiveInteger(layer.poolSize, 2, 16),
    rate: finiteNumber(layer.rate, 0.2, 0, 0.9),
    activation: ["relu", "gelu", "tanh", "sigmoid"].includes(
      layer.activation,
    )
      ? layer.activation
      : "relu",
    returnSequences: layer.returnSequences === true,
  }));
}

function getPreset(presetId) {
  return NEURAL_PRESETS.find(({ id }) => id === presetId)
    ?? NEURAL_PRESETS[0];
}

export function normalizeNeuralConfig(input = {}) {
  const preset = getPreset(input.preset);
  const requestedTask = String(input.task ?? "").trim();
  if (requestedTask && (!TASKS.has(requestedTask) || requestedTask !== preset.task)) {
    throw new NeuralConfigurationError(
      "architecture",
      `Preset ${preset.id} is compatible with ${preset.task}, not ${requestedTask}.`,
    );
  }
  const task = preset.task;
  const framework = FRAMEWORKS.has(input.framework)
    ? input.framework
    : DEFAULTS.framework;
  const dataContract = dataContractForPreset(preset);
  if (input.dataContract && input.dataContract !== dataContract) {
    throw new NeuralConfigurationError(
      "data",
      `Preset ${preset.id} requires the ${dataContract} data contract.`,
    );
  }
  const dataSource = String(
    input.dataSource ?? defaultDataSource(task, dataContract),
  ).trim();
  if (!DATA_SOURCES[dataContract].has(dataSource)) {
    throw new NeuralConfigurationError(
      "data",
      `${dataSource || "The selected source"} is not compatible with the ${dataContract} data contract.`,
    );
  }
  const dataPath = safeRelativePath(
    input.dataPath,
    defaultDataPath(dataContract),
    "data",
    "Data path",
  );
  const targetColumn = String(input.targetColumn ?? "target").trim();
  if (dataContract === "tabular" && !targetColumn) {
    throw new NeuralConfigurationError("data", "Target column is required for tabular data.");
  }
  const splitStrategy = String(input.splitStrategy ?? DEFAULTS.splitStrategy);
  if (!SPLIT_STRATEGIES.has(splitStrategy)) {
    throw new NeuralConfigurationError("split", "Choose a supported split strategy.");
  }
  const testRatio = requiredNumber(
    input.testRatio,
    DEFAULTS.testRatio,
    0.01,
    0.49,
    "split",
    "Test ratio",
  );
  const validationRatio = splitStrategy === "train-validation-test"
    ? requiredNumber(
      input.validationRatio,
      DEFAULTS.validationRatio,
      0.01,
      0.49,
      "split",
      "Validation ratio",
    )
    : 0;
  if (testRatio + validationRatio >= 1) {
    throw new NeuralConfigurationError(
      "split",
      "Test and validation ratios must leave data for training.",
    );
  }
  const requestedNumClasses = input.numClasses === undefined
    ? (task === "tabular-regression" ? 1 : DEFAULTS.numClasses)
    : requiredInteger(input.numClasses, DEFAULTS.numClasses, 1, 100000, "architecture", "Number of classes");
  if (task === "tabular-regression" && requestedNumClasses !== 1) {
    throw new NeuralConfigurationError(
      "architecture",
      "Regression networks require one continuous output.",
    );
  }
  if (task !== "tabular-regression" && requestedNumClasses < 2) {
    throw new NeuralConfigurationError(
      "architecture",
      "Classification networks require at least two classes.",
    );
  }
  const extension = framework === "keras" ? ".keras" : ".pt";
  const checkpointPath = safeRelativePath(
    input.checkpointPath,
    `artifacts/best_neural_network${extension}`,
    "architecture",
    "Checkpoint path",
  );
  const artifactPath = safeRelativePath(
    input.artifactPath,
    `artifacts/neural_network${extension}`,
    "architecture",
    "Artifact path",
  );
  if (!checkpointPath.endsWith(extension) || !artifactPath.endsWith(extension)) {
    throw new NeuralConfigurationError(
      "architecture",
      `${framework === "keras" ? "Keras" : "PyTorch"} artifacts must end in ${extension}.`,
    );
  }
  const inputShape = Array.isArray(input.inputShape)
    ? input.inputShape.map((dimension, index) =>
        positiveInteger(dimension, preset.inputShape[index] ?? 1),
      )
    : [...preset.inputShape];
  const requestedLayers = Array.isArray(input.layers)
    ? input.layers
    : preset.layers;
  const scaling = String(input.scaling ?? DEFAULTS.scaling);
  if (!SCALERS.has(scaling)) {
    throw new NeuralConfigurationError("data", "Choose a supported scaling strategy.");
  }
  const optimizer = String(input.optimizer ?? DEFAULTS.optimizer);
  if (!OPTIMIZERS.has(optimizer)) {
    throw new NeuralConfigurationError("training", "Choose a supported optimizer.");
  }
  const scheduler = String(input.scheduler ?? DEFAULTS.scheduler);
  if (!SCHEDULERS.has(scheduler)) {
    throw new NeuralConfigurationError("training", "Choose a supported scheduler.");
  }
  const device = String(input.device ?? DEFAULTS.device);
  if (!DEVICES.has(device)) {
    throw new NeuralConfigurationError("training", "Choose a supported device.");
  }

  return {
    framework,
    preset: preset.id,
    task,
    dataSource,
    dataPath,
    targetColumn,
    dataContract,
    splitStrategy,
    validationRatio,
    testRatio,
    scaling,
    inputShape,
    numClasses: requestedNumClasses,
    layers: cloneLayers(requestedLayers),
    epochs: positiveInteger(input.epochs, DEFAULTS.epochs, 100000),
    batchSize: positiveInteger(input.batchSize, DEFAULTS.batchSize, 65536),
    learningRate: finiteNumber(
      input.learningRate,
      DEFAULTS.learningRate,
      0.0000001,
      10,
    ),
    optimizer,
    scheduler,
    weightDecay: requiredNumber(input.weightDecay, DEFAULTS.weightDecay, 0, 10, "training", "Weight decay"),
    momentum: requiredNumber(input.momentum, DEFAULTS.momentum, 0, 0.999, "training", "Momentum"),
    patience: requiredInteger(input.patience, DEFAULTS.patience, 0, 100000, "training", "Patience"),
    minimumDelta: requiredNumber(input.minimumDelta, DEFAULTS.minimumDelta, 0, 100000, "training", "Minimum delta"),
    gradientClip: requiredNumber(input.gradientClip, DEFAULTS.gradientClip, 0, 100000, "training", "Gradient clip"),
    mixedPrecision: input.mixedPrecision === true,
    device,
    workers: requiredInteger(input.workers, DEFAULTS.workers, 0, 128, "training", "Workers"),
    randomSeed: requiredInteger(input.randomSeed, DEFAULTS.randomSeed, 0, 999999, "training", "Random seed"),
    checkpointPath,
    artifactPath,
  };
}

export function buildNeuralDataSection(config, framework) {
  const activeFramework = FRAMEWORKS.has(framework) ? framework : config.framework;
  const lines = [
    "# Data contract: split before fitting transforms or tuning the model",
    `DATA_CONTRACT = ${JSON.stringify(config.dataContract)}`,
    `DATA_SOURCE = ${JSON.stringify(config.dataSource)}`,
    `SPLIT_STRATEGY = ${JSON.stringify(config.splitStrategy)}`,
    `TEST_RATIO = ${config.testRatio}`,
    `VALIDATION_RATIO = ${config.validationRatio}`,
    `SCALING = ${JSON.stringify(config.scaling)}`,
    `RANDOM_SEED = ${config.randomSeed}`,
  ];
  if (config.dataContract === "tabular") {
    lines.push(
      `DATA_PATH = ${JSON.stringify(config.dataPath)}`,
      `TARGET_COLUMN = ${JSON.stringify(config.targetColumn)}`,
      "# Fit tabular preprocessing on X_train only, then transform validation and test data.",
    );
  } else if (config.dataContract === "image-folder") {
    lines.push(
      `IMAGE_DIRECTORY = ${JSON.stringify(config.dataPath)}`,
      "# Derive image labels from train-only folder metadata; keep validation and test folders untouched.",
    );
  } else {
    lines.push(
      `SEQUENCE_PATH = ${JSON.stringify(config.dataPath)}`,
      "# Split sequence windows before any normalization; fit normalization statistics on training windows only.",
    );
  }
  lines.push(`# ${activeFramework === "keras" ? "Keras" : "PyTorch"} loading workflow is added in the framework-specific recipe.`);
  return lines;
}

function shapeText(shape) {
  return `[${shape.join(", ")}]`;
}

export function inferLayerShapes(inputShape, inputLayers) {
  const layers = cloneLayers(inputLayers);
  let currentShape = [...inputShape];
  const steps = [];
  const errors = [];

  for (const layer of layers) {
    const before = [...currentShape];
    let after = [...before];
    let error = "";

    if (layer.type === "dense") {
      if (before.length !== 1) {
        error = `Dense expects [features], received ${shapeText(before)}. Add Flatten or global pooling first.`;
      } else {
        after = [layer.units];
      }
    } else if (layer.type === "conv1d") {
      if (before.length !== 2) {
        error = `Conv1D expects [timesteps, channels], received ${shapeText(before)}.`;
      } else {
        after = [before[0], layer.filters];
      }
    } else if (layer.type === "conv2d") {
      if (before.length !== 3) {
        error = `Conv2D expects [height, width, channels], received ${shapeText(before)}.`;
      } else {
        after = [before[0], before[1], layer.filters];
      }
    } else if (layer.type === "maxpool1d") {
      if (before.length !== 2) {
        error = `MaxPool1D expects [timesteps, channels], received ${shapeText(before)}.`;
      } else {
        after = [Math.ceil(before[0] / layer.poolSize), before[1]];
      }
    } else if (layer.type === "maxpool2d") {
      if (before.length !== 3) {
        error = `MaxPool2D expects [height, width, channels], received ${shapeText(before)}.`;
      } else {
        after = [
          Math.ceil(before[0] / layer.poolSize),
          Math.ceil(before[1] / layer.poolSize),
          before[2],
        ];
      }
    } else if (layer.type === "global-average-pool1d") {
      if (before.length !== 2) {
        error = `GlobalAveragePool1D expects [timesteps, channels], received ${shapeText(before)}.`;
      } else {
        after = [before[1]];
      }
    } else if (layer.type === "global-average-pool2d") {
      if (before.length !== 3) {
        error = `GlobalAveragePool2D expects [height, width, channels], received ${shapeText(before)}.`;
      } else {
        after = [before[2]];
      }
    } else if (layer.type === "flatten") {
      after = [before.reduce((product, dimension) => product * dimension, 1)];
    } else if (layer.type === "lstm" || layer.type === "gru") {
      const label = layer.type === "lstm" ? "LSTM" : "GRU";
      if (before.length !== 2) {
        error = `${label} expects [timesteps, features], received ${shapeText(before)}.`;
      } else {
        after = layer.returnSequences
          ? [before[0], layer.units]
          : [layer.units];
      }
    } else if (layer.type === "dropout") {
      after = [...before];
    } else {
      error = `Unknown layer type: ${layer.type}.`;
    }

    steps.push({
      layer,
      inputShape: before,
      outputShape: error ? before : after,
      error,
    });
    if (error) errors.push(error);
    if (!error) currentShape = after;
  }

  if (currentShape.length !== 1 && errors.length === 0) {
    errors.push(
      `The automatic output head expects [features], received ${shapeText(currentShape)}. Add Flatten or global pooling.`,
    );
  }

  return {
    steps,
    outputShape: currentShape,
    errors,
  };
}

function kerasActivation(activation) {
  return activation === "gelu" ? "gelu" : activation;
}

function buildKerasLayer(layer) {
  if (layer.type === "dense") {
    return `layers.Dense(${layer.units}, activation=${JSON.stringify(kerasActivation(layer.activation))})`;
  }
  if (layer.type === "conv1d") {
    return `layers.Conv1D(${layer.filters}, ${layer.kernelSize}, padding="same", activation=${JSON.stringify(kerasActivation(layer.activation))})`;
  }
  if (layer.type === "conv2d") {
    return `layers.Conv2D(${layer.filters}, ${layer.kernelSize}, padding="same", activation=${JSON.stringify(kerasActivation(layer.activation))})`;
  }
  if (layer.type === "maxpool1d") {
    return `layers.MaxPooling1D(pool_size=${layer.poolSize})`;
  }
  if (layer.type === "maxpool2d") {
    return `layers.MaxPooling2D(pool_size=${layer.poolSize})`;
  }
  if (layer.type === "global-average-pool1d") {
    return "layers.GlobalAveragePooling1D()";
  }
  if (layer.type === "global-average-pool2d") {
    return "layers.GlobalAveragePooling2D()";
  }
  if (layer.type === "flatten") {
    return "layers.Flatten()";
  }
  if (layer.type === "lstm") {
    return `layers.LSTM(${layer.units}, return_sequences=${layer.returnSequences ? "True" : "False"})`;
  }
  if (layer.type === "gru") {
    return `layers.GRU(${layer.units}, return_sequences=${layer.returnSequences ? "True" : "False"})`;
  }
  return `layers.Dropout(${layer.rate})`;
}

function buildKerasScript(config, inference) {
  const isRegression = config.task === "tabular-regression";
  const isBinary = !isRegression && config.numClasses === 2;
  const outputLine = isRegression
    ? "layers.Dense(1)"
    : isBinary
      ? "layers.Dense(1)"
      : "layers.Dense(num_classes)";
  const lossLine = isRegression
    ? "loss=keras.losses.MeanSquaredError(),"
    : isBinary
      ? "loss=keras.losses.BinaryCrossentropy(from_logits=True),"
      : "loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),";
  const metricLine = isRegression
    ? "metrics=[keras.metrics.MeanAbsoluteError(name=\"mae\")],"
    : isBinary
      ? "metrics=[keras.metrics.BinaryAccuracy(name=\"accuracy\", threshold=0.0)],"
      : "metrics=[keras.metrics.SparseCategoricalAccuracy(name=\"accuracy\")],";

  return [
    `"""Framework-neutral ${config.task} design translated to Keras."""`,
    "",
    "import keras",
    "from keras import layers",
    "",
    ...buildNeuralDataSection(config, "keras"),
    "",
    `INPUT_SHAPE = (${config.inputShape.join(", ")}${config.inputShape.length === 1 ? "," : ""})`,
    `NUM_CLASSES = ${config.numClasses}`,
    `EPOCHS = ${config.epochs}`,
    `BATCH_SIZE = ${config.batchSize}`,
    `LEARNING_RATE = ${config.learningRate}`,
    "",
    "def build_model(input_shape=INPUT_SHAPE, num_classes=NUM_CLASSES):",
    "    model = keras.Sequential([",
    "        layers.Input(shape=input_shape),",
    ...config.layers.map((layer) => `        ${buildKerasLayer(layer)},`),
    `        ${outputLine},`,
    "    ])",
    "    model.compile(",
    `        optimizer=${optimizerExpression(config, "keras")},`,
    `        ${lossLine}`,
    `        ${metricLine}`,
    "    )",
    "    return model",
    "",
    "model = build_model()",
    "model.summary()",
    "",
    "# Supply arrays or dataset objects produced by your selected data workflow.",
    "# X_train, y_train, X_validation, y_validation = ...",
    "early_stopping = keras.callbacks.EarlyStopping(",
    `    monitor=\"val_loss\", patience=${config.patience}, min_delta=${config.minimumDelta}, restore_best_weights=True`,
    ")",
    `checkpoint = keras.callbacks.ModelCheckpoint(${JSON.stringify(config.checkpointPath)}, monitor=\"val_loss\", save_best_only=True)`,
    "# history = model.fit(",
    "#     X_train, y_train,",
    "#     validation_data=(X_validation, y_validation),",
    `#     epochs=${config.epochs},`,
    `#     batch_size=${config.batchSize},`,
    "#     callbacks=[early_stopping, checkpoint],",
    "# )",
    "# model.evaluate(X_test, y_test)",
    `model.save(${JSON.stringify(config.artifactPath)})`,
    "",
    "# Layer shape trace",
    ...inference.steps.map(
      ({ layer, inputShape, outputShape }) =>
        `# ${layer.type}: ${shapeText(inputShape)} -> ${shapeText(outputShape)}`,
    ),
    "",
  ].join("\n");
}

function torchActivation(activation) {
  const activations = {
    relu: "nn.ReLU()",
    gelu: "nn.GELU()",
    tanh: "nn.Tanh()",
    sigmoid: "nn.Sigmoid()",
  };
  return activations[activation] ?? "nn.ReLU()";
}

function buildTorchScript(config, inference) {
  const isRegression = config.task === "tabular-regression";
  const isBinary = !isRegression && config.numClasses === 2;
  const initLines = [];
  const forwardLines = ["        x = inputs"];
  let conv1dLayout = false;
  let conv2dLayout = false;

  inference.steps.forEach((step, index) => {
    const layer = step.layer;
    const name = `layer_${index}`;
    if (layer.type === "dense") {
      initLines.push(
        `        self.${name} = nn.Sequential(nn.Linear(${step.inputShape[0]}, ${layer.units}), ${torchActivation(layer.activation)})`,
      );
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "conv1d") {
      initLines.push(
        `        self.${name} = nn.Sequential(nn.Conv1d(${step.inputShape[1]}, ${layer.filters}, kernel_size=${layer.kernelSize}, padding="same"), ${torchActivation(layer.activation)})`,
      );
      if (!conv1dLayout) {
        forwardLines.push("        x = x.transpose(1, 2)");
        conv1dLayout = true;
      }
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "conv2d") {
      initLines.push(
        `        self.${name} = nn.Sequential(nn.Conv2d(${step.inputShape[2]}, ${layer.filters}, kernel_size=${layer.kernelSize}, padding="same"), ${torchActivation(layer.activation)})`,
      );
      if (!conv2dLayout) {
        forwardLines.push("        x = x.permute(0, 3, 1, 2)");
        conv2dLayout = true;
      }
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "maxpool1d") {
      initLines.push(`        self.${name} = nn.MaxPool1d(${layer.poolSize})`);
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "maxpool2d") {
      initLines.push(`        self.${name} = nn.MaxPool2d(${layer.poolSize})`);
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "global-average-pool1d") {
      initLines.push(`        self.${name} = nn.AdaptiveAvgPool1d(1)`);
      forwardLines.push(`        x = self.${name}(x).flatten(1)`);
      conv1dLayout = false;
    } else if (layer.type === "global-average-pool2d") {
      initLines.push(`        self.${name} = nn.AdaptiveAvgPool2d(1)`);
      forwardLines.push(`        x = self.${name}(x).flatten(1)`);
      conv2dLayout = false;
    } else if (layer.type === "flatten") {
      initLines.push(`        self.${name} = nn.Flatten()`);
      forwardLines.push(`        x = self.${name}(x)`);
      conv1dLayout = false;
      conv2dLayout = false;
    } else if (layer.type === "lstm" || layer.type === "gru") {
      const className = layer.type === "lstm" ? "LSTM" : "GRU";
      initLines.push(
        `        self.${name} = nn.${className}(input_size=${step.inputShape[1]}, hidden_size=${layer.units}, batch_first=True)`,
      );
      forwardLines.push(`        x, _ = self.${name}(x)`);
      if (!layer.returnSequences) {
        forwardLines.push("        x = x[:, -1, :]");
      }
    } else if (layer.type === "dropout") {
      initLines.push(`        self.${name} = nn.Dropout(${layer.rate})`);
      forwardLines.push(`        x = self.${name}(x)`);
    }
  });

  const featureCount = inference.outputShape[0];
  const outputCount = isRegression || isBinary ? 1 : config.numClasses;
  initLines.push(`        self.output = nn.Linear(${featureCount}, ${outputCount})`);
  forwardLines.push("        return self.output(x)");
  const criterion = isRegression
    ? "nn.MSELoss()"
    : isBinary
      ? "nn.BCEWithLogitsLoss()"
      : "nn.CrossEntropyLoss()";

  return [
    `"""Framework-neutral ${config.task} design translated to PyTorch."""`,
    "",
    "import torch",
    "from torch import nn",
    "",
    ...buildNeuralDataSection(config, "pytorch"),
    "",
    `input_shape = (${config.inputShape.join(", ")}${config.inputShape.length === 1 ? "," : ""})`,
    `num_classes = ${config.numClasses}`,
    `epochs = ${config.epochs}`,
    `batch_size = ${config.batchSize}`,
    `learning_rate = ${config.learningRate}`,
    `weight_decay = ${config.weightDecay}`,
    `momentum = ${config.momentum}`,
    `device = torch.device(${JSON.stringify(config.device === "auto" ? "cuda" : config.device)} if ${JSON.stringify(config.device)} != "auto" else ("cuda" if torch.cuda.is_available() else "cpu"))`,
    "",
    "class ConfigurableNetwork(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...initLines,
    "",
    "    def forward(self, inputs):",
    ...forwardLines,
    "",
    "model = ConfigurableNetwork().to(device)",
    `criterion = ${criterion}`,
    `optimizer = ${optimizerExpression(config, "pytorch")}`,
    "print(model)",
    "",
    "# Supply DataLoader objects produced by your selected data workflow.",
    "# for epoch in range(epochs):",
    "#     model.train()",
    "#     for features, targets in train_loader:",
    "#         features, targets = features.to(device), targets.to(device)",
    "#         optimizer.zero_grad()",
    "#         predictions = model(features)",
    "#         loss = criterion(predictions, targets)",
    "#         loss.backward()",
    "#         optimizer.step()",
    "#     # Run validation here without optimizer updates.",
    "",
    `torch.save(model.state_dict(), ${JSON.stringify(config.artifactPath)})`,
    "",
    "# Layer shape trace",
    ...inference.steps.map(
      ({ layer, inputShape, outputShape }) =>
        `# ${layer.type}: ${shapeText(inputShape)} -> ${shapeText(outputShape)}`,
    ),
    "",
  ].join("\n");
}

export function generateNeuralScript(input = {}) {
  const config = normalizeNeuralConfig(input);
  const inference = inferLayerShapes(config.inputShape, config.layers);
  if (inference.errors.length > 0) {
    throw new Error(inference.errors.join(" "));
  }

  const code = config.framework === "keras"
    ? buildKerasScript(config, inference)
    : buildTorchScript(config, inference);

  return {
    filename: `${config.framework}_${config.task.replaceAll("-", "_")}_network.py`,
    code,
    dependencies: config.framework === "keras" ? ["keras"] : ["torch"],
    config,
    inference,
    summary: `${getPreset(config.preset).label} translated to ${config.framework === "keras" ? "Keras" : "PyTorch"} with ${config.layers.length} configurable layers.`,
  };
}
