import test from "node:test";
import assert from "node:assert/strict";
import { useSecurityMissionBuilder } from "../../lib/tools/security-mission/adapters.js";

test("useSecurityMissionBuilder is exported", () => {
  assert.equal(typeof useSecurityMissionBuilder, "function");
});
