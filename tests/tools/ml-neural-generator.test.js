import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  NeuralConfigurationError,
  NEURAL_PRESETS,
  buildNeuralDataSection,
  generateNeuralScript,
  getNeuralControlOptions,
  inferLayerShapes,
  normalizeNeuralConfig,
} from "../../lib/tools/ml-generator/workbench/neural-generator.js";
import {
  getMissionControls,
} from "../../lib/tools/ml-generator/model-mission/control-registry.js";

test("neural presets cover tabular, image, and sequence learning", () => {
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "tabular-mlp"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "image-cnn"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "sequence-conv1d"));
  assert.ok(NEURAL_PRESETS.some(({ id }) => id === "sequence-lstm"));
});

test("neural select options stay non-empty and compatible with the selected preset", () => {
  const values = (controlId, project) =>
    getNeuralControlOptions(controlId, project).map(({ value }) => value);

  for (const preset of NEURAL_PRESETS) {
    const project = {
      model: {
        framework: "keras",
        preset: preset.id,
        task: preset.task,
      },
    };
    const dataSources = values("dataSource", project);

    assert.ok(dataSources.length > 0, `${preset.id} has a data source`);
    for (const dataSource of dataSources) {
      assert.doesNotThrow(
        () => normalizeNeuralConfig({
          preset: preset.id,
          task: preset.task,
          dataSource,
        }),
        `${dataSource} is valid for ${preset.id}`,
      );
    }
  }

  assert.deepEqual(
    values("dataSource", {
      model: {
        framework: "keras",
        preset: "tabular-regression-mlp",
        task: "tabular-regression",
      },
    }),
    ["diabetes", "custom-csv"],
  );
  assert.deepEqual(
    values("splitStrategy", {
      model: { preset: "tabular-mlp", task: "tabular-classification" },
    }),
    ["train-validation-test"],
  );
  assert.deepEqual(
    values("scaling", {
      model: { preset: "sequence-lstm", task: "sequence-classification" },
    }),
    ["none", "standard", "minmax", "robust"],
  );
  assert.deepEqual(
    values("scaling", {
      model: { preset: "image-cnn", task: "image-classification" },
    }),
    ["none"],
  );
});

test("neural registry hides framework-only and regression-only controls", () => {
  const controlsFor = (project, stepId) =>
    getMissionControls({
      taskId: "neural-network",
      stepId,
      learningLevel: "advanced",
      project: {
        taskId: "neural-network",
        learningLevel: "advanced",
        data: {},
        inspection: {},
        split: {},
        preparation: {},
        training: {},
        evaluation: {},
        output: {},
        ...project,
      },
    }).map(({ id }) => id);

  const kerasTraining = controlsFor({
    model: {
      framework: "keras",
      preset: "tabular-mlp",
      task: "tabular-classification",
    },
  }, "train");
  const pytorchTraining = controlsFor({
    model: {
      framework: "pytorch",
      preset: "tabular-mlp",
      task: "tabular-classification",
    },
  }, "train");
  const regressionData = controlsFor({
    model: {
      framework: "keras",
      preset: "tabular-regression-mlp",
      task: "tabular-regression",
    },
  }, "data");

  assert.equal(kerasTraining.includes("device"), false);
  assert.equal(kerasTraining.includes("workers"), false);
  assert.equal(pytorchTraining.includes("device"), true);
  assert.equal(pytorchTraining.includes("workers"), true);
  assert.equal(regressionData.includes("numClasses"), false);
});

test("shape inference explains every valid layer transition", () => {
  const config = normalizeNeuralConfig({
    preset: "image-cnn",
    task: "image-classification",
    inputShape: [64, 64, 3],
    numClasses: 5,
  });

  const inference = inferLayerShapes(config.inputShape, config.layers);

  assert.deepEqual(inference.errors, []);
  assert.equal(inference.steps.length, config.layers.length);
  assert.deepEqual(inference.steps[0].inputShape, [64, 64, 3]);
  assert.deepEqual(inference.steps.at(-1).outputShape, [64]);
});

test("shape inference blocks incompatible recurrent layers", () => {
  const inference = inferLayerShapes(
    [32],
    [{ id: "layer-1", type: "lstm", units: 64, returnSequences: false }],
  );

  assert.equal(inference.errors.length, 1);
  assert.match(inference.errors[0], /LSTM expects \[timesteps, features\]/);
});

test("odd pooling dimensions match emitted Keras and PyTorch valid pooling", () => {
  const sequenceLayers = [
    { id: "pool", type: "maxpool1d", poolSize: 2 },
    { id: "flatten", type: "flatten" },
  ];
  const imageLayers = [
    { id: "pool", type: "maxpool2d", poolSize: 2 },
    { id: "flatten", type: "flatten" },
  ];

  assert.deepEqual(
    inferLayerShapes([5, 4], sequenceLayers).outputShape,
    [8],
  );
  assert.deepEqual(
    inferLayerShapes([5, 7, 3], imageLayers).outputShape,
    [18],
  );

  const keras = generateNeuralScript({
    framework: "keras",
    preset: "sequence-conv1d",
    inputShape: [5, 4],
    layers: sequenceLayers,
  }).code;
  const pytorch = generateNeuralScript({
    framework: "pytorch",
    preset: "image-cnn",
    inputShape: [5, 7, 3],
    numClasses: 2,
    layers: imageLayers,
  }).code;

  assert.match(keras, /# flatten: \[2, 4\] -> \[8\]/);
  assert.match(pytorch, /self\.output = nn\.Linear\(18, 1\)/);
});

test("PyTorch Conv1D, pooling, recurrent, and global pooling preserve sequence layout", () => {
  const code = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-conv1d",
    inputShape: [24, 6],
    numClasses: 3,
    layers: [
      {
        id: "conv",
        type: "conv1d",
        filters: 16,
        kernelSize: 3,
        activation: "relu",
      },
      { id: "pool", type: "maxpool1d", poolSize: 2 },
      {
        id: "recurrent",
        type: "lstm",
        units: 8,
        returnSequences: true,
      },
      { id: "summary", type: "global-average-pool1d" },
    ],
  }).code;
  const runtime = spawnSync(
    "python",
    ["-c", String.raw`
import ast
import math
import sys

source = sys.stdin.read()
tree = ast.parse(source)
network = next(
    node for node in tree.body
    if isinstance(node, ast.ClassDef) and node.name == "ConfigurableNetwork"
)
forward = next(
    node for node in network.body
    if isinstance(node, ast.FunctionDef) and node.name == "forward"
)
module = ast.Module(body=[forward], type_ignores=[])
ast.fix_missing_locations(module)
namespace = {}
exec(compile(module, "<generated-forward>", "exec"), namespace)

class FakeTensor:
    def __init__(self, shape):
        self.shape = tuple(shape)

    def transpose(self, first, second):
        shape = list(self.shape)
        shape[first], shape[second] = shape[second], shape[first]
        return FakeTensor(shape)

    def flatten(self, start_dim):
        return FakeTensor(
            self.shape[:start_dim]
            + (math.prod(self.shape[start_dim:]),)
        )

class ShapeModule:
    def __init__(self, name, expected, output):
        self.name = name
        self.expected = tuple(expected)
        self.output = tuple(output)

    def __call__(self, inputs):
        if inputs.shape != self.expected:
            raise AssertionError(
                f"{self.name} expected {self.expected}, received {inputs.shape}"
            )
        return FakeTensor(self.output)

class RecurrentModule(ShapeModule):
    def __call__(self, inputs):
        return super().__call__(inputs), None

class FakeNetwork:
    layer_0 = ShapeModule("Conv1D", (2, 6, 24), (2, 16, 24))
    layer_1 = ShapeModule("MaxPool1D", (2, 16, 24), (2, 16, 12))
    layer_2 = RecurrentModule("LSTM", (2, 12, 16), (2, 12, 8))
    layer_3 = ShapeModule(
        "GlobalAveragePool1D",
        (2, 8, 12),
        (2, 8, 1),
    )
    output = ShapeModule("Output", (2, 8), (2, 3))

result = namespace["forward"](FakeNetwork(), FakeTensor((2, 24, 6)))
print(result.shape)
`],
    { input: code, encoding: "utf8" },
  );

  assert.equal(runtime.status, 0, runtime.stderr);
  assert.equal(runtime.stdout.trim(), "(2, 3)");
});

test("advanced neural UI metadata only makes normalized settings editable", () => {
  const project = {
    taskId: "neural-network",
    learningLevel: "advanced",
    data: {},
    inspection: {},
    split: {},
    preparation: {},
    model: {
      framework: "pytorch",
      preset: "tabular-mlp",
    },
    training: {},
    evaluation: {},
    output: {},
  };
  const controls = ["model", "train", "generate"].flatMap((stepId) =>
    getMissionControls({
      taskId: "neural-network",
      stepId,
      learningLevel: "advanced",
      project,
    })
  );
  const byId = new Map(controls.map((control) => [control.id, control]));
  const normalized = normalizeNeuralConfig({
    preset: "tabular-mlp",
    framework: "pytorch",
  });

  for (const id of [
    "scheduler",
    "weightDecay",
    "momentum",
    "minimumDelta",
    "gradientClip",
    "mixedPrecision",
    "device",
    "workers",
    "checkpointPath",
  ]) {
    const control = byId.get(id);
    assert.ok(control, `${id} is available in Advanced`);
    assert.equal(control.readOnly, undefined, `${id} remains editable`);
    assert.ok(
      (control.configKey ?? id) in normalized,
      `${id} maps to the normalized neural contract`,
    );
  }
  for (const id of ["deterministic"]) {
    const control = byId.get(id);
    assert.ok(control, `${id} is disclosed in Advanced`);
    assert.equal(
      control.readOnly,
      true,
      `${id} cannot imply an unsupported generator override`,
    );
  }
});

test("compatible layer settings preserve inferred shapes and generated effects", () => {
  const layers = [
    {
      id: "conv",
      type: "conv1d",
      filters: 16,
      kernelSize: 5,
      activation: "gelu",
      initializer: "he-normal",
      normalization: "batch",
    },
    { id: "pool", type: "maxpool1d", poolSize: 2 },
    {
      id: "recurrent",
      type: "lstm",
      units: 8,
      returnSequences: true,
      initializer: "orthogonal",
      normalization: "layer",
    },
    { id: "summary", type: "global-average-pool1d" },
    { id: "dense", type: "dense", units: 4, activation: "tanh" },
    { id: "dropout", type: "dropout", rate: 0.35 },
  ];
  const inference = inferLayerShapes([24, 6], layers);
  const normalized = normalizeNeuralConfig({
    framework: "pytorch",
    preset: "sequence-conv1d",
    inputShape: [24, 6],
    layers,
  });
  const keras = generateNeuralScript({
    framework: "keras",
    preset: "sequence-conv1d",
    inputShape: [24, 6],
    layers,
  }).code;
  const pytorch = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-conv1d",
    inputShape: [24, 6],
    layers,
  }).code;
  const imageLayers = [
    {
      id: "conv-image",
      type: "conv2d",
      filters: 12,
      kernelSize: 3,
      activation: "relu",
      initializer: "glorot-uniform",
      normalization: "layer",
    },
    { id: "summary-image", type: "global-average-pool2d" },
  ];
  const kerasImage = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    inputShape: [32, 32, 3],
    layers: imageLayers,
  }).code;
  const pytorchImage = generateNeuralScript({
    framework: "pytorch",
    preset: "image-cnn",
    inputShape: [32, 32, 3],
    layers: imageLayers,
  }).code;
  const denseLayers = [
    {
      id: "dense-normalized",
      type: "dense",
      units: 24,
      activation: "relu",
      initializer: "he-normal",
      normalization: "batch",
    },
  ];
  const pytorchDense = generateNeuralScript({
    framework: "pytorch",
    preset: "tabular-mlp",
    inputShape: [10],
    layers: denseLayers,
  }).code;

  assert.deepEqual(inference.errors, []);
  assert.equal(normalized.layers[0].initializer, "he-normal");
  assert.equal(normalized.layers[0].normalization, "batch");
  assert.equal(normalized.layers[2].initializer, "orthogonal");
  assert.equal(normalized.layers[2].normalization, "layer");
  assert.deepEqual(
    inference.steps.map(({ inputShape, outputShape }) => [
      inputShape,
      outputShape,
    ]),
    [
      [[24, 6], [24, 16]],
      [[24, 16], [12, 16]],
      [[12, 16], [12, 8]],
      [[12, 8], [8]],
      [[8], [4]],
      [[4], [4]],
    ],
  );
  assert.match(keras, /layers\.Conv1D\(16, 5/);
  assert.match(
    keras,
    /activation="gelu", kernel_initializer="he_normal"/,
  );
  assert.match(keras, /layers\.BatchNormalization\(\)/);
  assert.match(keras, /layers\.MaxPooling1D\(pool_size=2\)/);
  assert.match(
    keras,
    /layers\.LSTM\(8, return_sequences=True, kernel_initializer="orthogonal", recurrent_initializer="orthogonal"\)/,
  );
  assert.match(keras, /layers\.LayerNormalization\(\)/);
  assert.match(keras, /layers\.Dense\(4, activation="tanh"\)/);
  assert.match(keras, /layers\.Dropout\(0\.35\)/);
  assert.match(
    pytorch,
    /nn\.Sequential\(nn\.Conv1d\(6, 16, kernel_size=5, padding="same"\), nn\.GELU\(\), nn\.BatchNorm1d\(16\)\)/,
  );
  assert.match(
    pytorch,
    /initialize_module\(self\.layer_0, "he-normal"\)/,
  );
  assert.match(pytorch, /nn\.MaxPool1d\(2\)/);
  assert.match(pytorch, /nn\.LSTM\(input_size=16, hidden_size=8, batch_first=True/);
  assert.match(
    pytorch,
    /initialize_module\(self\.layer_2, "orthogonal"\)/,
  );
  assert.match(
    pytorch,
    /self\.layer_2_normalization = nn\.LayerNorm\(8\)/,
  );
  assert.match(pytorch, /x = self\.layer_2_normalization\(x\)/);
  assert.match(pytorch, /nn\.Linear\(8, 4\)/);
  assert.match(pytorch, /nn\.Tanh\(\)/);
  assert.match(pytorch, /nn\.Dropout\(0\.35\)/);
  assert.match(
    kerasImage,
    /kernel_initializer="glorot_uniform"/,
  );
  assert.match(kerasImage, /layers\.LayerNormalization\(\)/);
  assert.match(
    pytorchImage,
    /self\.layer_0 = nn\.Sequential\(nn\.Conv2d\(3, 12, kernel_size=3, padding="same"\), nn\.ReLU\(\), ChannelLayerNorm2d\(12\)\)/,
  );
  assert.match(
    pytorchImage,
    /initialize_module\(self\.layer_0, "glorot-uniform"\)/,
  );
  assert.match(
    pytorchDense,
    /nn\.Sequential\(nn\.Linear\(10, 24\), nn\.ReLU\(\), nn\.BatchNorm1d\(24\)\)/,
  );

  for (const [framework, code] of [
    ["keras-sequence", keras],
    ["pytorch-sequence", pytorch],
    ["keras-image", kerasImage],
    ["pytorch-image", pytorchImage],
    ["pytorch-dense", pytorchDense],
  ]) {
    const parsed = spawnSync(
      "python",
      [
        "-c",
        "import ast, sys; source = sys.stdin.read(); ast.parse(source); compile(source, '<generated>', 'exec'); print('compile-ok')",
      ],
      { input: code, encoding: "utf8" },
    );
    assert.equal(parsed.status, 0, `${framework}: ${parsed.stderr}`);
    assert.match(parsed.stdout, /compile-ok/, framework);
  }
});

test("layer initialization and normalization reject unsupported combinations", () => {
  const invalidLayers = [
    {
      layer: {
        id: "bad-initializer",
        type: "dense",
        units: 8,
        initializer: "lecun-normal",
      },
      message: /initializer.*framework-default.*glorot-uniform.*he-normal.*orthogonal/i,
    },
    {
      layer: {
        id: "bad-normalization",
        type: "dense",
        units: 8,
        normalization: "instance",
      },
      message: /normalization.*none.*batch.*layer/i,
    },
    {
      layer: {
        id: "pool-initializer",
        type: "maxpool1d",
        poolSize: 2,
        initializer: "he-normal",
      },
      message: /MaxPool1D does not support an initializer/i,
    },
    {
      layer: {
        id: "recurrent-batch",
        type: "lstm",
        units: 8,
        normalization: "batch",
      },
      message: /LSTM supports none or layer normalization/i,
    },
  ];

  for (const { layer, message } of invalidLayers) {
    assert.throws(
      () => normalizeNeuralConfig({
        preset: "sequence-conv1d",
        layers: [
          layer,
          { id: "summary", type: "global-average-pool1d" },
        ],
      }),
      (error) => error instanceof NeuralConfigurationError
        && error.section === "architecture"
        && message.test(error.message),
    );
  }
});

test("neural normalization resolves a complete tabular training contract", () => {
  const config = normalizeNeuralConfig({
    framework: "pytorch",
    preset: "tabular-mlp",
    task: "tabular-classification",
    dataSource: "breast-cancer",
    splitStrategy: "train-validation-test",
    validationRatio: 0.15,
    testRatio: 0.15,
    scaling: "standard",
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    weightDecay: 0.0001,
    patience: 8,
    gradientClip: 1,
    mixedPrecision: true,
    device: "auto",
    workers: 2,
    randomSeed: 42,
  });

  assert.equal(config.dataContract, "tabular");
  assert.equal(config.dataSource, "breast-cancer");
  assert.equal(config.optimizer, "adamw");
  assert.equal(config.scheduler, "reduce-on-plateau");
  assert.equal(config.checkpointPath, "artifacts/best_neural_network.pt");
  assert.equal(config.artifactPath, "artifacts/neural_network.pt");
  assert.equal(config.minimumDelta, 0);
  assert.equal(config.momentum, 0.9);
});

test("neural normalization derives image-folder and sequence-array contracts", () => {
  const image = normalizeNeuralConfig({
    preset: "image-cnn",
    task: "image-classification",
    dataPath: "data/images",
  });
  const sequence = normalizeNeuralConfig({
    preset: "sequence-lstm",
    task: "sequence-classification",
    dataPath: "data/sensor_windows.npz",
  });

  assert.equal(image.dataContract, "image-folder");
  assert.equal(sequence.dataContract, "sequence-array");
  assert.match(buildNeuralDataSection(image, "keras").join("\n"), /image-folder/);
  assert.match(buildNeuralDataSection(sequence, "pytorch").join("\n"), /sequence-array/);
});

test("neural training requires an explicit validation split instead of relabeling training data", () => {
  assert.throws(
    () => normalizeNeuralConfig({
      preset: "tabular-mlp",
      splitStrategy: "train-test",
      testRatio: 0.2,
    }),
    (error) => error instanceof NeuralConfigurationError
      && error.section === "split"
      && /validation/i.test(error.message),
  );

  for (const framework of ["keras", "pytorch"]) {
    const code = generateNeuralScript({
      framework,
      preset: "tabular-mlp",
      splitStrategy: "train-validation-test",
      testRatio: 0.2,
      validationRatio: 0.1,
    }).code;

    assert.doesNotMatch(
      code,
      /VALIDATION_RATIO if VALIDATION_RATIO > 0 else TEST_RATIO/,
      `${framework} never invents a validation split`,
    );
  }
});

test("neural training persists preprocessing and label metadata beside every artifact", () => {
  const cases = [
    {
      framework: "keras",
      preset: "tabular-mlp",
      dataSource: "breast-cancer",
      expected: [
        /PREPROCESSING_PATH = ARTIFACT_PATH\.with_suffix\("\.preprocessing\.joblib"\)/,
        /"transformer": preprocessor/,
        /"label_encoder": encoder/,
      ],
    },
    {
      framework: "pytorch",
      preset: "sequence-lstm",
      dataSource: "sequence-array",
      expected: [
        /"scaler": scaler/,
        /"label_encoder": encoder/,
      ],
    },
    {
      framework: "keras",
      preset: "image-cnn",
      dataSource: "image-folder",
      expected: [
        /"class_names": expected_classes/,
        /"pixel_scale_denominator": 255\.0/,
      ],
    },
  ];

  for (const item of cases) {
    const result = generateNeuralScript(item);

    assert.match(result.code, /import joblib/);
    assert.match(
      result.code,
      /joblib\.dump\(preprocessing, PREPROCESSING_PATH\)/,
    );
    assert.ok(
      result.dependencies.includes("joblib"),
      `${item.framework}/${item.preset} declares joblib`,
    );
    for (const expected of item.expected) {
      assert.match(result.code, expected);
    }
  }
});

test("neural contracts reject unsafe paths and invalid split totals with typed errors", () => {
  assert.throws(
    () => normalizeNeuralConfig({ dataPath: "../private/dataset.csv" }),
    (error) => error instanceof NeuralConfigurationError && error.section === "data",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      testRatio: 0.6,
      validationRatio: 0.5,
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "split",
  );
  assert.throws(
    () => normalizeNeuralConfig({
      artifactPath: "C:\\models\\network.keras",
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
});

test("neural contracts reject Windows traversal and UNC paths before normalizing them", () => {
  const cases = [
    { dataPath: "data\\..\\secret.csv", section: "data" },
    { checkpointPath: "artifacts\\..\\best_neural_network.keras", section: "architecture" },
    { artifactPath: "artifacts\\..\\neural_network.keras", section: "architecture" },
    { dataPath: "\\\\server\\share\\dataset.csv", section: "data" },
  ];

  for (const item of cases) {
    assert.throws(
      () => normalizeNeuralConfig(item),
      (error) => error instanceof NeuralConfigurationError
        && error.section === item.section,
    );
  }
});

test("neural contracts reject incompatible preset, data, and output combinations", () => {
  assert.throws(
    () => normalizeNeuralConfig({
      preset: "image-cnn",
      task: "tabular-classification",
    }),
    (error) => error instanceof NeuralConfigurationError && error.section === "architecture",
  );
  assert.equal(
    normalizeNeuralConfig({
      preset: "tabular-regression-mlp",
      task: "tabular-regression",
      numClasses: 3,
    }).numClasses,
    1,
  );
  assert.equal(
    normalizeNeuralConfig({
      preset: "tabular-mlp",
      task: "tabular-classification",
      numClasses: 1,
    }).numClasses,
    2,
  );
});

test("Keras generator emits an editable multiclass CNN", () => {
  const result = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    task: "image-classification",
    inputShape: [32, 32, 3],
    numClasses: 10,
    epochs: 20,
    batchSize: 64,
    learningRate: 0.001,
  });

  assert.equal(result.filename, "keras_image_classification_network.py");
  assert.match(result.code, /keras\.Sequential/);
  assert.match(result.code, /layers\.Conv2D\(32/);
  assert.match(result.code, /layers\.GlobalAveragePooling2D/);
  assert.match(result.code, /layers\.Dense\(num_classes\)/);
  assert.match(result.code, /SparseCategoricalCrossentropy\(from_logits=True\)/);
  assert.match(result.code, /EPOCHS = 20/);
});

test("Keras generator trains, validates, tests, saves, and predicts", () => {
  const result = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
    task: "tabular-classification",
    dataSource: "breast-cancer",
    epochs: 4,
    batchSize: 16,
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    patience: 2,
    weightDecay: 0.0004,
    gradientClip: 1.5,
  });

  assert.match(result.code, /def load_data\(\):/);
  assert.match(result.code, /train_test_split/);
  assert.match(result.code, /model\.fit\(/);
  assert.doesNotMatch(result.code, /# history = model\.fit/);
  assert.match(result.code, /keras\.callbacks\.EarlyStopping\(/);
  assert.match(result.code, /keras\.callbacks\.ModelCheckpoint\(/);
  assert.match(result.code, /keras\.callbacks\.ReduceLROnPlateau\(/);
  assert.equal(result.code.match(/model\.evaluate\(test_/g)?.length, 1);
  assert.match(result.code, /model\.save\(ARTIFACT_PATH\)/);
  assert.match(result.code, /def predict_sample\(/);
  assert.match(result.code, /if __name__ == "__main__":/);
  assert.match(result.code, /EPOCHS = 4/);
  assert.match(result.code, /BATCH_SIZE = 16/);
  assert.match(result.code, /PATIENCE = 2/);
  assert.match(result.code, /WEIGHT_DECAY = 0\.0004/);
  assert.match(result.code, /CLIPNORM = 1\.5/);
  assert.match(
    result.code,
    /AdamW\(learning_rate=LEARNING_RATE, weight_decay=WEIGHT_DECAY, clipnorm=CLIPNORM\)/,
  );
});

test("Keras tabular preprocessing learns only from training rows", () => {
  const result = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
    dataSource: "custom-csv",
    dataPath: "data/customer-churn.csv",
    targetColumn: "churned",
    scaling: "robust",
    randomSeed: 73,
  });

  assert.match(result.code, /pd\.read_csv\(DATA_PATH\)/);
  assert.match(result.code, /if TARGET_COLUMN not in frame\.columns:/);
  assert.match(result.code, /if features\.shape\[1\] == 0:/);
  assert.ok(
    result.code.indexOf("train_test_split(")
      < result.code.indexOf("preprocessor.fit_transform(X_train)"),
  );
  assert.match(result.code, /preprocessor\.transform\(X_validation\)/);
  assert.match(result.code, /preprocessor\.transform\(X_test\)/);
  assert.doesNotMatch(result.code, /fit_transform\(X_validation\)|fit_transform\(X_test\)/);
  assert.ok(
    result.code.indexOf(") = _split_arrays(features, targets")
      < result.code.indexOf("encoder.fit_transform(y_train)"),
  );
  assert.match(result.code, /y_train = encoder\.fit_transform\(y_train\)/);
  assert.match(result.code, /y_validation = encoder\.transform\(y_validation\)/);
  assert.match(result.code, /y_test = encoder\.transform\(y_test\)/);
  assert.doesNotMatch(result.code, /encoder\.fit_transform\(targets\)/);
  assert.match(result.code, /RobustScaler\(\)/);
  assert.match(result.code, /RANDOM_SEED = 73/);
});

test("Keras classification and regression heads use compatible losses and metrics", () => {
  const binary = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
    dataSource: "breast-cancer",
    numClasses: 2,
  }).code;
  const multiclass = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
    dataSource: "iris",
    numClasses: 3,
  }).code;
  const regression = generateNeuralScript({
    framework: "keras",
    preset: "tabular-regression-mlp",
    task: "tabular-regression",
    dataSource: "diabetes",
  }).code;

  assert.match(binary, /layers\.Dense\(1\)/);
  assert.match(binary, /BinaryCrossentropy\(from_logits=True\)/);
  assert.match(binary, /BinaryAccuracy\(name="accuracy", threshold=0\.0\)/);
  assert.match(multiclass, /layers\.Dense\(num_classes\)/);
  assert.match(multiclass, /SparseCategoricalCrossentropy\(from_logits=True\)/);
  assert.match(multiclass, /SparseCategoricalAccuracy\(name="accuracy"\)/);
  assert.match(regression, /layers\.Dense\(1\)/);
  assert.match(regression, /MeanSquaredError\(\)/);
  assert.match(regression, /MeanAbsoluteError\(name="mae"\)/);
  assert.match(regression, /stratify=None/);
});

test("Keras image folders load explicit train, validation, and test datasets", () => {
  const code = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    task: "image-classification",
    dataPath: "datasets/animals",
    inputShape: [48, 48, 3],
    numClasses: 4,
  }).code;

  assert.match(code, /IMAGE_DIRECTORY = "datasets\/animals"/);
  assert.match(code, /train_directory = Path\(IMAGE_DIRECTORY\) \/ "train"/);
  assert.match(code, /validation_directory = Path\(IMAGE_DIRECTORY\) \/ "validation"/);
  assert.match(code, /test_directory = Path\(IMAGE_DIRECTORY\) \/ "test"/);
  assert.equal(
    code.match(/keras\.utils\.image_dataset_from_directory\(/g)?.length,
    3,
  );
  assert.match(code, /image_size=INPUT_SHAPE\[:2\]/);
  assert.match(code, /layers\.Rescaling\(1\.0 \/ 255\.0\)/);
  assert.match(code, /model\.fit\(\s*train_data,/);
});

test("Keras image folders derive loader color mode from supported channel counts", () => {
  const grayscale = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    inputShape: [32, 32, 1],
  }).code;
  const rgba = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
    inputShape: [32, 32, 4],
  }).code;

  for (const code of [grayscale, rgba]) {
    assert.match(
      code,
      /color_mode = \{1: "grayscale", 3: "rgb", 4: "rgba"\}\[INPUT_SHAPE\[-1\]\]/,
    );
    assert.equal(code.match(/color_mode=color_mode,/g)?.length, 3);
  }
  assert.throws(
    () => generateNeuralScript({
      framework: "keras",
      preset: "image-cnn",
      inputShape: [32, 32, 2],
    }),
    (error) => error instanceof NeuralConfigurationError
      && error.section === "architecture"
      && /1 \(grayscale\), 3 \(RGB\), or 4 \(RGBA\)/.test(error.message),
  );
});

test("Keras sequence arrays validate shape, split deterministically, and scale train-only", () => {
  const code = generateNeuralScript({
    framework: "keras",
    preset: "sequence-lstm",
    task: "sequence-classification",
    dataPath: "data/windows.npz",
    inputShape: [64, 8],
    numClasses: 5,
    scaling: "minmax",
    scheduler: "cosine",
    randomSeed: 19,
  }).code;

  assert.match(code, /with np\.load\(SEQUENCE_PATH\) as arrays:/);
  assert.match(code, /"features" not in arrays or "targets" not in arrays/);
  assert.match(code, /features\.shape\[1:\] != INPUT_SHAPE/);
  assert.ok(
    code.indexOf("train_test_split(")
      < code.indexOf("scaler.fit_transform(train_flat)"),
  );
  assert.match(code, /MinMaxScaler\(\)/);
  assert.match(code, /keras\.callbacks\.LearningRateScheduler\(/);
  assert.match(code, /RANDOM_SEED = 19/);
});

test("Keras sequence arrays encode non-zero-based binary and multiclass labels train-only", () => {
  const harness = String.raw`
import json
import sys
import types

import numpy as np

payload = json.load(sys.stdin)
fit_calls = []
transform_calls = []

class InstrumentedLabelEncoder:
    def fit_transform(self, values):
        values = np.asarray(values)
        fit_calls.append(values.tolist())
        self.classes_ = np.unique(values)
        self.mapping = {value: index for index, value in enumerate(self.classes_)}
        return np.asarray([self.mapping[value] for value in values], dtype=int)

    def transform(self, values):
        values = np.asarray(values)
        transform_calls.append(values.tolist())
        encoded = np.asarray([self.mapping[value] for value in values], dtype=int)
        if payload.get("force_bad_range") and len(transform_calls) == 1:
            encoded[0] = payload["num_classes"]
        return encoded

class UnusedScaler:
    pass

keras = types.ModuleType("keras")
keras.layers = types.SimpleNamespace()
sys.modules["keras"] = keras

sklearn = types.ModuleType("sklearn")
model_selection = types.ModuleType("sklearn.model_selection")
model_selection.train_test_split = lambda *args, **kwargs: None
preprocessing = types.ModuleType("sklearn.preprocessing")
preprocessing.LabelEncoder = InstrumentedLabelEncoder
preprocessing.MinMaxScaler = UnusedScaler
preprocessing.RobustScaler = UnusedScaler
preprocessing.StandardScaler = UnusedScaler
sys.modules["sklearn"] = sklearn
sys.modules["sklearn.model_selection"] = model_selection
sys.modules["sklearn.preprocessing"] = preprocessing
joblib = types.ModuleType("joblib")
sys.modules["joblib"] = joblib

namespace = {}
exec(payload["code"], namespace)
train = np.asarray(payload["train"])
validation = np.asarray(payload["validation"])
test = np.asarray(payload["test"])

try:
    encoded = namespace["_encode_sequence_targets"](train, validation, test)
except ValueError as error:
    if not payload.get("force_bad_range"):
        raise
    assert "outside the model output range" in str(error)
    print("range-guard-ok")
else:
    assert not payload.get("force_bad_range")
    assert fit_calls == [payload["train"]]
    assert transform_calls == [payload["validation"], payload["test"]]
    expected = list(range(payload["num_classes"]))
    for values in encoded[:3]:
        assert sorted(np.unique(values).tolist()) == expected
    assert encoded[3].classes_.tolist() == sorted(set(payload["train"]))
    print("encoding-ok")
`;
  const cases = [
    {
      numClasses: 2,
      train: [-1, 1, -1, 1],
      validation: [1, -1],
      test: [-1, 1],
    },
    {
      numClasses: 3,
      train: [1, 2, 3, 1, 2, 3],
      validation: [3, 1, 2],
      test: [2, 3, 1],
    },
    {
      numClasses: 3,
      train: ["idle", "run", "walk", "run", "walk", "idle"],
      validation: ["walk", "idle", "run"],
      test: ["run", "walk", "idle"],
    },
    {
      numClasses: 2,
      train: [-1, 1, -1, 1],
      validation: [1, -1],
      test: [-1, 1],
      forceBadRange: true,
    },
  ];

  for (const item of cases) {
    const code = generateNeuralScript({
      framework: "keras",
      preset: "sequence-conv1d",
      numClasses: item.numClasses,
    }).code;
    const executed = spawnSync(
      "python",
      ["-c", harness],
      {
        input: JSON.stringify({
          code,
          num_classes: item.numClasses,
          train: item.train,
          validation: item.validation,
          test: item.test,
          force_bad_range: item.forceBadRange === true,
        }),
        encoding: "utf8",
      },
    );
    assert.equal(
      executed.status,
      0,
      `${item.numClasses} classes: ${executed.stderr}`,
    );
    assert.match(
      executed.stdout,
      item.forceBadRange ? /range-guard-ok/ : /encoding-ok/,
    );
  }
});

test("Keras workflow dependencies include every directly imported data package", () => {
  const tabular = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
  });
  const image = generateNeuralScript({
    framework: "keras",
    preset: "image-cnn",
  });
  const sequence = generateNeuralScript({
    framework: "keras",
    preset: "sequence-conv1d",
  });

  assert.deepEqual(tabular.dependencies, [
    "joblib",
    "keras",
    "numpy",
    "pandas",
    "scikit-learn",
  ]);
  assert.deepEqual(image.dependencies, ["joblib", "keras", "numpy"]);
  assert.deepEqual(sequence.dependencies, [
    "joblib",
    "keras",
    "numpy",
    "scikit-learn",
  ]);
});

test("PyTorch generator emits a sequence LSTM and training skeleton", () => {
  const result = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    task: "sequence-classification",
    inputShape: [128, 6],
    numClasses: 4,
    epochs: 15,
    batchSize: 32,
    learningRate: 0.0005,
  });

  assert.equal(result.filename, "pytorch_sequence_classification_network.py");
  assert.match(result.code, /class ConfigurableNetwork\(nn\.Module\)/);
  assert.match(result.code, /nn\.LSTM\(input_size=6, hidden_size=64, batch_first=True/);
  assert.match(result.code, /x, _ = self\.layer_0\(x\)/);
  assert.match(result.code, /x = x\[:, -1, :\]/);
  assert.match(result.code, /CrossEntropyLoss/);
  assert.match(result.code, /learning_rate = 0\.0005/);
});

test("PyTorch generator emits executable loaders and training loops", () => {
  const result = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    task: "sequence-classification",
    dataSource: "custom-npz",
    dataPath: "data/sequences.npz",
    epochs: 4,
    batchSize: 16,
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    patience: 2,
    gradientClip: 1,
    mixedPrecision: true,
  });

  assert.match(result.code, /class ArrayDataset\(Dataset\)/);
  assert.match(result.code, /train_loader = DataLoader/);
  assert.match(result.code, /def train_epoch/);
  assert.match(result.code, /def evaluate/);
  assert.doesNotMatch(result.code, /# for epoch in range/);
  assert.match(result.code, /clip_grad_norm_/);
  assert.match(result.code, /autocast/);
  assert.match(result.code, /torch\.save\(/);
  assert.match(result.code, /model\.load_state_dict/);
  assert.match(result.code, /test_metrics = evaluate/);
  assert.match(result.code, /if __name__ == "__main__":/);
});

test("PyTorch tabular and image loaders preserve split and channel contracts", () => {
  const tabular = generateNeuralScript({
    framework: "pytorch",
    preset: "tabular-mlp",
    dataSource: "custom-csv",
    dataPath: "data/churn.csv",
    targetColumn: "churned",
    scaling: "robust",
    workers: 3,
    batchSize: 12,
  });
  const image = generateNeuralScript({
    framework: "pytorch",
    preset: "image-cnn",
    dataSource: "image-folder",
    dataPath: "datasets/animals",
    inputShape: [48, 48, 4],
    numClasses: 4,
    workers: 2,
  });

  assert.match(tabular.code, /pd\.read_csv\(DATA_PATH\)/);
  assert.ok(
    tabular.code.indexOf("train_test_split(")
      < tabular.code.indexOf("preprocessor.fit_transform(X_train)"),
  );
  assert.match(tabular.code, /preprocessor\.transform\(X_validation\)/);
  assert.match(tabular.code, /preprocessor\.transform\(X_test\)/);
  assert.doesNotMatch(
    tabular.code,
    /fit_transform\(X_validation\)|fit_transform\(X_test\)/,
  );
  assert.match(tabular.code, /RobustScaler\(\)/);
  assert.match(tabular.code, /BATCH_SIZE = 12/);
  assert.match(tabular.code, /WORKERS = 3/);
  assert.deepEqual(tabular.dependencies, [
    "joblib",
    "numpy",
    "pandas",
    "scikit-learn",
    "torch",
  ]);

  assert.match(image.code, /ImageFolder\(train_directory, transform=image_transform\)/);
  assert.equal(image.code.match(/ImageFolder\(/g)?.length, 3);
  assert.match(image.code, /image\.convert\("RGBA"\)/);
  assert.match(image.code, /transforms\.Resize\(INPUT_SHAPE\[:2\]\)/);
  assert.match(image.code, /validation_base\.class_to_idx != expected_classes/);
  assert.match(image.code, /test_base\.class_to_idx != expected_classes/);
  assert.doesNotMatch(image.code, /x = x\.permute\(0, 3, 1, 2\)/);
  assert.deepEqual(image.dependencies, [
    "joblib",
    "numpy",
    "torch",
    "torchvision",
  ]);
});

test("PyTorch image transforms are pickleable by spawn workers", () => {
  const harness = String.raw`
import ast
import json
from multiprocessing.reduction import ForkingPickler
import sys
import types

payload = json.load(sys.stdin)

class FakePath:
    def __init__(self, *parts):
        self.parts = tuple(str(part) for part in parts)

    def __truediv__(self, part):
        return FakePath(*self.parts, part)

    def is_dir(self):
        return True

class FakeLambda:
    def __init__(self, function):
        self.function = function

class FakeCompose:
    def __init__(self, transforms):
        self.transforms = transforms

class FakeResize:
    def __init__(self, size):
        self.size = size

class FakeToTensor:
    pass

class FakeImageFolder:
    def __init__(self, directory, transform):
        self.directory = directory
        self.transform = transform
        self.class_to_idx = {
            f"class-{index}": index
            for index in range(payload["num_classes"])
        }

tree = ast.parse(payload["code"])
selected = []
for node in tree.body:
    if isinstance(node, ast.Assign):
        names = {target.id for target in node.targets if isinstance(target, ast.Name)}
        if names & {
            "DATA_CONTRACT",
            "IMAGE_DIRECTORY",
            "INPUT_SHAPE",
            "NUM_CLASSES",
        }:
            selected.append(node)
    elif isinstance(node, ast.FunctionDef) and node.name in {
        "convert_image_mode",
        "load_datasets",
    }:
        selected.append(node)

module_name = "generated_image_pickle_seam"
module = types.ModuleType(module_name)
module.__dict__.update({
    "ImageFolder": FakeImageFolder,
    "Path": FakePath,
    "transforms": types.SimpleNamespace(
        Compose=FakeCompose,
        Lambda=FakeLambda,
        Resize=FakeResize,
        ToTensor=FakeToTensor,
    ),
})
sys.modules[module_name] = module
exec(
    compile(ast.Module(body=selected, type_ignores=[]), module_name, "exec"),
    module.__dict__,
)
datasets = module.load_datasets()
ForkingPickler.dumps(datasets)
print("spawn-pickle-ok")
`;

  for (const channels of [1, 3, 4]) {
    const numClasses = 3;
    const code = generateNeuralScript({
      framework: "pytorch",
      preset: "image-cnn",
      dataSource: "image-folder",
      inputShape: [32, 32, channels],
      numClasses,
      workers: 2,
    }).code;
    const executed = spawnSync(
      "python",
      ["-c", harness],
      {
        input: JSON.stringify({
          code,
          num_classes: numClasses,
        }),
        encoding: "utf8",
      },
    );
    assert.equal(
      executed.status,
      0,
      `${channels} channels: ${executed.stderr}`,
    );
    assert.match(executed.stdout, /spawn-pickle-ok/);
  }
});

test("PyTorch array target preparation produces loss-compatible dtypes and shapes", () => {
  const harness = String.raw`
import ast
import json
import sys

import numpy as np

payload = json.load(sys.stdin)
tree = ast.parse(payload["code"])
selected = []
for node in tree.body:
    if isinstance(node, ast.Assign):
        names = {target.id for target in node.targets if isinstance(target, ast.Name)}
        if names & {"IS_REGRESSION", "IS_BINARY"}:
            selected.append(node)
    elif isinstance(node, ast.FunctionDef) and node.name == "_prepare_array_targets":
        selected.append(node)
namespace = {"np": np}
exec(compile(ast.Module(body=selected, type_ignores=[]), "<target-seam>", "exec"), namespace)
prepared = namespace["_prepare_array_targets"](payload["targets"])
assert prepared.dtype.name == payload["dtype"], prepared.dtype
assert list(prepared.shape) == payload["shape"], prepared.shape
print("target-seam-ok")
`;
  const cases = [
    {
      config: {
        framework: "pytorch",
        preset: "tabular-mlp",
        numClasses: 2,
      },
      targets: [0, 1, 0],
      dtype: "float32",
      shape: [3, 1],
    },
    {
      config: {
        framework: "pytorch",
        preset: "sequence-conv1d",
        numClasses: 3,
      },
      targets: [0, 2, 1],
      dtype: "int64",
      shape: [3],
    },
    {
      config: {
        framework: "pytorch",
        preset: "tabular-regression-mlp",
        dataSource: "diabetes",
      },
      targets: [1.25, -0.5, 3],
      dtype: "float32",
      shape: [3, 1],
    },
  ];

  for (const item of cases) {
    const code = generateNeuralScript(item.config).code;
    const executed = spawnSync(
      "python",
      ["-c", harness],
      {
        input: JSON.stringify({
          code,
          targets: item.targets,
          dtype: item.dtype,
          shape: item.shape,
        }),
        encoding: "utf8",
      },
    );
    assert.equal(executed.status, 0, executed.stderr);
    assert.match(executed.stdout, /target-seam-ok/);
  }
});

test("PyTorch optimizer, scheduler, determinism, and checkpoint mappings are complete", () => {
  const optimizers = {
    adam: /torch\.optim\.Adam\(model\.parameters\(\), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY\)/,
    adamw: /torch\.optim\.AdamW\(model\.parameters\(\), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY\)/,
    sgd: /torch\.optim\.SGD\(model\.parameters\(\), lr=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY\)/,
    rmsprop: /torch\.optim\.RMSprop\(model\.parameters\(\), lr=LEARNING_RATE, momentum=MOMENTUM, weight_decay=WEIGHT_DECAY\)/,
  };
  for (const [optimizer, pattern] of Object.entries(optimizers)) {
    const code = generateNeuralScript({
      framework: "pytorch",
      preset: "tabular-mlp",
      optimizer,
    }).code;
    assert.match(code, pattern, optimizer);
  }

  const plateau = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    scheduler: "reduce-on-plateau",
    gradientClip: 0.75,
    mixedPrecision: true,
    device: "auto",
  }).code;
  const cosine = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    scheduler: "cosine",
  }).code;

  assert.match(plateau, /torch\.optim\.lr_scheduler\.ReduceLROnPlateau/);
  assert.match(plateau, /scheduler\.step\(validation_metrics\["loss"\]\)/);
  assert.match(cosine, /torch\.optim\.lr_scheduler\.CosineAnnealingLR/);
  assert.match(cosine, /scheduler\.step\(\)/);
  assert.match(plateau, /def seed_worker\(worker_id\):/);
  assert.match(plateau, /torch\.initial_seed\(\) % 2\*\*32/);
  assert.match(plateau, /worker_init_fn=seed_worker/);
  assert.match(plateau, /generator=_loader_generator\(\)/);
  assert.equal(plateau.match(/shuffle=True/g)?.length, 1);
  assert.equal(plateau.match(/shuffle=False/g)?.length, 2);
  assert.match(plateau, /device\.type == "cuda"/);
  assert.match(plateau, /torch\.amp\.GradScaler\("cuda"\)/);
  assert.match(plateau, /torch\.amp\.autocast\("cuda"\)/);
  assert.match(plateau, /clip_grad_norm_\(model\.parameters\(\), GRADIENT_CLIP\)/);
  assert.match(plateau, /"model_state": model\.state_dict\(\)/);
  assert.match(plateau, /"input_shape": INPUT_SHAPE/);
  assert.match(plateau, /"num_classes": NUM_CLASSES/);
  assert.match(plateau, /"task": TASK/);
  assert.equal(plateau.match(/test_metrics = evaluate\(/g)?.length, 1);
  assert.ok(
    plateau.indexOf("model.load_state_dict")
      < plateau.indexOf("test_metrics = evaluate"),
  );
  assert.ok(
    plateau.indexOf("model.load_state_dict")
      < plateau.indexOf("sample_prediction = predict_sample"),
  );
});

test("invalid neural architecture refuses to generate code", () => {
  assert.throws(
    () => generateNeuralScript({
      framework: "keras",
      task: "tabular-classification",
      inputShape: [12],
      layers: [
        { id: "bad-layer", type: "conv2d", filters: 32, kernelSize: 3 },
      ],
    }),
    /Conv2D expects \[height, width, channels\]/,
  );
});
