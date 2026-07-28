import {
  CURRENT_PROJECT_CONFIG_VERSION,
  migrateProjectConfig,
} from "./project-config-migrations.js";

import { assertJsonCompatible, migrateCloneable } from '../model-mission/json-compatible.js';

export {
  CURRENT_PROJECT_CONFIG_VERSION,
  migrateProjectConfig,
};

const DEFAULT_TASK_ID = "object-detection";
const LEARNING_LEVELS = new Set([
  "guided",
  "customize",
  "advanced",
]);
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

function isRecord(value) {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
  );
}

function cloneSection(value) {
  if (!isRecord(value)) return {};
  return structuredClone(
    Object.fromEntries(Object.entries(value)),
  );
}

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

export function createDefaultProjectConfig() {
  return {
    schemaVersion: CURRENT_PROJECT_CONFIG_VERSION,
    taskId: DEFAULT_TASK_ID,
    learningLevel: "guided",
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

export function normalizeProjectConfig(input = {}) {
  const migrated = migrateCloneable(input, migrateProjectConfig);
  for (const key of SECTION_KEYS) {
    if (isRecord(migrated[key])) {
      assertJsonCompatible(migrated[key], key);
    }
  }
  const taskId =
    typeof migrated.taskId === "string"
    && migrated.taskId.trim() !== ""
      ? migrated.taskId.trim()
      : DEFAULT_TASK_ID;
  const learningLevel = LEARNING_LEVELS.has(
    migrated.learningLevel,
  )
    ? migrated.learningLevel
    : "guided";

  return {
    schemaVersion: CURRENT_PROJECT_CONFIG_VERSION,
    taskId,
    learningLevel,
    data: cloneSection(migrated.data),
    inspection: cloneSection(migrated.inspection),
    split: cloneSection(migrated.split),
    preparation: cloneSection(migrated.preparation),
    model: cloneSection(migrated.model),
    training: cloneSection(migrated.training),
    evaluation: cloneSection(migrated.evaluation),
    output: cloneSection(migrated.output),
  };
}

export function parseProjectConfig(serializedConfig) {
  if (typeof serializedConfig !== "string") {
    throw new TypeError(
      "Serialized ProjectConfig must be a JSON string.",
    );
  }
  return normalizeProjectConfig(JSON.parse(serializedConfig));
}

export function serializeProjectConfig(input) {
  const config = normalizeProjectConfig(input);
  const stableSections = Object.fromEntries(
    SECTION_KEYS.map((key) => [
      key,
      stableValue(config[key]),
    ]),
  );

  return JSON.stringify({
    schemaVersion: config.schemaVersion,
    taskId: config.taskId,
    learningLevel: config.learningLevel,
    ...stableSections,
  });
}

export function cloneProjectConfig(input) {
  return structuredClone(normalizeProjectConfig(input));
}
