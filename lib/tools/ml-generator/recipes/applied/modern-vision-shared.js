const MODEL_SIZE_OPTIONS = [
  { value: "nano", label: "Nano" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra-large" },
];

const MODEL_SIZE_CODES = {
  nano: "n",
  small: "s",
  medium: "m",
  large: "l",
  "extra-large": "x",
};

const IMAGE_SIZE_OPTIONS = [320, 512, 640, 768, 960].map((value) => ({
  value: String(value),
  label: `${value} px`,
}));

function pythonLiteral(value) {
  if (value === true) return "True";
  if (value === false) return "False";
  if (value === null || value === undefined) return "None";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => pythonLiteral(item)).join(", ")}]`;
  }
  return JSON.stringify(String(value));
}

function selectValue(value, options, fallback) {
  const allowed = new Set(options.map(({ value: option }) => option));
  return allowed.has(String(value)) ? String(value) : fallback;
}

function finiteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizedPath(value, fallback) {
  const path = String(value ?? "").trim();
  return path || fallback;
}

function parsePrompts(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

const ULTRALYTICS_DEPENDENCIES = [
  { package: "ultralytics", version: ">=8.4,<9", purpose: "YOLO26 and YOLOE model execution" },
  { package: "torch", version: ">=2.3,<3", purpose: "Model execution and acceleration" },
  { package: "opencv-python", version: ">=4.10,<5", purpose: "Images, cameras, and result output" },
];

const YOLOE_DEFAULTS = {
  starter: {
    modelSize: "small",
    classPrompts: "workshop helmet, safety glasses, circuit board, damaged connector",
    sourcePath: "./workshop.jpg",
    imageSize: "640",
    confidence: 0.25,
    outputDirectory: "./runs/open_vocabulary",
  },
  production: {
    modelSize: "medium",
    classPrompts: "workshop helmet, safety glasses, circuit board, damaged connector",
    sourcePath: "./workshop.jpg",
    imageSize: "640",
    confidence: 0.3,
    outputDirectory: "./runs/open_vocabulary",
  },
};

function normalizeYoloe(input, mode) {
  const defaults = YOLOE_DEFAULTS[mode === "production" ? "production" : "starter"];
  const config = { ...defaults, ...(input ?? {}) };
  config.modelSize = selectValue(config.modelSize, MODEL_SIZE_OPTIONS, defaults.modelSize);
  config.imageSize = selectValue(config.imageSize, IMAGE_SIZE_OPTIONS, defaults.imageSize);
  config.classPrompts = parsePrompts(config.classPrompts).join(", ");
  config.sourcePath = normalizedPath(config.sourcePath, defaults.sourcePath);
  config.outputDirectory = normalizedPath(config.outputDirectory, defaults.outputDirectory);
  config.confidence = finiteNumber(config.confidence, defaults.confidence);
  return config;
}

function validateYoloe(config) {
  const errors = {};
  if (parsePrompts(config.classPrompts).length === 0) {
    errors.classPrompts = "Enter at least one class prompt.";
  }
  if (config.confidence < 0 || config.confidence > 1) {
    errors.confidence = "Confidence must be between 0 and 1.";
  }
  return errors;
}

function generateYoloe(config) {
  const model = `yoloe-26${MODEL_SIZE_CODES[config.modelSize] ?? "s"}-seg.pt`;
  const prompts = parsePrompts(config.classPrompts);
  return `"""Prompted detection and segmentation with Ultralytics YOLOE-26."""
from pathlib import Path

from ultralytics import YOLOE


CONFIG = {
    "model": ${pythonLiteral(model)},
    "classes": ${pythonLiteral(prompts)},
    "source": ${pythonLiteral(config.sourcePath)},
    "image_size": ${pythonLiteral(Number(config.imageSize))},
    "confidence": ${pythonLiteral(config.confidence)},
    "output_directory": ${pythonLiteral(config.outputDirectory)},
}


def main() -> None:
    source = Path(CONFIG["source"]).expanduser()
    if not source.exists():
        raise FileNotFoundError(f"Image or video source not found: {source}")
    output_directory = Path(CONFIG["output_directory"])
    output_directory.mkdir(parents=True, exist_ok=True)

    model = YOLOE(CONFIG["model"])
    model.set_classes(CONFIG["classes"])
    results = model.predict(
        source=str(source),
        imgsz=CONFIG["image_size"],
        conf=CONFIG["confidence"],
        save=True,
        project=str(output_directory),
        name="prompted_results",
        exist_ok=True,
    )
    detections = sum(0 if result.boxes is None else len(result.boxes) for result in results)
    print(f"Prompted classes: {', '.join(CONFIG['classes'])}")
    print(f"Detections: {detections}")
    print(f"Saved results under: {output_directory.resolve()}")


if __name__ == "__main__":
    main()
`;
}

export const YOLOE_OPEN_VOCABULARY_TEMPLATE = {
  id: "yoloe-open-vocabulary",
  fields: [
    { id: "sourcePath", label: "Image or video", inputType: "text", modes: ["starter", "production"], helpText: "Path to the scene you want to inspect." },
    { id: "classPrompts", label: "Objects to find", inputType: "text", modes: ["starter", "production"], helpText: "Comma-separated plain-language prompts such as workshop helmet or damaged connector." },
    { id: "imageSize", label: "Image size", inputType: "select", modes: ["starter", "production"], options: IMAGE_SIZE_OPTIONS, helpText: "Inference resolution." },
    { id: "modelSize", label: "YOLOE-26 size", inputType: "select", modes: ["starter", "production"], options: MODEL_SIZE_OPTIONS.slice(1, 4), helpText: "Larger models need more memory." },
    { id: "confidence", label: "Confidence", inputType: "number", modes: ["starter", "production"], min: 0, max: 1, step: 0.01, helpText: "Minimum score retained in the results." },
    { id: "outputDirectory", label: "Output directory", inputType: "text", modes: ["starter", "production"], helpText: "Directory for annotated results." },
  ],
  defaults: YOLOE_DEFAULTS,
  normalize: normalizeYoloe,
  validate: validateYoloe,
  generate: generateYoloe,
  filename: () => "detect_prompted_objects.py",
  dependencies: ULTRALYTICS_DEPENDENCIES,
  dataset: { title: "Prompted scene", summary: "An image or video plus class names expressed as text.", structure: "project/\n  workshop.jpg\n  detect_prompted_objects.py" },
  metrics: ["Detection count", "Confidence", "Per-class results", "Inference time"],
  hardware: { minimum: "Modern CPU and 8 GB RAM for a small image.", recommended: "CUDA-capable GPU for video or medium/large models." },
  deployment: ["Python inference", "Saved annotated images and video"],
  notes: ["Text prompts can change between runs without retraining."],
  warnings: ["Open-vocabulary results still require review on your real camera and environment."],
  getWarnings: () => [],
  getReadiness: (config) => ({ source: config.sourcePath ? "configured" : "blocked", prompts: parsePrompts(config.classPrompts).length > 0 ? "configured" : "blocked" }),
};

const DEPTH_DEFAULTS = {
  starter: {
    sourceMode: "image",
    sourcePath: "./room.jpg",
    cameraIndex: 0,
    modelSize: "nano",
    imageSize: "768",
    outputPath: "./depth_output",
  },
  production: {
    sourceMode: "camera",
    sourcePath: "./room.jpg",
    cameraIndex: 0,
    modelSize: "small",
    imageSize: "768",
    outputPath: "./depth_output",
  },
};

const SOURCE_MODE_OPTIONS = [
  { value: "image", label: "Image or video file" },
  { value: "camera", label: "Ordinary RGB camera" },
];

function normalizeDepth(input, mode) {
  const defaults = DEPTH_DEFAULTS[mode === "production" ? "production" : "starter"];
  const config = { ...defaults, ...(input ?? {}) };
  config.sourceMode = selectValue(config.sourceMode, SOURCE_MODE_OPTIONS, defaults.sourceMode);
  config.modelSize = selectValue(config.modelSize, MODEL_SIZE_OPTIONS, defaults.modelSize);
  config.imageSize = selectValue(config.imageSize, IMAGE_SIZE_OPTIONS, defaults.imageSize);
  config.sourcePath = normalizedPath(config.sourcePath, defaults.sourcePath);
  config.outputPath = normalizedPath(config.outputPath, defaults.outputPath);
  config.cameraIndex = Math.max(0, Math.trunc(finiteNumber(config.cameraIndex, defaults.cameraIndex)));
  return config;
}

function validateDepth(config) {
  const errors = {};
  if (config.sourceMode === "image" && !config.sourcePath) {
    errors.sourcePath = "Choose an image or video source.";
  }
  return errors;
}

function generateDepth(config) {
  const model = `yolo26${MODEL_SIZE_CODES[config.modelSize] ?? "n"}-depth.pt`;
  return `"""Dense monocular depth from an ordinary RGB image, video, or camera."""
from pathlib import Path

import cv2
from ultralytics import YOLO
from ultralytics.utils.plotting import colorize_depth


CONFIG = {
    "model": ${pythonLiteral(model)},
    "source_mode": ${pythonLiteral(config.sourceMode)},
    "source_path": ${pythonLiteral(config.sourcePath)},
    "camera_index": ${pythonLiteral(config.cameraIndex)},
    "image_size": ${pythonLiteral(Number(config.imageSize))},
    "output_path": ${pythonLiteral(config.outputPath)},
}


def save_depth(result, destination: Path, frame_number: int) -> None:
    depth = result.depth.data.cpu().numpy()
    colored = colorize_depth(depth, cmap="spectral")
    filename = destination / f"depth_{frame_number:05d}.png"
    if not cv2.imwrite(str(filename), colored):
        raise RuntimeError(f"Could not save depth map: {filename}")
    print(
        f"{filename.name}: min={float(depth.min()):.3f} m, "
        f"max={float(depth.max()):.3f} m"
    )


def main() -> None:
    destination = Path(CONFIG["output_path"])
    destination.mkdir(parents=True, exist_ok=True)
    model = YOLO(CONFIG["model"])

    if CONFIG["source_mode"] == "camera":
        source = int(CONFIG["camera_index"])
        results = model.predict(source=source, imgsz=CONFIG["image_size"], stream=True)
        for frame_number, result in enumerate(results):
            save_depth(result, destination, frame_number)
            if frame_number >= 299:
                break
    else:
        source = Path(CONFIG["source_path"]).expanduser()
        if not source.exists():
            raise FileNotFoundError(f"Image or video source not found: {source}")
        results = model.predict(source=str(source), imgsz=CONFIG["image_size"], stream=False)
        for frame_number, result in enumerate(results):
            save_depth(result, destination, frame_number)

    print(f"Depth maps saved under: {destination.resolve()}")


if __name__ == "__main__":
    main()
`;
}

export const YOLO26_DEPTH_TEMPLATE = {
  id: "yolo26-monocular-depth",
  fields: [
    { id: "sourceMode", label: "Source", inputType: "select", modes: ["starter", "production"], options: SOURCE_MODE_OPTIONS, helpText: "Use a file or a normal RGB webcam." },
    { id: "sourcePath", label: "Image or video", inputType: "text", modes: ["starter", "production"], visibleWhen: ({ sourceMode }) => sourceMode === "image", helpText: "Path to an RGB image or video." },
    { id: "cameraIndex", label: "Camera index", inputType: "number", modes: ["starter", "production"], min: 0, max: 16, step: 1, visibleWhen: ({ sourceMode }) => sourceMode === "camera", helpText: "Usually zero for the built-in or first USB camera." },
    { id: "imageSize", label: "Image size", inputType: "select", modes: ["starter", "production"], options: IMAGE_SIZE_OPTIONS, helpText: "YOLO26 depth weights are optimized around 768 px." },
    { id: "modelSize", label: "YOLO26 depth size", inputType: "select", modes: ["starter", "production"], options: MODEL_SIZE_OPTIONS, helpText: "Nano is the quickest starting point." },
    { id: "outputPath", label: "Depth output", inputType: "text", modes: ["starter", "production"], helpText: "Directory for colorized depth maps." },
  ],
  defaults: DEPTH_DEFAULTS,
  normalize: normalizeDepth,
  validate: validateDepth,
  generate: generateDepth,
  filename: () => "estimate_monocular_depth.py",
  dependencies: ULTRALYTICS_DEPENDENCIES,
  dataset: { title: "Ordinary RGB source", summary: "A single image, video, or RGB camera; no stereo camera is required for inference.", structure: "project/\n  room.jpg\n  estimate_monocular_depth.py" },
  metrics: ["Per-pixel depth in meters", "Minimum depth", "Maximum depth", "Inference time"],
  hardware: { minimum: "Modern CPU and 8 GB RAM with the nano model.", recommended: "CUDA-capable GPU for live camera throughput." },
  deployment: ["Python image inference", "RGB camera stream", "Colorized PNG depth maps"],
  notes: ["Monocular depth estimates distance from one RGB view; validate accuracy in your physical scene."],
  warnings: ["Do not use unvalidated monocular depth as the only safety sensor in a critical system."],
  getWarnings: () => [],
  getReadiness: (config) => ({ source: config.sourceMode === "camera" || config.sourcePath ? "configured" : "blocked", output: config.outputPath ? "configured" : "blocked" }),
};

const UNET_DEFAULTS = {
  starter: {
    datasetDirectory: "./segmentation_dataset",
    sampleImagePath: "./segmentation_dataset/images/sample.png",
    imageSize: "320",
    numClasses: 3,
    baseChannels: 32,
    validationFraction: 0.2,
    epochs: 20,
    batchSize: 4,
    learningRate: 0.001,
    seed: 42,
    checkpointPath: "./artifacts/best_unet.pt",
    predictionPath: "./artifacts/sample_mask.png",
  },
  production: {
    datasetDirectory: "./segmentation_dataset",
    sampleImagePath: "./segmentation_dataset/images/sample.png",
    imageSize: "512",
    numClasses: 3,
    baseChannels: 64,
    validationFraction: 0.2,
    epochs: 80,
    batchSize: 8,
    learningRate: 0.0003,
    seed: 42,
    checkpointPath: "./artifacts/best_unet.pt",
    predictionPath: "./artifacts/sample_mask.png",
  },
};

function normalizeUnet(input, mode) {
  const defaults = UNET_DEFAULTS[mode === "production" ? "production" : "starter"];
  const config = { ...defaults, ...(input ?? {}) };
  for (const key of ["numClasses", "baseChannels", "epochs", "batchSize", "seed"]) {
    config[key] = Math.trunc(finiteNumber(config[key], defaults[key]));
  }
  config.learningRate = finiteNumber(config.learningRate, defaults.learningRate);
  config.validationFraction = finiteNumber(config.validationFraction, defaults.validationFraction);
  config.imageSize = selectValue(config.imageSize, IMAGE_SIZE_OPTIONS, defaults.imageSize);
  for (const key of ["datasetDirectory", "sampleImagePath", "checkpointPath", "predictionPath"]) {
    config[key] = normalizedPath(config[key], defaults[key]);
  }
  return config;
}

function validateUnet(config) {
  const errors = {};
  if (config.numClasses < 2 || config.numClasses > 256) errors.numClasses = "Classes must be between 2 and 256.";
  if (config.baseChannels < 8 || config.baseChannels > 256) errors.baseChannels = "Base channels must be between 8 and 256.";
  if (config.epochs < 1) errors.epochs = "Epochs must be at least 1.";
  if (config.batchSize < 1) errors.batchSize = "Batch size must be at least 1.";
  if (config.learningRate <= 0 || config.learningRate > 1) errors.learningRate = "Learning rate must be greater than 0 and at most 1.";
  if (config.validationFraction <= 0 || config.validationFraction >= 0.5) errors.validationFraction = "Validation fraction must be greater than 0 and less than 0.5.";
  return errors;
}

function generateUnet(config) {
  return `"""Complete PyTorch U-Net workflow for semantic segmentation."""
import random
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision.transforms import functional as TF


CONFIG = {
    "dataset_directory": ${pythonLiteral(config.datasetDirectory)},
    "sample_image_path": ${pythonLiteral(config.sampleImagePath)},
    "image_size": ${pythonLiteral(Number(config.imageSize))},
    "num_classes": ${pythonLiteral(config.numClasses)},
    "base_channels": ${pythonLiteral(config.baseChannels)},
    "validation_fraction": ${pythonLiteral(config.validationFraction)},
    "epochs": ${pythonLiteral(config.epochs)},
    "batch_size": ${pythonLiteral(config.batchSize)},
    "learning_rate": ${pythonLiteral(config.learningRate)},
    "seed": ${pythonLiteral(config.seed)},
    "checkpoint_path": ${pythonLiteral(config.checkpointPath)},
    "prediction_path": ${pythonLiteral(config.predictionPath)},
}


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class SegmentationDataset(Dataset):
    def __init__(self, root: Path, image_size: int) -> None:
        self.image_directory = root / "images"
        self.mask_directory = root / "masks"
        self.image_size = image_size
        if not self.image_directory.is_dir() or not self.mask_directory.is_dir():
            raise FileNotFoundError("Dataset needs images/ and masks/ directories.")
        self.images = sorted(path for path in self.image_directory.iterdir() if path.is_file())
        self.pairs = [(image, self.mask_directory / image.name) for image in self.images]
        self.pairs = [(image, mask) for image, mask in self.pairs if mask.is_file()]
        if not self.pairs:
            raise ValueError("No image/mask pairs with matching filenames were found.")

    def __len__(self) -> int:
        return len(self.pairs)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        image_path, mask_path = self.pairs[index]
        image = Image.open(image_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")
        image = TF.resize(image, [self.image_size, self.image_size], antialias=True)
        mask = TF.resize(mask, [self.image_size, self.image_size], interpolation=TF.InterpolationMode.NEAREST)
        image_tensor = TF.to_tensor(image)
        mask_tensor = torch.from_numpy(np.asarray(mask, dtype=np.int64).copy()).long()
        if int(mask_tensor.max()) >= CONFIG["num_classes"]:
            raise ValueError(f"Mask {mask_path} contains a class index outside num_classes.")
        return image_tensor, mask_tensor


class DoubleConv(nn.Module):
    def __init__(self, input_channels: int, output_channels: int) -> None:
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(input_channels, output_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(output_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(output_channels, output_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(output_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.block(inputs)


class UNet(nn.Module):
    def __init__(self, num_classes: int, base_channels: int) -> None:
        super().__init__()
        b = base_channels
        self.pool = nn.MaxPool2d(2)
        self.encoder1 = DoubleConv(3, b)
        self.encoder2 = DoubleConv(b, b * 2)
        self.encoder3 = DoubleConv(b * 2, b * 4)
        self.bridge = DoubleConv(b * 4, b * 8)
        self.up3 = nn.ConvTranspose2d(b * 8, b * 4, 2, stride=2)
        self.decoder3 = DoubleConv(b * 8, b * 4)
        self.up2 = nn.ConvTranspose2d(b * 4, b * 2, 2, stride=2)
        self.decoder2 = DoubleConv(b * 4, b * 2)
        self.up1 = nn.ConvTranspose2d(b * 2, b, 2, stride=2)
        self.decoder1 = DoubleConv(b * 2, b)
        self.head = nn.Conv2d(b, num_classes, 1)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        e1 = self.encoder1(inputs)
        e2 = self.encoder2(self.pool(e1))
        e3 = self.encoder3(self.pool(e2))
        bridge = self.bridge(self.pool(e3))
        d3 = self.decoder3(torch.cat([self.up3(bridge), e3], dim=1))
        d2 = self.decoder2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.decoder1(torch.cat([self.up1(d2), e1], dim=1))
        return self.head(d1)


def mean_iou(logits: torch.Tensor, targets: torch.Tensor, num_classes: int) -> float:
    predictions = logits.argmax(dim=1)
    scores = []
    for class_index in range(num_classes):
        predicted = predictions == class_index
        actual = targets == class_index
        union = (predicted | actual).sum().item()
        if union:
            scores.append((predicted & actual).sum().item() / union)
    return float(np.mean(scores)) if scores else 0.0


def train_epoch(model, loader, optimizer, criterion, device) -> float:
    model.train()
    total_loss = 0.0
    for images, masks in loader:
        images, masks = images.to(device), masks.to(device)
        optimizer.zero_grad(set_to_none=True)
        loss = criterion(model(images), masks)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(loader.dataset)


@torch.no_grad()
def evaluate(model, loader, criterion, device) -> tuple[float, float]:
    model.eval()
    total_loss = 0.0
    total_iou = 0.0
    for images, masks in loader:
        images, masks = images.to(device), masks.to(device)
        logits = model(images)
        total_loss += criterion(logits, masks).item() * images.size(0)
        total_iou += mean_iou(logits, masks, CONFIG["num_classes"]) * images.size(0)
    count = len(loader.dataset)
    return total_loss / count, total_iou / count


@torch.no_grad()
def predict_mask(model, image_path: Path, output_path: Path, device) -> None:
    image = Image.open(image_path).convert("RGB")
    resized = TF.resize(image, [CONFIG["image_size"], CONFIG["image_size"]], antialias=True)
    tensor = TF.to_tensor(resized).unsqueeze(0).to(device)
    mask = model(tensor).argmax(dim=1).squeeze(0).byte().cpu().numpy()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(mask).save(output_path)


def main() -> None:
    set_seed(CONFIG["seed"])
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dataset = SegmentationDataset(Path(CONFIG["dataset_directory"]), CONFIG["image_size"])
    validation_count = max(1, round(len(dataset) * CONFIG["validation_fraction"]))
    training_count = len(dataset) - validation_count
    if training_count < 1:
        raise ValueError("Add more image/mask pairs so both training and validation are non-empty.")
    generator = torch.Generator().manual_seed(CONFIG["seed"])
    train_data, validation_data = random_split(dataset, [training_count, validation_count], generator=generator)
    train_loader = DataLoader(train_data, batch_size=CONFIG["batch_size"], shuffle=True)
    validation_loader = DataLoader(validation_data, batch_size=CONFIG["batch_size"], shuffle=False)

    model = UNet(CONFIG["num_classes"], CONFIG["base_channels"]).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=CONFIG["learning_rate"])
    criterion = nn.CrossEntropyLoss()
    checkpoint = Path(CONFIG["checkpoint_path"])
    checkpoint.parent.mkdir(parents=True, exist_ok=True)
    best_iou = -1.0

    for epoch in range(1, CONFIG["epochs"] + 1):
        train_loss = train_epoch(model, train_loader, optimizer, criterion, device)
        validation_loss, validation_iou = evaluate(model, validation_loader, criterion, device)
        print(f"epoch={epoch:03d} train_loss={train_loss:.4f} val_loss={validation_loss:.4f} mean_iou={validation_iou:.4f}")
        if validation_iou > best_iou:
            best_iou = validation_iou
            torch.save(model.state_dict(), checkpoint)

    model.load_state_dict(torch.load(checkpoint, map_location=device, weights_only=True))
    sample = Path(CONFIG["sample_image_path"])
    if sample.is_file():
        predict_mask(model, sample, Path(CONFIG["prediction_path"]), device)
    print(f"Best mean IoU: {best_iou:.4f}")
    print(f"Checkpoint: {checkpoint.resolve()}")


if __name__ == "__main__":
    main()
`;
}

export const UNET_SEMANTIC_SEGMENTATION_TEMPLATE = {
  id: "unet-semantic-segmentation",
  fields: [
    { id: "datasetDirectory", label: "Dataset directory", inputType: "text", modes: ["starter", "production"], helpText: "Folder containing images/ and masks/ with matching filenames." },
    { id: "sampleImagePath", label: "Prediction example", inputType: "text", modes: ["starter", "production"], helpText: "An image used to demonstrate mask prediction after training." },
    { id: "validationFraction", label: "Validation fraction", inputType: "number", modes: ["starter", "production"], min: 0.05, max: 0.49, step: 0.05, helpText: "Part of the dataset reserved for honest validation." },
    { id: "imageSize", label: "Image size", inputType: "select", modes: ["starter", "production"], options: IMAGE_SIZE_OPTIONS, helpText: "Square training resolution." },
    { id: "numClasses", label: "Semantic classes", inputType: "number", modes: ["starter", "production"], min: 2, max: 256, step: 1, helpText: "Includes the background class." },
    { id: "baseChannels", label: "Base channels", inputType: "number", modes: ["starter", "production"], min: 8, max: 256, step: 8, helpText: "Controls U-Net capacity and memory use." },
    { id: "epochs", label: "Epochs", inputType: "number", modes: ["starter", "production"], min: 1, max: 500, step: 1, helpText: "Complete passes through the training images." },
    { id: "batchSize", label: "Batch size", inputType: "number", modes: ["starter", "production"], min: 1, max: 64, step: 1, helpText: "Reduce this if accelerator memory is limited." },
    { id: "learningRate", label: "Learning rate", inputType: "number", modes: ["starter", "production"], min: 0.000001, max: 1, step: 0.0001, helpText: "AdamW optimizer step size." },
    { id: "seed", label: "Random seed", inputType: "number", modes: ["starter", "production"], min: 0, max: 2147483647, step: 1, helpText: "Keeps the split and initialization repeatable." },
    { id: "checkpointPath", label: "Best checkpoint", inputType: "text", modes: ["starter", "production"], helpText: "Where the highest validation-IoU weights are saved." },
    { id: "predictionPath", label: "Example mask output", inputType: "text", modes: ["starter", "production"], helpText: "Where the predicted class-index mask is saved." },
  ],
  defaults: UNET_DEFAULTS,
  normalize: normalizeUnet,
  validate: validateUnet,
  generate: generateUnet,
  filename: () => "train_unet_semantic_segmentation.py",
  dependencies: [
    { package: "torch", version: ">=2.3,<3", purpose: "U-Net training and inference" },
    { package: "torchvision", version: ">=0.18,<1", purpose: "Image and mask resizing" },
    { package: "Pillow", version: ">=10,<12", purpose: "Image and indexed-mask files" },
    { package: "numpy", version: ">=1.26,<3", purpose: "Mask arrays and mean IoU" },
  ],
  dataset: { title: "Semantic image masks", summary: "RGB images paired with single-channel masks whose pixel values are class indices.", structure: "segmentation_dataset/\n  images/\n    sample.png\n  masks/\n    sample.png" },
  metrics: ["Cross-entropy loss", "Mean Intersection over Union", "Best validation checkpoint"],
  hardware: { minimum: "Modern CPU and 8 GB RAM at 320 px with a small U-Net.", recommended: "CUDA GPU with at least 8 GB VRAM for 512 px training." },
  deployment: ["PyTorch checkpoint", "Indexed PNG prediction mask"],
  notes: ["Mask pixel values must be integer class indices from 0 through num_classes - 1."],
  warnings: ["A random split is only appropriate when related scenes or subjects cannot leak across the split."],
  getWarnings: () => [],
  getReadiness: (config) => ({ dataset: config.datasetDirectory ? "configured" : "blocked", checkpoint: config.checkpointPath ? "configured" : "blocked" }),
};
