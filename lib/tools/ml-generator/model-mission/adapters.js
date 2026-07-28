import {
  generateClassicalScript,
} from "../workbench/classical-generator.js";
import {
  generateNeuralScript,
  NeuralConfigurationError,
} from "../workbench/neural-generator.js";

const EMPTY_RESULT = Object.freeze({
  filename: "",
  code: "",
  dependencies: Object.freeze([]),
  warnings: Object.freeze([]),
  summary: "",
  validationErrors: Object.freeze({}),
});

function resultWithDefaults(result = {}) {
  return {
    filename: String(result.filename ?? ""),
    code: String(result.code ?? ""),
    dependencies: [...(result.dependencies ?? [])],
    warnings: [...(result.warnings ?? [])],
    summary: String(result.summary ?? ""),
    validationErrors: { ...(result.validationErrors ?? {}) },
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
  return resultWithDefaults(generated);
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
    });
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
    });
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
  });
}

export function adaptLegacyMissionResult(result = {}) {
  const datasetTitle = String(result.dataset?.title ?? "").trim();
  const metric = String(result.metrics?.[0] ?? "").trim();
  const deployment = String(result.deployment?.[0] ?? "").trim();

  return resultWithDefaults({
    filename: result.filename,
    code: result.code,
    dependencies: (result.dependencies ?? [])
      .map((dependency) =>
        typeof dependency === "string"
          ? dependency
          : dependency?.package
      )
      .filter(Boolean),
    warnings: result.warnings,
    summary: [datasetTitle, metric, deployment]
      .filter(Boolean)
      .join(" · "),
    validationErrors: result.validationErrors,
  });
}
