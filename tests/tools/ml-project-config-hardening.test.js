import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeProjectConfig,
  parseProjectConfig,
  serializeProjectConfig,
} from "../../lib/tools/ml-generator/workbench/project-config.js";

test("ProjectConfig rejects invalid roots and schema versions", () => {
  assert.throws(
    () => normalizeProjectConfig(null),
    /ProjectConfig must be an object/,
  );
  assert.throws(
    () => normalizeProjectConfig([]),
    /ProjectConfig must be an object/,
  );
  assert.throws(
    () => normalizeProjectConfig({ schemaVersion: 1.5 }),
    /schemaVersion must be a non-negative integer/,
  );
  assert.throws(
    () => parseProjectConfig("{not-json"),
    SyntaxError,
  );
});

test("invalid learning levels fall back without altering valid task data", () => {
  const normalized = normalizeProjectConfig({
    schemaVersion: 1,
    taskId: "regression",
    learningLevel: "expert",
    data: { targetColumn: "power" },
  });

  assert.equal(normalized.learningLevel, "guided");
  assert.equal(normalized.taskId, "regression");
  assert.deepEqual(normalized.data, { targetColumn: "power" });
});

test("serialization rejects non-JSON-safe section values with a useful path", () => {
  const invalidCases = [
    { value: 42n, label: "BigInt" },
    { value: new Date("2026-07-27T00:00:00Z"), label: "Date" },
    { value: new Map([["key", "value"]]), label: "Map" },
    { value: undefined, label: "undefined" },
    { value: Number.POSITIVE_INFINITY, label: "Infinity" },
  ];

  for (const { value, label } of invalidCases) {
    assert.throws(
      () => serializeProjectConfig({
        schemaVersion: 1,
        data: { nested: { invalid: value } },
      }),
      (error) => {
        assert.match(error.message, /JSON-compatible/);
        assert.match(error.message, /data\.nested\.invalid/);
        return true;
      },
      label,
    );
  }
});

test("serialization rejects cyclic section values explicitly", () => {
  const cyclic = { targetColumn: "label" };
  cyclic.self = cyclic;

  assert.throws(
    () => serializeProjectConfig({
      schemaVersion: 1,
      data: cyclic,
    }),
    (error) => {
      assert.match(error.message, /JSON-compatible/);
      assert.match(error.message, /data\.self/);
      assert.match(error.message, /cyclic/i);
      return true;
    },
  );
});
