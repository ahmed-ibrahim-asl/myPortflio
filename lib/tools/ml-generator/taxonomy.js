function freezeRecords(records) {
  return Object.freeze(
    records.map((record) => Object.freeze({
      ...record,
      ...(record.taskFamilyIds
        ? { taskFamilyIds: Object.freeze([...record.taskFamilyIds]) }
        : {}),
    })),
  );
}

export const ML_DOMAINS = freezeRecords([
  {
    id: "data-preparation",
    label: "Data Preparation",
    taskFamilyIds: ["inspect", "clean", "transform", "split", "export-clean-data"],
  },
  {
    id: "tabular-ml",
    label: "Tabular ML",
    taskFamilyIds: ["regression", "binary-classification", "multiclass-classification", "multilabel-classification"],
  },
  {
    id: "classical-ml",
    label: "Classical ML",
    taskFamilyIds: ["linear-models", "neighbors", "bayes", "svm", "trees", "ensembles", "dimensionality-reduction"],
  },
  {
    id: "classical-ai",
    label: "Classical AI",
    taskFamilyIds: ["graph-search", "adversarial-search", "knowledge-representation", "probabilistic-inference", "constraint-optimization"],
  },
  {
    id: "unsupervised-ml",
    label: "Unsupervised ML",
    taskFamilyIds: ["clustering", "anomaly-detection", "density-estimation", "semi-supervised-learning"],
  },
  {
    id: "computer-vision",
    label: "Computer Vision",
    taskFamilyIds: ["image-classification", "object-detection", "segmentation", "transfer-learning", "vision-transformers"],
  },
  {
    id: "time-series",
    label: "Time Series",
    taskFamilyIds: ["forecasting", "sequence-classification", "anomaly-detection", "window-preparation"],
  },
  {
    id: "nlp",
    label: "Text and NLP",
    taskFamilyIds: ["text-classification", "sequence-modeling", "translation", "attention", "transformers"],
  },
  {
    id: "llm-applications",
    label: "LLM Applications",
    taskFamilyIds: ["embeddings", "semantic-search", "rag", "text-generation", "local-inference", "fine-tuning", "multimodal-workflows"],
  },
  {
    id: "audio",
    label: "Audio ML",
    taskFamilyIds: ["classification", "feature-extraction", "preparation"],
  },
  {
    id: "generative-ai",
    label: "Generative Models",
    taskFamilyIds: ["autoencoders", "variational-autoencoders", "gans", "diffusion"],
  },
  {
    id: "reinforcement-learning",
    label: "Reinforcement Learning",
    taskFamilyIds: ["policy-learning", "value-learning", "environment-evaluation"],
  },
  {
    id: "deployment",
    label: "Export and Deployment",
    taskFamilyIds: ["model-export", "inference-app", "experiment-tracking", "distributed-runtime-preparation"],
  },
  {
    id: "sensor-ai",
    label: "Sensor AI / Robotics",
    taskFamilyIds: ["fault-detection", "fault-diagnosis", "predictive-maintenance", "remaining-useful-life", "sensor-classification", "anomaly-detection", "edge-inference"],
  },
]);

export const ML_TASKS = freezeRecords([
  {
    id: "object-detection",
    domainId: "computer-vision",
    label: "Object detection",
  },
  {
    id: "instance-segmentation",
    domainId: "computer-vision",
    label: "Instance segmentation",
  },
  {
    id: "sequence-classification",
    domainId: "sensor-ai",
    label: "Sensor sequence classification",
  },
  {
    id: "edge-image-classification",
    domainId: "deployment",
    label: "Edge image classification",
  },
]);

export const ML_DATA_PROFILES = freezeRecords([
  {
    id: "yolo-detection",
    label: "YOLO detection dataset",
    dataType: "images-and-bounding-boxes",
  },
  {
    id: "yolo-segmentation",
    label: "YOLO instance-segmentation dataset",
    dataType: "images-and-polygons",
  },
  {
    id: "chronological-sensor-csv",
    label: "Chronological sensor CSV",
    dataType: "time-series-table",
  },
  {
    id: "class-directory-images",
    label: "Class-directory image dataset",
    dataType: "image-directories",
  },
]);

export const ML_FRAMEWORKS = freezeRecords([
  { id: "ultralytics", label: "Ultralytics YOLO", language: "python" },
  { id: "pytorch", label: "PyTorch", language: "python" },
  { id: "tensorflow", label: "TensorFlow / Keras", language: "python" },
]);

export const ML_PIPELINE_STAGES = freezeRecords([
  { id: "configuration-and-seed", label: "Configuration and seed setup" },
  { id: "input-validation", label: "Input validation" },
  { id: "data-loading", label: "Data loading" },
  { id: "data-inspection", label: "Data inspection" },
  { id: "cleaning", label: "Cleaning" },
  { id: "preprocessing-and-augmentation", label: "Preprocessing and augmentation" },
  { id: "splitting-and-sampling", label: "Splitting and sampling" },
  { id: "loader-and-batch-construction", label: "Loader and batch construction" },
  { id: "model-construction", label: "Model construction" },
  { id: "training-and-optimization", label: "Training and optimization" },
  { id: "evaluation-and-error-analysis", label: "Evaluation and error analysis" },
  { id: "export-and-artifact-summary", label: "Export and artifact summary" },
]);

export const ML_SECTIONS = freezeRecords([
  { id: "core-configuration", label: "Core configuration" },
  { id: "data", label: "Data" },
  { id: "model", label: "Model" },
  { id: "training", label: "Training" },
  { id: "evaluation", label: "Evaluation" },
  { id: "export", label: "Export" },
]);

export const ML_PRESETS = freezeRecords([
  { id: "starter", label: "Starter", mode: "starter" },
  {
    id: "production-oriented",
    label: "Production-oriented",
    mode: "production",
  },
]);
