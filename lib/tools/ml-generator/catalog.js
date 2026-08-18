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
    id: "yoloe-open-vocabulary",
    title: "YOLOE-26 Open-Vocabulary Detection",
    shortDescription:
      "Detect and segment classes supplied as plain-language prompts without retraining the model.",
    domainId: "computer-vision",
    taskId: "open-vocabulary-detection",
    supportedDataProfileIds: ["prompted-images"],
    frameworkId: "ultralytics",
    difficulty: "intermediate",
    tags: ["YOLOE-26", "open vocabulary", "text prompts", "detection", "segmentation"],
    normalizedKeywords:
      "yoloe 26 open vocabulary detection segmentation text prompts dynamic classes ultralytics",
    sourceRefs: ["ultralytics-docs"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "yoloe-open-vocabulary",
  }),
  freezeManifest({
    id: "yolo26-monocular-depth",
    title: "YOLO26 Monocular Depth",
    shortDescription:
      "Estimate a dense depth map from one ordinary RGB camera, image, or video source.",
    domainId: "computer-vision",
    taskId: "monocular-depth",
    supportedDataProfileIds: ["rgb-depth-images"],
    frameworkId: "ultralytics",
    difficulty: "intermediate",
    tags: ["YOLO26", "depth", "monocular camera", "robotics", "3D perception"],
    normalizedKeywords:
      "yolo26 monocular depth normal ordinary rgb camera image distance map robotics ultralytics",
    sourceRefs: ["ultralytics-docs"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "yolo26-monocular-depth",
  }),
  freezeManifest({
    id: "unet-semantic-segmentation",
    title: "U-Net Semantic Segmentation",
    shortDescription:
      "Train a complete PyTorch U-Net that assigns one semantic class to every image pixel.",
    domainId: "computer-vision",
    taskId: "semantic-segmentation",
    supportedDataProfileIds: ["semantic-mask-images"],
    frameworkId: "pytorch",
    difficulty: "intermediate",
    tags: ["U-Net", "semantic segmentation", "pixel masks", "PyTorch", "computer vision"],
    normalizedKeywords:
      "unet u-net semantic segmentation pixel masks pytorch medical road defect crop",
    sourceRefs: ["pytorch-docs"],
    pipelineStages: TRAINING_PIPELINE,
    sectionIds: COMMON_SECTION_IDS,
    presetIds: COMMON_PRESET_IDS,
    generatorModuleId: "unet-semantic-segmentation",
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
