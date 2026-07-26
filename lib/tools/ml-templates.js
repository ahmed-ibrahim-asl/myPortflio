const MODES = new Set(["starter", "production"]);

const WORKFLOW_OPTIONS = [
  { value: "train", label: "Train + validate + infer" },
  { value: "validate", label: "Validate existing weights" },
  { value: "inference", label: "Inference only" },
  { value: "train-export", label: "Train + validate + infer + export" },
];

const YOLO_MODEL_SIZE_OPTIONS = [
  { value: "nano", label: "Nano" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra-large" },
];

const YOLO_RUNTIME_OPTIONS = [
  { value: "local", label: "Local machine" },
  { value: "colab", label: "Google Colab" },
  { value: "nvidia-gpu", label: "NVIDIA GPU workstation" },
  { value: "jetson", label: "NVIDIA Jetson" },
  { value: "raspberry-pi", label: "Raspberry Pi" },
];

const IMAGE_SIZE_OPTIONS = [320, 416, 640, 960, 1280].map((value) => ({
  value: String(value),
  label: `${value} px`,
}));

const DEVICE_LABELS = {
  auto: "Auto-detect",
  cpu: "CPU",
  "cuda:0": "CUDA GPU 0",
};

const DEVICE_VALUES = {
  local: ["auto", "cpu"],
  colab: ["auto", "cpu", "cuda:0"],
  "nvidia-gpu": ["auto", "cuda:0"],
  jetson: ["auto", "cuda:0"],
  "raspberry-pi": ["cpu"],
};

const EXPORT_LABELS = {
  onnx: "ONNX",
  openvino: "OpenVINO",
  torchscript: "TorchScript",
  engine: "TensorRT engine",
  tflite: "TensorFlow Lite",
};

const YOLO_EXPORT_VALUES = {
  local: ["onnx", "openvino", "torchscript"],
  colab: ["onnx", "torchscript"],
  "nvidia-gpu": ["onnx", "engine", "torchscript"],
  jetson: ["onnx", "engine"],
  "raspberry-pi": ["onnx", "openvino", "tflite"],
};

const YOLO_DETECTION_WEIGHTS = {
  nano: "yolov8n.pt",
  small: "yolov8s.pt",
  medium: "yolov8m.pt",
  large: "yolov8l.pt",
  "extra-large": "yolov8x.pt",
};

const isTraining = ({ task }) => ["train", "train-export"].includes(task);
const hasDataset = ({ task }) => ["train", "validate", "train-export"].includes(task);
const hasInference = ({ task }) => ["train", "inference", "train-export"].includes(task);
const hasExport = ({ task }) => task === "train-export";

function ensureMode(mode) {
  return MODES.has(mode) ? mode : "starter";
}

function ensureTrailingNewline(code) {
  return `${String(code).replace(/\s+$/u, "")}\n`;
}

function normalizeSelectValue(value, options, fallback) {
  const values = new Set(options.map((option) => option.value));
  if (values.has(String(value))) return String(value);
  if (values.has(String(fallback))) return String(fallback);
  return options[0]?.value ?? "";
}

function clone(value) {
  return structuredClone(value);
}

function optionList(values, labels) {
  return values.map((value) => ({ value, label: labels[value] ?? value }));
}

function toBoolean(value, fallback) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function toFiniteNumber(value, fallback) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function createYoloFields({ defaultRunName, defaultProjectDirectory }) {
  return [
    {
      id: "task",
      label: "Workflow",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Choose the actions the generated script performs.",
      options: WORKFLOW_OPTIONS,
    },
    {
      id: "modelSize",
      label: "Model size",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Larger models can improve accuracy but need more memory and time.",
      options: YOLO_MODEL_SIZE_OPTIONS,
    },
    {
      id: "environment",
      label: "Runtime target",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Filters compatible devices and exports; output remains a Python script.",
      options: YOLO_RUNTIME_OPTIONS,
    },
    {
      id: "datasetYaml",
      label: "Dataset YAML",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Path to a YOLO data.yaml file with train, val, and names entries.",
      visibleWhen: hasDataset,
    },
    {
      id: "sourcePath",
      label: "Inference source",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Image, video, directory, or stream used for the inference example.",
      visibleWhen: hasInference,
    },
    {
      id: "imageSize",
      label: "Image size",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Square input resolution used for training and prediction.",
      options: IMAGE_SIZE_OPTIONS,
    },
    {
      id: "epochs",
      label: "Epochs",
      inputType: "number",
      modes: ["production"],
      helpText: "Complete passes over the training data.",
      min: 1,
      max: 500,
      step: 1,
      visibleWhen: isTraining,
    },
    {
      id: "batchSize",
      label: "Batch size",
      inputType: "number",
      modes: ["production"],
      helpText: "Use -1 for automatic sizing, or choose 1 to 256.",
      min: -1,
      max: 256,
      step: 1,
      visibleWhen: ({ task }) => task !== "inference",
    },
    {
      id: "device",
      label: "Compute device",
      inputType: "select",
      modes: ["production"],
      helpText: "Resolved again at runtime so unavailable CUDA fails clearly.",
      getOptions: (config) => optionList(
        DEVICE_VALUES[config.environment] ?? [],
        DEVICE_LABELS,
      ),
    },
    {
      id: "learningRate",
      label: "Learning rate",
      inputType: "number",
      modes: ["production"],
      helpText: "Initial optimizer learning rate.",
      min: 0.000001,
      max: 1,
      step: 0.0001,
      visibleWhen: isTraining,
    },
    {
      id: "confidenceThreshold",
      label: "Confidence threshold",
      inputType: "number",
      modes: ["production"],
      helpText: "Minimum confidence retained during validation and prediction.",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: "patience",
      label: "Early-stop patience",
      inputType: "number",
      modes: ["production"],
      helpText: "Epochs without improvement before training stops; zero disables it.",
      min: 0,
      max: 200,
      step: 1,
      visibleWhen: isTraining,
    },
    {
      id: "workers",
      label: "Data workers",
      inputType: "number",
      modes: ["production"],
      helpText: "Parallel workers used while loading data.",
      min: 0,
      max: 32,
      step: 1,
      visibleWhen: ({ task }) => task !== "inference",
    },
    {
      id: "seed",
      label: "Random seed",
      inputType: "number",
      modes: ["production"],
      helpText: "Seeds Python, NumPy, and PyTorch.",
      min: 0,
      max: 2147483647,
      step: 1,
    },
    {
      id: "exportFormat",
      label: "Export format",
      inputType: "select",
      modes: ["production"],
      helpText: "Only formats compatible with the runtime target are offered.",
      getOptions: (config) => optionList(
        YOLO_EXPORT_VALUES[config.environment] ?? [],
        EXPORT_LABELS,
      ),
      visibleWhen: hasExport,
    },
    {
      id: "runName",
      label: "Run name",
      inputType: "text",
      modes: ["production"],
      helpText: "Safe folder name for checkpoints and predictions.",
      defaultValue: defaultRunName,
      visibleWhen: ({ task }) => task !== "inference",
    },
    {
      id: "projectDirectory",
      label: "Project directory",
      inputType: "text",
      modes: ["production"],
      helpText: "Directory that receives runs, checkpoints, and predictions.",
      defaultValue: defaultProjectDirectory,
    },
    {
      id: "cacheDataset",
      label: "Cache dataset",
      inputType: "toggle",
      modes: ["production"],
      helpText: "Cache images when memory and storage allow it.",
      visibleWhen: isTraining,
    },
    {
      id: "useAmp",
      label: "Mixed precision (AMP)",
      inputType: "toggle",
      modes: ["production"],
      helpText: "Use mixed precision on a CUDA-capable runtime.",
      visibleWhen: (config) => isTraining(config) && config.device !== "cpu",
    },
    {
      id: "exportInt8",
      label: "INT8 export",
      inputType: "toggle",
      modes: ["production"],
      helpText: "Request INT8 calibration for supported export formats.",
      visibleWhen: (config) => hasExport(config) &&
        ["engine", "openvino", "tflite"].includes(config.exportFormat),
    },
  ];
}

const YOLO_DETECTION_DEFAULTS = {
  starter: {
    task: "train",
    modelSize: "nano",
    environment: "local",
    datasetYaml: "./dataset/data.yaml",
    sourcePath: "./sample.jpg",
    imageSize: "640",
    epochs: 100,
    batchSize: 16,
    device: "auto",
    learningRate: 0.01,
    confidenceThreshold: 0.25,
    patience: 50,
    workers: 8,
    seed: 42,
    exportFormat: "onnx",
    runName: "yolo_detection",
    projectDirectory: "./runs/detection",
    cacheDataset: false,
    useAmp: false,
    exportInt8: false,
  },
  production: {
    task: "train-export",
    modelSize: "nano",
    environment: "local",
    datasetYaml: "./dataset/data.yaml",
    sourcePath: "./sample.jpg",
    imageSize: "640",
    epochs: 100,
    batchSize: 16,
    device: "auto",
    learningRate: 0.01,
    confidenceThreshold: 0.25,
    patience: 50,
    workers: 8,
    seed: 42,
    exportFormat: "onnx",
    runName: "yolo_detection",
    projectDirectory: "./runs/detection",
    cacheDataset: false,
    useAmp: true,
    exportInt8: false,
  },
};

function normalizeYoloConfig(inputConfig, mode, defaults) {
  const resolvedMode = ensureMode(mode);
  const modeDefaults = defaults[resolvedMode];
  const config = { ...clone(modeDefaults), ...(inputConfig ?? {}) };

  config.task = normalizeSelectValue(
    config.task,
    WORKFLOW_OPTIONS,
    modeDefaults.task,
  );
  config.modelSize = normalizeSelectValue(
    config.modelSize,
    YOLO_MODEL_SIZE_OPTIONS,
    modeDefaults.modelSize,
  );
  config.environment = normalizeSelectValue(
    config.environment,
    YOLO_RUNTIME_OPTIONS,
    modeDefaults.environment,
  );
  config.imageSize = normalizeSelectValue(
    config.imageSize,
    IMAGE_SIZE_OPTIONS,
    modeDefaults.imageSize,
  );

  const deviceOptions = optionList(
    DEVICE_VALUES[config.environment] ?? [],
    DEVICE_LABELS,
  );
  config.device = normalizeSelectValue(
    config.device,
    deviceOptions,
    modeDefaults.device,
  );

  const exportOptions = optionList(
    YOLO_EXPORT_VALUES[config.environment] ?? [],
    EXPORT_LABELS,
  );
  config.exportFormat = normalizeSelectValue(
    config.exportFormat,
    exportOptions,
    modeDefaults.exportFormat,
  );

  for (const key of [
    "epochs",
    "batchSize",
    "learningRate",
    "confidenceThreshold",
    "patience",
    "workers",
    "seed",
  ]) {
    config[key] = toFiniteNumber(config[key], modeDefaults[key]);
  }

  config.datasetYaml = String(config.datasetYaml ?? "").trim();
  config.sourcePath = String(config.sourcePath ?? "").trim();
  config.runName = String(config.runName ?? "").trim();
  config.projectDirectory = String(config.projectDirectory ?? "").trim();
  config.cacheDataset = toBoolean(config.cacheDataset, modeDefaults.cacheDataset);
  config.useAmp = toBoolean(config.useAmp, modeDefaults.useAmp);
  config.exportInt8 = toBoolean(config.exportInt8, modeDefaults.exportInt8);

  if (resolvedMode === "starter") {
    for (const key of [
      "epochs",
      "batchSize",
      "device",
      "learningRate",
      "confidenceThreshold",
      "patience",
      "workers",
      "seed",
      "exportFormat",
      "runName",
      "projectDirectory",
      "cacheDataset",
      "useAmp",
      "exportInt8",
    ]) {
      config[key] = clone(modeDefaults[key]);
    }
  }

  if (!hasDataset(config)) config.datasetYaml = "";
  if (!hasInference(config)) config.sourcePath = "";
  if (!isTraining(config)) {
    config.epochs = modeDefaults.epochs;
    config.learningRate = modeDefaults.learningRate;
    config.patience = modeDefaults.patience;
    config.cacheDataset = false;
    config.useAmp = false;
  }
  if (config.task === "inference") {
    config.batchSize = modeDefaults.batchSize;
    config.workers = modeDefaults.workers;
  }
  if (config.device === "cpu" || !isTraining(config)) config.useAmp = false;
  if (
    resolvedMode !== "production" ||
    !hasExport(config) ||
    !["engine", "openvino", "tflite"].includes(config.exportFormat)
  ) {
    config.exportInt8 = false;
  }

  return config;
}

function validateNumber(errors, config, key, label, minimum, maximum, options = {}) {
  const value = config[key];
  if (!Number.isFinite(value)) {
    errors[key] = `${label} must be a number.`;
    return;
  }
  if (options.integer && !Number.isInteger(value)) {
    errors[key] = `${label} must be a whole number.`;
    return;
  }
  if (options.allowMinusOne && value === -1) return;
  if (value < minimum || value > maximum) {
    errors[key] = `${label} must be between ${minimum} and ${maximum}.`;
  }
}

function validateYoloConfig(config, mode) {
  const errors = {};
  const resolvedMode = ensureMode(mode);

  if (hasDataset(config) && !config.datasetYaml) {
    errors.datasetYaml = "Dataset YAML is required for training and validation.";
  }
  if (hasInference(config) && !config.sourcePath) {
    errors.sourcePath = "An inference source path is required for this workflow.";
  }

  if (resolvedMode === "production") {
    if (isTraining(config)) {
      validateNumber(errors, config, "epochs", "Epochs", 1, 500, { integer: true });
      validateNumber(errors, config, "learningRate", "Learning rate", 0.000001, 1);
      validateNumber(errors, config, "patience", "Patience", 0, 200, { integer: true });
    }
    if (config.task !== "inference") {
      validateNumber(errors, config, "batchSize", "Batch size", 1, 256, {
        allowMinusOne: true,
        integer: true,
      });
      validateNumber(errors, config, "workers", "Workers", 0, 32, { integer: true });
    }
    validateNumber(
      errors,
      config,
      "confidenceThreshold",
      "Confidence threshold",
      0,
      1,
    );
    validateNumber(errors, config, "seed", "Seed", 0, 2147483647, {
      integer: true,
    });
    if (!config.projectDirectory) {
      errors.projectDirectory = "Project directory is required.";
    }
    if (
      config.task !== "inference" &&
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(config.runName)
    ) {
      errors.runName = "Run name may contain letters, numbers, dots, dashes, and underscores.";
    }
  }

  return errors;
}

function getYoloWarnings(config, mode, kind) {
  const warnings = [];
  if (
    ["large", "extra-large"].includes(config.modelSize) &&
    ["jetson", "raspberry-pi"].includes(config.environment)
  ) {
    warnings.push(`Large YOLO ${kind} models can exceed edge-device memory or latency targets.`);
  }
  if (Number(config.imageSize) >= 960 && Number(config.batchSize) >= 16) {
    warnings.push("This image-size and batch-size combination may require substantial GPU memory.");
  }
  if (
    isTraining(config) &&
    config.device === "cpu" &&
    ["medium", "large", "extra-large"].includes(config.modelSize)
  ) {
    warnings.push("Training this model size on CPU is likely to be very slow.");
  }
  if (
    ensureMode(mode) === "production" &&
    (config.datasetYaml?.startsWith("./dataset") || config.sourcePath?.startsWith("./sample"))
  ) {
    warnings.push("Replace placeholder dataset and source paths before running this production-oriented script.");
  }
  return warnings;
}

const YOLO_DEPENDENCIES = [
  {
    package: "ultralytics",
    version: ">=8.3,<9",
    purpose: "YOLO training, validation, inference, and export",
  },
  {
    package: "torch",
    version: ">=2.3,<3",
    purpose: "Model execution and hardware acceleration",
  },
  {
    package: "numpy",
    version: ">=1.26,<3",
    purpose: "Reproducible random state and numeric utilities",
  },
  {
    package: "PyYAML",
    version: ">=6,<7",
    purpose: "Dataset YAML validation",
  },
];

const YOLO_DETECTION_TEMPLATE = {
  id: "yolo-detection-training",
  name: "YOLO Custom Object Detection",
  shortDescription: "Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",
  category: "Computer Vision",
  filename: () => "train_yolo_detection.py",
  fields: createYoloFields({
    defaultRunName: "yolo_detection",
    defaultProjectDirectory: "./runs/detection",
  }),
  defaults: YOLO_DETECTION_DEFAULTS,
  normalize(config, mode) {
    return normalizeYoloConfig(config, mode, YOLO_DETECTION_DEFAULTS);
  },
  validate: validateYoloConfig,
  generate(config, mode) {
    return generateYoloScript({
      config,
      mode,
      yoloTask: "detect",
      modelFilename: YOLO_DETECTION_WEIGHTS[config.modelSize],
      outputName: "detection",
    });
  },
  dependencies: YOLO_DEPENDENCIES,
  dataset: {
    title: "YOLO detection dataset",
    summary: "Images paired with normalized bounding-box label rows and described by a data.yaml file.",
    structure: "dataset/\n  data.yaml\n  images/{train,val,test}/\n  labels/{train,val,test}/",
    examplePaths: ["./dataset/data.yaml", "./dataset/images/train", "./dataset/labels/train"],
    labelFormat: "class_id x_center y_center width height, normalized from 0 to 1",
  },
  metrics: [
    "mAP50",
    "mAP50-95",
    "Precision",
    "Recall",
    "Inference latency",
    "Exported model size",
  ],
  hardware: {
    minimum: "Modern four-core CPU, 8 GB RAM, nano model, and a small dataset.",
    recommended: "NVIDIA GPU with at least 8 GB VRAM, 16 GB system RAM, and CUDA-compatible PyTorch.",
    edge: "Use nano or small models and benchmark the exported output on the physical target.",
  },
  deployment: ["ONNX", "OpenVINO", "TorchScript", "TensorRT engine", "TensorFlow Lite"],
  notes: [
    "The generator intentionally targets Ultralytics 8.x and YOLOv8 weights for repeatability.",
    "Raspberry Pi is presented as an inference or export target, not a recommended training runtime.",
  ],
  warnings: [
    "Benchmark exported models with representative data on the actual deployment hardware.",
  ],
  getWarnings(config, mode) {
    return getYoloWarnings(config, mode, "detection");
  },
};

function pythonLiteral(value) {
  if (value === true) return "True";
  if (Array.isArray(value)) {
    return `[${value.map((item) => pythonLiteral(item)).join(", ")}]`;
  }
  if (value === false) return "False";
  if (value === null || value === undefined) return "None";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return JSON.stringify(String(value));
}

function generateYoloScript({
  config,
  mode,
  yoloTask,
  modelFilename,
  outputName,
}) {
  return `from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from typing import Any

import numpy as np
import torch
import yaml
from ultralytics import YOLO


CONFIG: dict[str, Any] = {
    "mode": ${pythonLiteral(ensureMode(mode))},
    "yolo_task": ${pythonLiteral(yoloTask)},
    "workflow": ${pythonLiteral(config.task)},
    "dataset_yaml": ${pythonLiteral(config.datasetYaml)},
    "source_path": ${pythonLiteral(config.sourcePath)},
    "model_weights": ${pythonLiteral(modelFilename)},
    "epochs": ${pythonLiteral(config.epochs)},
    "batch_size": ${pythonLiteral(config.batchSize)},
    "image_size": ${pythonLiteral(Number(config.imageSize))},
    "device": ${pythonLiteral(config.device)},
    "learning_rate": ${pythonLiteral(config.learningRate)},
    "confidence_threshold": ${pythonLiteral(config.confidenceThreshold)},
    "patience": ${pythonLiteral(config.patience)},
    "workers": ${pythonLiteral(config.workers)},
    "seed": ${pythonLiteral(config.seed)},
    "project_directory": ${pythonLiteral(config.projectDirectory)},
    "run_name": ${pythonLiteral(config.runName)},
    "cache_dataset": ${pythonLiteral(config.cacheDataset)},
    "use_amp": ${pythonLiteral(config.useAmp)},
    "export_format": ${pythonLiteral(config.exportFormat)},
    "export_int8": ${pythonLiteral(config.exportInt8)},
    "output_kind": ${pythonLiteral(outputName)},
}


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    if hasattr(torch.backends, "cudnn"):
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def resolve_device(requested_device: str) -> str:
    if requested_device == "auto":
        return "0" if torch.cuda.is_available() else "cpu"

    if requested_device.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError(
            f"Device {requested_device!r} was requested, but CUDA is unavailable."
        )

    if requested_device == "cuda:0":
        return "0"

    return requested_device


def validate_dataset_yaml(dataset_yaml: str) -> Path:
    path = Path(dataset_yaml).expanduser().resolve()

    if not path.is_file():
        raise FileNotFoundError(
            f"Dataset YAML was not found: {path}\\n"
            "Update CONFIG['dataset_yaml'] before running the script."
        )

    with path.open("r", encoding="utf-8") as file:
        payload = yaml.safe_load(file)

    if not isinstance(payload, dict):
        raise ValueError("Dataset YAML must contain a mapping.")

    for required_key in ("train", "val", "names"):
        if required_key not in payload:
            raise ValueError(
                f"Dataset YAML is missing required key: {required_key!r}"
            )

    return path


def validate_source_path(source_path: str) -> Path:
    path = Path(source_path).expanduser().resolve()

    if not path.exists():
        raise FileNotFoundError(f"Inference source was not found: {path}")

    return path


def load_model(weights: str) -> YOLO:
    try:
        return YOLO(weights)
    except Exception as error:
        raise RuntimeError(
            f"Could not initialize YOLO weights {weights!r}."
        ) from error


def train_model(model: YOLO, dataset_yaml: Path, device: str) -> YOLO:
    model.train(
        data=str(dataset_yaml),
        epochs=int(CONFIG["epochs"]),
        batch=int(CONFIG["batch_size"]),
        imgsz=int(CONFIG["image_size"]),
        device=device,
        lr0=float(CONFIG["learning_rate"]),
        patience=int(CONFIG["patience"]),
        workers=int(CONFIG["workers"]),
        seed=int(CONFIG["seed"]),
        project=str(CONFIG["project_directory"]),
        name=str(CONFIG["run_name"]),
        cache=bool(CONFIG["cache_dataset"]),
        amp=bool(CONFIG["use_amp"]),
        pretrained=True,
        exist_ok=True,
        verbose=True,
    )

    best_weights = (
        Path(str(CONFIG["project_directory"]))
        / str(CONFIG["run_name"])
        / "weights"
        / "best.pt"
    )

    if not best_weights.is_file():
        raise FileNotFoundError(
            "Training completed, but best weights were not found: "
            f"{best_weights}"
        )

    try:
        return YOLO(str(best_weights))
    except Exception as error:
        raise RuntimeError(
            f"Could not load the best checkpoint: {best_weights}"
        ) from error


def validate_model(model: YOLO, dataset_yaml: Path, device: str) -> None:
    metrics = model.val(
        data=str(dataset_yaml),
        imgsz=int(CONFIG["image_size"]),
        batch=int(CONFIG["batch_size"]),
        device=device,
        conf=float(CONFIG["confidence_threshold"]),
        workers=int(CONFIG["workers"]),
    )

    summary = {
        "results_dict": getattr(metrics, "results_dict", {}),
        "speed": getattr(metrics, "speed", {}),
    }

    print("Validation summary:")
    print(json.dumps(summary, indent=2, default=str))


def run_inference(model: YOLO, source_path: Path, device: str) -> None:
    results = model.predict(
        source=str(source_path),
        imgsz=int(CONFIG["image_size"]),
        conf=float(CONFIG["confidence_threshold"]),
        device=device,
        save=True,
        project=str(CONFIG["project_directory"]),
        name=f"{CONFIG['run_name']}_predictions",
        exist_ok=True,
    )

    speeds = [getattr(result, "speed", {}) for result in results]
    print(f"Inference completed for {len(results)} item(s).")
    print(json.dumps({"speed": speeds}, indent=2, default=str))


def export_model(model: YOLO, device: str, dataset_yaml: Path | None) -> None:
    export_arguments: dict[str, Any] = {
        "format": str(CONFIG["export_format"]),
        "imgsz": int(CONFIG["image_size"]),
        "device": device,
    }

    if bool(CONFIG["export_int8"]):
        export_arguments["int8"] = True
        if dataset_yaml is not None:
            export_arguments["data"] = str(dataset_yaml)

    exported_path = model.export(**export_arguments)
    exported_file = Path(str(exported_path)).expanduser().resolve()
    exported_size = exported_file.stat().st_size if exported_file.is_file() else None
    print(
        json.dumps(
            {
                "exported_path": str(exported_path),
                "exported_size_bytes": exported_size,
            },
            indent=2,
        )
    )


def main() -> int:
    seed_everything(int(CONFIG["seed"]))
    device = resolve_device(str(CONFIG["device"]))
    workflow = str(CONFIG["workflow"])

    project_directory = Path(str(CONFIG["project_directory"])).expanduser()
    project_directory.mkdir(parents=True, exist_ok=True)

    print("Resolved configuration:")
    print(json.dumps(CONFIG, indent=2, default=str))
    print(f"Resolved device: {device}")

    model = load_model(str(CONFIG["model_weights"]))

    dataset_yaml: Path | None = None
    if workflow in {"train", "validate", "train-export"}:
        dataset_yaml = validate_dataset_yaml(str(CONFIG["dataset_yaml"]))

    if workflow in {"train", "train-export"}:
        assert dataset_yaml is not None
        model = train_model(model, dataset_yaml, device)

    if workflow in {"train", "validate", "train-export"}:
        assert dataset_yaml is not None
        validate_model(model, dataset_yaml, device)

    source_value = str(CONFIG["source_path"]).strip()
    if source_value:
        source_path = validate_source_path(source_value)
        run_inference(model, source_path, device)

    if workflow == "train-export":
        export_model(model, device, dataset_yaml)

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Execution cancelled by the user.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as error:
        print(f"Fatal error: {error}", file=sys.stderr)
        raise SystemExit(1)
`;
}


const YOLO_SEGMENTATION_WEIGHTS = {
  nano: "yolov8n-seg.pt",
  small: "yolov8s-seg.pt",
  medium: "yolov8m-seg.pt",
  large: "yolov8l-seg.pt",
  "extra-large": "yolov8x-seg.pt",
};

const YOLO_SEGMENTATION_DEFAULTS = {
  starter: {
    ...YOLO_DETECTION_DEFAULTS.starter,
    datasetYaml: "./segmentation_dataset/data.yaml",
    runName: "yolo_segmentation",
    projectDirectory: "./runs/segmentation",
  },
  production: {
    ...YOLO_DETECTION_DEFAULTS.production,
    datasetYaml: "./segmentation_dataset/data.yaml",
    runName: "yolo_segmentation",
    projectDirectory: "./runs/segmentation",
  },
};

const YOLO_SEGMENTATION_TEMPLATE = {
  id: "yolo-segmentation-training",
  name: "YOLO Instance Segmentation",
  shortDescription: "Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",
  category: "Computer Vision",
  filename: () => "train_yolo_segmentation.py",
  fields: createYoloFields({
    defaultRunName: "yolo_segmentation",
    defaultProjectDirectory: "./runs/segmentation",
  }),
  defaults: YOLO_SEGMENTATION_DEFAULTS,
  normalize(config, mode) {
    return normalizeYoloConfig(config, mode, YOLO_SEGMENTATION_DEFAULTS);
  },
  validate: validateYoloConfig,
  generate(config, mode) {
    return generateYoloScript({
      config,
      mode,
      yoloTask: "segment",
      modelFilename: YOLO_SEGMENTATION_WEIGHTS[config.modelSize],
      outputName: "segmentation",
    });
  },
  dependencies: YOLO_DEPENDENCIES,
  dataset: {
    title: "YOLO instance-segmentation dataset",
    summary: "Images paired with normalized polygon annotations and described by a data.yaml file.",
    structure: "segmentation_dataset/\n  data.yaml\n  images/{train,val,test}/\n  labels/{train,val,test}/",
    examplePaths: [
      "./segmentation_dataset/data.yaml",
      "./segmentation_dataset/images/train",
      "./segmentation_dataset/labels/train",
    ],
    labelFormat: "class_id x1 y1 x2 y2 x3 y3 through xn yn, with normalized polygon coordinates",
  },
  metrics: [
    "Box mAP50",
    "Box mAP50-95",
    "Mask mAP50",
    "Mask mAP50-95",
    "Precision",
    "Recall",
    "Inference latency",
    "Exported model size",
  ],
  hardware: {
    minimum: "Modern four-core CPU, 8 GB RAM, nano model, and a small polygon dataset.",
    recommended: "NVIDIA GPU with at least 8 GB VRAM and carefully reviewed polygon annotations.",
    edge: "Prefer nano or small models and profile mask decoding on the physical device.",
  },
  deployment: ["ONNX", "OpenVINO", "TorchScript", "TensorRT engine", "TensorFlow Lite"],
  notes: [
    "Each label row contains a class ID followed by normalized polygon coordinate pairs.",
    "Review both box and mask metrics; a good box does not guarantee an accurate mask.",
  ],
  warnings: [
    "Poor polygon annotations produce poor masks even when bounding boxes look correct.",
    "Extremely detailed polygons increase annotation and preprocessing cost.",
    "Verify TensorRT and TensorFlow Lite exports using real segmentation outputs.",
  ],
  getWarnings(config, mode) {
    return getYoloWarnings(config, mode, "segmentation");
  },
};

const SENSOR_TASK_OPTIONS = [
  { value: "activity-classification", label: "Activity classification" },
  { value: "state-classification", label: "State classification" },
  { value: "binary-anomaly-classification", label: "Binary anomaly classification" },
];

const SENSOR_MODEL_OPTIONS = [
  { value: "cnn1d", label: "1D CNN" },
  { value: "lstm", label: "LSTM" },
  { value: "cnn-lstm", label: "CNN + LSTM" },
];

const SENSOR_SIZE_OPTIONS = [
  { value: "nano", label: "Nano (32 hidden units)" },
  { value: "small", label: "Small (64 hidden units)" },
  { value: "medium", label: "Medium (128 hidden units)" },
  { value: "large", label: "Large (256 hidden units)" },
];

const SENSOR_HIDDEN_WIDTHS = {
  nano: 32,
  small: 64,
  medium: 128,
  large: 256,
};

const SENSOR_EXPORT_OPTIONS = [
  { value: "torchscript", label: "TorchScript" },
  { value: "onnx", label: "ONNX" },
];

function createSensorFields() {
  return [
    {
      id: "task",
      label: "Classification task",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Choose how labels in the ordered sensor stream should be interpreted.",
      options: SENSOR_TASK_OPTIONS,
    },
    {
      id: "model",
      label: "Architecture",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Select a temporal neural-network architecture.",
      options: SENSOR_MODEL_OPTIONS,
    },
    {
      id: "modelSize",
      label: "Model size",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Controls the hidden width used throughout the model.",
      options: SENSOR_SIZE_OPTIONS,
    },
    {
      id: "environment",
      label: "Runtime target",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Filters compatible compute settings; output remains a Python script.",
      options: YOLO_RUNTIME_OPTIONS,
    },
    {
      id: "datasetPath",
      label: "Sensor CSV",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Chronologically ordered CSV with one sensor sample per row.",
    },
    {
      id: "featureColumns",
      label: "Feature columns",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Comma-separated numeric sensor columns.",
    },
    {
      id: "labelColumn",
      label: "Label column",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Each window receives the label from its last row.",
    },
    {
      id: "windowSize",
      label: "Window size",
      inputType: "number",
      modes: ["starter", "production"],
      helpText: "Number of chronological samples in one model input.",
      min: 1,
      max: 65536,
      step: 1,
    },
    {
      id: "windowStride",
      label: "Window stride",
      inputType: "number",
      modes: ["starter", "production"],
      helpText: "Samples advanced between overlapping windows.",
      min: 1,
      max: 65536,
      step: 1,
    },
    {
      id: "epochs",
      label: "Epochs",
      inputType: "number",
      modes: ["production"],
      helpText: "Maximum training epochs.",
      min: 1,
      max: 500,
      step: 1,
    },
    {
      id: "batchSize",
      label: "Batch size",
      inputType: "number",
      modes: ["production"],
      helpText: "Windows processed per optimizer step.",
      min: 1,
      max: 1024,
      step: 1,
    },
    {
      id: "learningRate",
      label: "Learning rate",
      inputType: "number",
      modes: ["production"],
      helpText: "Adam optimizer learning rate.",
      min: 0.000001,
      max: 1,
      step: 0.0001,
    },
    {
      id: "validationFraction",
      label: "Validation fraction",
      inputType: "number",
      modes: ["production"],
      helpText: "Chronological fraction held out before the test portion.",
      min: 0.05,
      max: 0.4,
      step: 0.01,
    },
    {
      id: "testFraction",
      label: "Test fraction",
      inputType: "number",
      modes: ["production"],
      helpText: "Final chronological fraction reserved for testing.",
      min: 0.05,
      max: 0.4,
      step: 0.01,
    },
    {
      id: "patience",
      label: "Early-stop patience",
      inputType: "number",
      modes: ["production"],
      helpText: "Epochs without validation improvement before stopping.",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      id: "dropout",
      label: "Dropout",
      inputType: "number",
      modes: ["production"],
      helpText: "Regularization probability in the classifier.",
      min: 0,
      max: 0.8,
      step: 0.05,
    },
    {
      id: "device",
      label: "Compute device",
      inputType: "select",
      modes: ["production"],
      helpText: "Runtime device resolved against PyTorch availability.",
      getOptions: (config) => optionList(
        DEVICE_VALUES[config.environment] ?? [],
        DEVICE_LABELS,
      ),
    },
    {
      id: "seed",
      label: "Random seed",
      inputType: "number",
      modes: ["production"],
      helpText: "Controls deterministic splitting and training behavior.",
      min: 0,
      max: 2147483647,
      step: 1,
    },
    {
      id: "workers",
      label: "Data workers",
      inputType: "number",
      modes: ["production"],
      helpText: "Parallel PyTorch DataLoader workers.",
      min: 0,
      max: 32,
      step: 1,
    },
    {
      id: "exportFormat",
      label: "Export format",
      inputType: "select",
      modes: ["production"],
      helpText: "Exports a fixed-window TorchScript or ONNX artifact.",
      options: SENSOR_EXPORT_OPTIONS,
    },
    {
      id: "checkpointPath",
      label: "Checkpoint path",
      inputType: "text",
      modes: ["production"],
      helpText: "Best weights and adjacent metadata are written here.",
    },
    {
      id: "sampleRateHz",
      label: "Sample rate (Hz)",
      inputType: "number",
      modes: ["production"],
      helpText: "Recorded in metadata for downstream preprocessing.",
      min: 0.000001,
      max: 1000000,
      step: 1,
    },
  ];
}

const SENSOR_DEFAULTS = {
  starter: {
    task: "activity-classification",
    model: "cnn1d",
    modelSize: "small",
    environment: "local",
    datasetPath: "./sensor_data.csv",
    featureColumns: "ax,ay,az,gx,gy,gz",
    labelColumn: "label",
    windowSize: 128,
    windowStride: 64,
    epochs: 50,
    batchSize: 64,
    learningRate: 0.001,
    validationFraction: 0.15,
    testFraction: 0.15,
    patience: 8,
    dropout: 0.2,
    device: "auto",
    seed: 42,
    workers: 0,
    exportFormat: "torchscript",
    checkpointPath: "./artifacts/sensor_classifier.pt",
    sampleRateHz: 100,
  },
  production: {
    task: "activity-classification",
    model: "cnn1d",
    modelSize: "small",
    environment: "local",
    datasetPath: "./sensor_data.csv",
    featureColumns: "ax,ay,az,gx,gy,gz",
    labelColumn: "label",
    windowSize: 128,
    windowStride: 64,
    epochs: 50,
    batchSize: 64,
    learningRate: 0.001,
    validationFraction: 0.15,
    testFraction: 0.15,
    patience: 8,
    dropout: 0.2,
    device: "auto",
    seed: 42,
    workers: 0,
    exportFormat: "onnx",
    checkpointPath: "./artifacts/sensor_classifier.pt",
    sampleRateHz: 100,
  },
};

function normalizeSensorConfig(inputConfig, mode) {
  const resolvedMode = ensureMode(mode);
  const defaults = SENSOR_DEFAULTS[resolvedMode];
  const config = { ...clone(defaults), ...(inputConfig ?? {}) };

  config.task = normalizeSelectValue(config.task, SENSOR_TASK_OPTIONS, defaults.task);
  config.model = normalizeSelectValue(config.model, SENSOR_MODEL_OPTIONS, defaults.model);
  config.modelSize = normalizeSelectValue(
    config.modelSize,
    SENSOR_SIZE_OPTIONS,
    defaults.modelSize,
  );
  config.environment = normalizeSelectValue(
    config.environment,
    YOLO_RUNTIME_OPTIONS,
    defaults.environment,
  );
  config.device = normalizeSelectValue(
    config.device,
    optionList(DEVICE_VALUES[config.environment] ?? [], DEVICE_LABELS),
    defaults.device,
  );
  config.exportFormat = normalizeSelectValue(
    config.exportFormat,
    SENSOR_EXPORT_OPTIONS,
    defaults.exportFormat,
  );

  for (const key of [
    "windowSize",
    "windowStride",
    "epochs",
    "batchSize",
    "learningRate",
    "validationFraction",
    "testFraction",
    "patience",
    "dropout",
    "seed",
    "workers",
    "sampleRateHz",
  ]) {
    config[key] = toFiniteNumber(config[key], defaults[key]);
  }

  for (const key of ["datasetPath", "labelColumn", "checkpointPath"]) {
    config[key] = String(config[key] ?? "").trim();
  }
  const rawFeatures = Array.isArray(config.featureColumns)
    ? config.featureColumns
    : String(config.featureColumns ?? "").split(",");
  config.featureColumns = rawFeatures
    .map((column) => String(column).trim())
    .filter(Boolean)
    .join(",");

  if (resolvedMode === "starter") {
    for (const key of [
      "epochs",
      "batchSize",
      "learningRate",
      "validationFraction",
      "testFraction",
      "patience",
      "dropout",
      "device",
      "seed",
      "workers",
      "exportFormat",
      "checkpointPath",
      "sampleRateHz",
    ]) {
      config[key] = clone(defaults[key]);
    }
  }

  return config;
}

function validateSensorConfig(config, mode) {
  const errors = {};
  const features = config.featureColumns.split(",").filter(Boolean);

  if (!config.datasetPath) errors.datasetPath = "Sensor CSV path is required.";
  if (features.length === 0) {
    errors.featureColumns = "Enter at least one feature column.";
  } else if (features.includes(config.labelColumn)) {
    errors.featureColumns = "The label column cannot also be included in feature columns.";
  }
  if (!config.labelColumn) errors.labelColumn = "Label column is required.";

  validateNumber(errors, config, "windowSize", "Window size", 1, 65536, {
    integer: true,
  });
  validateNumber(errors, config, "windowStride", "Window stride", 1, 65536, {
    integer: true,
  });
  if (
    !errors.windowStride &&
    !errors.windowSize &&
    config.windowStride > config.windowSize
  ) {
    errors.windowStride = "Window stride must be less than or equal to window size.";
  }

  if (ensureMode(mode) === "production") {
    validateNumber(errors, config, "epochs", "Epochs", 1, 500, { integer: true });
    validateNumber(errors, config, "batchSize", "Batch size", 1, 1024, {
      integer: true,
    });
    validateNumber(errors, config, "learningRate", "Learning rate", 0.000001, 1);
    validateNumber(errors, config, "validationFraction", "Validation fraction", 0.05, 0.4);
    validateNumber(errors, config, "testFraction", "Test fraction", 0.05, 0.4);
    validateNumber(errors, config, "patience", "Patience", 0, 100, { integer: true });
    validateNumber(errors, config, "dropout", "Dropout", 0, 0.8);
    validateNumber(errors, config, "seed", "Seed", 0, 2147483647, { integer: true });
    validateNumber(errors, config, "workers", "Workers", 0, 32, { integer: true });
    validateNumber(errors, config, "sampleRateHz", "Sample rate", 0.000001, 1000000);
    if (config.validationFraction + config.testFraction >= 0.8) {
      errors.validationFraction = "Validation and test fractions must total less than 0.8.";
    }
    if (!config.checkpointPath) {
      errors.checkpointPath = "Checkpoint path is required.";
    }
  }

  return errors;
}

const SENSOR_TEMPLATE = {
  id: "sensor-timeseries-classification",
  name: "Sensor Time-Series Classification",
  shortDescription: "Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",
  category: "Sensor AI / Robotics",
  filename: () => "train_sensor_classifier.py",
  fields: createSensorFields(),
  defaults: SENSOR_DEFAULTS,
  normalize: normalizeSensorConfig,
  validate: validateSensorConfig,
  generate: generateSensorScript,
  dependencies: [
    { package: "torch", version: ">=2.3,<3", purpose: "Training and export" },
    { package: "numpy", version: ">=1.26,<3", purpose: "Windowing and normalization" },
    { package: "pandas", version: ">=2.2,<3", purpose: "CSV loading" },
    { package: "scikit-learn", version: ">=1.4,<2", purpose: "Metrics and labels" },
    { package: "onnx", version: ">=1.16,<2", purpose: "ONNX export" },
  ],
  dataset: {
    title: "Chronological sensor CSV",
    summary: "One time-ordered sample per row with numeric feature columns and one categorical label column.",
    structure: "timestamp,ax,ay,az,gx,gy,gz,label\n0.00,0.01,-0.02,9.80,0.02,0.01,-0.03,idle",
    examplePaths: ["./sensor_data.csv"],
    labelFormat: "Each overlapping window uses the label from its final row.",
  },
  metrics: [
    "Accuracy",
    "Macro F1",
    "Per-class precision and recall",
    "Confusion matrix",
    "Inference latency per window",
    "Serialized model size",
  ],
  hardware: {
    minimum: "Four-core CPU, 4 GB RAM, and a small dataset.",
    recommended: "Eight-core CPU or CUDA GPU with 8 to 16 GB RAM.",
    edge: "Prefer a nano or small CNN, fixed windows, batch size one, and benchmark preprocessing.",
  },
  deployment: ["TorchScript", "ONNX"],
  notes: [
    "Rows must already be in chronological order; the script never shuffles before splitting.",
    "Missing values are rejected instead of silently interpolated.",
    "Normalization statistics are fitted only on the training windows.",
  ],
  warnings: [],
  getWarnings(config, mode) {
    const warnings = [];
    if (config.modelSize === "large" && ["jetson", "raspberry-pi"].includes(config.environment)) {
      warnings.push("A large temporal model may miss edge latency and memory targets.");
    }
    if (ensureMode(mode) === "production" && config.datasetPath.startsWith("./sensor_data")) {
      warnings.push("Replace the placeholder sensor CSV path before running this production-oriented script.");
    }
    return warnings;
  },
};

const EDGE_TASK_OPTIONS = [
  { value: "train-export", label: "Train + validate + export" },
];

const EDGE_MODEL_OPTIONS = [
  { value: "mobilenet-v3-small", label: "MobileNetV3Small" },
  { value: "mobilenet-v3-large", label: "MobileNetV3Large" },
  { value: "efficientnet-v2-b0", label: "EfficientNetV2B0" },
];

const EDGE_RUNTIME_OPTIONS = [
  { value: "local", label: "Local machine" },
  { value: "colab", label: "Google Colab" },
  { value: "raspberry-pi", label: "Raspberry Pi" },
  { value: "coral", label: "Google Coral" },
  { value: "android", label: "Android" },
];

const EDGE_INPUT_SIZE_OPTIONS = [160, 192, 224, 256].map((value) => ({
  value: String(value),
  label: `${value} px`,
}));

const EDGE_EXPORT_LABELS = {
  "tflite-fp32": "TensorFlow Lite FP32",
  "tflite-fp16": "TensorFlow Lite FP16",
  "tflite-int8": "TensorFlow Lite INT8",
};

const EDGE_EXPORT_VALUES = {
  local: ["tflite-fp32", "tflite-fp16", "tflite-int8"],
  colab: ["tflite-fp32", "tflite-fp16", "tflite-int8"],
  "raspberry-pi": ["tflite-fp16", "tflite-int8"],
  coral: ["tflite-int8"],
  android: ["tflite-fp16", "tflite-int8"],
};

const EDGE_BACKBONES = {
  "mobilenet-v3-small": "MobileNetV3Small",
  "mobilenet-v3-large": "MobileNetV3Large",
  "efficientnet-v2-b0": "EfficientNetV2B0",
};

function edgeExportOptions(config) {
  return optionList(
    EDGE_EXPORT_VALUES[config.environment] ?? [],
    EDGE_EXPORT_LABELS,
  );
}

function createEdgeFields() {
  return [
    {
      id: "task",
      label: "Workflow",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "The edge template trains, validates, exports, and runs one TFLite inference.",
      options: EDGE_TASK_OPTIONS,
    },
    {
      id: "model",
      label: "Backbone",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Transfer-learning backbone optimized for smaller deployment targets.",
      options: EDGE_MODEL_OPTIONS,
    },
    {
      id: "environment",
      label: "Runtime target",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Filters compatible TFLite formats; output remains a Python script.",
      options: EDGE_RUNTIME_OPTIONS,
    },
    {
      id: "datasetDirectory",
      label: "Image dataset directory",
      inputType: "text",
      modes: ["starter", "production"],
      helpText: "Each immediate subdirectory becomes a class label.",
    },
    {
      id: "inputSize",
      label: "Input size",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Square image resolution used for training and TFLite inference.",
      options: EDGE_INPUT_SIZE_OPTIONS,
    },
    {
      id: "exportFormat",
      label: "TFLite export",
      inputType: "select",
      modes: ["starter", "production"],
      helpText: "Coral always uses full INT8 quantization.",
      getOptions: edgeExportOptions,
    },
    {
      id: "epochs",
      label: "Epochs",
      inputType: "number",
      modes: ["production"],
      helpText: "Maximum transfer-learning epochs.",
      min: 1,
      max: 300,
      step: 1,
    },
    {
      id: "batchSize",
      label: "Batch size",
      inputType: "number",
      modes: ["production"],
      helpText: "Images processed per optimizer step.",
      min: 1,
      max: 256,
      step: 1,
    },
    {
      id: "learningRate",
      label: "Learning rate",
      inputType: "number",
      modes: ["production"],
      helpText: "Adam optimizer learning rate.",
      min: 0.000001,
      max: 1,
      step: 0.0001,
    },
    {
      id: "validationFraction",
      label: "Validation fraction",
      inputType: "number",
      modes: ["production"],
      helpText: "Deterministic fraction reserved for validation.",
      min: 0.05,
      max: 0.4,
      step: 0.01,
    },
    {
      id: "patience",
      label: "Early-stop patience",
      inputType: "number",
      modes: ["production"],
      helpText: "Epochs without validation improvement before stopping.",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      id: "dropout",
      label: "Dropout",
      inputType: "number",
      modes: ["production"],
      helpText: "Regularization before the classification layer.",
      min: 0,
      max: 0.8,
      step: 0.05,
    },
    {
      id: "seed",
      label: "Random seed",
      inputType: "number",
      modes: ["production"],
      helpText: "Controls the train and validation split and model initialization.",
      min: 0,
      max: 2147483647,
      step: 1,
    },
    {
      id: "fineTuneLayers",
      label: "Fine-tune layers",
      inputType: "number",
      modes: ["production"],
      helpText: "Unfreezes this many layers at the end of the backbone after warm-up.",
      min: 0,
      max: 200,
      step: 1,
    },
    {
      id: "representativeSamples",
      label: "Representative samples",
      inputType: "number",
      modes: ["production"],
      helpText: "Calibration images used for INT8 quantization.",
      min: 10,
      max: 1000,
      step: 10,
      visibleWhen: (config) => config.exportFormat === "tflite-int8",
    },
    {
      id: "artifactDirectory",
      label: "Artifact directory",
      inputType: "text",
      modes: ["production"],
      helpText: "Receives the Keras checkpoint, labels, metadata, and TFLite file.",
    },
    {
      id: "sampleImagePath",
      label: "Sample image",
      inputType: "text",
      modes: ["production"],
      helpText: "Optional image for the final TFLite inference example.",
    },
  ];
}

const EDGE_DEFAULTS = {
  starter: {
    task: "train-export",
    model: "mobilenet-v3-small",
    environment: "local",
    datasetDirectory: "./image_dataset",
    inputSize: "224",
    exportFormat: "tflite-fp32",
    epochs: 30,
    batchSize: 32,
    learningRate: 0.001,
    validationFraction: 0.2,
    patience: 5,
    dropout: 0.2,
    seed: 42,
    fineTuneLayers: 0,
    representativeSamples: 100,
    artifactDirectory: "./artifacts/edge_classifier",
    sampleImagePath: "./sample.jpg",
  },
  production: {
    task: "train-export",
    model: "mobilenet-v3-small",
    environment: "local",
    datasetDirectory: "./image_dataset",
    inputSize: "224",
    exportFormat: "tflite-fp16",
    epochs: 30,
    batchSize: 32,
    learningRate: 0.001,
    validationFraction: 0.2,
    patience: 5,
    dropout: 0.2,
    seed: 42,
    fineTuneLayers: 0,
    representativeSamples: 100,
    artifactDirectory: "./artifacts/edge_classifier",
    sampleImagePath: "./sample.jpg",
  },
};

function normalizeEdgeConfig(inputConfig, mode) {
  const resolvedMode = ensureMode(mode);
  const defaults = EDGE_DEFAULTS[resolvedMode];
  const config = { ...clone(defaults), ...(inputConfig ?? {}) };

  config.task = "train-export";
  config.model = normalizeSelectValue(config.model, EDGE_MODEL_OPTIONS, defaults.model);
  config.environment = normalizeSelectValue(
    config.environment,
    EDGE_RUNTIME_OPTIONS,
    defaults.environment,
  );
  config.inputSize = normalizeSelectValue(
    config.inputSize,
    EDGE_INPUT_SIZE_OPTIONS,
    defaults.inputSize,
  );
  config.exportFormat = normalizeSelectValue(
    config.exportFormat,
    edgeExportOptions(config),
    config.environment === "coral" ? "tflite-int8" : defaults.exportFormat,
  );
  if (config.environment === "coral") config.exportFormat = "tflite-int8";

  for (const key of [
    "epochs",
    "batchSize",
    "learningRate",
    "validationFraction",
    "patience",
    "dropout",
    "seed",
    "fineTuneLayers",
    "representativeSamples",
  ]) {
    config[key] = toFiniteNumber(config[key], defaults[key]);
  }
  for (const key of ["datasetDirectory", "artifactDirectory", "sampleImagePath"]) {
    config[key] = String(config[key] ?? "").trim();
  }

  if (resolvedMode === "starter") {
    for (const key of [
      "epochs",
      "batchSize",
      "learningRate",
      "validationFraction",
      "patience",
      "dropout",
      "seed",
      "fineTuneLayers",
      "representativeSamples",
      "artifactDirectory",
      "sampleImagePath",
    ]) {
      config[key] = clone(defaults[key]);
    }
  }

  return config;
}

function validateEdgeConfig(config, mode) {
  const errors = {};
  if (!config.datasetDirectory) {
    errors.datasetDirectory = "Image dataset directory is required.";
  }
  if (ensureMode(mode) === "production") {
    validateNumber(errors, config, "epochs", "Epochs", 1, 300, { integer: true });
    validateNumber(errors, config, "batchSize", "Batch size", 1, 256, {
      integer: true,
    });
    validateNumber(errors, config, "learningRate", "Learning rate", 0.000001, 1);
    validateNumber(errors, config, "validationFraction", "Validation fraction", 0.05, 0.4);
    validateNumber(errors, config, "patience", "Patience", 0, 100, { integer: true });
    validateNumber(errors, config, "dropout", "Dropout", 0, 0.8);
    validateNumber(errors, config, "seed", "Seed", 0, 2147483647, { integer: true });
    validateNumber(errors, config, "fineTuneLayers", "Fine-tune layers", 0, 200, {
      integer: true,
    });
    if (!config.artifactDirectory) {
      errors.artifactDirectory = "Artifact directory is required.";
    }
  }
  if (config.exportFormat === "tflite-int8") {
    validateNumber(
      errors,
      config,
      "representativeSamples",
      "Representative samples",
      10,
      1000,
      { integer: true },
    );
  }
  return errors;
}

const EDGE_TEMPLATE = {
  id: "edge-image-classification",
  name: "Edge Image Classification",
  shortDescription: "Train a compact transfer-learning classifier and export a benchmarkable TFLite artifact.",
  category: "Edge Deployment",
  filename: () => "train_edge_image_classifier.py",
  fields: createEdgeFields(),
  defaults: EDGE_DEFAULTS,
  normalize: normalizeEdgeConfig,
  validate: validateEdgeConfig,
  generate: generateEdgeScript,
  dependencies: [
    { package: "tensorflow", version: ">=2.16,<3", purpose: "Training and TFLite export" },
    { package: "numpy", version: ">=1.26,<3", purpose: "Representative data and inference" },
    { package: "Pillow", version: ">=10,<12", purpose: "Sample image loading" },
  ],
  dataset: {
    title: "Class-directory image dataset",
    summary: "Each immediate folder contains images for one class; folder names become labels.",
    structure: "image_dataset/\n  cat/{cat_001.jpg,cat_002.jpg}\n  dog/{dog_001.jpg,dog_002.jpg}\n  bird/{bird_001.jpg,bird_002.jpg}",
    examplePaths: ["./image_dataset/cat", "./image_dataset/dog", "./image_dataset/bird"],
    labelFormat: "One class name per immediate subdirectory.",
  },
  metrics: [
    "Validation accuracy",
    "Validation loss",
    "Top-k accuracy",
    "TFLite file size",
    "TFLite inference latency",
    "Quantized versus Keras accuracy change",
  ],
  hardware: {
    minimum: "Eight-core CPU and 8 GB RAM for a small image dataset.",
    recommended: "Accelerated TensorFlow environment and 16 GB RAM.",
    edge: "Benchmark the exported model on Raspberry Pi, Android, or the Coral pipeline.",
  },
  deployment: ["TensorFlow Lite FP32", "TensorFlow Lite FP16", "TensorFlow Lite INT8"],
  notes: [
    "Folder names become the exported class labels.",
    "The best Keras checkpoint is preserved beside the TFLite artifact.",
  ],
  warnings: [],
  getWarnings(config, mode) {
    const warnings = [];
    if (config.environment === "coral") {
      warnings.push("Edge TPU compilation is an external step after this script creates the INT8 TFLite model.");
    }
    if (config.exportFormat === "tflite-int8" && config.representativeSamples < 100) {
      warnings.push("A small representative set can reduce INT8 calibration quality.");
    }
    if (ensureMode(mode) === "production" && config.datasetDirectory.startsWith("./image_dataset")) {
      warnings.push("Replace the placeholder image dataset directory before running this production-oriented script.");
    }
    return warnings;
  },
};
export const ML_TEMPLATES = [
  YOLO_DETECTION_TEMPLATE,
  YOLO_SEGMENTATION_TEMPLATE,
  SENSOR_TEMPLATE,
  EDGE_TEMPLATE,
];

export function getTemplateById(templateId) {
  return ML_TEMPLATES.find((template) => template.id === templateId) ??
    ML_TEMPLATES[0] ??
    null;
}

export function getDefaultConfig(templateId, mode) {
  const template = getTemplateById(templateId);
  if (!template) return {};
  return clone(template.defaults[ensureMode(mode)] ?? template.defaults.starter ?? {});
}

export function getVisibleFields(templateId, config, mode) {
  const template = getTemplateById(templateId);
  if (!template) return [];
  const resolvedMode = ensureMode(mode);
  const normalized = template.normalize(config, resolvedMode);
  return template.fields.filter((field) => {
    if (!field.modes.includes(resolvedMode)) return false;
    return field.visibleWhen ? field.visibleWhen(normalized, resolvedMode) : true;
  });
}

export function getFieldOptions(templateId, fieldId, config, mode) {
  const template = getTemplateById(templateId);
  if (!template) return [];
  const field = template.fields.find((item) => item.id === fieldId);
  if (!field) return [];
  const normalized = template.normalize(config, ensureMode(mode));
  const options = field.getOptions
    ? field.getOptions(normalized, ensureMode(mode))
    : field.options ?? [];
  return options.map((option) => ({ ...option }));
}

export function normalizeTemplateConfig(templateId, config, mode) {
  const template = getTemplateById(templateId);
  if (!template) return {};
  return template.normalize(config ?? {}, ensureMode(mode));
}

export function validateTemplateConfig(templateId, config, mode) {
  const requestedTemplate = ML_TEMPLATES.find(
    (template) => template.id === templateId,
  );
  if (!requestedTemplate) {
    return { templateId: "Select a valid script template." };
  }
  const resolvedMode = ensureMode(mode);
  const normalized = requestedTemplate.normalize(config ?? {}, resolvedMode);
  return requestedTemplate.validate(normalized, resolvedMode);
}

export function generateMlScript(templateId, config, mode) {
  const template = ML_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return "";
  const resolvedMode = ensureMode(mode);
  const normalized = template.normalize(config ?? {}, resolvedMode);
  const errors = template.validate(normalized, resolvedMode);
  if (Object.keys(errors).length > 0) return "";
  return ensureTrailingNewline(template.generate(normalized, resolvedMode));
}

export function getTemplateOutputMetadata(templateId, config, mode) {
  const template = getTemplateById(templateId);
  if (!template) {
    return {
      dependencies: [],
      dataset: {},
      metrics: [],
      hardware: {},
      deployment: [],
      notes: [],
      warnings: [],
    };
  }

  const resolvedMode = ensureMode(mode);
  const normalized = template.normalize(config ?? {}, resolvedMode);
  const exportField = template.fields.find((field) => field.id === "exportFormat");
  const compatibleDeployment = exportField
    ? getFieldOptions(template.id, "exportFormat", normalized, resolvedMode)
      .map((option) => option.label)
    : template.deployment;
  const contextualWarnings = template.getWarnings
    ? template.getWarnings(normalized, resolvedMode)
    : [];
  const contextualNotes = template.getNotes
    ? template.getNotes(normalized, resolvedMode)
    : [];

  return {
    dependencies: clone(template.dependencies),
    dataset: clone(template.dataset),
    metrics: clone(template.metrics),
    hardware: clone(template.hardware),
    deployment: clone(compatibleDeployment),
    notes: [...clone(template.notes), ...contextualNotes],
    warnings: [...clone(template.warnings), ...contextualWarnings],
  };
}

export function buildMlGeneratorResult(templateId, inputConfig, mode) {
  const requestedTemplate = ML_TEMPLATES.find(
    (template) => template.id === templateId,
  );
  const template = requestedTemplate ?? getTemplateById(templateId);
  const resolvedMode = ensureMode(mode);

  if (!template) {
    return {
      templateId,
      filename: "",
      code: "",
      dependencies: [],
      dataset: {},
      metrics: [],
      hardware: {},
      deployment: [],
      notes: [],
      warnings: [],
      config: {},
      validationErrors: {
        templateId: "No script templates are currently available.",
      },
    };
  }

  const config = template.normalize(inputConfig ?? {}, resolvedMode);
  const validationErrors = requestedTemplate
    ? template.validate(config, resolvedMode)
    : { templateId: "Select a valid script template." };
  const metadata = getTemplateOutputMetadata(template.id, config, resolvedMode);

  return {
    templateId,
    filename: template.filename(config, resolvedMode),
    code: Object.keys(validationErrors).length === 0
      ? ensureTrailingNewline(template.generate(config, resolvedMode))
      : "",
    ...metadata,
    config,
    validationErrors,
  };
}

function generateSensorScript(config, mode) {
  const hiddenWidth = SENSOR_HIDDEN_WIDTHS[config.modelSize];
  return `from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from torch import nn
from torch.utils.data import DataLoader, Dataset


CONFIG: dict[str, Any] = {
    "mode": ${pythonLiteral(ensureMode(mode))},
    "task": ${pythonLiteral(config.task)},
    "architecture": ${pythonLiteral(config.model)},
    "hidden_width": ${pythonLiteral(hiddenWidth)},
    "dataset_path": ${pythonLiteral(config.datasetPath)},
    "feature_columns": ${pythonLiteral(config.featureColumns.split(","))},
    "label_column": ${pythonLiteral(config.labelColumn)},
    "window_size": ${pythonLiteral(config.windowSize)},
    "window_stride": ${pythonLiteral(config.windowStride)},
    "epochs": ${pythonLiteral(config.epochs)},
    "batch_size": ${pythonLiteral(config.batchSize)},
    "learning_rate": ${pythonLiteral(config.learningRate)},
    "validation_fraction": ${pythonLiteral(config.validationFraction)},
    "test_fraction": ${pythonLiteral(config.testFraction)},
    "patience": ${pythonLiteral(config.patience)},
    "dropout": ${pythonLiteral(config.dropout)},
    "device": ${pythonLiteral(config.device)},
    "seed": ${pythonLiteral(config.seed)},
    "workers": ${pythonLiteral(config.workers)},
    "export_format": ${pythonLiteral(config.exportFormat)},
    "checkpoint_path": ${pythonLiteral(config.checkpointPath)},
    "sample_rate_hz": ${pythonLiteral(config.sampleRateHz)},
}


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    if hasattr(torch.backends, "cudnn"):
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def resolve_device(requested: str) -> torch.device:
    if requested == "auto":
        return torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    if requested.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError(
            f"Device {requested!r} was requested, but CUDA is unavailable."
        )
    return torch.device(requested)


def load_sensor_rows() -> tuple[np.ndarray, np.ndarray]:
    path = Path(str(CONFIG["dataset_path"])).expanduser().resolve()
    if not path.is_file():
        raise FileNotFoundError(
            f"Sensor CSV was not found: {path}. "
            "Update CONFIG['dataset_path'] before running the script."
        )

    frame = pd.read_csv(path)
    feature_columns = [str(name) for name in CONFIG["feature_columns"]]
    label_column = str(CONFIG["label_column"])
    required_columns = feature_columns + [label_column]
    missing_columns = [name for name in required_columns if name not in frame.columns]
    if missing_columns:
        raise ValueError(f"Sensor CSV is missing columns: {missing_columns}")
    if frame[required_columns].isnull().any().any():
        raise ValueError(
            "Sensor CSV contains missing values. Choose and apply an explicit "
            "imputation policy before using this generator."
        )

    try:
        features = frame[feature_columns].to_numpy(dtype=np.float32)
    except (TypeError, ValueError) as error:
        raise ValueError("Every configured feature column must be numeric.") from error
    labels = frame[label_column].astype(str).to_numpy()

    if str(CONFIG["task"]) == "binary-anomaly-classification":
        unique_labels = np.unique(labels)
        if len(unique_labels) != 2:
            raise ValueError(
                "Binary anomaly classification requires exactly two labels; "
                f"found {len(unique_labels)}: {unique_labels.tolist()}"
            )

    return features, labels


def build_windows(
    features: np.ndarray,
    labels: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    window_size = int(CONFIG["window_size"])
    stride = int(CONFIG["window_stride"])
    if len(features) < window_size:
        raise ValueError(
            f"Dataset has {len(features)} rows but window size is {window_size}."
        )

    windows: list[np.ndarray] = []
    window_labels: list[str] = []
    for start in range(0, len(features) - window_size + 1, stride):
        end = start + window_size
        windows.append(features[start:end])
        window_labels.append(str(labels[end - 1]))

    if len(windows) < 3:
        raise ValueError("At least three windows are required for train, validation, and test splits.")

    return np.stack(windows).astype(np.float32), np.asarray(window_labels)


def split_chronologically(
    windows: np.ndarray,
    labels: np.ndarray,
) -> tuple[
    tuple[np.ndarray, np.ndarray],
    tuple[np.ndarray, np.ndarray],
    tuple[np.ndarray, np.ndarray],
]:
    count = len(windows)
    test_count = max(1, int(round(count * float(CONFIG["test_fraction"]))))
    validation_count = max(
        1,
        int(round(count * float(CONFIG["validation_fraction"]))),
    )
    train_count = count - validation_count - test_count
    if train_count < 1:
        raise ValueError("Split fractions leave no windows for training.")

    validation_end = train_count + validation_count
    train = (windows[:train_count], labels[:train_count])
    validation = (
        windows[train_count:validation_end],
        labels[train_count:validation_end],
    )
    test = (windows[validation_end:], labels[validation_end:])
    return train, validation, test


def normalize_from_training(
    train_x: np.ndarray,
    validation_x: np.ndarray,
    test_x: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    mean = train_x.mean(axis=(0, 1), keepdims=True)
    standard_deviation = train_x.std(axis=(0, 1), keepdims=True)
    standard_deviation = np.where(standard_deviation < 1e-8, 1.0, standard_deviation)
    return (
        ((train_x - mean) / standard_deviation).astype(np.float32),
        ((validation_x - mean) / standard_deviation).astype(np.float32),
        ((test_x - mean) / standard_deviation).astype(np.float32),
        mean.reshape(-1),
        standard_deviation.reshape(-1),
    )


def encode_labels(
    train_labels: np.ndarray,
    validation_labels: np.ndarray,
    test_labels: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    classes = sorted({str(label) for label in train_labels})
    class_to_index = {label: index for index, label in enumerate(classes)}

    def encode(values: np.ndarray, split_name: str) -> np.ndarray:
        unseen = sorted({str(value) for value in values} - set(class_to_index))
        if unseen:
            raise ValueError(
                f"{split_name} contains labels absent from training data: {unseen}"
            )
        return np.asarray([class_to_index[str(value)] for value in values], dtype=np.int64)

    return (
        encode(train_labels, "Training split"),
        encode(validation_labels, "Validation split"),
        encode(test_labels, "Test split"),
        classes,
    )


class SensorDataset(Dataset):
    def __init__(self, windows: np.ndarray, labels: np.ndarray) -> None:
        self.windows = torch.from_numpy(windows).permute(0, 2, 1).contiguous()
        self.labels = torch.from_numpy(labels)

    def __len__(self) -> int:
        return len(self.windows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.windows[index], self.labels[index]


class CNN1D(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv1d(input_features, hidden_width, kernel_size=5, padding=2),
            nn.BatchNorm1d(hidden_width),
            nn.ReLU(),
            nn.Conv1d(hidden_width, hidden_width, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(dropout),
            nn.Linear(hidden_width, class_count),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.classifier(self.features(inputs))


class LSTMClassifier(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.lstm = nn.LSTM(input_features, hidden_width, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_width, class_count)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        sequence = inputs.transpose(1, 2)
        outputs, _ = self.lstm(sequence)
        return self.classifier(self.dropout(outputs[:, -1]))


class CNNLSTM(nn.Module):
    def __init__(
        self,
        input_features: int,
        hidden_width: int,
        class_count: int,
        dropout: float,
    ) -> None:
        super().__init__()
        self.convolution = nn.Sequential(
            nn.Conv1d(input_features, hidden_width, kernel_size=5, padding=2),
            nn.ReLU(),
        )
        self.lstm = nn.LSTM(hidden_width, hidden_width, batch_first=True)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_width, class_count)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        sequence = self.convolution(inputs).transpose(1, 2)
        outputs, _ = self.lstm(sequence)
        return self.classifier(self.dropout(outputs[:, -1]))


def build_model(input_features: int, class_count: int) -> nn.Module:
    arguments = {
        "input_features": input_features,
        "hidden_width": int(CONFIG["hidden_width"]),
        "class_count": class_count,
        "dropout": float(CONFIG["dropout"]),
    }
    architecture = str(CONFIG["architecture"])
    if architecture == "cnn1d":
        return CNN1D(**arguments)
    if architecture == "lstm":
        return LSTMClassifier(**arguments)
    if architecture == "cnn-lstm":
        return CNNLSTM(**arguments)
    raise ValueError(f"Unsupported architecture: {architecture}")


def make_loader(
    windows: np.ndarray,
    labels: np.ndarray,
    shuffle: bool,
) -> DataLoader:
    return DataLoader(
        SensorDataset(windows, labels),
        batch_size=int(CONFIG["batch_size"]),
        shuffle=shuffle,
        num_workers=int(CONFIG["workers"]),
        pin_memory=torch.cuda.is_available(),
    )


def run_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    optimizer: torch.optim.Optimizer | None = None,
) -> float:
    training = optimizer is not None
    model.train(training)
    total_loss = 0.0
    total_items = 0

    for inputs, targets in loader:
        inputs = inputs.to(device)
        targets = targets.to(device)
        if training:
            optimizer.zero_grad(set_to_none=True)
        with torch.set_grad_enabled(training):
            logits = model(inputs)
            loss = criterion(logits, targets)
            if training:
                loss.backward()
                optimizer.step()
        total_loss += float(loss.item()) * len(inputs)
        total_items += len(inputs)

    if total_items == 0:
        raise RuntimeError("A data loader produced no batches.")
    return total_loss / total_items


def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    validation_loader: DataLoader,
    device: torch.device,
) -> Path:
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=float(CONFIG["learning_rate"]),
    )
    checkpoint = Path(str(CONFIG["checkpoint_path"])).expanduser().resolve()
    checkpoint.parent.mkdir(parents=True, exist_ok=True)
    best_validation_loss = float("inf")
    stale_epochs = 0

    for epoch in range(1, int(CONFIG["epochs"]) + 1):
        train_loss = run_epoch(model, train_loader, criterion, device, optimizer)
        validation_loss = run_epoch(model, validation_loader, criterion, device)
        print(
            f"Epoch {epoch:03d}: train_loss={train_loss:.6f} "
            f"validation_loss={validation_loss:.6f}"
        )

        if validation_loss < best_validation_loss:
            best_validation_loss = validation_loss
            stale_epochs = 0
            torch.save(model.state_dict(), checkpoint)
        else:
            stale_epochs += 1

        patience = int(CONFIG["patience"])
        if patience > 0 and stale_epochs >= patience:
            print(f"Early stopping after {epoch} epochs.")
            break

    if not checkpoint.is_file():
        raise FileNotFoundError(f"Best checkpoint was not created: {checkpoint}")
    model.load_state_dict(torch.load(checkpoint, map_location=device, weights_only=True))
    return checkpoint


@torch.no_grad()
def predict_loader(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
) -> tuple[np.ndarray, np.ndarray]:
    model.eval()
    predictions: list[np.ndarray] = []
    targets: list[np.ndarray] = []
    for inputs, labels in loader:
        logits = model(inputs.to(device))
        predictions.append(logits.argmax(dim=1).cpu().numpy())
        targets.append(labels.numpy())
    return np.concatenate(predictions), np.concatenate(targets)


def report_metrics(
    predictions: np.ndarray,
    targets: np.ndarray,
    classes: list[str],
) -> None:
    precision, recall, _, _ = precision_recall_fscore_support(
        targets,
        predictions,
        labels=np.arange(len(classes)),
        zero_division=0,
    )
    macro_f1 = f1_score(targets, predictions, average="macro")
    summary = {
        "accuracy": accuracy_score(targets, predictions),
        "macro_f1": macro_f1,
        "per_class": {
            label: {
                "precision": float(precision[index]),
                "recall": float(recall[index]),
            }
            for index, label in enumerate(classes)
        },
        "confusion_matrix": confusion_matrix(
            targets,
            predictions,
            labels=np.arange(len(classes)),
        ).tolist(),
    }
    print("Test metrics:")
    print(json.dumps(summary, indent=2))


def measure_latency(
    model: nn.Module,
    sample: torch.Tensor,
    device: torch.device,
) -> float:
    model.eval()
    sample = sample.to(device)
    with torch.no_grad():
        for _ in range(5):
            model(sample)
        if device.type == "cuda":
            torch.cuda.synchronize()
        started = time.perf_counter()
        for _ in range(50):
            model(sample)
        if device.type == "cuda":
            torch.cuda.synchronize()
    return (time.perf_counter() - started) * 1000.0 / 50.0


def export_model(model: nn.Module, example: torch.Tensor, checkpoint: Path) -> Path:
    model = model.cpu().eval()
    example = example.cpu()
    if str(CONFIG["export_format"]) == "torchscript":
        output_path = checkpoint.with_suffix(".torchscript.pt")
        scripted = torch.jit.script(model)
        scripted.save(str(output_path))
    else:
        output_path = checkpoint.with_suffix(".onnx")
        torch.onnx.export(
            model,
            example,
            str(output_path),
            input_names=["sensor_window"],
            output_names=["class_logits"],
            dynamic_axes={"sensor_window": {0: "batch"}, "class_logits": {0: "batch"}},
            opset_version=17,
        )
    return output_path


def main() -> int:
    seed_everything(int(CONFIG["seed"]))
    device = resolve_device(str(CONFIG["device"]))
    print("Resolved configuration:")
    print(json.dumps(CONFIG, indent=2, default=str))
    print(f"Resolved device: {device}")

    features, labels = load_sensor_rows()
    windows, window_labels = build_windows(features, labels)
    train, validation, test = split_chronologically(windows, window_labels)
    train_x, train_labels = train
    validation_x, validation_labels = validation
    test_x, test_labels = test
    train_x, validation_x, test_x, mean, standard_deviation = normalize_from_training(
        train_x,
        validation_x,
        test_x,
    )
    train_y, validation_y, test_y, classes = encode_labels(
        train_labels,
        validation_labels,
        test_labels,
    )

    train_loader = make_loader(train_x, train_y, shuffle=True)
    validation_loader = make_loader(validation_x, validation_y, shuffle=False)
    test_loader = make_loader(test_x, test_y, shuffle=False)
    model = build_model(train_x.shape[2], len(classes)).to(device)
    checkpoint = train_model(model, train_loader, validation_loader, device)

    predictions, targets = predict_loader(model, test_loader, device)
    report_metrics(predictions, targets, classes)

    example = torch.from_numpy(test_x[:1]).permute(0, 2, 1).contiguous()
    latency_ms = measure_latency(model, example, device)
    export_path = export_model(model, example, checkpoint)
    artifact_size = export_path.stat().st_size

    model.eval()
    with torch.no_grad():
        sample_logits = model(example.to(device))
        sample_index = int(sample_logits.argmax(dim=1).item())

    metadata_path = checkpoint.with_suffix(".metadata.json")
    metadata = {
        "classes": classes,
        "feature_columns": CONFIG["feature_columns"],
        "window_size": CONFIG["window_size"],
        "window_stride": CONFIG["window_stride"],
        "sample_rate_hz": CONFIG["sample_rate_hz"],
        "normalization_mean": mean.tolist(),
        "normalization_standard_deviation": standard_deviation.tolist(),
        "export_path": str(export_path),
        "artifact_size_bytes": artifact_size,
        "latency_ms_per_window": latency_ms,
        "sample_prediction": classes[sample_index],
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print("Artifact summary:")
    print(json.dumps(metadata, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Execution cancelled by the user.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as error:
        print(f"Fatal error: {error}", file=sys.stderr)
        raise SystemExit(1)
`;
}

function generateEdgeScript(config, mode) {
  const backbone = EDGE_BACKBONES[config.model];
  return `from __future__ import annotations

import json
import random
import sys
import time
from pathlib import Path
from typing import Any, Iterator

import numpy as np
import tensorflow as tf


CONFIG: dict[str, Any] = {
    "mode": ${pythonLiteral(ensureMode(mode))},
    "workflow": "train-export",
    "backbone": ${pythonLiteral(backbone)},
    "runtime_target": ${pythonLiteral(config.environment)},
    "dataset_directory": ${pythonLiteral(config.datasetDirectory)},
    "input_size": ${pythonLiteral(Number(config.inputSize))},
    "export_format": ${pythonLiteral(config.exportFormat)},
    "epochs": ${pythonLiteral(config.epochs)},
    "batch_size": ${pythonLiteral(config.batchSize)},
    "learning_rate": ${pythonLiteral(config.learningRate)},
    "validation_fraction": ${pythonLiteral(config.validationFraction)},
    "patience": ${pythonLiteral(config.patience)},
    "dropout": ${pythonLiteral(config.dropout)},
    "seed": ${pythonLiteral(config.seed)},
    "fine_tune_layers": ${pythonLiteral(config.fineTuneLayers)},
    "representative_samples": ${pythonLiteral(config.representativeSamples)},
    "artifact_directory": ${pythonLiteral(config.artifactDirectory)},
    "sample_image_path": ${pythonLiteral(config.sampleImagePath)},
}


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    tf.keras.utils.set_random_seed(seed)
    try:
        tf.config.experimental.enable_op_determinism()
    except (AttributeError, RuntimeError):
        pass


def validate_paths() -> tuple[Path, Path]:
    dataset_directory = Path(str(CONFIG["dataset_directory"])).expanduser().resolve()
    if not dataset_directory.is_dir():
        raise FileNotFoundError(
            f"Image dataset directory was not found: {dataset_directory}. "
            "Update CONFIG['dataset_directory'] before running the script."
        )
    class_directories = [path for path in dataset_directory.iterdir() if path.is_dir()]
    if len(class_directories) < 2:
        raise ValueError("Image dataset must contain at least two class directories.")

    artifact_directory = Path(str(CONFIG["artifact_directory"])).expanduser().resolve()
    artifact_directory.mkdir(parents=True, exist_ok=True)
    return dataset_directory, artifact_directory


def load_datasets(
    dataset_directory: Path,
) -> tuple[tf.data.Dataset, tf.data.Dataset, list[str]]:
    arguments = {
        "directory": str(dataset_directory),
        "validation_split": float(CONFIG["validation_fraction"]),
        "seed": int(CONFIG["seed"]),
        "image_size": (int(CONFIG["input_size"]), int(CONFIG["input_size"])),
        "batch_size": int(CONFIG["batch_size"]),
        "label_mode": "int",
    }
    train_dataset = tf.keras.utils.image_dataset_from_directory(
        subset="training",
        shuffle=True,
        **arguments,
    )
    validation_dataset = tf.keras.utils.image_dataset_from_directory(
        subset="validation",
        shuffle=False,
        **arguments,
    )
    class_names = list(train_dataset.class_names)
    if class_names != list(validation_dataset.class_names):
        raise RuntimeError("Training and validation class mappings do not match.")

    autotune = tf.data.AUTOTUNE
    train_dataset = train_dataset.prefetch(autotune)
    validation_dataset = validation_dataset.prefetch(autotune)
    return train_dataset, validation_dataset, class_names


def build_model(class_count: int) -> tuple[tf.keras.Model, tf.keras.Model]:
    input_size = int(CONFIG["input_size"])
    backbone_name = str(CONFIG["backbone"])
    backbone_constructor = getattr(tf.keras.applications, backbone_name, None)
    if backbone_constructor is None:
        raise ValueError(f"Unsupported TensorFlow backbone: {backbone_name}")

    backbone = backbone_constructor(
        include_top=False,
        weights="imagenet",
        input_shape=(input_size, input_size, 3),
        pooling="avg",
    )
    backbone.trainable = False

    inputs = tf.keras.Input(shape=(input_size, input_size, 3), name="image")
    augmented = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal", seed=int(CONFIG["seed"])),
            tf.keras.layers.RandomRotation(0.05, seed=int(CONFIG["seed"])),
        ],
        name="augmentation",
    )(inputs)
    features = backbone(augmented, training=False)
    features = tf.keras.layers.Dropout(float(CONFIG["dropout"]))(features)
    outputs = tf.keras.layers.Dense(class_count, name="class_logits")(features)
    return tf.keras.Model(inputs, outputs, name="edge_classifier"), backbone


def compile_model(model: tf.keras.Model, class_count: int, learning_rate: float) -> None:
    top_k = min(3, class_count)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=[
            tf.keras.metrics.SparseCategoricalAccuracy(name="accuracy"),
            tf.keras.metrics.SparseTopKCategoricalAccuracy(
                k=top_k,
                name="top_k_accuracy",
            ),
        ],
    )


def train_model(
    model: tf.keras.Model,
    backbone: tf.keras.Model,
    train_dataset: tf.data.Dataset,
    validation_dataset: tf.data.Dataset,
    artifact_directory: Path,
    class_count: int,
) -> Path:
    checkpoint_path = artifact_directory / "best_model.keras"
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_loss",
            save_best_only=True,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=int(CONFIG["patience"]),
            restore_best_weights=True,
        ),
    ]
    compile_model(model, class_count, float(CONFIG["learning_rate"]))
    model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=int(CONFIG["epochs"]),
        callbacks=callbacks,
        verbose=2,
    )

    fine_tune_layers = min(int(CONFIG["fine_tune_layers"]), len(backbone.layers))
    if fine_tune_layers > 0:
        backbone.trainable = True
        for layer in backbone.layers[:-fine_tune_layers]:
            layer.trainable = False
        compile_model(
            model,
            class_count,
            float(CONFIG["learning_rate"]) * 0.1,
        )
        model.fit(
            train_dataset,
            validation_data=validation_dataset,
            epochs=max(1, int(CONFIG["epochs"]) // 3),
            callbacks=callbacks,
            verbose=2,
        )

    if not checkpoint_path.is_file():
        raise FileNotFoundError(f"Best Keras checkpoint was not created: {checkpoint_path}")
    return checkpoint_path


def create_representative_dataset(
    train_dataset: tf.data.Dataset,
) -> Iterator[list[tf.Tensor]]:
    sample_count = int(CONFIG["representative_samples"])
    for images, _ in train_dataset.unbatch().batch(1).take(sample_count):
        yield [tf.cast(images, tf.float32)]


def export_tflite(
    model: tf.keras.Model,
    train_dataset: tf.data.Dataset,
    artifact_directory: Path,
) -> Path:
    export_format = str(CONFIG["export_format"])
    converter = tf.lite.TFLiteConverter.from_keras_model(model)

    if export_format == "tflite-fp16":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
    elif export_format == "tflite-int8":
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = lambda: create_representative_dataset(
            train_dataset
        )
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        if str(CONFIG["runtime_target"]) == "coral":
            converter.inference_input_type = tf.uint8
            converter.inference_output_type = tf.uint8

    tflite_bytes = converter.convert()
    output_path = artifact_directory / f"edge_classifier_{export_format}.tflite"
    output_path.write_bytes(tflite_bytes)
    return output_path


def quantize_input(image: np.ndarray, detail: dict[str, Any]) -> np.ndarray:
    dtype = detail["dtype"]
    if not np.issubdtype(dtype, np.integer):
        return image.astype(dtype)
    scale, zero_point = detail["quantization"]
    if scale <= 0:
        raise ValueError("TFLite input quantization scale must be positive.")
    limits = np.iinfo(dtype)
    quantized = np.round(image / scale + zero_point)
    return np.clip(quantized, limits.min, limits.max).astype(dtype)


def dequantize_output(output: np.ndarray, detail: dict[str, Any]) -> np.ndarray:
    if not np.issubdtype(detail["dtype"], np.integer):
        return output.astype(np.float32)
    scale, zero_point = detail["quantization"]
    return (output.astype(np.float32) - zero_point) * scale


def create_interpreter(tflite_path: Path) -> tuple[tf.lite.Interpreter, dict[str, Any], dict[str, Any]]:
    interpreter = tf.lite.Interpreter(model_path=str(tflite_path))
    interpreter.allocate_tensors()
    input_detail = interpreter.get_input_details()[0]
    output_detail = interpreter.get_output_details()[0]
    return interpreter, input_detail, output_detail


def run_tflite(
    interpreter: tf.lite.Interpreter,
    input_detail: dict[str, Any],
    output_detail: dict[str, Any],
    image: np.ndarray,
) -> np.ndarray:
    interpreter.set_tensor(input_detail["index"], quantize_input(image, input_detail))
    interpreter.invoke()
    return dequantize_output(
        interpreter.get_tensor(output_detail["index"]),
        output_detail,
    )


def evaluate_tflite(
    tflite_path: Path,
    validation_dataset: tf.data.Dataset,
    keras_accuracy: float,
) -> tuple[float, float, float]:
    interpreter, input_detail, output_detail = create_interpreter(tflite_path)
    correct = 0
    count = 0
    started = time.perf_counter()
    for image, label in validation_dataset.unbatch().batch(1).take(100):
        logits = run_tflite(
            interpreter,
            input_detail,
            output_detail,
            image.numpy().astype(np.float32),
        )
        correct += int(int(np.argmax(logits[0])) == int(label.numpy()[0]))
        count += 1
    elapsed = time.perf_counter() - started
    if count == 0:
        raise RuntimeError("Validation dataset produced no examples for TFLite evaluation.")
    tflite_accuracy = correct / count
    latency_ms = elapsed * 1000.0 / count
    return tflite_accuracy, tflite_accuracy - keras_accuracy, latency_ms


def load_sample_image(
    validation_dataset: tf.data.Dataset,
) -> np.ndarray:
    sample_path_value = str(CONFIG["sample_image_path"]).strip()
    input_size = int(CONFIG["input_size"])
    if sample_path_value:
        sample_path = Path(sample_path_value).expanduser().resolve()
        if not sample_path.is_file():
            raise FileNotFoundError(f"Sample image was not found: {sample_path}")
        image = tf.keras.utils.load_img(
            sample_path,
            target_size=(input_size, input_size),
        )
        return np.expand_dims(tf.keras.utils.img_to_array(image), axis=0).astype(np.float32)

    for images, _ in validation_dataset.take(1):
        return images[:1].numpy().astype(np.float32)
    raise RuntimeError("Validation dataset produced no sample image.")


def main() -> int:
    seed_everything(int(CONFIG["seed"]))
    print("Resolved configuration:")
    print(json.dumps(CONFIG, indent=2, default=str))

    dataset_directory, artifact_directory = validate_paths()
    train_dataset, validation_dataset, class_names = load_datasets(dataset_directory)
    model, backbone = build_model(len(class_names))
    checkpoint_path = train_model(
        model,
        backbone,
        train_dataset,
        validation_dataset,
        artifact_directory,
        len(class_names),
    )
    best_model = tf.keras.models.load_model(checkpoint_path)
    keras_metrics = best_model.evaluate(
        validation_dataset,
        return_dict=True,
        verbose=0,
    )

    tflite_path = export_tflite(best_model, train_dataset, artifact_directory)
    labels_path = artifact_directory / "labels.txt"
    labels_path.write_text(chr(10).join(class_names) + chr(10), encoding="utf-8")

    keras_accuracy = float(keras_metrics.get("accuracy", 0.0))
    tflite_accuracy, accuracy_change, latency_ms = evaluate_tflite(
        tflite_path,
        validation_dataset,
        keras_accuracy,
    )

    sample_image = load_sample_image(validation_dataset)
    interpreter, input_detail, output_detail = create_interpreter(tflite_path)
    sample_logits = run_tflite(
        interpreter,
        input_detail,
        output_detail,
        sample_image,
    )
    sample_index = int(np.argmax(sample_logits[0]))

    summary = {
        "validation_loss": float(keras_metrics.get("loss", 0.0)),
        "validation_accuracy": keras_accuracy,
        "top_k_accuracy": float(keras_metrics.get("top_k_accuracy", 0.0)),
        "tflite_accuracy": tflite_accuracy,
        "quantization_accuracy_change": accuracy_change,
        "tflite_latency_ms": latency_ms,
        "tflite_size_bytes": tflite_path.stat().st_size,
        "tflite_path": str(tflite_path),
        "labels_path": str(labels_path),
        "sample_prediction": class_names[sample_index],
    }
    metadata_path = artifact_directory / "metadata.json"
    metadata_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("Artifact summary:")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Execution cancelled by the user.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as error:
        print(f"Fatal error: {error}", file=sys.stderr)
        raise SystemExit(1)
`;
}
