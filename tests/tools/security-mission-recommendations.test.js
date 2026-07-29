import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityRecommendation } from "../../lib/tools/security-mission/recommendations.js";

test("recommendations resolve deterministic hints", () => {
  const rec = getSecurityRecommendation({
    objectiveId: "host-discovery-port-scanning",
    actionId: null,
    controlId: null,
    project: { toolId: null, actionId: null },
  });
  assert.ok(rec === null || typeof rec.toolId === "string");
});
