import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeProjectConfig,
} from "../../lib/tools/ml-generator/workbench/project-config.js";

test("ProjectConfig reports non-cloneable values at its boundary", () => {
  assert.throws(
    () => normalizeProjectConfig({
      schemaVersion: 1,
      data: {
        transform() {},
      },
    }),
    {
      name: "TypeError",
      message: "ProjectConfig contains a value that cannot be cloned.",
    },
  );
});
