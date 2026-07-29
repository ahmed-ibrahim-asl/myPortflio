import {
  getLegacyFieldsForStep,
} from "./catalog.js";
import {
  adaptLegacyMissionResult,
  generateSynchronousMissionResult,
} from "./adapters.js";

const STEP_SECTION = Object.freeze({
  data: "data",
  inspect: "inspection",
  split: "split",
  prepare: "preparation",
  model: "model",
  train: "training",
  evaluate: "evaluation",
  generate: "output",
});

const SECTION_KEYS = Object.freeze([
  "data",
  "inspection",
  "split",
  "preparation",
  "model",
  "training",
  "evaluation",
  "output",
]);

function emptySections() {
  return Object.fromEntries(
    SECTION_KEYS.map((key) => [key, {}]),
  );
}

export function getLegacySectionForField(recipeId, fieldId) {
  for (const [stepId, section] of Object.entries(STEP_SECTION)) {
    if (
      getLegacyFieldsForStep(recipeId, stepId)
        .includes(fieldId)
    ) {
      return section;
    }
  }
  return null;
}

export function legacyDefaultsToSections(recipeId, defaults = {}) {
  const sections = emptySections();
  for (const [fieldId, value] of Object.entries(defaults)) {
    const section = getLegacySectionForField(recipeId, fieldId);
    if (section) sections[section][fieldId] = value;
  }
  return sections;
}

export function legacyConfigFromProject(project, recipeId) {
  const config = {};
  for (const section of SECTION_KEYS) {
    for (
      const [fieldId, value]
      of Object.entries(project?.[section] ?? {})
    ) {
      if (getLegacySectionForField(recipeId, fieldId)) {
        config[fieldId] = value;
      }
    }
  }
  return config;
}

export function hasLegacyProjectConfig(project, recipeId) {
  return Object.keys(
    legacyConfigFromProject(project, recipeId),
  ).length > 0;
}

export function resolveMissionGeneration({
  task,
  project,
  legacy,
}) {
  if (!task) {
    return {
      status: "error",
      result: null,
      error: new Error("Select a supported Model Mission task."),
    };
  }

  if (task.adapterId !== "legacy") {
    return {
      status: "ready",
      result: generateSynchronousMissionResult(project),
      error: null,
    };
  }

  if (legacy?.status === "error") {
    return {
      status: "error",
      result: null,
      error: legacy.error
        ?? new Error("The selected recipe could not be loaded."),
    };
  }

  const activeResult =
    legacy?.status === "ready"
    && legacy.recipeId === task.recipeId
    && legacy.result?.templateId === task.recipeId;

  if (!activeResult) {
    return {
      status: "loading",
      result: null,
      error: null,
    };
  }

  return {
    status: "ready",
    result: adaptLegacyMissionResult(legacy.result, project),
    error: null,
  };
}
