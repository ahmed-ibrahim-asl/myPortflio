const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DIFFICULTIES = new Set(["starter", "intermediate", "advanced"]);

function requireString(errors, record, field) {
  if (typeof record?.[field] !== "string" || record[field].trim() === "") {
    errors[field] = `${field} is required.`;
  }
}

function requireStringArray(errors, record, field) {
  if (
    !Array.isArray(record?.[field])
    || record[field].length === 0
    || record[field].some((value) => typeof value !== "string" || value === "")
  ) {
    errors[field] = `${field} must contain at least one string ID.`;
  }
}

function requireFunction(errors, record, field) {
  if (typeof record?.[field] !== "function") {
    errors[field] = `${field} is required and must be a function.`;
  }
}

export function validateRecipeManifest(manifest) {
  const errors = {};

  for (const field of [
    "id",
    "title",
    "shortDescription",
    "domainId",
    "taskId",
    "frameworkId",
    "difficulty",
    "normalizedKeywords",
    "generatorModuleId",
  ]) {
    requireString(errors, manifest, field);
  }

  for (const field of [
    "supportedDataProfileIds",
    "tags",
    "sourceRefs",
    "pipelineStages",
    "sectionIds",
    "presetIds",
  ]) {
    requireStringArray(errors, manifest, field);
  }

  if (manifest?.id && !ID_PATTERN.test(manifest.id)) {
    errors.id = "id must use lowercase kebab-case.";
  }
  if (
    manifest?.generatorModuleId
    && !ID_PATTERN.test(manifest.generatorModuleId)
  ) {
    errors.generatorModuleId =
      "generatorModuleId must use lowercase kebab-case.";
  }
  if (manifest?.difficulty && !DIFFICULTIES.has(manifest.difficulty)) {
    errors.difficulty = "difficulty must be starter, intermediate, or advanced.";
  }

  return errors;
}

export function validateSourceRecord(source) {
  const errors = {};

  for (const field of [
    "id",
    "title",
    "owner",
    "url",
    "sourceType",
    "licenseStatus",
    "licenseName",
    "versionOrDate",
    "verifiedAt",
  ]) {
    requireString(errors, source, field);
  }
  requireStringArray(errors, source, "topics");

  if (source?.id && !ID_PATTERN.test(source.id)) {
    errors.id = "id must use lowercase kebab-case.";
  }

  if (source?.url) {
    try {
      const parsedUrl = new URL(source.url);
      if (parsedUrl.protocol !== "https:") {
        errors.url = "url must use HTTPS.";
      }
    } catch {
      errors.url = "url must be a valid HTTPS URL.";
    }
  }

  if (source?.verifiedAt && !ISO_DATE_PATTERN.test(source.verifiedAt)) {
    errors.verifiedAt = "verifiedAt must use YYYY-MM-DD.";
  }

  return errors;
}

export function validateLoadedRecipe(recipe) {
  const errors = validateRecipeManifest(recipe);

  for (const field of [
    "normalize",
    "validate",
    "generate",
    "filename",
    "getWarnings",
    "getReadiness",
  ]) {
    requireFunction(errors, recipe, field);
  }

  if (!Array.isArray(recipe?.fields) || recipe.fields.length === 0) {
    errors.fields = "fields must contain at least one field definition.";
  } else {
    const fieldIds = new Set();
    for (const field of recipe.fields) {
      if (
        typeof field?.id !== "string"
        || field.id.trim() === ""
        || fieldIds.has(field.id)
      ) {
        errors.fields = "fields must use non-empty, unique string IDs.";
        break;
      }
      fieldIds.add(field.id);
    }
  }

  for (const mode of ["starter", "production"]) {
    if (
      !recipe?.defaults
      || typeof recipe.defaults[mode] !== "object"
      || recipe.defaults[mode] === null
      || Array.isArray(recipe.defaults[mode])
    ) {
      errors.defaults =
        "defaults must define starter and production configuration objects.";
      break;
    }
  }

  for (const field of [
    "dependencies",
    "metrics",
    "artifacts",
    "deployment",
    "notes",
    "warnings",
  ]) {
    if (!Array.isArray(recipe?.[field])) {
      errors[field] = `${field} must be an array.`;
    }
  }

  for (const field of ["dataset", "hardware"]) {
    if (
      typeof recipe?.[field] !== "object"
      || recipe[field] === null
      || Array.isArray(recipe[field])
    ) {
      errors[field] = `${field} must be an object.`;
    }
  }

  return errors;
}
