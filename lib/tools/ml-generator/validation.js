const SUPPORTED_MODES = new Set(["starter", "production"]);

export function ensureMode(mode) {
  return SUPPORTED_MODES.has(mode) ? mode : "starter";
}

export function cloneValue(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function normalizeSelectValue(value, options, fallback) {
  const values = new Set((options ?? []).map((option) => option.value));
  if (values.has(value)) return value;
  if (values.has(fallback)) return fallback;
  return options?.[0]?.value ?? "";
}

export function coerceFiniteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function validateNumber(
  errors,
  config,
  fieldId,
  label,
  minimum,
  maximum,
  { integer = false } = {},
) {
  const value = Number(config?.[fieldId]);

  if (!Number.isFinite(value)) {
    errors[fieldId] = `${label} must be a number.`;
  } else if (value < minimum || value > maximum) {
    errors[fieldId] =
      `${label} must be between ${minimum} and ${maximum}.`;
  } else if (integer && !Number.isInteger(value)) {
    errors[fieldId] = `${label} must be a whole number.`;
  }

  return errors;
}

export function isFieldVisible(field, config, mode) {
  const resolvedMode = ensureMode(mode);
  const modes = field?.modes ?? ["starter", "production"];
  if (!modes.includes(resolvedMode)) return false;
  return field.visibleWhen
    ? Boolean(field.visibleWhen(config, resolvedMode))
    : true;
}
