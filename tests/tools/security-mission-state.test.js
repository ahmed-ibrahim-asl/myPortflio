import test from "node:test";
import assert from "node:assert/strict";
import { createSecurityMissionState, securityMissionReducer } from "../../lib/tools/security-mission/state.js";

test("level changes preserve hidden options", () => {
  let state = createSecurityMissionState();
  state = securityMissionReducer(state, { type: "patch-options", patch: { timing: "T3" } });
  state = securityMissionReducer(state, { type: "set-learning-level", level: "advanced" });
  state = securityMissionReducer(state, { type: "set-learning-level", level: "guided" });
  assert.equal(state.project.options.timing, "T3");
});

test("choosing an incompatible tool clears action-specific values", () => {
  let state = createSecurityMissionState();
  state = securityMissionReducer(state, { type: "choose-tool", toolId: "nmap" });
  state = securityMissionReducer(state, { type: "choose-action", actionId: "nmap-tcp-scan" });
  state = securityMissionReducer(state, { type: "patch-options", patch: { ports: "80,443" } });
  state = securityMissionReducer(state, { type: "choose-tool", toolId: "curl" });
  assert.equal(state.project.actionId, null);
  assert.deepEqual(state.project.options, {});
});
