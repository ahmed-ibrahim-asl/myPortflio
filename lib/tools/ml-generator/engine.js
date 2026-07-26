import { ensureTrailingNewline } from "./python/formatting.js";
import {
  cloneValue,
  ensureMode,
  isFieldVisible,
} from "./validation.js";

function emptyGeneratorResult(templateId, message) {
  return {
    templateId,
    filename: "",
    code: "",
    dependencies: [],
    dataset: {},
    metrics: [],
    artifacts: [],
    hardware: {},
    deployment: [],
    notes: [],
    warnings: [],
    readiness: {},
    config: {},
    validationErrors: {
      templateId: message,
    },
  };
}

export function getRecipeDefaultConfig(recipe, mode) {
  if (!recipe) return {};
  const resolvedMode = ensureMode(mode);
  return cloneValue(
    recipe.defaults?.[resolvedMode]
      ?? recipe.defaults?.starter
      ?? {},
  );
}

export function normalizeRecipeConfig(recipe, config, mode) {
  if (!recipe) return {};
  return recipe.normalize(config ?? {}, ensureMode(mode));
}

export function validateRecipeConfig(recipe, config, mode) {
  if (!recipe) {
    return { templateId: "Select a valid script template." };
  }
  const resolvedMode = ensureMode(mode);
  const normalized = recipe.normalize(config ?? {}, resolvedMode);
  return recipe.validate(normalized, resolvedMode);
}

export function getRecipeVisibleFields(recipe, config, mode) {
  if (!recipe) return [];
  const resolvedMode = ensureMode(mode);
  const normalized = recipe.normalize(config ?? {}, resolvedMode);
  return recipe.fields.filter((field) =>
    isFieldVisible(field, normalized, resolvedMode)
  );
}

export function getRecipeFieldOptions(recipe, fieldId, config, mode) {
  if (!recipe) return [];
  const resolvedMode = ensureMode(mode);
  const normalized = recipe.normalize(config ?? {}, resolvedMode);
  const field = recipe.fields.find(({ id }) => id === fieldId);
  if (!field) return [];

  const options = field.getOptions
    ? field.getOptions(normalized, resolvedMode)
    : field.options ?? [];
  return options.map((option) => ({ ...option }));
}

export function getRecipeOutputMetadata(recipe, config, mode) {
  if (!recipe) {
    return {
      dependencies: [],
      dataset: {},
      metrics: [],
      artifacts: [],
      hardware: {},
      deployment: [],
      notes: [],
      warnings: [],
      readiness: {},
    };
  }

  const resolvedMode = ensureMode(mode);
  const normalized = recipe.normalize(config ?? {}, resolvedMode);
  const exportField = recipe.fields.find(({ id }) => id === "exportFormat");
  const compatibleDeployment = exportField
    ? getRecipeFieldOptions(
      recipe,
      "exportFormat",
      normalized,
      resolvedMode,
    ).map(({ label }) => label)
    : recipe.deployment ?? [];
  const contextualWarnings = recipe.getWarnings
    ? recipe.getWarnings(normalized, resolvedMode)
    : [];
  const contextualNotes = recipe.getNotes
    ? recipe.getNotes(normalized, resolvedMode)
    : [];
  const readiness = recipe.getReadiness
    ? recipe.getReadiness(normalized, resolvedMode)
    : {};

  return {
    dependencies: cloneValue(recipe.dependencies ?? []),
    dataset: cloneValue(recipe.dataset ?? {}),
    metrics: cloneValue(recipe.metrics ?? []),
    artifacts: cloneValue(recipe.artifacts ?? []),
    hardware: cloneValue(recipe.hardware ?? {}),
    deployment: cloneValue(compatibleDeployment),
    notes: [
      ...cloneValue(recipe.notes ?? []),
      ...cloneValue(contextualNotes),
    ],
    warnings: [
      ...cloneValue(recipe.warnings ?? []),
      ...cloneValue(contextualWarnings),
    ],
    readiness: cloneValue(readiness),
  };
}

export function buildRecipeResult(
  recipe,
  requestedTemplateId,
  inputConfig,
  mode,
) {
  if (!recipe) {
    return emptyGeneratorResult(
      requestedTemplateId,
      "No script templates are currently available.",
    );
  }

  const resolvedMode = ensureMode(mode);
  const config = recipe.normalize(inputConfig ?? {}, resolvedMode);
  const validationErrors = recipe.id === requestedTemplateId
    ? recipe.validate(config, resolvedMode)
    : { templateId: "Select a valid script template." };
  const metadata = getRecipeOutputMetadata(recipe, config, resolvedMode);

  return {
    templateId: requestedTemplateId,
    filename: recipe.filename(config, resolvedMode),
    code: Object.keys(validationErrors).length === 0
      ? ensureTrailingNewline(recipe.generate(config, resolvedMode))
      : "",
    ...metadata,
    config,
    validationErrors,
  };
}
