function createCompatibilityError(path, reason) {
  return new TypeError(
    `ProjectConfig must contain JSON-compatible values; ${path} ${reason}.`,
  );
}

export function migrateCloneable(input, migrate) {
  try { return migrate(input); } catch (error) {
    if (error?.name === 'DataCloneError') throw new TypeError('ProjectConfig contains a value that cannot be cloned.');
    throw error;
  }
}

export function assertJsonCompatible(
  value,
  path,
  ancestors = new WeakSet(),
) {
  if (
    value === null
    || typeof value === "string"
    || typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (Number.isFinite(value)) return value;
    throw createCompatibilityError(path, "is not finite");
  }

  if (typeof value !== "object") {
    throw createCompatibilityError(path, `is ${typeof value}`);
  }

  if (ancestors.has(value)) {
    throw createCompatibilityError(path, "is cyclic");
  }

  ancestors.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertJsonCompatible(
        item,
        `${path}[${index}]`,
        ancestors,
      );
    });
    ancestors.delete(value);
    return value;
  }

  const prototype = Object.getPrototypeOf(value);
  if (
    prototype !== Object.prototype
    && prototype !== null
  ) {
    ancestors.delete(value);
    throw createCompatibilityError(
      path,
      "is not a plain object",
    );
  }

  for (const [key, item] of Object.entries(value)) {
    assertJsonCompatible(
      item,
      `${path}.${key}`,
      ancestors,
    );
  }

  ancestors.delete(value);
  return value;
}
