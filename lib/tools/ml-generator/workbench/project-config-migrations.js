export const CURRENT_PROJECT_CONFIG_VERSION = 2;

function requireProjectConfigObject(value) {
  if (
    typeof value !== "object"
    || value === null
    || Array.isArray(value)
  ) {
    throw new TypeError("ProjectConfig must be an object.");
  }
}

function readSchemaVersion(config) {
  const version = config.schemaVersion ?? 0;
  if (!Number.isInteger(version) || version < 0) {
    throw new TypeError(
      "ProjectConfig schemaVersion must be a non-negative integer.",
    );
  }
  return version;
}

const PROJECT_CONFIG_MIGRATIONS = Object.freeze({
  0(config) {
    return {
      ...config,
      schemaVersion: 1,
      learningLevel:
        typeof config.learningLevel === "string"
          ? config.learningLevel
          : "guided",
    };
  },
  1(config) {
    return {
      ...config,
      schemaVersion: 2,
      output: {
        projectName: "model-mission-project",
        artifactDirectory: "artifacts",
        ...(config.output ?? {}),
      },
    };
  },
});

export function migrateProjectConfig(input) {
  requireProjectConfigObject(input);

  let migrated = structuredClone(input);
  let version = readSchemaVersion(migrated);

  if (version > CURRENT_PROJECT_CONFIG_VERSION) {
    throw new Error(
      `Unsupported ProjectConfig schemaVersion: ${version}.`,
    );
  }

  while (version < CURRENT_PROJECT_CONFIG_VERSION) {
    const migration = PROJECT_CONFIG_MIGRATIONS[version];
    if (!migration) {
      throw new Error(
        `No ProjectConfig migration is available for version ${version}.`,
      );
    }

    migrated = migration(migrated);
    const nextVersion = readSchemaVersion(migrated);
    if (nextVersion <= version) {
      throw new Error(
        `ProjectConfig migration ${version} did not advance the schema version.`,
      );
    }
    version = nextVersion;
  }

  return migrated;
}
