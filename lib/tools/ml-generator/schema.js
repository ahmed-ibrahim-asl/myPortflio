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
