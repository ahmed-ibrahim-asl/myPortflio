import test from "node:test";
import assert from "node:assert/strict";
import { createSecurityMissionBuilder } from "../../lib/tools/security-mission/builder.js";

test("builder manages the whole pipeline", () => {
  const builder = createSecurityMissionBuilder();
  builder.dispatch({ type: "choose-objective", objectiveId: "host-discovery-port-scanning" });
  
  builder.dispatch({ type: "choose-tool", toolId: "nmap" });
  builder.dispatch({ type: "choose-action", actionId: "nmap-host-discovery" });
  builder.dispatch({ type: "patch-target", patch: { network: "1.2.3.0/24" } });
  
  const result = builder.getState();
  assert.equal(result.project.objectiveId, "host-discovery-port-scanning");
  assert.equal(result.command.command, "nmap -sn '1.2.3.0/24'");
  assert.equal(result.actions.length > 0, true);
  assert.equal(result.tools.length > 0, true);
});
