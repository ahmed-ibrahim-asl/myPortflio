import {
  generateClassicalScript,
} from "../workbench/classical-generator.js";
import {
  generateNeuralScript,
  NeuralConfigurationError,
} from "../workbench/neural-generator.js";
import {
  cloneProjectConfig,
} from "../workbench/project-config.js";

const DEFAULT_DEPENDENCY_RANGES = Object.freeze({
  "imbalanced-learn": ">=0.12,<1",
  joblib: ">=1.4,<2",
  keras: ">=3,<4",
  numpy: ">=1.26,<3",
  pandas: ">=2.2,<3",
  "scikit-learn": ">=1.5,<2",
  tensorflow: ">=2.16,<3",
  torch: ">=2.3,<3",
  torchvision: ">=0.18,<1",
});

const DEFAULT_DEPENDENCY_PURPOSES = Object.freeze({
  "imbalanced-learn": "class balancing",
  joblib: "model persistence",
  keras: "neural network API",
  numpy: "numerical operations",
  pandas: "data loading",
  "scikit-learn": "modeling and preprocessing",
  tensorflow: "Keras runtime",
  torch: "neural network training",
  torchvision: "image data loading",
});

const EMPTY_RESULT = Object.freeze({
  filename: "",
  code: "",
  dependencies: Object.freeze([]),
  warnings: Object.freeze([]),
  summary: "",
  validationErrors: Object.freeze({}),
});

function normalizeDependency(dependency) {
  if (typeof dependency === "string") {
    return {
      package: dependency,
      version: DEFAULT_DEPENDENCY_RANGES[dependency] ?? "",
      purpose: DEFAULT_DEPENDENCY_PURPOSES[dependency] ?? "runtime",
    };
  }
  return {
    package: String(dependency.package),
    version: String(dependency.version ?? ""),
    purpose: String(dependency.purpose ?? "runtime"),
  };
}

function resultWithDefaults(result = {}, resolvedProject) {
  return {
    filename: String(result.filename ?? ""),
    code: String(result.code ?? ""),
    dependencies: (result.dependencies ?? []).map(normalizeDependency),
    warnings: [...(result.warnings ?? [])],
    summary: String(result.summary ?? ""),
    validationErrors: { ...(result.validationErrors ?? {}) },
    resolvedConfig: cloneProjectConfig(
      resolvedProject ?? result.resolvedConfig ?? {},
    ),
  };
}

function projectSections(project) {
  return {
    ...(project.data ?? {}),
    ...(project.inspection ?? {}),
    ...(project.split ?? {}),
    ...(project.preparation ?? {}),
    ...(project.model ?? {}),
    ...(project.training ?? {}),
    ...(project.evaluation ?? {}),
    ...(project.output ?? {}),
  };
}

function generateClassicalMissionResult(project) {
  const generated = generateClassicalScript({
    ...projectSections(project),
    task: project.taskId,
  });
  return resultWithDefaults({
    ...generated,
    dependencies: [
      "scikit-learn",
      ...generated.dependencies.filter(
        (dependency) => dependency !== "scikit-learn",
      ),
    ],
  }, project);
}

function normalizeNeuralPreset(preset) {
  return preset === "sensor-lstm" ? "sequence-lstm" : preset;
}

function generateNeuralMissionResult(project) {
  try {
    const generated = generateNeuralScript({
      ...projectSections(project),
      preset: normalizeNeuralPreset(project.model?.preset),
      framework: project.model?.framework ?? "keras",
    });
    const dependencies = generated.dependencies.includes("keras")
      ? [...generated.dependencies, "tensorflow"]
      : generated.dependencies;
    return resultWithDefaults({
      ...generated,
      dependencies,
    }, project);
  } catch (error) {
    return resultWithDefaults({
      ...EMPTY_RESULT,
      validationErrors: {
        [error instanceof NeuralConfigurationError
          ? error.section
          : "architecture"]: error instanceof Error
          ? error.message
          : "The architecture is not valid.",
      },
    }, project);
  }
}

export function generateSynchronousMissionResult(project = {}) {
  if (
    project.taskId === "classification"
    || project.taskId === "regression"
  ) {
    return generateClassicalMissionResult(project);
  }

  if (project.taskId === "neural-network") {
    return generateNeuralMissionResult(project);
  }

  return resultWithDefaults({
    ...EMPTY_RESULT,
    validationErrors: {
      taskId: "The selected task requires its lazy recipe adapter.",
    },
  }, project);
}

export function adaptLegacyMissionResult(
  result = {},
  resolvedProject,
) {
  const datasetTitle = String(result.dataset?.title ?? "").trim();
  const metric = String(result.metrics?.[0] ?? "").trim();
  const deployment = String(result.deployment?.[0] ?? "").trim();

  return resultWithDefaults({
    filename: result.filename,
    code: result.code,
    dependencies: result.dependencies,
    warnings: result.warnings,
    summary: [datasetTitle, metric, deployment]
      .filter(Boolean)
      .join(" · "),
    validationErrors: result.validationErrors,
  }, resolvedProject);
}
