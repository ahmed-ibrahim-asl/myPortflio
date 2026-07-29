import test from "node:test";
import assert from "node:assert/strict";
import { createSecurityMissionBuilder } from "../../lib/tools/security-mission/builder.js";

test("Security Mission Builder smoke test", async (t) => {
  await t.test("default project instantiates properly", () => {
    const builder = createSecurityMissionBuilder();
    const result = builder.getState();
    assert.equal(result.project.platform, "linux");
    assert.equal(result.project.shell, "bash");
    assert.equal(result.project.learningLevel, "guided");
    assert.equal(result.actions.length, 0);
  });

  await t.test("changing objectives updates tool choices", () => {
    const builder = createSecurityMissionBuilder();
    builder.dispatch({ type: "choose-objective", objectiveId: "host-discovery-port-scanning" });
    const result = builder.getState();
    assert.equal(result.project.objectiveId, "host-discovery-port-scanning");
    assert.ok(result.tools.length > 0);
    assert.ok(result.tools.some(tool => tool.id === "nmap"));
    // Actions should still be empty until a tool is chosen
    assert.equal(result.actions.length, 0);
  });

  await t.test("changing tools updates action choices", () => {
    const builder = createSecurityMissionBuilder();
    builder.dispatch({ type: "choose-objective", objectiveId: "host-discovery-port-scanning" });
    builder.dispatch({ type: "choose-tool", toolId: "nmap" });
    const result = builder.getState();
    assert.equal(result.project.toolId, "nmap");
    assert.ok(result.actions.length > 0);
    assert.ok(result.actions.some(action => action.id === "nmap-host-discovery"));
  });

  await t.test("compiling a full action with target generates expected CLI string", () => {
    const builder = createSecurityMissionBuilder();
    builder.dispatch({ type: "choose-objective", objectiveId: "host-discovery-port-scanning" });
    builder.dispatch({ type: "choose-tool", toolId: "nmap" });
    builder.dispatch({ type: "choose-action", actionId: "nmap-host-discovery" });
    builder.dispatch({ type: "patch-target", patch: { network: "192.168.1.0/24" } });
    
    const result = builder.getState();
    assert.ok(result.command);
    assert.equal(result.command.command, "nmap -sn '192.168.1.0/24'");
  });
});
