import {
  CLASSICAL_DATASETS,
} from "../workbench/classical-generator.js";
import {
  getModelMissionTask,
} from "./catalog.js";

const BASE_FILE_PATHS = Object.freeze([
  ".gitignore",
  "README.md",
  "data/README.md",
  "model_mission.json",
  "requirements.txt",
  "src/predict.py",
  "src/train.py",
  "tests/test_generated_project.py",
]);

const CONFIG_PATH_FIELDS = Object.freeze([
  ["data", "dataPath"],
  ["data", "datasetPath"],
  ["data", "datasetDirectory"],
  ["data", "sampleImagePath"],
  ["data", "datasetYaml"],
  ["data", "sourcePath"],
  ["output", "checkpointPath"],
  ["output", "artifactPath"],
  ["output", "artifactDirectory"],
  ["output", "projectDirectory"],
]);

function isRecord(value) {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
  );
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function stableJson(value) {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

function containsTraversal(path) {
  return path
    .replaceAll("\\", "/")
    .split("/")
    .some((segment) => segment === "..");
}

function safeRelativePath(value, label, { allowEmpty = false } = {}) {
  const original = String(value ?? "").trim();
  if (original === "" && allowEmpty) return "";
  const portable = original.replaceAll("\\", "/");
  const absolute =
    portable.startsWith("/")
    || /^[A-Za-z]:\//u.test(portable);
  if (
    original === ""
    || /[\u0000-\u001F\u007F]/u.test(original)
    || absolute
    || containsTraversal(original)
    || portable.includes(":")
  ) {
    throw new Error(`${label} must be a safe relative path.`);
  }

  const segments = portable
    .split("/")
    .filter((segment) => segment !== "" && segment !== ".");
  if (segments.length === 0) {
    throw new Error(`${label} must be a safe relative path.`);
  }
  return segments.join("/");
}

function safeProjectName(value) {
  const original = String(value ?? "").trim();
  if (original === "") return "model-mission-project";
  if (
    /[\u0000-\u001F\u007F]/u.test(original)
    || original.includes("/")
    || original.includes("\\")
    || containsTraversal(original)
    || /^[A-Za-z]:/u.test(original)
  ) {
    throw new Error("Project name must be a safe project name.");
  }

  const normalized = original
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  if (normalized === "") {
    throw new Error("Project name must be a safe project name.");
  }
  return normalized;
}

function validateConfiguredPaths(project) {
  for (const [section, field] of CONFIG_PATH_FIELDS) {
    const value = project[section]?.[field];
    if (value !== undefined && value !== null && value !== "") {
      safeRelativePath(value, `${section}.${field}`);
    }
  }
}

function normalizedConfigPath(project, section, field, fallback = "") {
  const value = project[section]?.[field];
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return safeRelativePath(value, `${section}.${field}`);
}

function joinRelativePath(...parts) {
  return safeRelativePath(
    parts.filter(Boolean).join("/"),
    "Generated artifact path",
  );
}

function replaceSuffix(path, suffix) {
  const dot = path.lastIndexOf(".");
  return `${dot > path.lastIndexOf("/") ? path.slice(0, dot) : path}${suffix}`;
}

function artifactDetails(project, task) {
  if (task.adapterId === "classical") {
    return {
      kind: "classical",
      path: `${task.id}_pipeline.joblib`,
    };
  }

  if (task.id === "neural-network") {
    const framework = project.model?.framework ?? "keras";
    return {
      kind: framework === "pytorch" ? "pytorch" : "keras",
      path: normalizedConfigPath(
        project,
        "output",
        "artifactPath",
        framework === "pytorch"
          ? "artifacts/neural_network.pt"
          : "artifacts/neural_network.keras",
      ),
    };
  }

  if (
    task.id === "object-detection"
    || task.id === "instance-segmentation"
  ) {
    const projectDirectory = normalizedConfigPath(
      project,
      "output",
      "projectDirectory",
      task.id === "object-detection"
        ? "runs/detection"
        : "runs/segmentation",
    );
    const runName = safeRelativePath(
      project.output?.runName
        ?? (task.id === "object-detection"
          ? "yolo_detection"
          : "yolo_segmentation"),
      "output.runName",
    );
    return {
      kind: "yolo",
      path: joinRelativePath(
        projectDirectory,
        runName,
        "weights/best.pt",
      ),
    };
  }

  if (task.id === "image-classification") {
    const directory = normalizedConfigPath(
      project,
      "output",
      "artifactDirectory",
      "artifacts/edge_classifier",
    );
    return {
      kind: "edge-keras",
      path: joinRelativePath(directory, "best_model.keras"),
    };
  }

  if (task.id === "sensor-classification") {
    const checkpoint = normalizedConfigPath(
      project,
      "output",
      "checkpointPath",
      "artifacts/sensor_classifier.pt",
    );
    const exportFormat = project.output?.exportFormat ?? "torchscript";
    return {
      kind: exportFormat === "onnx" ? "sensor-onnx" : "sensor-torchscript",
      path: replaceSuffix(
        checkpoint,
        exportFormat === "onnx" ? ".onnx" : ".torchscript.pt",
      ),
    };
  }

  throw new Error(`Unsupported Model Mission task: ${task.id}.`);
}

function requirementsText(dependencies) {
  return dependencies
    .map(({ package: name, version }) => {
      const packageName = String(name ?? "");
      const range = String(version ?? "");
      if (
        packageName === ""
        || /[\r\n\0]/u.test(packageName)
        || /[\r\n\0]/u.test(range)
      ) {
        throw new Error("Dependency metadata must be plain text.");
      }
      return `${packageName}${range}`;
    })
    .sort()
    .join("\n")
    .concat("\n");
}

function selectedModel(project) {
  return String(
    project.model?.model
      ?? project.model?.preset
      ?? project.model?.modelSize
      ?? "configured baseline",
  );
}

function selectedData(project) {
  return String(
    project.data?.dataset
      ?? project.data?.dataSource
      ?? project.data?.datasetPath
      ?? project.data?.datasetDirectory
      ?? project.data?.datasetYaml
      ?? "configured data",
  );
}

function warningsSection(warnings) {
  if (warnings.length === 0) {
    return "- No generator warnings were reported for this configuration.";
  }
  return warnings.map((warning) => `- ${String(warning)}`).join("\n");
}

function artifactsSection(primaryArtifact, artifacts) {
  return [
    `- Primary prediction artifact: \`${primaryArtifact}\``,
    ...artifacts.map((artifact) => `- ${String(artifact)}`),
  ].join("\n");
}

function buildReadme({
  rootName,
  result,
  project,
  task,
  artifact,
  predictionInput,
}) {
  const summary = result.summary
    ? `\n${result.summary}\n`
    : "";
  return `# ${rootName}

This reproducible starter project was generated by Model Mission for **${task.technicalTerm}** (${task.title}).
${summary}
## Resolved choices

- Task: ${task.technicalTerm}
- Model: ${selectedModel(project)}
- Data: ${selectedData(project)}
- Learning level: ${project.learningLevel}
- Random seed: ${project.training?.randomSeed ?? project.training?.seed ?? "configured by the generated workflow"}

The complete resolved configuration is stored in \`model_mission.json\`. The generated training program is preserved unchanged in \`src/train.py\`.

## Set up

\`\`\`text
python -m venv .venv
python -m pip install -r requirements.txt
\`\`\`

Activate \`.venv\` using the command for your shell, then run the commands below from this project root.

## Data

Read \`data/README.md\` before training. It documents the selected source and the directory or file shape expected by this workflow.

## Train and evaluate

\`\`\`text
python src/train.py
\`\`\`

The training program performs the configured validation and final evaluation as part of the generated workflow.

## Predict

\`\`\`text
python src/predict.py
\`\`\`

Prediction loads \`${artifact.path}\` and reads \`${predictionInput}\`.

## Smoke test

\`\`\`text
python tests/test_generated_project.py
\`\`\`

The smoke test validates files, JSON, and Python syntax. It never imports the training module or starts training.

## Expected artifacts

${artifactsSection(artifact.path, result.artifacts ?? [])}

## Limitations and warnings

${warningsSection(result.warnings ?? [])}

## Suggested next experiments

- Change one resolved choice at a time and compare final evaluation metrics.
- Keep the test split unchanged while comparing models or preparation choices.
- Record the configuration and artifact together for every experiment.
`;
}

function findClassicalDataset(taskId, datasetId) {
  const family = taskId === "regression"
    ? CLASSICAL_DATASETS.regression
    : CLASSICAL_DATASETS.classification;
  return family.find(({ id }) => id === datasetId) ?? null;
}

function catalogDataset(project, task) {
  if (task.adapterId === "classical") {
    return findClassicalDataset(task.id, project.data?.dataset);
  }
  if (task.id === "neural-network") {
    return (
      findClassicalDataset("classification", project.data?.dataSource)
      ?? findClassicalDataset("regression", project.data?.dataSource)
    );
  }
  return null;
}

function dataShape(project, task, result) {
  if (result.dataset?.structure) return result.dataset.structure;

  if (task.adapterId === "classical") {
    if (project.data?.dataset !== "custom-csv") {
      return "This built-in dataset is loaded directly by scikit-learn.";
    }
    const path = normalizedConfigPath(
      project,
      "data",
      "dataPath",
      "data/dataset.csv",
    );
    return `${path}\n  feature_a,feature_b,${project.data?.targetColumn ?? "target"}`;
  }

  if (task.id === "neural-network") {
    const source = project.data?.dataSource;
    const path = normalizedConfigPath(
      project,
      "data",
      "dataPath",
      source === "image-folder"
        ? "data/images"
        : source === "sequence-array"
          ? "data/sequences.npz"
          : "data/dataset.csv",
    );
    if (source === "image-folder" || source === "custom-image-folder") {
      return `${path}/
  train/
    class-name/
  validation/
    class-name/
  test/
    class-name/`;
    }
    if (source === "sequence-array" || source === "custom-npz") {
      return `${path}
  X: [samples, timesteps, features]
  y: [samples]`;
    }
    if (source === "custom-csv") {
      return `${path}
  feature_a,feature_b,${project.data?.targetColumn ?? "target"}`;
    }
    return "This built-in dataset is loaded directly by scikit-learn.";
  }

  return "Follow the configured data path and schema in model_mission.json.";
}

function configuredDataPath(project, task) {
  if (task.adapterId === "classical") {
    return project.data?.dataset === "custom-csv"
      ? normalizedConfigPath(project, "data", "dataPath")
      : "Loaded by scikit-learn";
  }
  for (const field of [
    "dataPath",
    "datasetPath",
    "datasetDirectory",
    "datasetYaml",
  ]) {
    if (project.data?.[field]) {
      return normalizedConfigPath(project, "data", field);
    }
  }
  return "See model_mission.json";
}

function buildDataGuide({
  project,
  task,
  result,
  predictionInput,
}) {
  const metadata = catalogDataset(project, task);
  const title =
    result.dataset?.title
    ?? metadata?.label
    ?? task.modality;
  const source = metadata?.source
    ? `\n- Catalog source: ${metadata.source}`
    : "";
  const link = metadata?.sourceUrl
    ? `\n- Public source: ${metadata.sourceUrl}`
    : "";
  const summary =
    result.dataset?.summary
    ?? metadata?.lesson
    ?? task.description;
  const labelFormat = result.dataset?.labelFormat
    ? `\n## Labels\n\n${result.dataset.labelFormat}\n`
    : "";

  return `# Data guide

## ${title}

${summary}

- Configured location: \`${configuredDataPath(project, task)}\`${source}${link}

## Expected shape

\`\`\`text
${dataShape(project, task, result)}
\`\`\`
${labelFormat}
## Prediction input

Place inference input at \`${predictionInput}\` before running \`python src/predict.py\`.

Data files are intentionally not included in the generated project. Confirm that you may use the selected data and retain its source or license information with your experiment.
`;
}

function classicalPrediction(artifactPath) {
  return `"""Load the fitted classical pipeline and predict CSV rows."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifactPath)})
INPUT_PATH = Path("data/inference.csv")


def main() -> None:
    import joblib
    import pandas as pd

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add inference rows at: {input_path}")
    pipeline = joblib.load(artifact_path)
    rows = pd.read_csv(input_path)
    print(pipeline.predict(rows))


if __name__ == "__main__":
    main()
`;
}

function kerasPrediction(artifactPath) {
  return `"""Load the configured Keras artifact for local inference."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifactPath)})
INPUT_PATH = Path("data/inference.npy")


def main() -> None:
    import keras
    import numpy as np

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add a NumPy inference batch at: {input_path}")
    model = keras.models.load_model(artifact_path)
    batch = np.load(input_path, allow_pickle=False)
    print(model.predict(batch[:1], verbose=0))


if __name__ == "__main__":
    main()
`;
}

function pytorchPrediction(artifactPath) {
  return `"""Reconstruct the generated PyTorch network from checkpoint metadata."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifactPath)})
INPUT_PATH = Path("data/inference.npy")


def main() -> None:
    import numpy as np
    import torch
    from train import ConfigurableNetwork, INPUT_SHAPE, NUM_CLASSES, TASK

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add a NumPy inference batch at: {input_path}")
    checkpoint = torch.load(artifact_path, map_location="cpu", weights_only=True)
    checkpoint_shape = tuple(checkpoint["input_shape"])
    if checkpoint_shape != tuple(INPUT_SHAPE):
        raise ValueError("Checkpoint input_shape does not match this project.")
    if int(checkpoint["num_classes"]) != int(NUM_CLASSES):
        raise ValueError("Checkpoint num_classes does not match this project.")
    if str(checkpoint["task"]) != str(TASK):
        raise ValueError("Checkpoint task does not match this project.")
    model = ConfigurableNetwork()
    model.load_state_dict(checkpoint["model_state"])
    model.eval()
    sample = torch.from_numpy(np.load(input_path, allow_pickle=False)[:1]).float()
    with torch.inference_mode():
        print(model(sample))


if __name__ == "__main__":
    main()
`;
}

function yoloPrediction(project, artifactPath) {
  const sourcePath = normalizedConfigPath(
    project,
    "data",
    "sourcePath",
    "sample.jpg",
  );
  const confidence = Number(
    project.evaluation?.predictionConfidence ?? 0.25,
  );
  const iou = Number(project.evaluation?.iouThreshold ?? 0.7);
  return `"""Load the trained YOLO checkpoint and run configured inference."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifactPath)})
SOURCE_PATH = Path(${JSON.stringify(sourcePath)})


def main() -> None:
    from ultralytics import YOLO

    artifact_path = ARTIFACT_PATH
    source_path = SOURCE_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not source_path.exists():
        raise FileNotFoundError(f"Add the configured inference source: {source_path}")
    model = YOLO(artifact_path)
    model.predict(source=str(source_path), conf=${confidence}, iou=${iou})


if __name__ == "__main__":
    main()
`;
}

function edgeKerasPrediction(project, artifactPath) {
  const sourcePath = normalizedConfigPath(
    project,
    "data",
    "sampleImagePath",
    "sample.jpg",
  );
  return `"""Load the best edge-classifier Keras checkpoint."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifactPath)})
INPUT_PATH = Path(${JSON.stringify(sourcePath)})


def main() -> None:
    import numpy as np
    from PIL import Image
    import tensorflow as tf

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add the configured sample image: {input_path}")
    model = tf.keras.models.load_model(artifact_path)
    image = np.asarray(Image.open(input_path).convert("RGB"), dtype=np.float32)
    print(model.predict(image[None, ...], verbose=0))


if __name__ == "__main__":
    main()
`;
}

function sensorPrediction(artifact) {
  if (artifact.kind === "sensor-onnx") {
    return `"""Run inference with the exported sensor ONNX artifact."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifact.path)})
INPUT_PATH = Path("data/inference.npy")


def main() -> None:
    import numpy as np
    import onnxruntime as ort

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add a NumPy sensor window at: {input_path}")
    session = ort.InferenceSession(
        str(artifact_path),
        providers=["CPUExecutionProvider"],
    )
    input_name = session.get_inputs()[0].name
    batch = np.load(input_path, allow_pickle=False)
    print(session.run(None, {input_name: batch}))


if __name__ == "__main__":
    main()
`;
  }

  return `"""Load the exported TorchScript sensor classifier."""

from pathlib import Path

ARTIFACT_PATH = Path(${JSON.stringify(artifact.path)})
INPUT_PATH = Path("data/inference.npy")


def main() -> None:
    import numpy as np
    import torch

    artifact_path = ARTIFACT_PATH
    input_path = INPUT_PATH
    if not artifact_path.is_file():
        raise FileNotFoundError(f"Train the project first: {artifact_path}")
    if not input_path.is_file():
        raise FileNotFoundError(f"Add a NumPy sensor window at: {input_path}")
    model = torch.jit.load(str(artifact_path), map_location="cpu")
    sample = torch.from_numpy(np.load(input_path, allow_pickle=False)[:1]).float()
    with torch.inference_mode():
        print(model(sample))


if __name__ == "__main__":
    main()
`;
}

function buildPrediction(project, artifact) {
  if (artifact.kind === "classical") {
    return classicalPrediction(artifact.path);
  }
  if (artifact.kind === "keras") {
    return kerasPrediction(artifact.path);
  }
  if (artifact.kind === "pytorch") {
    return pytorchPrediction(artifact.path);
  }
  if (artifact.kind === "yolo") {
    return yoloPrediction(project, artifact.path);
  }
  if (artifact.kind === "edge-keras") {
    return edgeKerasPrediction(project, artifact.path);
  }
  return sensorPrediction(artifact);
}

function predictionInputPath(project, artifact) {
  if (artifact.kind === "classical") return "data/inference.csv";
  if (
    artifact.kind === "keras"
    || artifact.kind === "pytorch"
    || artifact.kind === "sensor-onnx"
    || artifact.kind === "sensor-torchscript"
  ) {
    return "data/inference.npy";
  }
  if (artifact.kind === "yolo") {
    return normalizedConfigPath(
      project,
      "data",
      "sourcePath",
      "sample.jpg",
    );
  }
  return normalizedConfigPath(
    project,
    "data",
    "sampleImagePath",
    "sample.jpg",
  );
}

function smokeTest() {
  return `"""Dependency-free structural smoke tests for this generated project."""

import ast
import json
from pathlib import Path
import unittest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = (
    ".gitignore",
    "README.md",
    "data/README.md",
    "model_mission.json",
    "requirements.txt",
    "src/predict.py",
    "src/train.py",
    "tests/test_generated_project.py",
)


class GeneratedProjectSmokeTest(unittest.TestCase):
    def test_required_files_exist(self) -> None:
        for relative_path in REQUIRED_FILES:
            self.assertTrue(
                (PROJECT_ROOT / relative_path).is_file(),
                relative_path,
            )

    def test_training_script_parses(self) -> None:
        source = (PROJECT_ROOT / "src/train.py").read_text(encoding="utf-8")
        ast.parse(source, filename="src/train.py")

    def test_project_configuration_is_valid_json(self) -> None:
        source = (PROJECT_ROOT / "model_mission.json").read_text(encoding="utf-8")
        config = json.loads(source)
        self.assertIsInstance(config, dict)
        self.assertIsInstance(config.get("taskId"), str)
        self.assertTrue(config["taskId"])


if __name__ == "__main__":
    unittest.main()
`;
}

function gitignore() {
  return `.venv/
__pycache__/
*.py[cod]
*.joblib
artifacts/
runs/
data/*
!data/README.md
`;
}

function validateBundleFileKey(path) {
  const normalized = safeRelativePath(path, "Bundle file key");
  if (normalized !== path || path.includes("\\")) {
    throw new Error("Bundle file key must stay inside the bundle root.");
  }
}

function requireBundleInput(input = {}) {
  const { result, project, task } = input;
  if (!isRecord(result) || !isRecord(project) || !isRecord(task)) {
    throw new TypeError(
      "A MissionResult, resolved ProjectConfig, and task are required.",
    );
  }
  if (typeof result.code !== "string" || result.code === "") {
    throw new Error("A generated training script is required.");
  }
  if (!Array.isArray(result.dependencies)) {
    throw new TypeError("MissionResult dependencies must be structured.");
  }
  if (
    !result.dependencies.every(
      (dependency) =>
        isRecord(dependency)
        && typeof dependency.package === "string"
        && typeof dependency.version === "string"
        && typeof dependency.purpose === "string",
    )
  ) {
    throw new TypeError(
      "MissionResult dependencies must contain structured records.",
    );
  }
  if (!isRecord(result.resolvedConfig)) {
    throw new TypeError("MissionResult resolvedConfig is required.");
  }
  if (stableJson(project) !== stableJson(result.resolvedConfig)) {
    throw new Error("Project must match result.resolvedConfig.");
  }
  if (task.id !== result.resolvedConfig.taskId) {
    throw new Error("Task must match result.resolvedConfig taskId.");
  }
  const canonicalTask = getModelMissionTask(
    result.resolvedConfig.taskId,
  );
  if (!canonicalTask) {
    throw new Error("A supported Model Mission task is required.");
  }
  return {
    project: stableValue(result.resolvedConfig),
    task: canonicalTask,
  };
}

export function buildMissionProjectBundle(input = {}) {
  const resolved = requireBundleInput(input);
  const { result } = input;
  const project = resolved.project;
  const task = resolved.task;
  validateConfiguredPaths(project);
  const rootName = safeProjectName(project.output?.projectName);
  const details = artifactDetails(project, task);
  const artifact = {
    ...details,
    path: safeRelativePath(
      details.path,
      "Generated artifact path",
    ),
  };
  const predictionInput = predictionInputPath(project, artifact);
  const files = {
    ".gitignore": gitignore(),
    "README.md": buildReadme({
      rootName,
      result,
      project,
      task,
      artifact,
      predictionInput,
    }),
    "data/README.md": buildDataGuide({
      project,
      task,
      result,
      predictionInput,
    }),
    "model_mission.json": stableJson(project),
    "requirements.txt": requirementsText(result.dependencies),
    "src/predict.py": buildPrediction(project, artifact),
    "src/train.py": result.code,
    "tests/test_generated_project.py": smokeTest(),
  };

  for (const path of Object.keys(files)) validateBundleFileKey(path);
  if (
    Object.keys(files).length !== BASE_FILE_PATHS.length
    || BASE_FILE_PATHS.some((path) => !(path in files))
  ) {
    throw new Error("The generated project is missing a required base file.");
  }
  return { rootName, files };
}
