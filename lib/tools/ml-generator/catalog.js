const COMMON_SECTION_IDS = Object.freeze([
  "core-configuration",
  "data",
  "model",
  "training",
  "evaluation",
  "export",
]);

const COMMON_PRESET_IDS = Object.freeze(["starter", "production-oriented"]);

const TRAINING_PIPELINE = Object.freeze([
  "configuration-and-seed",
  "input-validation",
  "data-loading",
  "data-inspection",
  "cleaning",
  "preprocessing-and-augmentation",
  "splitting-and-sampling",
  "loader-and-batch-construction",
  "model-construction",
  "training-and-optimization",
  "evaluation-and-error-analysis",
  "export-and-artifact-summary",
]);

function freezeManifest(manifest) {
  return Object.freeze({
    ...manifest,
    supportedDataProfileIds: Object.freeze([...manifest.supportedDataProfileIds]),
    tags: Object.freeze([...manifest.tags]),
    sourceRefs: Object.freeze([...manifest.sourceRefs]),
    pipelineStages: Object.freeze([...manifest.pipelineStages]),
    sectionIds: Object.freeze([...manifest.sectionIds]),
    presetIds: Object.freeze([...manifest.presetIds]),
  });
}

export const ML_RECIPE_CATALOG = Object.freeze([
  freezeManifest({
    id: "yolo-detection-training",
    title: "YOLO Custom Object Detection",
    shortDescription:
      "Train, validate, infer, and export a YOLOv8 detector without writing the API syntax by hand.",
    domainId: "computer-vision",
    taskId: "object-detection",
    supportedDataProfileIds: ["yolo-detection"],
    frameworkId: "ultralytics",
    difficulty: "intermediate",
    tags: ["YOLO", "detection", "bounding boxes", "computer vision", "edge export"],
    normalizedKeywords:
      "yolo custom object detection train validate infer export yolov8 bounding boxes computer vision edge ultralytics",
    sourceRefs: ["ultralytics-docs"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "yolo-detection-training",
  }),
  freezeManifest({
    id: "yolo-segmentation-training",
    title: "YOLO Instance Segmentation",
    shortDescription:
      "Configure a YOLOv8 segmentation workflow with polygon-aware guidance and compatible exports.",
    domainId: "computer-vision",
    taskId: "instance-segmentation",
    supportedDataProfileIds: ["yolo-segmentation"],
    frameworkId: "ultralytics",
    difficulty: "intermediate",
    tags: ["YOLO", "segmentation", "masks", "polygons", "computer vision"],
    normalizedKeywords:
      "yolo instance segmentation yolov8 masks polygons computer vision train validate infer export ultralytics",
    sourceRefs: ["ultralytics-docs"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "yolo-segmentation-training",
  }),
  freezeManifest({
    id: "sensor-timeseries-classification",
    title: "Sensor Time-Series Classification",
    shortDescription:
      "Turn ordered sensor rows into overlapping windows and train a deployable temporal classifier.",
    domainId: "sensor-ai",
    taskId: "sequence-classification",
    supportedDataProfileIds: ["chronological-sensor-csv"],
    frameworkId: "pytorch",
    difficulty: "intermediate",
    tags: ["sensor", "time series", "CNN", "LSTM", "fault detection", "classification"],
    normalizedKeywords:
      "sensor time series classification cnn lstm fault detection chronological csv pytorch edge temporal",
    sourceRefs: ["pytorch-docs", "pytorch-deep-learning"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "sensor-timeseries-classification",
  }),
  freezeManifest({
    id: "edge-image-classification",
    title: "Edge Image Classification",
    shortDescription:
      "Train a compact transfer-learning classifier and export a benchmarkable TFLite artifact.",
    domainId: "deployment",
    taskId: "edge-image-classification",
    supportedDataProfileIds: ["class-directory-images"],
    frameworkId: "tensorflow",
    difficulty: "intermediate",
    tags: ["image classification", "edge", "TensorFlow Lite", "quantization", "transfer learning"],
    normalizedKeywords:
      "edge image classification tensorflow keras tflite quantization transfer learning mobilenet efficientnet",
    sourceRefs: ["tensorflow-docs", "handson-ml3"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "edge-image-classification",
  }),
]);

export function getRecipeManifest(recipeId) {
  return ML_RECIPE_CATALOG.find(({ id }) => id === recipeId) ?? null;
}

export function searchRecipeCatalog(query) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();
  if (!normalizedQuery) return ML_RECIPE_CATALOG;

  return ML_RECIPE_CATALOG.filter((manifest) =>
    manifest.normalizedKeywords.includes(normalizedQuery)
  );
}
