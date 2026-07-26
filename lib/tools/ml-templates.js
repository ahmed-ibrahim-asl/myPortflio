export const ML_CONFIGURATIONS = [
  {
    id: "classification-pytorch-local",
    task: "classification",
    taskLabel: "Image Classification",
    framework: "pytorch",
    frameworkLabel: "PyTorch",
    environment: "local",
    environmentLabel: "Local Script (.py)",
    language: "python",
    filename: "train_classification.py",
    dependencies: [
      { name: "torch", version: ">=2.0.0" },
      { name: "torchvision", version: ">=0.15.0" }
    ],
    notes: [
      "Assumes you have a dataset structured as: train/class_1, train/class_2, val/class_1...",
      "Uses a pre-trained ResNet18 model and fine-tunes the last layer."
    ],
    generate: () => `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

# Hyperparameters
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001
DATA_DIR = './dataset'

# Data Augmentation & Normalization
data_transforms = {
    'train': transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

# Load Datasets
image_datasets = {x: datasets.ImageFolder(f"{DATA_DIR}/{x}", data_transforms[x]) for x in ['train', 'val']}
dataloaders = {x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True) for x in ['train', 'val']}
dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
class_names = image_datasets['train'].classes
num_classes = len(class_names)

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load Pretrained ResNet18
model = models.resnet18(weights='DEFAULT')
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, num_classes)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# Training Loop
for epoch in range(EPOCHS):
    print(f'Epoch {epoch+1}/{EPOCHS}')
    print('-' * 10)
    
    for phase in ['train', 'val']:
        if phase == 'train':
            model.train()
        else:
            model.eval()
            
        running_loss = 0.0
        running_corrects = 0
        
        for inputs, labels in dataloaders[phase]:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            with torch.set_grad_enabled(phase == 'train'):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)
                
                if phase == 'train':
                    loss.backward()
                    optimizer.step()
                    
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
            
        epoch_loss = running_loss / dataset_sizes[phase]
        epoch_acc = running_corrects.double() / dataset_sizes[phase]
        print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

torch.save(model.state_dict(), 'classification_model.pth')
print("Training Complete. Model saved!")
`
  },
  {
    id: "object-detection-yolo-colab",
    task: "object_detection",
    taskLabel: "Object Detection (YOLOv8)",
    framework: "ultralytics",
    frameworkLabel: "Ultralytics YOLO",
    environment: "colab",
    environmentLabel: "Google Colab / Jupyter",
    language: "python",
    filename: "train_yolo.ipynb",
    dependencies: [
      { name: "ultralytics", version: ">=8.0.0" }
    ],
    notes: [
      "Make sure you configure data.yaml with your classes and dataset paths.",
      "In Colab, ensure Hardware Accelerator is set to T4 GPU."
    ],
    generate: () => `!pip install ultralytics

from ultralytics import YOLO

# Load a pre-trained YOLOv8 model (nano size for speed)
model = YOLO('yolov8n.pt')

# Train the model on your custom dataset
# Replace 'data.yaml' with the path to your dataset configuration file
results = model.train(
    data='data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    name='yolov8_custom_training'
)

# Validate the model
metrics = model.val()
print(f"mAP50-95: {metrics.box.map}")

# Perform inference on a test image
results = model('path/to/test_image.jpg')
results[0].show()  # Display the results
`
  },
  {
    id: "segmentation-yolo-local",
    task: "segmentation",
    taskLabel: "Image Segmentation",
    framework: "ultralytics",
    frameworkLabel: "Ultralytics YOLO (Seg)",
    environment: "local",
    environmentLabel: "Local Script (.py)",
    language: "python",
    filename: "train_segmentation.py",
    dependencies: [
      { name: "ultralytics", version: ">=8.0.0" }
    ],
    notes: [
      "YOLOv8 segmentation requires dataset polygon annotations (YOLO format).",
      "We use 'yolov8n-seg.pt' for the segmentation model."
    ],
    generate: () => `from ultralytics import YOLO

def main():
    # Load a pre-trained YOLOv8 segmentation model
    model = YOLO('yolov8n-seg.pt')

    # Train the model on your custom segmentation dataset
    print("Starting training...")
    results = model.train(
        data='seg_data.yaml',
        epochs=100,
        imgsz=640,
        batch=8,
        device=0, # Use GPU 0
        name='yolov8_segmentation_custom'
    )
    
    print("Training complete! Validating...")
    metrics = model.val()
    print(f"Mask mAP50-95: {metrics.seg.map}")

    # Export to ONNX if needed for edge deployment
    success = model.export(format='onnx')
    print(f"ONNX export successful: {success}")

if __name__ == '__main__':
    main()
`
  },
  {
    id: "llm-inference-hf-local",
    task: "llm_inference",
    taskLabel: "LLM Inference",
    framework: "huggingface",
    frameworkLabel: "HuggingFace Transformers",
    environment: "local",
    environmentLabel: "Local Script (.py)",
    language: "python",
    filename: "llm_inference.py",
    dependencies: [
      { name: "transformers", version: ">=4.30.0" },
      { name: "accelerate", version: ">=0.20.0" },
      { name: "torch", version: ">=2.0.0" }
    ],
    notes: [
      "Requires significant GPU RAM. Use model quantization (bitsandbytes) for smaller GPUs.",
      "Make sure you have logged into huggingface-cli if downloading gated models like LLaMA."
    ],
    generate: () => `import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"

print(f"Loading model: {MODEL_ID}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Create a text generation pipeline
generator = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=256,
    temperature=0.7,
    top_p=0.95,
    repetition_penalty=1.1
)

prompt = "Explain the difference between a microcontroller and a microprocessor."
messages = [
    {"role": "user", "content": prompt}
]

# Apply chat template
formatted_prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

print("Generating response...")
outputs = generator(formatted_prompt)

# Print the generated text
print("\\n--- RESPONSE ---\\n")
print(outputs[0]["generated_text"][len(formatted_prompt):])
`
  }
];

export function generateMLCode(selection) {
  const config = ML_CONFIGURATIONS.find(
    (c) =>
      c.task === selection.task &&
      c.framework === selection.framework &&
      c.environment === selection.environment
  );

  if (!config) {
    return {
      ok: false,
      error: "UNSUPPORTED_CONFIGURATION",
      code: "",
      notes: [],
      dependencies: []
    };
  }

  try {
    const generatedCode = config.generate();
    return {
      ok: true,
      error: null,
      code: generatedCode,
      notes: config.notes || [],
      dependencies: config.dependencies || [],
      filename: config.filename || "script.py",
      language: config.language || "python"
    };
  } catch (err) {
    return {
      ok: false,
      error: "GENERATION_FAILED",
      code: "",
      notes: [],
      dependencies: []
    };
  }
}

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
            f"Dataset YAML was not found: {path}\n"
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

export const ML_TEMPLATES = [YOLO_DETECTION_TEMPLATE];

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
