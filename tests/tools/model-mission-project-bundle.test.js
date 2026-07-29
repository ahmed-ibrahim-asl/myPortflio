import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  adaptLegacyMissionResult,
  generateSynchronousMissionResult,
} from "../../lib/tools/ml-generator/model-mission/adapters.js";
import {
  MODEL_MISSION_TASKS,
  getModelMissionTask,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";
import {
  legacyDefaultsToSections,
} from "../../lib/tools/ml-generator/model-mission/legacy-bridge.js";
import {
  buildMissionProjectBundle,
} from "../../lib/tools/ml-generator/model-mission/project-bundle.js";
import {
  createProjectForTask,
} from "../../lib/tools/ml-generator/model-mission/state.js";
import {
  buildRecipeResult,
  getRecipeDefaultConfig,
} from "../../lib/tools/ml-generator/engine.js";
import {
  loadRecipe,
} from "../../lib/tools/ml-generator/load-recipe.js";

const BASE_FILES = [
  ".gitignore",
  "README.md",
  "data/README.md",
  "model_mission.json",
  "requirements.txt",
  "src/predict.py",
  "src/train.py",
  "tests/test_generated_project.py",
];

function mergeProject(project, overrides = {}) {
  return {
    ...project,
    ...overrides,
    data: { ...project.data, ...overrides.data },
    inspection: { ...project.inspection, ...overrides.inspection },
    split: { ...project.split, ...overrides.split },
    preparation: { ...project.preparation, ...overrides.preparation },
    model: { ...project.model, ...overrides.model },
    training: { ...project.training, ...overrides.training },
    evaluation: { ...project.evaluation, ...overrides.evaluation },
    output: { ...project.output, ...overrides.output },
  };
}

function synchronousMission(taskId, overrides = {}) {
  const project = mergeProject(createProjectForTask(taskId), overrides);
  const result = generateSynchronousMissionResult(project);
  assert.deepEqual(result.validationErrors, {});
  return {
    project: result.resolvedConfig,
    result,
    task: getModelMissionTask(taskId),
  };
}

function synchronousBundle(taskId, overrides = {}) {
  const mission = synchronousMission(taskId, overrides);
  return buildMissionProjectBundle({
    ...mission,
  });
}

function executePredictor(bundle, extraFiles = {}) {
  const temporaryRoot = mkdtempSync(
    join(tmpdir(), "model-mission-predictor-"),
  );
  try {
    writeBundle(temporaryRoot, {
      ...bundle.files,
      ...extraFiles,
    });
    return spawnSync(
      "python",
      ["src/predict.py"],
      { cwd: temporaryRoot, encoding: "utf8" },
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function assertPredictorOutput(executed, expected) {
  assert.equal(executed.status, 0, executed.stderr || executed.stdout);
  assert.match(executed.stdout, expected);
}

function bundleMission(mission) {
  return buildMissionProjectBundle({
    result: mission.result,
    project: mission.project,
    task: mission.task,
  });
}

async function legacyMission(taskId, overrides = {}, mode = "starter") {
  const task = getModelMissionTask(taskId);
  const recipe = await loadRecipe(task.recipeId);
  const defaults = getRecipeDefaultConfig(recipe, mode);
  const config = { ...defaults, ...overrides };
  const generated = buildRecipeResult(
    recipe,
    task.recipeId,
    config,
    mode,
  );
  assert.deepEqual(generated.validationErrors, {});
  const sections = legacyDefaultsToSections(
    task.recipeId,
    generated.config,
  );
  const initialProject = createProjectForTask(taskId);
  const project = {
    ...initialProject,
    ...sections,
    output: {
      ...initialProject.output,
      ...sections.output,
    },
  };
  return {
    project,
    result: adaptLegacyMissionResult(generated, project),
    task,
  };
}

function writeBundle(root, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const destination = join(root, ...relativePath.split("/"));
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, content, "utf8");
  }
}

function assertPythonCompiles(source, label) {
  const parsed = spawnSync(
    "python",
    [
      "-c",
      "import ast,sys; compile(ast.parse(sys.stdin.read()), '<generated>', 'exec')",
    ],
    { input: source, encoding: "utf8" },
  );
  assert.equal(parsed.status, 0, `${label}: ${parsed.stderr}`);
}

test("project bundle contains one documented reproducible project", () => {
  const project = createProjectForTask("classification");
  const result = generateSynchronousMissionResult(project);
  const bundle = buildMissionProjectBundle({
    result,
    project: result.resolvedConfig,
    task: getModelMissionTask("classification"),
  });

  assert.equal(bundle.rootName, "model-mission-project");
  assert.deepEqual(Object.keys(bundle.files).sort(), BASE_FILES);
  assert.match(bundle.files["README.md"], /Classification/);
  assert.match(bundle.files["README.md"], /python src\/train\.py/);
  assert.match(bundle.files["requirements.txt"], /scikit-learn>=1\.5,<2/);
  assert.deepEqual(
    JSON.parse(bundle.files["model_mission.json"]),
    result.resolvedConfig,
  );
  assert.equal(bundle.files["src/train.py"], result.code);
  assert.ok(
    Object.values(bundle.files).every(
      (content) => typeof content === "string" && !content.includes("\0"),
    ),
  );
});

test("requirements are sorted structured dependency ranges", () => {
  const bundle = synchronousBundle("classification");

  assert.equal(
    bundle.files["requirements.txt"],
    [
      "joblib>=1.4,<2",
      "numpy>=1.26,<3",
      "pandas>=2.2,<3",
      "scikit-learn>=1.5,<2",
      "",
    ].join("\n"),
  );
});

test("bundle output is deterministic and configuration has no live alias", () => {
  const project = createProjectForTask("classification");
  const result = generateSynchronousMissionResult(project);
  const first = buildMissionProjectBundle({
    result,
    project: result.resolvedConfig,
    task: getModelMissionTask("classification"),
  });
  const second = buildMissionProjectBundle({
    result,
    project: result.resolvedConfig,
    task: getModelMissionTask("classification"),
  });
  const serialized = first.files["model_mission.json"];

  result.resolvedConfig.model.model = "decision-tree";

  assert.deepEqual(first, second);
  assert.equal(first.files["model_mission.json"], serialized);
  assert.equal(JSON.parse(serialized).model.model, "logistic-regression");
});

test("resolved MissionResult configuration is authoritative", () => {
  const mission = synchronousMission("classification");
  const mismatchedProject = mergeProject(mission.project, {
    model: { model: "decision-tree" },
  });

  assert.throws(
    () => buildMissionProjectBundle({
      ...mission,
      project: mismatchedProject,
    }),
    /project must match result\.resolvedConfig/i,
  );
  assert.throws(
    () => buildMissionProjectBundle({
      ...mission,
      task: getModelMissionTask("regression"),
    }),
    /task must match result\.resolvedConfig/i,
  );
  assert.throws(
    () => buildMissionProjectBundle({
      ...mission,
      result: {
        ...mission.result,
        resolvedConfig: undefined,
      },
    }),
    /resolvedConfig is required/i,
  );
});

test("bundle validates required structured inputs before generation", () => {
  assert.throws(
    () => buildMissionProjectBundle(),
    /MissionResult, resolved ProjectConfig, and task are required/i,
  );

  const mission = synchronousMission("classification");
  assert.throws(
    () => buildMissionProjectBundle({
      ...mission,
      result: {
        ...mission.result,
        dependencies: ["numpy"],
      },
    }),
    /dependencies must contain structured records/i,
  );
});

test("forged task identifiers cannot become artifact paths", () => {
  const mission = synchronousMission("classification");
  const resolvedConfig = {
    ...mission.result.resolvedConfig,
    taskId: "../escape",
  };

  assert.throws(
    () => buildMissionProjectBundle({
      result: {
        ...mission.result,
        resolvedConfig,
      },
      project: resolvedConfig,
      task: {
        ...mission.task,
        id: "../escape",
      },
    }),
    /supported Model Mission task/i,
  );
});

test("project names normalize safely and path-shaped names are rejected", () => {
  const project = mergeProject(createProjectForTask("classification"), {
    output: { projectName: "  Factory Vision_Project!  " },
  });
  const result = generateSynchronousMissionResult(project);

  assert.equal(
    buildMissionProjectBundle({
      result,
      project: result.resolvedConfig,
      task: getModelMissionTask("classification"),
    }).rootName,
    "factory-vision-project",
  );

  for (const projectName of [
    "../escape",
    "..\\escape",
    "/absolute",
    "C:\\absolute",
    "\\\\server\\share",
    "folder/project",
  ]) {
    const unsafeProject = mergeProject(result.resolvedConfig, {
      output: { projectName },
    });
    assert.throws(
      () => buildMissionProjectBundle({
        result: {
          ...result,
          resolvedConfig: unsafeProject,
        },
        project: unsafeProject,
        task: getModelMissionTask("classification"),
      }),
      /safe project name/i,
      projectName,
    );
  }
});

test("internal paths reject traversal, absolute paths, and Windows bypasses", () => {
  const project = createProjectForTask("neural-network");
  const result = generateSynchronousMissionResult(project);
  const unsafePaths = [
    "../private/model.keras",
    "..\\private\\model.keras",
    "/var/models/model.keras",
    "C:\\models\\model.keras",
    "\\\\server\\models\\model.keras",
    "artifacts/model.keras\nREADME.md",
  ];

  for (const artifactPath of unsafePaths) {
    const unsafeProject = mergeProject(result.resolvedConfig, {
      output: { artifactPath },
    });
    assert.throws(
      () => buildMissionProjectBundle({
        result: {
          ...result,
          resolvedConfig: unsafeProject,
        },
        project: unsafeProject,
        task: getModelMissionTask("neural-network"),
      }),
      /safe relative path/i,
      artifactPath,
    );
  }
});

test("classical data guide links the selected catalog source", () => {
  const bundle = synchronousBundle("classification", {
    data: { dataset: "wine" },
    evaluation: { decisionThreshold: null },
  });

  assert.match(bundle.files["data/README.md"], /Wine/);
  assert.match(
    bundle.files["data/README.md"],
    /https:\/\/archive\.ics\.uci\.edu\/dataset\/109\/winedataset/,
  );
  assert.match(bundle.files["data/README.md"], /Scikit-learn \/ UCI/);
});

test("custom tabular project documents the portable CSV path", () => {
  const bundle = synchronousBundle("classification", {
    data: {
      dataset: "custom-csv",
      dataPath: "data/patients.csv",
      targetColumn: "diagnosis",
    },
  });

  assert.match(bundle.files["data/README.md"], /data\/patients\.csv/);
  assert.match(bundle.files["data/README.md"], /diagnosis/);
  assert.doesNotMatch(bundle.files["data/README.md"], /https?:\/\//);
});

test("classical prediction uses the emitted task artifact and inference CSV", () => {
  const classification = synchronousBundle("classification");
  const regression = synchronousBundle("regression");

  assert.match(
    classification.files["src/predict.py"],
    /joblib\.load\(artifact_path\)/,
  );
  assert.match(
    classification.files["src/predict.py"],
    /classification_pipeline\.joblib/,
  );
  assert.match(
    classification.files["src/predict.py"],
    /data\/inference\.csv/,
  );
  assert.match(
    regression.files["src/predict.py"],
    /regression_pipeline\.joblib/,
  );
  assert.match(
    classification.files["README.md"],
    /classification_pipeline\.joblib/,
  );
});

test("Keras project loads the configured artifact and documents image folders", () => {
  const bundle = synchronousBundle("neural-network", {
    data: {
      dataSource: "image-folder",
      dataPath: "data/product-images",
      targetColumn: "",
    },
    model: {
      framework: "keras",
      preset: "image-cnn",
      inputShape: [32, 32, 3],
      numClasses: 4,
    },
    output: {
      checkpointPath: "artifacts/best_products.keras",
      artifactPath: "artifacts/products.keras",
    },
  });

  assert.match(
    bundle.files["src/predict.py"],
    /keras\.models\.load_model\(artifact_path\)/,
  );
  assert.match(bundle.files["src/predict.py"], /artifacts\/products\.keras/);
  assert.match(
    bundle.files["data/README.md"],
    /data\/product-images\/\s*\n\s*train\/\s*\n\s*class-name\//,
  );
  assert.match(bundle.files["README.md"], /artifacts\/products\.keras/);
});

test("PyTorch project reconstructs the network from checkpoint metadata", () => {
  const bundle = synchronousBundle("neural-network", {
    data: {
      dataSource: "custom-csv",
      dataPath: "data/patients.csv",
      targetColumn: "diagnosis",
    },
    model: {
      framework: "pytorch",
      preset: "tabular-mlp",
    },
    output: {
      checkpointPath: "artifacts/best_patients.pt",
      artifactPath: "artifacts/patients.pt",
    },
  });
  const prediction = bundle.files["src/predict.py"];

  assert.match(prediction, /torch\.load\(artifact_path/);
  assert.match(prediction, /checkpoint\["model_state"\]/);
  assert.match(prediction, /checkpoint\["input_shape"\]/);
  assert.match(prediction, /checkpoint\["num_classes"\]/);
  assert.match(prediction, /checkpoint\["task"\]/);
  assert.match(prediction, /ConfigurableNetwork/);
  assert.match(prediction, /artifacts\/patients\.pt/);
  assert.match(bundle.files["README.md"], /artifacts\/patients\.pt/);
});

test("YOLO project loads the actual best checkpoint and configured source", async () => {
  const { project, result, task } = await legacyMission(
    "object-detection",
    {
      sourcePath: "./examples/conveyor.jpg",
      projectDirectory: "./runs/factory",
      runName: "bearing_check",
    },
    "production",
  );
  const bundle = buildMissionProjectBundle({ result, project, task });
  const prediction = bundle.files["src/predict.py"];

  assert.match(prediction, /YOLO\(artifact_path\)/);
  assert.match(
    prediction,
    /runs\/factory\/bearing_check\/weights\/best\.pt/,
  );
  assert.match(prediction, /examples\/conveyor\.jpg/);
  assert.match(
    bundle.files["data/README.md"],
    /images\/\{train,val,test\}\//,
  );
  assert.match(bundle.files["README.md"], /bearing_check\/weights\/best\.pt/);
  assert.match(
    bundle.files["requirements.txt"],
    /ultralytics>=8\.3,<9/,
  );
});

test("ONNX sensor prediction loads documented input and executes inference", async () => {
  const mission = await legacyMission("sensor-classification", {
    exportFormat: "onnx",
  }, "production");
  const bundle = bundleMission(mission);

  assert.match(
    bundle.files["requirements.txt"],
    /onnxruntime>=1\.18,<2/,
  );
  assert.match(bundle.files["README.md"], /data\/inference\.npy/);
  assert.match(bundle.files["data/README.md"], /data\/inference\.npy/);
  assert.match(
    mission.result.code,
    /output_path = checkpoint\.with_suffix\("\.onnx"\)/,
  );

  const executed = executePredictor(bundle, {
    "artifacts/sensor_classifier.onnx": "",
    "data/inference.npy": "stub",
    "src/numpy.py": `class Batch:
    pass


def load(path, allow_pickle=False):
    assert str(path).replace("\\\\", "/") == "data/inference.npy"
    assert allow_pickle is False
    return Batch()
`,
    "src/onnxruntime.py": `class Input:
    name = "sensor_input"


class InferenceSession:
    def __init__(self, path, providers):
        assert str(path).replace("\\\\", "/") == "artifacts/sensor_classifier.onnx"
        assert providers == ["CPUExecutionProvider"]

    def get_inputs(self):
        return [Input()]

    def run(self, output_names, inputs):
        assert output_names is None
        assert list(inputs) == ["sensor_input"]
        return [["onnx-ok"]]
`,
  });

  assertPredictorOutput(executed, /onnx-ok/);
});

test("executed classical and Keras predictors honor training artifact paths", () => {
  const classicalMission = synchronousMission("classification");
  const classicalBundle = bundleMission(classicalMission);
  assert.match(
    classicalMission.result.code,
    /MODEL_PATH = "classification_pipeline\.joblib"/,
  );
  const classical = executePredictor(classicalBundle, {
    "classification_pipeline.joblib": "",
    "data/inference.csv": "feature\n1\n",
    "src/joblib.py": `class Pipeline:
    def predict(self, rows):
        assert rows == ["csv-rows"]
        return ["classical-ok"]


def load(path):
    assert str(path).replace("\\\\", "/") == "classification_pipeline.joblib"
    return Pipeline()
`,
    "src/pandas.py": `def read_csv(path):
    assert str(path).replace("\\\\", "/") == "data/inference.csv"
    return ["csv-rows"]
`,
  });
  assertPredictorOutput(classical, /classical-ok/);

  const kerasMission = synchronousMission("neural-network", {
    output: {
      checkpointPath: "artifacts/best_products.keras",
      artifactPath: "artifacts/products.keras",
    },
  });
  const kerasBundle = bundleMission(kerasMission);
  assert.match(
    kerasMission.result.code,
    /ARTIFACT_PATH = Path\("artifacts\/products\.keras"\)/,
  );
  const keras = executePredictor(kerasBundle, {
    "artifacts/products.keras": "",
    "data/inference.npy": "stub",
    "src/keras.py": `class Model:
    def predict(self, batch, verbose=0):
        assert batch == ["keras-input"]
        assert verbose == 0
        return ["keras-ok"]


class Models:
    @staticmethod
    def load_model(path):
        assert str(path).replace("\\\\", "/") == "artifacts/products.keras"
        return Model()


models = Models()
`,
    "src/numpy.py": `def load(path, allow_pickle=False):
    assert str(path).replace("\\\\", "/") == "data/inference.npy"
    assert allow_pickle is False
    return ["keras-input", "unused"]
`,
  });
  assertPredictorOutput(keras, /keras-ok/);
});

test("executed PyTorch and YOLO predictors honor training artifact paths", async () => {
  const pytorchMission = synchronousMission("neural-network", {
    model: {
      framework: "pytorch",
      preset: "tabular-mlp",
    },
    output: {
      checkpointPath: "artifacts/best_patients.pt",
      artifactPath: "artifacts/patients.pt",
    },
  });
  const pytorchBundle = bundleMission(pytorchMission);
  assert.match(
    pytorchMission.result.code,
    /ARTIFACT_PATH = Path\("artifacts\/patients\.pt"\)/,
  );
  const pytorch = executePredictor(pytorchBundle, {
    "artifacts/patients.pt": "",
    "data/inference.npy": "stub",
    "src/numpy.py": `def load(path, allow_pickle=False):
    assert str(path).replace("\\\\", "/") == "data/inference.npy"
    assert allow_pickle is False
    return ["torch-input", "unused"]
`,
    "src/torch.py": `class Tensor:
    def float(self):
        return self


def load(path, map_location, weights_only):
    assert str(path).replace("\\\\", "/") == "artifacts/patients.pt"
    assert map_location == "cpu"
    assert weights_only is True
    return {
        "model_state": {"weight": "ready"},
        "input_shape": (30,),
        "num_classes": 2,
        "task": "tabular-classification",
    }


def from_numpy(value):
    assert value == ["torch-input"]
    return Tensor()


class inference_mode:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False
`,
    "src/train.py": `INPUT_SHAPE = (30,)
NUM_CLASSES = 2
TASK = "tabular-classification"


class ConfigurableNetwork:
    def load_state_dict(self, state):
        assert state == {"weight": "ready"}

    def eval(self):
        return None

    def __call__(self, sample):
        return ["pytorch-ok"]
`,
  });
  assertPredictorOutput(pytorch, /pytorch-ok/);

  const yoloMission = await legacyMission("object-detection", {
    sourcePath: "./examples/conveyor.jpg",
    projectDirectory: "./runs/factory",
    runName: "bearing_check",
  }, "production");
  const yoloBundle = bundleMission(yoloMission);
  assert.match(
    yoloMission.result.code,
    /"project_directory": "\.\/runs\/factory"/,
  );
  assert.match(yoloMission.result.code, /"run_name": "bearing_check"/);
  const yolo = executePredictor(yoloBundle, {
    "runs/factory/bearing_check/weights/best.pt": "",
    "examples/conveyor.jpg": "",
    "src/ultralytics.py": `class YOLO:
    def __init__(self, path):
        assert str(path).replace("\\\\", "/") == "runs/factory/bearing_check/weights/best.pt"

    def predict(self, source, conf, iou):
        assert source.replace("\\\\", "/") == "examples/conveyor.jpg"
        assert conf == 0.25
        assert iou == 0.7
        print("yolo-ok")
`,
  });
  assertPredictorOutput(yolo, /yolo-ok/);
});

test("legacy adapter preserves recipe data structure for the bundle guide", async () => {
  const { result } = await legacyMission("image-classification");

  assert.equal(result.dataset.title, "Class-directory image dataset");
  assert.match(result.dataset.structure, /cat\/\{cat_001\.jpg/);
  assert.deepEqual(result.artifacts, [
    "best Keras checkpoint",
    "class-label file",
    "TensorFlow Lite deployment model",
    "latency and file-size benchmark summary",
  ]);
});

test("README commands name every generated executable project file", () => {
  const bundle = synchronousBundle("classification");
  const readme = bundle.files["README.md"];

  assert.match(readme, /python -m venv \.venv/);
  assert.match(readme, /python -m pip install -r requirements\.txt/);
  assert.match(readme, /python src\/train\.py/);
  assert.match(readme, /python src\/predict\.py/);
  assert.match(
    readme,
    /python tests\/test_generated_project\.py/,
  );
  for (const commandPath of [
    "requirements.txt",
    "src/train.py",
    "src/predict.py",
    "tests/test_generated_project.py",
  ]) {
    assert.ok(bundle.files[commandPath], commandPath);
  }
});

test("smoke test parses training and validates files without training", () => {
  const bundle = synchronousBundle("classification");
  const smoke = bundle.files["tests/test_generated_project.py"];
  const temporaryRoot = mkdtempSync(
    join(tmpdir(), "model-mission-bundle-"),
  );

  try {
    assert.doesNotMatch(
      smoke,
      /subprocess|runpy|import\s+train|src\.train/,
    );
    writeBundle(temporaryRoot, bundle.files);
    const executed = spawnSync(
      "python",
      ["tests/test_generated_project.py"],
      { cwd: temporaryRoot, encoding: "utf8" },
    );
    assert.equal(executed.status, 0, executed.stderr || executed.stdout);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("every task emits the exact base map and parseable prediction script", async () => {
  for (const task of MODEL_MISSION_TASKS) {
    let project;
    let result;
    if (task.adapterId === "legacy") {
      ({ project, result } = await legacyMission(task.id));
    } else {
      project = createProjectForTask(task.id);
      result = generateSynchronousMissionResult(project);
    }
    const bundle = buildMissionProjectBundle({ result, project, task });

    assert.deepEqual(
      Object.keys(bundle.files).sort(),
      BASE_FILES,
      task.id,
    );
    assert.equal(bundle.files["src/train.py"], result.code, task.id);
    assertPythonCompiles(bundle.files["src/predict.py"], task.id);
    assertPythonCompiles(
      bundle.files["tests/test_generated_project.py"],
      `${task.id} smoke`,
    );
  }
});
