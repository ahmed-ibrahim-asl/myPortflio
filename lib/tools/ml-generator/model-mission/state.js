import {
  MODEL_MISSION_STEPS,
  getModelMissionTask,
} from "./catalog.js";
import {
  createDefaultProjectConfig,
  normalizeProjectConfig,
} from "../workbench/project-config.js";

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
    evaluation: {},
    output: {},
  };
}

function neuralDefaults() {
  return {
    data: {},
    inspection: {},
    split: {},
    preparation: {},
    model: {
      framework: "keras",
      preset: "tabular-mlp",
    },
    training: {
      epochs: 20,
      batchSize: 32,
      learningRate: 0.001,
    },
    evaluation: {},
    output: {},
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
      ...(previousProject?.output ?? {}),
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
    return {
      ...state,
      project: normalizeProjectConfig({
        ...state.project,
        [action.section]: {
          ...state.project[action.section],
          ...(action.patch ?? {}),
        },
      }),
      copyStatus: "idle",
    };
  }

  if (
    action.type === "replace-section"
    && SECTION_KEYS.has(action.section)
  ) {
    return {
      ...state,
      project: normalizeProjectConfig({
        ...state.project,
        [action.section]: action.value ?? {},
      }),
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

  return state;
}
