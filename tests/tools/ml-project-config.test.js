import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CURRENT_PROJECT_CONFIG_VERSION,
  cloneProjectConfig,
  createDefaultProjectConfig,
  migrateProjectConfig,
  normalizeProjectConfig,
  parseProjectConfig,
  serializeProjectConfig,
} from "../../lib/tools/ml-generator/workbench/project-config.js";

const EXPECTED_DEFAULT = {
  schemaVersion: 2,
  taskId: "object-detection",
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

test("ProjectConfig defaults are deterministic and independently mutable", () => {
  const first = createDefaultProjectConfig();
  const second = createDefaultProjectConfig();

  assert.equal(CURRENT_PROJECT_CONFIG_VERSION, 2);
  assert.deepEqual(first, EXPECTED_DEFAULT);
  assert.deepEqual(second, EXPECTED_DEFAULT);
  assert.notEqual(first, second);
  assert.notEqual(first.data, second.data);

  first.data.path = "./changed.csv";
  assert.deepEqual(second.data, {});
});

test("normalization allowlists root fields and deeply clones sections", () => {
  const input = {
    schemaVersion: 1,
    taskId: "  regression  ",
    learningLevel: "advanced",
    data: {
      path: "./data.csv",
      columns: ["temperature", "pressure"],
      nested: { target: "remaining_life" },
    },
    inspection: { includeHead: true },
    split: [],
    preparation: { scaling: "standard" },
    model: null,
    training: { randomSeed: 42 },
    evaluation: { metricIds: ["mae"] },
    output: { runtimeProfileId: "cpu" },
    unexpectedRootField: "remove-me",
  };

  const normalized = normalizeProjectConfig(input);

  assert.deepEqual(Object.keys(normalized), Object.keys(EXPECTED_DEFAULT));
  assert.equal(normalized.taskId, "regression");
  assert.equal(normalized.learningLevel, "advanced");
  assert.deepEqual(normalized.data, input.data);
  assert.deepEqual(normalized.split, {});
  assert.deepEqual(normalized.model, {});
  assert.equal("unexpectedRootField" in normalized, false);
  assert.notEqual(normalized.data, input.data);
  assert.notEqual(normalized.data.columns, input.data.columns);
  assert.notEqual(normalized.data.nested, input.data.nested);
});

test("serialization is stable and round-trips through normalization", () => {
  const first = {
    schemaVersion: 1,
    taskId: "regression",
    data: {
      zeta: 3,
      alpha: {
        second: 2,
        first: 1,
      },
    },
  };
  const second = {
    data: {
      alpha: {
        first: 1,
        second: 2,
      },
      zeta: 3,
    },
    taskId: "regression",
    schemaVersion: 1,
  };

  const firstSerialized = serializeProjectConfig(first);
  const secondSerialized = serializeProjectConfig(second);

  assert.equal(firstSerialized, secondSerialized);
  assert.deepEqual(
    parseProjectConfig(firstSerialized),
    normalizeProjectConfig(first),
  );
});

test("version zero configurations migrate through version two", () => {
  const legacy = {
    schemaVersion: 0,
    taskId: "classification",
    data: { targetColumn: "label" },
  };

  const migrated = migrateProjectConfig(legacy);

  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.taskId, "classification");
  assert.equal(migrated.learningLevel, "guided");
  assert.deepEqual(migrated.data, { targetColumn: "label" });
  assert.equal(legacy.schemaVersion, 0);
  assert.equal("learningLevel" in legacy, false);
});

test("future ProjectConfig versions are rejected", () => {
  assert.throws(
    () => migrateProjectConfig({ schemaVersion: 3 }),
    /Unsupported ProjectConfig schemaVersion: 3/,
  );
  assert.throws(
    () => parseProjectConfig('{"schemaVersion":3}'),
    /Unsupported ProjectConfig schemaVersion: 3/,
  );
});

test("cloneProjectConfig creates a deep canonical clone", () => {
  const original = normalizeProjectConfig({
    schemaVersion: 1,
    taskId: "regression",
    data: {
      columns: ["speed", "torque"],
      metadata: { target: "power" },
    },
  });

  const cloned = cloneProjectConfig(original);
  cloned.data.columns.push("temperature");
  cloned.data.metadata.target = "efficiency";

  assert.deepEqual(original.data, {
    columns: ["speed", "torque"],
    metadata: { target: "power" },
  });
});
