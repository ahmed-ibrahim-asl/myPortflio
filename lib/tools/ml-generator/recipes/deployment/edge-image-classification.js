import { getRecipeManifest } from "../../catalog.js";

const MODES = new Set(["starter", "production"]);

function ensureMode(mode) {
  return MODES.has(mode) ? mode : "starter";
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

function toFiniteNumber(value, fallback) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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

export const manifest = getRecipeManifest("edge-image-classification");

export const recipe = Object.freeze({
  ...manifest,
  ...EDGE_TEMPLATE,
  artifacts: [
    "best Keras checkpoint",
    "class-label file",
    "TensorFlow Lite deployment model",
    "latency and file-size benchmark summary",
  ],
  getReadiness(config, mode) {
    const validationErrors = EDGE_TEMPLATE.validate(config, mode);
    return {
      configuration:
        Object.keys(validationErrors).length === 0 ? "ready" : "blocked",
      data: config.datasetDirectory ? "configured" : "blocked",
      calibration:
        config.exportFormat === "tflite-int8" ? "configured" : "not-required",
      deployment: config.exportFormat ? "configured" : "blocked",
    };
  },
});
