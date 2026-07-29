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
const INITIALIZERS = new Set([
  "framework-default",
  "glorot-uniform",
  "he-normal",
  "orthogonal",
]);
const NORMALIZATIONS = new Set(["none", "batch", "layer"]);
const TRAINABLE_LAYER_TYPES = new Set([
  "dense",
  "conv1d",
  "conv2d",
  "lstm",
  "gru",
]);
const RECURRENT_LAYER_TYPES = new Set(["lstm", "gru"]);
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
  const path = String(value ?? fallback).trim().replaceAll("\\", "/");
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
  return path;
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
      return "keras.optimizers.AdamW(learning_rate=LEARNING_RATE, weight_decay=WEIGHT_DECAY, clipnorm=CLIPNORM)";
    }
    if (config.optimizer === "sgd") {
      return "keras.optimizers.SGD(learning_rate=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY, clipnorm=CLIPNORM)";
    }
    if (config.optimizer === "rmsprop") {
      return "keras.optimizers.RMSprop(learning_rate=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY, clipnorm=CLIPNORM)";
    }
    return "keras.optimizers.Adam(learning_rate=LEARNING_RATE, weight_decay=WEIGHT_DECAY, clipnorm=CLIPNORM)";
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

function layerTypeLabel(type) {
  return NEURAL_LAYER_TYPES.find(({ id }) => id === type)?.label
    ?? type;
}

function cloneLayers(layers) {
  return layers.map((layer, index) => {
    const type = String(layer.type ?? "dense");
    const initializer = String(
      layer.initializer ?? "framework-default",
    );
    const normalization = String(layer.normalization ?? "none");
    const label = layerTypeLabel(type);

    if (!INITIALIZERS.has(initializer)) {
      throw new NeuralConfigurationError(
        "architecture",
        `Layer ${index + 1} initializer must be framework-default, glorot-uniform, he-normal, or orthogonal.`,
      );
    }
    if (!NORMALIZATIONS.has(normalization)) {
      throw new NeuralConfigurationError(
        "architecture",
        `Layer ${index + 1} normalization must be none, batch, or layer.`,
      );
    }
    if (
      !TRAINABLE_LAYER_TYPES.has(type)
      && initializer !== "framework-default"
    ) {
      throw new NeuralConfigurationError(
        "architecture",
        `${label} does not support an initializer.`,
      );
    }
    if (
      !TRAINABLE_LAYER_TYPES.has(type)
      && normalization !== "none"
    ) {
      throw new NeuralConfigurationError(
        "architecture",
        `${label} does not support normalization.`,
      );
    }
    if (
      RECURRENT_LAYER_TYPES.has(type)
      && normalization === "batch"
    ) {
      throw new NeuralConfigurationError(
        "architecture",
        `${label} supports none or layer normalization.`,
      );
    }

    return {
      ...layer,
      id: String(layer.id ?? `layer-${index + 1}`),
      type,
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
      initializer,
      normalization,
      returnSequences: layer.returnSequences === true,
    };
  });
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
  if (
    dataContract === "image-folder"
    && (
      inputShape.length !== 3
      || ![1, 3, 4].includes(inputShape.at(-1))
    )
  ) {
    throw new NeuralConfigurationError(
      "architecture",
      "Image inputs require [height, width, channels] with 1 (grayscale), 3 (RGB), or 4 (RGBA) channels.",
    );
  }
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

function kerasInitializerName(initializer) {
  const names = {
    "glorot-uniform": "glorot_uniform",
    "he-normal": "he_normal",
    orthogonal: "orthogonal",
  };
  return names[initializer] ?? "";
}

function kerasInitializerArguments(layer, recurrent = false) {
  const initializer = kerasInitializerName(layer.initializer);
  if (!initializer) return "";
  const kernel = `, kernel_initializer=${JSON.stringify(initializer)}`;
  return recurrent
    ? `${kernel}, recurrent_initializer=${JSON.stringify(initializer)}`
    : kernel;
}

function kerasNormalizationLayer(layer) {
  if (layer.normalization === "batch") {
    return "layers.BatchNormalization()";
  }
  if (layer.normalization === "layer") {
    return "layers.LayerNormalization()";
  }
  return "";
}

function buildKerasLayers(layer) {
  let expression;
  if (layer.type === "dense") {
    expression = `layers.Dense(${layer.units}, activation=${JSON.stringify(kerasActivation(layer.activation))}${kerasInitializerArguments(layer)})`;
  } else if (layer.type === "conv1d") {
    expression = `layers.Conv1D(${layer.filters}, ${layer.kernelSize}, padding="same", activation=${JSON.stringify(kerasActivation(layer.activation))}${kerasInitializerArguments(layer)})`;
  } else if (layer.type === "conv2d") {
    expression = `layers.Conv2D(${layer.filters}, ${layer.kernelSize}, padding="same", activation=${JSON.stringify(kerasActivation(layer.activation))}${kerasInitializerArguments(layer)})`;
  } else if (layer.type === "maxpool1d") {
    expression = `layers.MaxPooling1D(pool_size=${layer.poolSize})`;
  } else if (layer.type === "maxpool2d") {
    expression = `layers.MaxPooling2D(pool_size=${layer.poolSize})`;
  } else if (layer.type === "global-average-pool1d") {
    expression = "layers.GlobalAveragePooling1D()";
  } else if (layer.type === "global-average-pool2d") {
    expression = "layers.GlobalAveragePooling2D()";
  } else if (layer.type === "flatten") {
    expression = "layers.Flatten()";
  } else if (layer.type === "lstm") {
    expression = `layers.LSTM(${layer.units}, return_sequences=${layer.returnSequences ? "True" : "False"}${kerasInitializerArguments(layer, true)})`;
  } else if (layer.type === "gru") {
    expression = `layers.GRU(${layer.units}, return_sequences=${layer.returnSequences ? "True" : "False"}${kerasInitializerArguments(layer, true)})`;
  } else {
    expression = `layers.Dropout(${layer.rate})`;
  }
  const normalization = kerasNormalizationLayer(layer);
  return normalization ? [expression, normalization] : [expression];
}

function kerasScalerExpression(scaling) {
  const scalers = {
    standard: "StandardScaler()",
    minmax: "MinMaxScaler()",
    robust: "RobustScaler()",
  };
  return scalers[scaling] ?? null;
}

function buildKerasSplitFunction() {
  return [
    "def _split_arrays(features, targets, *, stratify):",
    "    train_features, test_features, train_targets, test_targets = train_test_split(",
    "        features,",
    "        targets,",
    "        test_size=TEST_RATIO,",
    "        random_state=RANDOM_SEED,",
    "        stratify=stratify,",
    "    )",
    "    validation_ratio = VALIDATION_RATIO if VALIDATION_RATIO > 0 else TEST_RATIO",
    "    validation_fraction = validation_ratio / (1.0 - TEST_RATIO)",
    "    train_stratify = train_targets if stratify is not None else None",
    "    train_features, validation_features, train_targets, validation_targets = train_test_split(",
    "        train_features,",
    "        train_targets,",
    "        test_size=validation_fraction,",
    "        random_state=RANDOM_SEED,",
    "        stratify=train_stratify,",
    "    )",
    "    return (",
    "        train_features,",
    "        validation_features,",
    "        test_features,",
    "        train_targets,",
    "        validation_targets,",
    "        test_targets,",
    "    )",
    "",
  ];
}

function buildKerasTabularLoader(config) {
  const scaler = kerasScalerExpression(config.scaling);
  return [
    ...buildKerasSplitFunction(),
    "def _load_tabular_source():",
    "    if DATA_SOURCE == \"custom-csv\":",
    "        frame = pd.read_csv(DATA_PATH)",
    "        if TARGET_COLUMN not in frame.columns:",
    "            raise ValueError(f\"Target column {TARGET_COLUMN!r} is missing from {DATA_PATH}.\")",
    "        features = frame.drop(columns=[TARGET_COLUMN])",
    "        if features.shape[1] == 0:",
    "            raise ValueError(\"The CSV must contain at least one predictor column.\")",
    "        targets = frame[TARGET_COLUMN]",
    "        return features, targets",
    "",
    "    loaders = {",
    "        \"breast-cancer\": load_breast_cancer,",
    "        \"iris\": load_iris,",
    "        \"wine\": load_wine,",
    "        \"diabetes\": load_diabetes,",
    "    }",
    "    dataset = loaders[DATA_SOURCE](as_frame=True)",
    "    return dataset.data, dataset.target",
    "",
    "def _tabular_preprocessor(X_train):",
    "    numeric_columns = X_train.select_dtypes(include=np.number).columns.tolist()",
    "    categorical_columns = X_train.columns.difference(numeric_columns).tolist()",
    "    numeric_steps = [(\"imputer\", SimpleImputer(strategy=\"median\"))]",
    ...(scaler
      ? [`    numeric_steps.append((\"scaler\", ${scaler}))`]
      : []),
    "    transformers = []",
    "    if numeric_columns:",
    "        transformers.append((\"numeric\", Pipeline(numeric_steps), numeric_columns))",
    "    if categorical_columns:",
    "        categorical_pipeline = Pipeline([",
    "            (\"imputer\", SimpleImputer(strategy=\"most_frequent\")),",
    "            (\"one_hot\", OneHotEncoder(handle_unknown=\"ignore\", sparse_output=False)),",
    "        ])",
    "        transformers.append((\"categorical\", categorical_pipeline, categorical_columns))",
    "    return ColumnTransformer(transformers, remainder=\"drop\")",
    "",
    "def load_data():",
    "    features, targets = _load_tabular_source()",
    "    if IS_REGRESSION:",
    "        targets = pd.to_numeric(targets, errors=\"raise\").to_numpy(dtype=\"float32\")",
    "        stratify = None",
    "    else:",
    "        stratify = targets",
    "    (",
    "        X_train,",
    "        X_validation,",
    "        X_test,",
    "        y_train,",
    "        y_validation,",
    "        y_test,",
    "    ) = _split_arrays(features, targets, stratify=None if IS_REGRESSION else stratify)",
    "    if not IS_REGRESSION:",
    "        encoder = LabelEncoder()",
    "        y_train = encoder.fit_transform(y_train)",
    "        if len(encoder.classes_) != NUM_CLASSES:",
    "            raise ValueError(",
    "                f\"Expected {NUM_CLASSES} target classes, found {len(encoder.classes_)}.\"",
    "            )",
    "        y_validation = encoder.transform(y_validation)",
    "        y_test = encoder.transform(y_test)",
    "    preprocessor = _tabular_preprocessor(X_train)",
    "    X_train = preprocessor.fit_transform(X_train)",
    "    X_validation = preprocessor.transform(X_validation)",
    "    X_test = preprocessor.transform(X_test)",
    "    return (",
    "        (np.asarray(X_train, dtype=\"float32\"), np.asarray(y_train)),",
    "        (np.asarray(X_validation, dtype=\"float32\"), np.asarray(y_validation)),",
    "        (np.asarray(X_test, dtype=\"float32\"), np.asarray(y_test)),",
    "    )",
  ];
}

function buildKerasImageLoader() {
  return [
    "def load_data():",
    "    label_mode = \"binary\" if NUM_CLASSES == 2 else \"int\"",
    "    color_mode = {1: \"grayscale\", 3: \"rgb\", 4: \"rgba\"}[INPUT_SHAPE[-1]]",
    "    train_directory = Path(IMAGE_DIRECTORY) / \"train\"",
    "    validation_directory = Path(IMAGE_DIRECTORY) / \"validation\"",
    "    test_directory = Path(IMAGE_DIRECTORY) / \"test\"",
    "    for directory in (train_directory, validation_directory, test_directory):",
    "        if not directory.is_dir():",
    "            raise FileNotFoundError(f\"Expected image directory: {directory}\")",
    "    train_data = keras.utils.image_dataset_from_directory(",
    "        train_directory,",
    "        labels=\"inferred\",",
    "        label_mode=label_mode,",
    "        color_mode=color_mode,",
    "        image_size=INPUT_SHAPE[:2],",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=True,",
    "        seed=RANDOM_SEED,",
    "    )",
    "    validation_data = keras.utils.image_dataset_from_directory(",
    "        validation_directory,",
    "        labels=\"inferred\",",
    "        label_mode=label_mode,",
    "        color_mode=color_mode,",
    "        image_size=INPUT_SHAPE[:2],",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=False,",
    "    )",
    "    test_data = keras.utils.image_dataset_from_directory(",
    "        test_directory,",
    "        labels=\"inferred\",",
    "        label_mode=label_mode,",
    "        color_mode=color_mode,",
    "        image_size=INPUT_SHAPE[:2],",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=False,",
    "    )",
    "    expected_classes = train_data.class_names",
    "    if len(expected_classes) != NUM_CLASSES:",
    "        raise ValueError(f\"Expected {NUM_CLASSES} classes, found {len(expected_classes)}.\")",
    "    if validation_data.class_names != expected_classes or test_data.class_names != expected_classes:",
    "        raise ValueError(\"Train, validation, and test folders must contain the same classes.\")",
    "    rescale = layers.Rescaling(1.0 / 255.0)",
    "    train_data = train_data.map(lambda images, labels: (rescale(images), labels))",
    "    validation_data = validation_data.map(lambda images, labels: (rescale(images), labels))",
    "    test_data = test_data.map(lambda images, labels: (rescale(images), labels))",
    "    return train_data, validation_data, test_data",
  ];
}

function buildKerasSequenceLoader(config) {
  const scaler = kerasScalerExpression(config.scaling);
  return [
    ...buildKerasSplitFunction(),
    "def _encode_sequence_targets(y_train, y_validation, y_test):",
    "    encoder = LabelEncoder()",
    "    y_train = encoder.fit_transform(y_train)",
    "    if len(encoder.classes_) != NUM_CLASSES:",
    "        raise ValueError(",
    "            f\"Expected {NUM_CLASSES} training target classes, found {len(encoder.classes_)}.\"",
    "        )",
    "    y_validation = encoder.transform(y_validation)",
    "    y_test = encoder.transform(y_test)",
    "    for split_name, encoded in (",
    "        (\"training\", y_train),",
    "        (\"validation\", y_validation),",
    "        (\"test\", y_test),",
    "    ):",
    "        if encoded.size == 0 or encoded.min() < 0 or encoded.max() >= NUM_CLASSES:",
    "            raise ValueError(f\"{split_name.title()} targets are outside the model output range.\")",
    "    return y_train, y_validation, y_test",
    "",
    "def load_data():",
    "    with np.load(SEQUENCE_PATH) as arrays:",
    "        if \"features\" not in arrays or \"targets\" not in arrays:",
    "            raise ValueError(\"The sequence archive must contain 'features' and 'targets' arrays.\")",
    "        features = np.asarray(arrays[\"features\"], dtype=\"float32\")",
    "        targets = np.asarray(arrays[\"targets\"])",
    "    if features.ndim != len(INPUT_SHAPE) + 1 or features.shape[1:] != INPUT_SHAPE:",
    "        raise ValueError(f\"Expected sequence features shaped [samples, {INPUT_SHAPE}], got {features.shape}.\")",
    "    if targets.ndim != 1:",
    "        raise ValueError(f\"Expected one target per sequence, got shape {targets.shape}.\")",
    "    if len(features) != len(targets):",
    "        raise ValueError(\"Sequence features and targets must contain the same number of samples.\")",
    "    (",
    "        X_train,",
    "        X_validation,",
    "        X_test,",
    "        y_train,",
    "        y_validation,",
    "        y_test,",
    "    ) = _split_arrays(features, targets, stratify=targets)",
    "    y_train, y_validation, y_test = _encode_sequence_targets(",
    "        y_train, y_validation, y_test",
    "    )",
    ...(scaler
      ? [
          `    scaler = ${scaler}`,
          "    feature_count = X_train.shape[-1]",
          "    train_flat = X_train.reshape(-1, feature_count)",
          "    validation_flat = X_validation.reshape(-1, feature_count)",
          "    test_flat = X_test.reshape(-1, feature_count)",
          "    X_train = scaler.fit_transform(train_flat).reshape(X_train.shape)",
          "    X_validation = scaler.transform(validation_flat).reshape(X_validation.shape)",
          "    X_test = scaler.transform(test_flat).reshape(X_test.shape)",
        ]
      : []),
    "    return (",
    "        (np.asarray(X_train, dtype=\"float32\"), np.asarray(y_train)),",
    "        (np.asarray(X_validation, dtype=\"float32\"), np.asarray(y_validation)),",
    "        (np.asarray(X_test, dtype=\"float32\"), np.asarray(y_test)),",
    "    )",
  ];
}

function buildKerasLoader(config) {
  if (config.dataContract === "image-folder") return buildKerasImageLoader();
  if (config.dataContract === "sequence-array") return buildKerasSequenceLoader(config);
  return buildKerasTabularLoader(config);
}

function buildKerasImports(config) {
  const imports = [
    "from pathlib import Path",
    "",
    "import keras",
    "import numpy as np",
    "from keras import layers",
  ];
  if (config.dataContract === "tabular") {
    imports.push(
      "import pandas as pd",
      "from sklearn.compose import ColumnTransformer",
      "from sklearn.datasets import load_breast_cancer, load_diabetes, load_iris, load_wine",
      "from sklearn.impute import SimpleImputer",
      "from sklearn.model_selection import train_test_split",
      "from sklearn.pipeline import Pipeline",
      "from sklearn.preprocessing import LabelEncoder, MinMaxScaler, OneHotEncoder, RobustScaler, StandardScaler",
    );
  } else if (config.dataContract === "sequence-array") {
    imports.push(
      "from sklearn.model_selection import train_test_split",
      "from sklearn.preprocessing import LabelEncoder, MinMaxScaler, RobustScaler, StandardScaler",
    );
  }
  return imports;
}

function kerasDependencies(config) {
  if (config.dataContract === "tabular") {
    return ["keras", "numpy", "pandas", "scikit-learn"];
  }
  if (config.dataContract === "sequence-array") {
    return ["keras", "numpy", "scikit-learn"];
  }
  return ["keras", "numpy"];
}

function buildKerasScheduler(config) {
  if (config.scheduler === "reduce-on-plateau") {
    return [
      "    callbacks.append(",
      "        keras.callbacks.ReduceLROnPlateau(",
      "            monitor=\"val_loss\",",
      "            factor=0.5,",
      "            patience=max(1, PATIENCE // 2),",
      "            min_delta=MINIMUM_DELTA,",
      "        )",
      "    )",
    ];
  }
  if (config.scheduler === "cosine") {
    return [
      "    callbacks.append(",
      "        keras.callbacks.LearningRateScheduler(",
      "            lambda epoch, _rate: LEARNING_RATE",
      "            * 0.5",
      "            * (1.0 + np.cos(np.pi * epoch / max(1, EPOCHS))),",
      "        )",
      "    )",
    ];
  }
  return [];
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
    ...buildKerasImports(config),
    "",
    ...buildNeuralDataSection(config, "keras"),
    "",
    `INPUT_SHAPE = (${config.inputShape.join(", ")}${config.inputShape.length === 1 ? "," : ""})`,
    `NUM_CLASSES = ${config.numClasses}`,
    `EPOCHS = ${config.epochs}`,
    `BATCH_SIZE = ${config.batchSize}`,
    `LEARNING_RATE = ${config.learningRate}`,
    `WEIGHT_DECAY = ${config.weightDecay}`,
    `MOMENTUM = ${config.momentum}`,
    `CLIPNORM = ${config.gradientClip > 0 ? config.gradientClip : "None"}`,
    `PATIENCE = ${config.patience}`,
    `MINIMUM_DELTA = ${config.minimumDelta}`,
    `MIXED_PRECISION = ${config.mixedPrecision ? "True" : "False"}`,
    `CHECKPOINT_PATH = Path(${JSON.stringify(config.checkpointPath)})`,
    `ARTIFACT_PATH = Path(${JSON.stringify(config.artifactPath)})`,
    `IS_REGRESSION = ${isRegression ? "True" : "False"}`,
    "",
    ...buildKerasLoader(config),
    "",
    "def build_model(input_shape=INPUT_SHAPE, num_classes=NUM_CLASSES):",
    "    if MIXED_PRECISION:",
    "        keras.mixed_precision.set_global_policy(\"mixed_float16\")",
    "    model = keras.Sequential([",
    "        layers.Input(shape=input_shape),",
    ...config.layers.flatMap((layer) =>
      buildKerasLayers(layer).map(
        (expression) => `        ${expression},`,
      )
    ),
    `        ${outputLine},`,
    "    ])",
    "    model.compile(",
    `        optimizer=${optimizerExpression(config, "keras")},`,
    `        ${lossLine}`,
    `        ${metricLine}`,
    "    )",
    "    return model",
    "",
    "def train_model(model, train_data, validation_data):",
    "    callbacks = [",
    "        keras.callbacks.EarlyStopping(",
    "            monitor=\"val_loss\",",
    "            patience=PATIENCE,",
    "            min_delta=MINIMUM_DELTA,",
    "            restore_best_weights=True,",
    "        ),",
    "        keras.callbacks.ModelCheckpoint(",
    "            CHECKPOINT_PATH,",
    "            monitor=\"val_loss\",",
    "            save_best_only=True,",
    "        ),",
    "    ]",
    ...buildKerasScheduler(config),
    ...(config.dataContract === "image-folder"
      ? [
          "    return model.fit(",
          "        train_data,",
          "        validation_data=validation_data,",
          "        epochs=EPOCHS,",
          "        callbacks=callbacks,",
          "    )",
        ]
      : [
          "    return model.fit(",
          "        train_data[0],",
          "        train_data[1],",
          "        validation_data=validation_data,",
          "        epochs=EPOCHS,",
          "        batch_size=BATCH_SIZE,",
          "        callbacks=callbacks,",
          "    )",
        ]),
    "",
    "def evaluate_model(model, test_data):",
    ...(config.dataContract === "image-folder"
      ? ["    return model.evaluate(test_data, verbose=0, return_dict=True)"]
      : ["    return model.evaluate(test_data[0], test_data[1], verbose=0, return_dict=True)"]),
    "",
    "def predict_sample(model, test_data):",
    ...(config.dataContract === "image-folder"
      ? [
          "    sample_batch, _ = next(iter(test_data.take(1)))",
          "    sample = sample_batch[:1]",
        ]
      : ["    sample = test_data[0][:1]"]),
    "    prediction = np.asarray(model.predict(sample, verbose=0))",
    ...(isRegression
      ? ["    return float(prediction[0, 0])"]
      : isBinary
        ? ["    return int(prediction[0, 0] >= 0.0)"]
        : ["    return int(np.argmax(prediction[0]))"]),
    "",
    "def main():",
    "    keras.utils.set_random_seed(RANDOM_SEED)",
    "    CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)",
    "    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)",
    "    train_data, validation_data, test_data = load_data()",
    ...(config.dataContract === "image-folder"
      ? ["    model = build_model()"]
      : ["    model = build_model(input_shape=tuple(train_data[0].shape[1:]))"]),
    "    model.summary()",
    "    history = train_model(model, train_data, validation_data)",
    "    test_metrics = evaluate_model(model, test_data)",
    "    model.save(ARTIFACT_PATH)",
    "    sample_prediction = predict_sample(model, test_data)",
    "    print(\"Final test metrics:\", test_metrics)",
    "    print(\"Sample prediction:\", sample_prediction)",
    "    return history, test_metrics, sample_prediction",
    "",
    "# Layer shape trace",
    ...inference.steps.map(
      ({ layer, inputShape, outputShape }) =>
        `# ${layer.type}: ${shapeText(inputShape)} -> ${shapeText(outputShape)}`,
    ),
    "",
    "if __name__ == \"__main__\":",
    "    main()",
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

function torchScalerExpression(scaling) {
  const scalers = {
    standard: "StandardScaler()",
    minmax: "MinMaxScaler()",
    robust: "RobustScaler()",
  };
  return scalers[scaling] ?? null;
}

function buildTorchImports(config) {
  const imports = [
    "from contextlib import nullcontext",
    "from pathlib import Path",
    "import random",
    "",
    "import numpy as np",
    "import torch",
    "from torch import nn",
    "from torch.nn.utils import clip_grad_norm_",
    "from torch.utils.data import DataLoader, Dataset",
  ];
  if (config.dataContract === "tabular") {
    imports.push(
      "import pandas as pd",
      "from sklearn.compose import ColumnTransformer",
      "from sklearn.datasets import load_breast_cancer, load_diabetes, load_iris, load_wine",
      "from sklearn.impute import SimpleImputer",
      "from sklearn.model_selection import train_test_split",
      "from sklearn.pipeline import Pipeline",
      "from sklearn.preprocessing import LabelEncoder, MinMaxScaler, OneHotEncoder, RobustScaler, StandardScaler",
    );
  } else if (config.dataContract === "sequence-array") {
    imports.push(
      "from sklearn.model_selection import train_test_split",
      "from sklearn.preprocessing import LabelEncoder, MinMaxScaler, RobustScaler, StandardScaler",
    );
  } else {
    imports.push(
      "from torchvision import transforms",
      "from torchvision.datasets import ImageFolder",
    );
  }
  return imports;
}

function torchDependencies(config) {
  if (config.dataContract === "tabular") {
    return ["numpy", "pandas", "scikit-learn", "torch"];
  }
  if (config.dataContract === "sequence-array") {
    return ["numpy", "scikit-learn", "torch"];
  }
  return ["numpy", "torch", "torchvision"];
}

function buildTorchSplitFunction() {
  return [
    "def _split_arrays(features, targets, *, stratify):",
    "    train_features, test_features, train_targets, test_targets = train_test_split(",
    "        features,",
    "        targets,",
    "        test_size=TEST_RATIO,",
    "        random_state=RANDOM_SEED,",
    "        stratify=stratify,",
    "    )",
    "    validation_ratio = VALIDATION_RATIO if VALIDATION_RATIO > 0 else TEST_RATIO",
    "    validation_fraction = validation_ratio / (1.0 - TEST_RATIO)",
    "    train_stratify = train_targets if stratify is not None else None",
    "    train_features, validation_features, train_targets, validation_targets = train_test_split(",
    "        train_features,",
    "        train_targets,",
    "        test_size=validation_fraction,",
    "        random_state=RANDOM_SEED,",
    "        stratify=train_stratify,",
    "    )",
    "    return (",
    "        train_features,",
    "        validation_features,",
    "        test_features,",
    "        train_targets,",
    "        validation_targets,",
    "        test_targets,",
    "    )",
    "",
  ];
}

function buildTorchArrayDataset() {
  return [
    "def _prepare_array_targets(targets):",
    "    if IS_REGRESSION or IS_BINARY:",
    "        return np.asarray(targets, dtype=np.float32).reshape(-1, 1)",
    "    return np.asarray(targets, dtype=np.int64).reshape(-1)",
    "",
    "class ArrayDataset(Dataset):",
    "    def __init__(self, features, targets):",
    "        feature_array = np.asarray(features, dtype=np.float32)",
    "        target_array = _prepare_array_targets(targets)",
    "        if len(feature_array) != len(target_array):",
    "            raise ValueError(\"Features and targets must contain the same number of samples.\")",
    "        self.features = torch.as_tensor(feature_array, dtype=torch.float32)",
    "        self.targets = torch.as_tensor(target_array)",
    "",
    "    def __len__(self):",
    "        return len(self.features)",
    "",
    "    def __getitem__(self, index):",
    "        return self.features[index], self.targets[index]",
    "",
  ];
}

function buildTorchTabularLoader(config) {
  const scaler = torchScalerExpression(config.scaling);
  return [
    ...buildTorchArrayDataset(),
    ...buildTorchSplitFunction(),
    "def _load_tabular_source():",
    "    if DATA_SOURCE == \"custom-csv\":",
    "        frame = pd.read_csv(DATA_PATH)",
    "        if TARGET_COLUMN not in frame.columns:",
    "            raise ValueError(f\"Target column {TARGET_COLUMN!r} is missing from {DATA_PATH}.\")",
    "        features = frame.drop(columns=[TARGET_COLUMN])",
    "        if features.shape[1] == 0:",
    "            raise ValueError(\"The CSV must contain at least one predictor column.\")",
    "        return features, frame[TARGET_COLUMN]",
    "",
    "    loaders = {",
    "        \"breast-cancer\": load_breast_cancer,",
    "        \"iris\": load_iris,",
    "        \"wine\": load_wine,",
    "        \"diabetes\": load_diabetes,",
    "    }",
    "    dataset = loaders[DATA_SOURCE](as_frame=True)",
    "    return dataset.data, dataset.target",
    "",
    "def _tabular_preprocessor(X_train):",
    "    numeric_columns = X_train.select_dtypes(include=np.number).columns.tolist()",
    "    categorical_columns = X_train.columns.difference(numeric_columns).tolist()",
    "    numeric_steps = [(\"imputer\", SimpleImputer(strategy=\"median\"))]",
    ...(scaler
      ? [`    numeric_steps.append(("scaler", ${scaler}))`]
      : []),
    "    transformers = []",
    "    if numeric_columns:",
    "        transformers.append((\"numeric\", Pipeline(numeric_steps), numeric_columns))",
    "    if categorical_columns:",
    "        categorical_pipeline = Pipeline([",
    "            (\"imputer\", SimpleImputer(strategy=\"most_frequent\")),",
    "            (\"one_hot\", OneHotEncoder(handle_unknown=\"ignore\", sparse_output=False)),",
    "        ])",
    "        transformers.append((\"categorical\", categorical_pipeline, categorical_columns))",
    "    return ColumnTransformer(transformers, remainder=\"drop\")",
    "",
    "def load_datasets():",
    "    features, targets = _load_tabular_source()",
    "    if IS_REGRESSION:",
    "        targets = pd.to_numeric(targets, errors=\"raise\").to_numpy(dtype=\"float32\")",
    "        stratify = None",
    "    else:",
    "        stratify = targets",
    "    (",
    "        X_train,",
    "        X_validation,",
    "        X_test,",
    "        y_train,",
    "        y_validation,",
    "        y_test,",
    "    ) = _split_arrays(features, targets, stratify=stratify)",
    "    if not IS_REGRESSION:",
    "        encoder = LabelEncoder()",
    "        y_train = encoder.fit_transform(y_train)",
    "        if len(encoder.classes_) != NUM_CLASSES:",
    "            raise ValueError(",
    "                f\"Expected {NUM_CLASSES} training target classes, found {len(encoder.classes_)}.\"",
    "            )",
    "        y_validation = encoder.transform(y_validation)",
    "        y_test = encoder.transform(y_test)",
    "    preprocessor = _tabular_preprocessor(X_train)",
    "    X_train = preprocessor.fit_transform(X_train)",
    "    X_validation = preprocessor.transform(X_validation)",
    "    X_test = preprocessor.transform(X_test)",
    "    return (",
    "        ArrayDataset(X_train, y_train),",
    "        ArrayDataset(X_validation, y_validation),",
    "        ArrayDataset(X_test, y_test),",
    "    )",
  ];
}

function buildTorchSequenceLoader(config) {
  const scaler = torchScalerExpression(config.scaling);
  return [
    ...buildTorchArrayDataset(),
    ...buildTorchSplitFunction(),
    "def _encode_sequence_targets(y_train, y_validation, y_test):",
    "    encoder = LabelEncoder()",
    "    y_train = encoder.fit_transform(y_train)",
    "    if len(encoder.classes_) != NUM_CLASSES:",
    "        raise ValueError(",
    "            f\"Expected {NUM_CLASSES} training target classes, found {len(encoder.classes_)}.\"",
    "        )",
    "    y_validation = encoder.transform(y_validation)",
    "    y_test = encoder.transform(y_test)",
    "    for split_name, encoded in (",
    "        (\"training\", y_train),",
    "        (\"validation\", y_validation),",
    "        (\"test\", y_test),",
    "    ):",
    "        if encoded.size == 0 or encoded.min() < 0 or encoded.max() >= NUM_CLASSES:",
    "            raise ValueError(f\"{split_name.title()} targets are outside the model output range.\")",
    "    return y_train, y_validation, y_test",
    "",
    "def load_datasets():",
    "    with np.load(SEQUENCE_PATH) as arrays:",
    "        if \"features\" not in arrays or \"targets\" not in arrays:",
    "            raise ValueError(\"The sequence archive must contain 'features' and 'targets' arrays.\")",
    "        features = np.asarray(arrays[\"features\"], dtype=np.float32)",
    "        targets = np.asarray(arrays[\"targets\"])",
    "    if features.ndim != len(INPUT_SHAPE) + 1 or features.shape[1:] != INPUT_SHAPE:",
    "        raise ValueError(f\"Expected sequence features shaped [samples, {INPUT_SHAPE}], got {features.shape}.\")",
    "    if targets.ndim != 1:",
    "        raise ValueError(f\"Expected one target per sequence, got shape {targets.shape}.\")",
    "    if len(features) != len(targets):",
    "        raise ValueError(\"Sequence features and targets must contain the same number of samples.\")",
    "    (",
    "        X_train,",
    "        X_validation,",
    "        X_test,",
    "        y_train,",
    "        y_validation,",
    "        y_test,",
    "    ) = _split_arrays(features, targets, stratify=targets)",
    "    y_train, y_validation, y_test = _encode_sequence_targets(",
    "        y_train, y_validation, y_test",
    "    )",
    ...(scaler
      ? [
          `    scaler = ${scaler}`,
          "    feature_count = X_train.shape[-1]",
          "    train_flat = X_train.reshape(-1, feature_count)",
          "    validation_flat = X_validation.reshape(-1, feature_count)",
          "    test_flat = X_test.reshape(-1, feature_count)",
          "    X_train = scaler.fit_transform(train_flat).reshape(X_train.shape)",
          "    X_validation = scaler.transform(validation_flat).reshape(X_validation.shape)",
          "    X_test = scaler.transform(test_flat).reshape(X_test.shape)",
        ]
      : []),
    "    return (",
    "        ArrayDataset(X_train, y_train),",
    "        ArrayDataset(X_validation, y_validation),",
    "        ArrayDataset(X_test, y_test),",
    "    )",
  ];
}

function buildTorchImageLoader(config) {
  const imageMode = config.inputShape.at(-1) === 1
    ? "L"
    : config.inputShape.at(-1) === 4
      ? "RGBA"
      : "RGB";
  return [
    "def convert_image_mode(image):",
    `    return image.convert(${JSON.stringify(imageMode)})`,
    "",
    "def load_datasets():",
    "    image_mode = transforms.Lambda(convert_image_mode)",
    "    image_transform = transforms.Compose([",
    "        image_mode,",
    "        transforms.Resize(INPUT_SHAPE[:2]),",
    "        transforms.ToTensor(),",
    "    ])",
    "    train_directory = Path(IMAGE_DIRECTORY) / \"train\"",
    "    validation_directory = Path(IMAGE_DIRECTORY) / \"validation\"",
    "    test_directory = Path(IMAGE_DIRECTORY) / \"test\"",
    "    for directory in (train_directory, validation_directory, test_directory):",
    "        if not directory.is_dir():",
    "            raise FileNotFoundError(f\"Expected image directory: {directory}\")",
    "    train_base = ImageFolder(train_directory, transform=image_transform)",
    "    validation_base = ImageFolder(validation_directory, transform=image_transform)",
    "    test_base = ImageFolder(test_directory, transform=image_transform)",
    "    expected_classes = train_base.class_to_idx",
    "    if len(expected_classes) != NUM_CLASSES:",
    "        raise ValueError(f\"Expected {NUM_CLASSES} classes, found {len(expected_classes)}.\")",
    "    if validation_base.class_to_idx != expected_classes:",
    "        raise ValueError(\"Training and validation folders must contain the same classes.\")",
    "    if test_base.class_to_idx != expected_classes:",
    "        raise ValueError(\"Training and test folders must contain the same classes.\")",
    "    return train_base, validation_base, test_base",
  ];
}

function buildTorchLoader(config) {
  if (config.dataContract === "image-folder") return buildTorchImageLoader(config);
  if (config.dataContract === "sequence-array") return buildTorchSequenceLoader(config);
  return buildTorchTabularLoader(config);
}

function torchOptimizerExpression(config) {
  if (config.optimizer === "adamw") {
    return "torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)";
  }
  if (config.optimizer === "sgd") {
    return "torch.optim.SGD(model.parameters(), lr=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY)";
  }
  if (config.optimizer === "rmsprop") {
    return "torch.optim.RMSprop(model.parameters(), lr=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY)";
  }
  return "torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)";
}

function buildTorchScheduler(config) {
  if (config.scheduler === "reduce-on-plateau") {
    return {
      constructor: [
        "    return torch.optim.lr_scheduler.ReduceLROnPlateau(",
        "        optimizer,",
        "        mode=\"min\",",
        "        factor=0.5,",
        "        patience=max(1, PATIENCE // 2),",
        "        threshold=MINIMUM_DELTA,",
        "    )",
      ],
      step: ["        scheduler.step(validation_metrics[\"loss\"])"],
    };
  }
  if (config.scheduler === "cosine") {
    return {
      constructor: [
        "    return torch.optim.lr_scheduler.CosineAnnealingLR(",
        "        optimizer, T_max=max(1, EPOCHS)",
        "    )",
      ],
      step: ["        scheduler.step()"],
    };
  }
  return {
    constructor: ["    return None"],
    step: [],
  };
}

function torchNormalizationExpression(layer) {
  if (layer.normalization === "none") return "";
  if (layer.type === "dense") {
    return layer.normalization === "batch"
      ? `nn.BatchNorm1d(${layer.units})`
      : `nn.LayerNorm(${layer.units})`;
  }
  if (layer.type === "conv1d") {
    return layer.normalization === "batch"
      ? `nn.BatchNorm1d(${layer.filters})`
      : `ChannelLayerNorm1d(${layer.filters})`;
  }
  if (layer.type === "conv2d") {
    return layer.normalization === "batch"
      ? `nn.BatchNorm2d(${layer.filters})`
      : `ChannelLayerNorm2d(${layer.filters})`;
  }
  return "";
}

function appendTorchInitializer(initLines, name, layer) {
  if (layer.initializer === "framework-default") return;
  initLines.push(
    `        initialize_module(self.${name}, ${JSON.stringify(layer.initializer)})`,
  );
}

function buildTorchScript(config, inference) {
  const isRegression = config.task === "tabular-regression";
  const isBinary = !isRegression && config.numClasses === 2;
  const initLines = [];
  const forwardLines = ["        x = inputs"];
  let sequenceLayout = config.inputShape.length === 2
    ? "channel-last"
    : "features";
  let conv2dLayout = config.dataContract === "image-folder";

  inference.steps.forEach((step, index) => {
    const layer = step.layer;
    const name = `layer_${index}`;
    if (layer.type === "dense") {
      const modules = [
        `nn.Linear(${step.inputShape[0]}, ${layer.units})`,
        torchActivation(layer.activation),
      ];
      const normalization = torchNormalizationExpression(layer);
      if (normalization) modules.push(normalization);
      initLines.push(
        `        self.${name} = nn.Sequential(${modules.join(", ")})`,
      );
      appendTorchInitializer(initLines, name, layer);
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "conv1d") {
      const modules = [
        `nn.Conv1d(${step.inputShape[1]}, ${layer.filters}, kernel_size=${layer.kernelSize}, padding="same")`,
        torchActivation(layer.activation),
      ];
      const normalization = torchNormalizationExpression(layer);
      if (normalization) modules.push(normalization);
      initLines.push(
        `        self.${name} = nn.Sequential(${modules.join(", ")})`,
      );
      appendTorchInitializer(initLines, name, layer);
      if (sequenceLayout !== "channel-first") {
        forwardLines.push("        x = x.transpose(1, 2)");
      }
      forwardLines.push(`        x = self.${name}(x)`);
      sequenceLayout = "channel-first";
    } else if (layer.type === "conv2d") {
      const modules = [
        `nn.Conv2d(${step.inputShape[2]}, ${layer.filters}, kernel_size=${layer.kernelSize}, padding="same")`,
        torchActivation(layer.activation),
      ];
      const normalization = torchNormalizationExpression(layer);
      if (normalization) modules.push(normalization);
      initLines.push(
        `        self.${name} = nn.Sequential(${modules.join(", ")})`,
      );
      appendTorchInitializer(initLines, name, layer);
      if (!conv2dLayout) {
        forwardLines.push("        x = x.permute(0, 3, 1, 2)");
        conv2dLayout = true;
      }
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "maxpool1d") {
      initLines.push(`        self.${name} = nn.MaxPool1d(${layer.poolSize})`);
      if (sequenceLayout !== "channel-first") {
        forwardLines.push("        x = x.transpose(1, 2)");
      }
      forwardLines.push(`        x = self.${name}(x)`);
      sequenceLayout = "channel-first";
    } else if (layer.type === "maxpool2d") {
      initLines.push(`        self.${name} = nn.MaxPool2d(${layer.poolSize})`);
      forwardLines.push(`        x = self.${name}(x)`);
    } else if (layer.type === "global-average-pool1d") {
      initLines.push(`        self.${name} = nn.AdaptiveAvgPool1d(1)`);
      if (sequenceLayout !== "channel-first") {
        forwardLines.push("        x = x.transpose(1, 2)");
      }
      forwardLines.push(`        x = self.${name}(x).flatten(1)`);
      sequenceLayout = "features";
    } else if (layer.type === "global-average-pool2d") {
      initLines.push(`        self.${name} = nn.AdaptiveAvgPool2d(1)`);
      forwardLines.push(`        x = self.${name}(x).flatten(1)`);
      conv2dLayout = false;
    } else if (layer.type === "flatten") {
      initLines.push(`        self.${name} = nn.Flatten()`);
      forwardLines.push(`        x = self.${name}(x)`);
      sequenceLayout = "features";
      conv2dLayout = false;
    } else if (layer.type === "lstm" || layer.type === "gru") {
      const className = layer.type === "lstm" ? "LSTM" : "GRU";
      initLines.push(
        `        self.${name} = nn.${className}(input_size=${step.inputShape[1]}, hidden_size=${layer.units}, batch_first=True)`,
      );
      appendTorchInitializer(initLines, name, layer);
      if (layer.normalization === "layer") {
        initLines.push(
          `        self.${name}_normalization = nn.LayerNorm(${layer.units})`,
        );
      }
      if (sequenceLayout === "channel-first") {
        forwardLines.push("        x = x.transpose(1, 2)");
      }
      forwardLines.push(`        x, _ = self.${name}(x)`);
      if (!layer.returnSequences) {
        forwardLines.push("        x = x[:, -1, :]");
      }
      if (layer.normalization === "layer") {
        forwardLines.push(
          `        x = self.${name}_normalization(x)`,
        );
      }
      sequenceLayout = layer.returnSequences
        ? "channel-last"
        : "features";
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
  const scheduler = buildTorchScheduler(config);

  return [
    `"""Framework-neutral ${config.task} design translated to PyTorch."""`,
    "",
    ...buildTorchImports(config),
    "",
    ...buildNeuralDataSection(config, "pytorch"),
    "",
    `INPUT_SHAPE = (${config.inputShape.join(", ")}${config.inputShape.length === 1 ? "," : ""})`,
    `NUM_CLASSES = ${config.numClasses}`,
    `TASK = ${JSON.stringify(config.task)}`,
    `EPOCHS = ${config.epochs}`,
    `BATCH_SIZE = ${config.batchSize}`,
    `LEARNING_RATE = ${config.learningRate}`,
    `WEIGHT_DECAY = ${config.weightDecay}`,
    `MOMENTUM = ${config.momentum}`,
    `PATIENCE = ${config.patience}`,
    `MINIMUM_DELTA = ${config.minimumDelta}`,
    `GRADIENT_CLIP = ${config.gradientClip > 0 ? config.gradientClip : "None"}`,
    `MIXED_PRECISION = ${config.mixedPrecision ? "True" : "False"}`,
    `DEVICE = ${JSON.stringify(config.device)}`,
    `WORKERS = ${config.workers}`,
    `CHECKPOINT_PATH = Path(${JSON.stringify(config.checkpointPath)})`,
    `ARTIFACT_PATH = Path(${JSON.stringify(config.artifactPath)})`,
    `IS_REGRESSION = ${isRegression ? "True" : "False"}`,
    `IS_BINARY = ${isBinary ? "True" : "False"}`,
    "",
    "# Lowercase aliases make the resolved recipe easy to edit interactively.",
    `input_shape = (${config.inputShape.join(", ")}${config.inputShape.length === 1 ? "," : ""})`,
    `num_classes = ${config.numClasses}`,
    `epochs = ${config.epochs}`,
    `batch_size = ${config.batchSize}`,
    `learning_rate = ${config.learningRate}`,
    `weight_decay = ${config.weightDecay}`,
    `momentum = ${config.momentum}`,
    "",
    ...buildTorchLoader(config),
    "",
    "def seed_worker(worker_id):",
    "    del worker_id",
    "    worker_seed = torch.initial_seed() % 2**32",
    "    np.random.seed(worker_seed)",
    "    random.seed(worker_seed)",
    "",
    "def _loader_generator():",
    "    generator = torch.Generator()",
    "    generator.manual_seed(RANDOM_SEED)",
    "    return generator",
    "",
    "def build_loaders(train_dataset, validation_dataset, test_dataset, device):",
    "    train_loader = DataLoader(",
    "        train_dataset,",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=True,",
    "        num_workers=WORKERS,",
    "        worker_init_fn=seed_worker,",
    "        generator=_loader_generator(),",
    "        pin_memory=device.type == \"cuda\",",
    "        persistent_workers=WORKERS > 0,",
    "    )",
    "    validation_loader = DataLoader(",
    "        validation_dataset,",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=False,",
    "        num_workers=WORKERS,",
    "        worker_init_fn=seed_worker,",
    "        generator=_loader_generator(),",
    "        pin_memory=device.type == \"cuda\",",
    "        persistent_workers=WORKERS > 0,",
    "    )",
    "    test_loader = DataLoader(",
    "        test_dataset,",
    "        batch_size=BATCH_SIZE,",
    "        shuffle=False,",
    "        num_workers=WORKERS,",
    "        worker_init_fn=seed_worker,",
    "        generator=_loader_generator(),",
    "        pin_memory=device.type == \"cuda\",",
    "        persistent_workers=WORKERS > 0,",
    "    )",
    "    return train_loader, validation_loader, test_loader",
    "",
    "def resolve_device():",
    "    if DEVICE == \"auto\":",
    "        if torch.cuda.is_available():",
    "            return torch.device(\"cuda\")",
    "        if hasattr(torch.backends, \"mps\") and torch.backends.mps.is_available():",
    "            return torch.device(\"mps\")",
    "        return torch.device(\"cpu\")",
    "    if DEVICE == \"cuda\" and not torch.cuda.is_available():",
    "        raise RuntimeError(\"CUDA was selected but is not available.\")",
    "    if DEVICE == \"mps\" and not (",
    "        hasattr(torch.backends, \"mps\") and torch.backends.mps.is_available()",
    "    ):",
    "        raise RuntimeError(\"MPS was selected but is not available.\")",
    "    return torch.device(DEVICE)",
    "",
    "def set_determinism():",
    "    random.seed(RANDOM_SEED)",
    "    np.random.seed(RANDOM_SEED)",
    "    torch.manual_seed(RANDOM_SEED)",
    "    if torch.cuda.is_available():",
    "        torch.cuda.manual_seed_all(RANDOM_SEED)",
    "    if hasattr(torch.backends, \"cudnn\"):",
    "        torch.backends.cudnn.deterministic = True",
    "        torch.backends.cudnn.benchmark = False",
    "",
    "def initialize_module(module, strategy):",
    "    if strategy == \"framework-default\":",
    "        return",
    "    for name, parameter in module.named_parameters():",
    "        if \"weight\" not in name or parameter.ndim < 2:",
    "            continue",
    "        if strategy == \"glorot-uniform\":",
    "            nn.init.xavier_uniform_(parameter)",
    "        elif strategy == \"he-normal\":",
    "            nn.init.kaiming_normal_(parameter, nonlinearity=\"relu\")",
    "        elif strategy == \"orthogonal\":",
    "            nn.init.orthogonal_(parameter)",
    "        else:",
    "            raise ValueError(f\"Unsupported initializer: {strategy}\")",
    "",
    "class ChannelLayerNorm1d(nn.Module):",
    "    def __init__(self, channels):",
    "        super().__init__()",
    "        self.normalization = nn.LayerNorm(channels)",
    "",
    "    def forward(self, inputs):",
    "        transposed = inputs.transpose(1, 2)",
    "        return self.normalization(transposed).transpose(1, 2)",
    "",
    "class ChannelLayerNorm2d(nn.Module):",
    "    def __init__(self, channels):",
    "        super().__init__()",
    "        self.normalization = nn.LayerNorm(channels)",
    "",
    "    def forward(self, inputs):",
    "        channels_last = inputs.permute(0, 2, 3, 1)",
    "        return self.normalization(channels_last).permute(0, 3, 1, 2)",
    "",
    "class ConfigurableNetwork(nn.Module):",
    "    def __init__(self):",
    "        super().__init__()",
    ...initLines,
    "",
    "    def forward(self, inputs):",
    ...forwardLines,
    "",
    "def build_optimizer(model):",
    `    return ${torchOptimizerExpression(config)}`,
    "",
    "def build_scheduler(optimizer):",
    ...scheduler.constructor,
    "",
    "def _prepare_batch(features, targets, device):",
    "    features = features.to(device=device, dtype=torch.float32, non_blocking=True)",
    "    if IS_REGRESSION or IS_BINARY:",
    "        targets = targets.to(device=device, dtype=torch.float32, non_blocking=True).reshape(-1, 1)",
    "    else:",
    "        targets = targets.to(device=device, dtype=torch.long, non_blocking=True).reshape(-1)",
    "    return features, targets",
    "",
    "def train_epoch(model, loader, criterion, optimizer, device, scaler):",
    "    model.train()",
    "    total_loss = 0.0",
    "    total_examples = 0",
    "    for features, targets in loader:",
    "        features, targets = _prepare_batch(features, targets, device)",
    "        optimizer.zero_grad(set_to_none=True)",
    "        amp_context = torch.amp.autocast(\"cuda\") if scaler is not None else nullcontext()",
    "        with amp_context:",
    "            predictions = model(features)",
    "            loss = criterion(predictions, targets)",
    "        if scaler is None:",
    "            loss.backward()",
    "            if GRADIENT_CLIP is not None:",
    "                clip_grad_norm_(model.parameters(), GRADIENT_CLIP)",
    "            optimizer.step()",
    "        else:",
    "            scaler.scale(loss).backward()",
    "            if GRADIENT_CLIP is not None:",
    "                scaler.unscale_(optimizer)",
    "                clip_grad_norm_(model.parameters(), GRADIENT_CLIP)",
    "            scaler.step(optimizer)",
    "            scaler.update()",
    "        examples = features.shape[0]",
    "        total_loss += float(loss.detach().item()) * examples",
    "        total_examples += examples",
    "    if total_examples == 0:",
    "        raise ValueError(\"The training loader is empty.\")",
    "    return {\"loss\": total_loss / total_examples}",
    "",
    "def evaluate(model, loader, criterion, device, amp_enabled=False):",
    "    model.eval()",
    "    total_loss = 0.0",
    "    total_metric = 0.0",
    "    total_examples = 0",
    "    with torch.inference_mode():",
    "        for features, targets in loader:",
    "            features, targets = _prepare_batch(features, targets, device)",
    "            amp_context = torch.amp.autocast(\"cuda\") if amp_enabled else nullcontext()",
    "            with amp_context:",
    "                predictions = model(features)",
    "                loss = criterion(predictions, targets)",
    "            examples = features.shape[0]",
    "            total_loss += float(loss.item()) * examples",
    "            total_examples += examples",
    "            if IS_REGRESSION:",
    "                total_metric += float(torch.abs(predictions - targets).sum().item())",
    "            elif IS_BINARY:",
    "                predicted = (predictions >= 0.0).to(torch.long)",
    "                expected = (targets >= 0.5).to(torch.long)",
    "                total_metric += float((predicted == expected).sum().item())",
    "            else:",
    "                predicted = predictions.argmax(dim=1)",
    "                total_metric += float((predicted == targets).sum().item())",
    "    if total_examples == 0:",
    "        raise ValueError(\"The evaluation loader is empty.\")",
    "    metric_name = \"mae\" if IS_REGRESSION else \"accuracy\"",
    "    return {\"loss\": total_loss / total_examples, metric_name: total_metric / total_examples}",
    "",
    "def train_model(model, train_loader, validation_loader, criterion, device):",
    "    optimizer = build_optimizer(model)",
    "    scheduler = build_scheduler(optimizer)",
    "    amp_enabled = MIXED_PRECISION and device.type == \"cuda\"",
    "    if MIXED_PRECISION and not amp_enabled:",
    "        print(\"Mixed precision requested but disabled because CUDA is unavailable.\")",
    "    scaler = torch.amp.GradScaler(\"cuda\") if amp_enabled else None",
    "    best_validation_loss = float(\"inf\")",
    "    epochs_without_improvement = 0",
    "    history = []",
    "    for epoch in range(1, EPOCHS + 1):",
    "        train_metrics = train_epoch(",
    "            model, train_loader, criterion, optimizer, device, scaler",
    "        )",
    "        validation_metrics = evaluate(",
    "            model, validation_loader, criterion, device, amp_enabled",
    "        )",
    "        history.append({",
    "            \"epoch\": epoch,",
    "            \"train\": train_metrics,",
    "            \"validation\": validation_metrics,",
    "        })",
    "        print(",
    "            f\"Epoch {epoch:03d} | train loss {train_metrics['loss']:.6f} \"",
    "            f\"| validation loss {validation_metrics['loss']:.6f}\"",
    "        )",
    ...scheduler.step,
    "        improved = validation_metrics[\"loss\"] < best_validation_loss - MINIMUM_DELTA",
    "        if improved:",
    "            best_validation_loss = validation_metrics[\"loss\"]",
    "            epochs_without_improvement = 0",
    "            torch.save(",
    "                {",
    "                    \"model_state\": model.state_dict(),",
    "                    \"input_shape\": INPUT_SHAPE,",
    "                    \"num_classes\": NUM_CLASSES,",
    "                    \"task\": TASK,",
    "                },",
    "                CHECKPOINT_PATH,",
    "            )",
    "        else:",
    "            epochs_without_improvement += 1",
    "            if epochs_without_improvement >= max(1, PATIENCE):",
    "                print(f\"Early stopping after epoch {epoch}.\")",
    "                break",
    "    return history, amp_enabled",
    "",
    "def predict_sample(model, test_loader, device, amp_enabled=False):",
    "    features, _ = next(iter(test_loader))",
    "    features = features[:1].to(device=device, dtype=torch.float32)",
    "    model.eval()",
    "    with torch.inference_mode():",
    "        amp_context = torch.amp.autocast(\"cuda\") if amp_enabled else nullcontext()",
    "        with amp_context:",
    "            prediction = model(features)",
    "    if IS_REGRESSION:",
    "        return float(prediction[0, 0].item())",
    "    if IS_BINARY:",
    "        return int(prediction[0, 0].item() >= 0.0)",
    "    return int(prediction.argmax(dim=1)[0].item())",
    "",
    "def main():",
    "    set_determinism()",
    "    device = resolve_device()",
    "    CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)",
    "    ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)",
    "    train_dataset, validation_dataset, test_dataset = load_datasets()",
    "    train_loader, validation_loader, test_loader = build_loaders(",
    "        train_dataset, validation_dataset, test_dataset, device",
    "    )",
    "    model = ConfigurableNetwork().to(device)",
    `    criterion = ${criterion}`,
    "    print(model)",
    "    history, amp_enabled = train_model(",
    "        model, train_loader, validation_loader, criterion, device",
    "    )",
    "    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device)",
    "    model.load_state_dict(checkpoint[\"model_state\"])",
    "    test_metrics = evaluate(",
    "        model, test_loader, criterion, device, amp_enabled",
    "    )",
    "    torch.save(checkpoint, ARTIFACT_PATH)",
    "    sample_prediction = predict_sample(model, test_loader, device, amp_enabled)",
    "    print(\"Final test metrics:\", test_metrics)",
    "    print(\"Sample prediction:\", sample_prediction)",
    "    return history, test_metrics, sample_prediction",
    "",
    "# Layer shape trace",
    ...inference.steps.map(
      ({ layer, inputShape, outputShape }) =>
        `# ${layer.type}: ${shapeText(inputShape)} -> ${shapeText(outputShape)}`,
    ),
    "",
    "if __name__ == \"__main__\":",
    "    main()",
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
    dependencies: config.framework === "keras"
      ? kerasDependencies(config)
      : torchDependencies(config),
    config,
    inference,
    summary: `${getPreset(config.preset).label} translated to ${config.framework === "keras" ? "Keras" : "PyTorch"} with ${config.layers.length} configurable layers.`,
  };
}
