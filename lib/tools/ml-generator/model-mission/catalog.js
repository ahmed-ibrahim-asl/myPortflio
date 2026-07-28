function freezeRecord(record) {
  return Object.freeze({
    ...record,
    examples: Object.freeze([...(record.examples ?? [])]),
  });
}

export const MODEL_MISSION_STEPS = Object.freeze([
  freezeRecord({ id: "goal", shortLabel: "Goal", label: "Choose the goal" }),
  freezeRecord({ id: "data", shortLabel: "Data", label: "Choose the data" }),
  freezeRecord({ id: "inspect", shortLabel: "Inspect", label: "Inspect the data" }),
  freezeRecord({ id: "split", shortLabel: "Split", label: "Split safely" }),
  freezeRecord({ id: "prepare", shortLabel: "Prepare", label: "Prepare features" }),
  freezeRecord({ id: "model", shortLabel: "Model", label: "Choose the model" }),
  freezeRecord({ id: "train", shortLabel: "Train", label: "Configure training" }),
  freezeRecord({ id: "evaluate", shortLabel: "Evaluate", label: "Evaluate results" }),
  freezeRecord({ id: "generate", shortLabel: "Generate", label: "Generate Python" }),
]);

export const MODEL_MISSION_STEP_IDS = Object.freeze(
  MODEL_MISSION_STEPS.map(({ id }) => id),
);

export const MODEL_MISSION_TASKS = Object.freeze([
  freezeRecord({
    id: "classification",
    order: 1,
    level: "beginner",
    title: "Predict a category",
    technicalTerm: "Classification",
    description: "Predict one label from two or more possible categories.",
    examples: ["fault type", "pass or fail", "species"],
    modality: "Tabular data",
    adapterId: "classical",
    adapterTask: "classification",
    recipeId: null,
  }),
  freezeRecord({
    id: "regression",
    order: 2,
    level: "beginner",
    title: "Predict a number",
    technicalTerm: "Regression",
    description: "Predict a continuous value such as lifetime, demand, or price.",
    examples: ["remaining life", "energy use", "temperature"],
    modality: "Tabular data",
    adapterId: "classical",
    adapterTask: "regression",
    recipeId: null,
  }),
  freezeRecord({
    id: "sensor-classification",
    order: 3,
    level: "intermediate",
    title: "Classify sensor data",
    technicalTerm: "Time-Series Classification",
    description: "Turn ordered measurements into windows and predict their state.",
    examples: ["fault detection", "activity recognition", "machine condition"],
    modality: "Sensor sequences",
    adapterId: "legacy",
    adapterTask: "sequence-classification",
    recipeId: "sensor-timeseries-classification",
  }),
  freezeRecord({
    id: "image-classification",
    order: 4,
    level: "intermediate",
    title: "Classify images",
    technicalTerm: "Edge Image Classification",
    description: "Train an image classifier and export it for compact devices.",
    examples: ["visual inspection", "plant disease", "product category"],
    modality: "Image folders",
    adapterId: "legacy",
    adapterTask: "edge-image-classification",
    recipeId: "edge-image-classification",
  }),
  freezeRecord({
    id: "object-detection",
    order: 5,
    level: "advanced",
    title: "Detect objects",
    technicalTerm: "YOLO Object Detection",
    description: "Locate and classify multiple objects with bounding boxes.",
    examples: ["defect location", "traffic objects", "inventory counting"],
    modality: "Images with boxes",
    adapterId: "legacy",
    adapterTask: "object-detection",
    recipeId: "yolo-detection-training",
  }),
  freezeRecord({
    id: "instance-segmentation",
    order: 6,
    level: "advanced",
    title: "Segment objects",
    technicalTerm: "YOLO Instance Segmentation",
    description: "Predict a precise mask for every detected object.",
    examples: ["surface area", "medical regions", "part boundaries"],
    modality: "Images with polygons",
    adapterId: "legacy",
    adapterTask: "instance-segmentation",
    recipeId: "yolo-segmentation-training",
  }),
  freezeRecord({
    id: "neural-network",
    order: 7,
    level: "advanced",
    title: "Design a neural network",
    technicalTerm: "Sequential Neural Network",
    description: "Arrange compatible layers and translate the design into code.",
    examples: ["custom MLP", "CNN", "Conv1D or LSTM"],
    modality: "Configurable tensor",
    adapterId: "neural",
    adapterTask: "tabular-mlp",
    recipeId: null,
  }),
]);

export const MODEL_MISSION_TASK_IDS = Object.freeze(
  MODEL_MISSION_TASKS.map(({ id }) => id),
);

const YOLO_STEP_FIELDS = Object.freeze({
  data: Object.freeze(["datasetYaml", "sourcePath"]),
  inspect: Object.freeze(["cacheDataset"]),
  split: Object.freeze([]),
  prepare: Object.freeze(["imageSize"]),
  model: Object.freeze(["task", "modelSize"]),
  train: Object.freeze([
    "environment",
    "epochs",
    "batchSize",
    "device",
    "optimizer",
    "learningRate",
    "weightDecay",
    "momentum",
    "warmupEpochs",
    "freezeLayers",
    "deterministic",
    "patience",
    "workers",
    "seed",
    "useAmp",
  ]),
  evaluate: Object.freeze([
    "validationConfidence",
    "predictionConfidence",
    "iouThreshold",
  ]),
  generate: Object.freeze([
    "exportFormat",
    "runName",
    "projectDirectory",
    "exportInt8",
  ]),
});

export const LEGACY_STEP_FIELDS = Object.freeze({
  "yolo-detection-training": YOLO_STEP_FIELDS,
  "yolo-segmentation-training": YOLO_STEP_FIELDS,
  "sensor-timeseries-classification": Object.freeze({
    data: Object.freeze([
      "datasetPath",
      "featureColumns",
      "labelColumn",
      "sampleRateHz",
    ]),
    inspect: Object.freeze([]),
    split: Object.freeze(["validationFraction", "testFraction"]),
    prepare: Object.freeze(["windowSize", "windowStride"]),
    model: Object.freeze(["task", "model", "modelSize"]),
    train: Object.freeze([
      "environment",
      "epochs",
      "batchSize",
      "learningRate",
      "patience",
      "dropout",
      "device",
      "seed",
      "workers",
    ]),
    evaluate: Object.freeze([]),
    generate: Object.freeze(["exportFormat", "checkpointPath"]),
  }),
  "edge-image-classification": Object.freeze({
    data: Object.freeze(["datasetDirectory", "sampleImagePath"]),
    inspect: Object.freeze([]),
    split: Object.freeze(["validationFraction"]),
    prepare: Object.freeze(["inputSize"]),
    model: Object.freeze(["task", "model"]),
    train: Object.freeze([
      "environment",
      "epochs",
      "batchSize",
      "learningRate",
      "patience",
      "dropout",
      "seed",
      "fineTuneLayers",
    ]),
    evaluate: Object.freeze([]),
    generate: Object.freeze([
      "exportFormat",
      "representativeSamples",
      "artifactDirectory",
    ]),
  }),
});

export function getModelMissionTask(taskId) {
  return MODEL_MISSION_TASKS.find(({ id }) => id === taskId) ?? null;
}

export function getModelMissionTasksByLevel(level) {
  return MODEL_MISSION_TASKS.filter((task) => task.level === level);
}

export function getLegacyFieldsForStep(recipeId, stepId) {
  const fields = LEGACY_STEP_FIELDS[recipeId]?.[stepId];
  return fields ? [...fields] : [];
}
