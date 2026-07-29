import test from "node:test";
import assert from "node:assert/strict";
import { EXPECTED_SECURITY_TOOL_IDS, SECURITY_TOOLS, SECURITY_ACTIONS } from "../../lib/tools/security-mission/catalog.js";

test("catalog is complete and matches expected tools", () => {
  const registeredToolIds = new Set(SECURITY_TOOLS.map(t => t.id));
  const missing = [...EXPECTED_SECURITY_TOOL_IDS].filter(id => !registeredToolIds.has(id));
  assert.deepEqual(missing, [], "Missing expected tools");
});

test("all actions belong to registered tools", () => {
  const registeredToolIds = new Set(SECURITY_TOOLS.map(t => t.id));
  for (const action of SECURITY_ACTIONS) {
    assert.ok(registeredToolIds.has(action.toolId), `Action ${action.id} references unregistered tool ${action.toolId}`);
  }
});
