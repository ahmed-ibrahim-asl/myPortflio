import test from "node:test";
import assert from "node:assert/strict";
import { SECURITY_OBJECTIVES } from "../../lib/tools/security-mission/objective-registry.js";
import { SECURITY_ACTIONS } from "../../lib/tools/security-mission/catalog.js";

test("every eCPPT objective is covered by at least one action", () => {
  const ecpptObjectives = SECURITY_OBJECTIVES.filter(o => o.certification.name === "eCPPT");
  assert.ok(ecpptObjectives.length > 0, "No eCPPT objectives found");

  for (const obj of ecpptObjectives) {
    const matchingActions = SECURITY_ACTIONS.filter(a => a.objectiveIds.includes(obj.id));
    assert.ok(matchingActions.length > 0, `Objective ${obj.id} has no matching actions`);
  }
});
