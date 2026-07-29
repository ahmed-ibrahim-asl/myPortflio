import {
  MODEL_MISSION_STEPS,
  getModelMissionTask,
} from "./catalog.js";
import {
  createDefaultProjectConfig,
  normalizeProjectConfig,
} from "../workbench/project-config.js";
import {
  NEURAL_PRESETS,
  getNeuralControlOptions,
} from "../workbench/neural-generator.js";

const SECTION_KEYS = new Set([
  "data",
  "inspection",
  "split",
  "preparation",
  "model",
  "training",
  "evaluation",
  "output",
]);
const WORKSPACE_TABS = new Set(["configure", "code"]);
const LEARNING_LEVELS = new Set(["guided", "customize", "advanced"]);

function classicalDefaults(taskId) {
  const classification = taskId === "classification";
  return {
    data: {
      dataset: classification ? "breast-cancer" : "diabetes",
      dataPath: "data/dataset.csv",
      targetColumn: "target",
    },
    inspection: {
      showHead: true,
      showShape: true,
      showStatistics: true,
      showMissing: true,
      showTarget: true,
    },
    split: {
      splitStrategy: "train-validation-test",
      testRatio: 0.15,
      validationRatio: 0.15,
      stratify: classification,
      groupColumn: "",
      timeColumn: "",
      cvFolds: 5,
      searchStrategy: "none",
    },
    preparation: {
      numericImputer: "median",
      categoricalImputer: "most_frequent",
      scaling: "standard",
      encoding: "onehot",
      balance: "none",
    },
    model: {
      model: classification ? "logistic-regression" : "ridge",
      alpha: 1,
      l1Ratio: 0.5,
      c: 1,
      kernel: "rbf",
      neighbors: 5,
    },
    training: {
      randomSeed: 42,
      nEstimators: 200,
      learningRate: 0.05,
    },
    evaluation: {
      calibration: "none",
      decisionThreshold: null,
    },
    output: {},
  };
}

function neuralDataDefaults(preset = "tabular-mlp") {
  if (preset === "image-cnn") {
    return {
      dataSource: "image-folder",
      dataPath: "data/images",
      targetColumn: "",
    };
  }
  if (preset === "sequence-conv1d" || preset === "sequence-lstm" || preset === "sensor-lstm") {
    return {
      dataSource: "sequence-array",
      dataPath: "data/sequences.npz",
      targetColumn: "target",
    };
  }
  if (preset === "tabular-regression-mlp") {
    return {
      dataSource: "diabetes",
      dataPath: "data/dataset.csv",
      targetColumn: "target",
    };
  }
  return {
    dataSource: "breast-cancer",
    dataPath: "data/dataset.csv",
    targetColumn: "target",
  };
}

function neuralOutputDefaults(framework = "keras") {
  const extension = framework === "pytorch" ? ".pt" : ".keras";
  return {
    checkpointPath: `artifacts/best_neural_network${extension}`,
    artifactPath: `artifacts/neural_network${extension}`,
  };
}

function taskIndependentOutput(output = {}) {
  return Object.fromEntries(
    ["projectName", "artifactDirectory"]
      .filter((key) => output[key] !== undefined)
      .map((key) => [key, output[key]]),
  );
}

function neuralPreset(presetId = "tabular-mlp") {
  return NEURAL_PRESETS.find(({ id }) => id === presetId)
    ?? NEURAL_PRESETS[0];
}

function neuralClassCount(task, dataSource, currentValue) {
  if (task === "tabular-regression") return 1;
  const builtInCounts = {
    "breast-cancer": 2,
    iris: 3,
    wine: 3,
  };
  return builtInCounts[dataSource] ?? currentValue ?? 2;
}

function replaceDependentDefaults(current, previousDefaults, nextDefaults) {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(nextDefaults).map(([key, nextValue]) => [
        key,
        current[key] === undefined || current[key] === previousDefaults[key]
          ? nextValue
          : current[key],
      ]),
    ),
  };
}

function synchronizeNeuralDependentDefaults(project, previousProject) {
  if (project.taskId !== "neural-network") return project;
  const previousModel = previousProject?.model;
  const previousPreset = neuralPreset(previousModel?.preset);
  const nextPreset = neuralPreset(project.model?.preset);
  const presetChanged = previousPreset.id !== nextPreset.id;
  const previousDataDefaults = neuralDataDefaults(previousModel?.preset);
  const nextDataDefaults = neuralDataDefaults(nextPreset.id);
  const previousOutputDefaults = neuralOutputDefaults(previousModel?.framework);
  const nextOutputDefaults = neuralOutputDefaults(project.model?.framework);
  const frameworkChanged = previousModel?.framework !== undefined
    && previousModel.framework !== project.model?.framework;

  const data = presetChanged
    ? nextDataDefaults
    : replaceDependentDefaults(
        project.data ?? {},
        previousDataDefaults,
        nextDataDefaults,
      );
  const model = {
    ...(project.model ?? {}),
    ...(presetChanged
      ? {
          inputShape: [...nextPreset.inputShape],
          layers: nextPreset.layers.map((layer) => ({ ...layer })),
          task: nextPreset.task,
        }
      : {}),
  };
  model.task = nextPreset.task;
  model.numClasses = neuralClassCount(
    nextPreset.task,
    data.dataSource,
    model.numClasses,
  );
  const projectWithDependents = {
    ...project,
    data,
    model,
  };
  const scalingOptions = getNeuralControlOptions(
    "scaling",
    projectWithDependents,
  );
  const currentScaling = project.preparation?.scaling;
  const scaling = scalingOptions.some(
    ({ value }) => value === currentScaling,
  )
    ? currentScaling
    : scalingOptions.find(({ value }) => value === "standard")?.value
      ?? scalingOptions[0]?.value;

  return {
    ...projectWithDependents,
    preparation: {
      ...(project.preparation ?? {}),
      scaling,
    },
    output: frameworkChanged
      ? {
          ...taskIndependentOutput(project.output),
          ...nextOutputDefaults,
        }
      : replaceDependentDefaults(
          project.output ?? {},
          previousOutputDefaults,
          nextOutputDefaults,
        ),
  };
}

function neuralDefaults() {
  const preset = neuralPreset();
  return {
    data: neuralDataDefaults(),
    inspection: {},
    split: {
      splitStrategy: "train-validation-test",
      testRatio: 0.15,
      validationRatio: 0.15,
    },
    preparation: { scaling: "standard" },
    model: {
      framework: "keras",
      preset: preset.id,
      task: preset.task,
      inputShape: [...preset.inputShape],
      layers: preset.layers.map((layer) => ({ ...layer })),
      numClasses: 2,
    },
    training: {
      epochs: 20,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: "adam",
      scheduler: "none",
      weightDecay: 0,
      momentum: 0.9,
      patience: 5,
      minimumDelta: 0,
      gradientClip: 0,
      mixedPrecision: false,
      device: "auto",
      workers: 0,
      randomSeed: 42,
    },
    evaluation: {},
    output: neuralOutputDefaults(),
  };
}

function legacyDefaults() {
  return {
    data: {},
    inspection: {},
    split: {},
    preparation: {},
    model: {},
    training: {},
    evaluation: {},
    output: {},
  };
}

export function createProjectForTask(taskId, previousProject) {
  const task = getModelMissionTask(taskId)
    ?? getModelMissionTask("classification");
  const learningLevel = LEARNING_LEVELS.has(previousProject?.learningLevel)
    ? previousProject.learningLevel
    : "guided";
  const sections =
    task.adapterId === "classical"
      ? classicalDefaults(task.id)
      : task.adapterId === "neural"
        ? neuralDefaults()
        : legacyDefaults();

  return normalizeProjectConfig({
    ...createDefaultProjectConfig(),
    taskId: task.id,
    learningLevel,
    ...sections,
    output: {
      ...(sections.output ?? {}),
      ...taskIndependentOutput(previousProject?.output),
    },
  });
}

export function createModelMissionState() {
  return {
    project: createProjectForTask("classification"),
    stepId: "goal",
    workspaceTab: "configure",
    copyStatus: "idle",
    reloadToken: 0,
  };
}

function stepIndex(stepId) {
  return MODEL_MISSION_STEPS.findIndex(({ id }) => id === stepId);
}

function moveStep(state, offset) {
  const currentIndex = Math.max(0, stepIndex(state.stepId));
  const nextIndex = Math.min(
    MODEL_MISSION_STEPS.length - 1,
    Math.max(0, currentIndex + offset),
  );
  return {
    ...state,
    stepId: MODEL_MISSION_STEPS[nextIndex].id,
    workspaceTab: "configure",
  };
}

export function modelMissionReducer(state, action) {
  if (action.type === "choose-task") {
    return {
      ...state,
      project: createProjectForTask(action.taskId, state.project),
      stepId: "data",
      workspaceTab: "configure",
      copyStatus: "idle",
    };
  }

  if (action.type === "go-to-step") {
    if (stepIndex(action.stepId) < 0) return state;
    return {
      ...state,
      stepId: action.stepId,
      workspaceTab: "configure",
    };
  }

  if (action.type === "next-step") {
    return moveStep(state, 1);
  }

  if (action.type === "previous-step") {
    return moveStep(state, -1);
  }

  if (
    action.type === "patch-section"
    && SECTION_KEYS.has(action.section)
  ) {
    const project = {
      ...state.project,
      [action.section]: {
        ...state.project[action.section],
        ...(action.patch ?? {}),
      },
    };
    return {
      ...state,
      project: normalizeProjectConfig(
        action.section === "model" || action.section === "data"
          ? synchronizeNeuralDependentDefaults(project, state.project)
          : project,
      ),
      copyStatus: "idle",
    };
  }

  if (
    action.type === "replace-section"
    && SECTION_KEYS.has(action.section)
  ) {
    const project = {
      ...state.project,
      [action.section]: action.value ?? {},
    };
    return {
      ...state,
      project: normalizeProjectConfig(
        action.section === "model" || action.section === "data"
          ? synchronizeNeuralDependentDefaults(project, state.project)
          : project,
      ),
      copyStatus: "idle",
    };
  }

  if (
    action.type === "set-learning-level"
    && LEARNING_LEVELS.has(action.level)
  ) {
    return {
      ...state,
      project: normalizeProjectConfig({
        ...state.project,
        learningLevel: action.level,
      }),
    };
  }

  if (
    action.type === "set-workspace-tab"
    && WORKSPACE_TABS.has(action.tab)
  ) {
    return {
      ...state,
      workspaceTab: action.tab,
    };
  }

  if (action.type === "set-copy-status") {
    return {
      ...state,
      copyStatus: action.status,
    };
  }

  if (action.type === "retry-generator") {
    return {
      ...state,
      reloadToken: state.reloadToken + 1,
    };
  }

  if (action.type === 'replace-sections') {
    const entries = Object.entries(action.sections ?? {}).filter(([key]) => SECTION_KEYS.has(key));
    return {
      ...state,
      project: normalizeProjectConfig({ ...state.project, ...Object.fromEntries(entries) }),
      copyStatus: 'idle',
    };
  }

  return state;
}
