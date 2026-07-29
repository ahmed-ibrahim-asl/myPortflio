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

test("choosing a compatible tool advances directly to action selection", () => {
  const state = securityMissionReducer(createSecurityMissionState(), {
    type: "choose-tool",
    toolId: "nmap",
  });

  assert.equal(state.project.objectiveId, "host-discovery-port-scanning");
  assert.equal(state.project.toolId, "nmap");
  assert.equal(state.stepId, "action");
});

test("tool-first entry clears the default objective and asks for a compatible outcome", () => {
  let state = securityMissionReducer(createSecurityMissionState(), {
    type: "choose-entry-mode",
    mode: "tool",
  });
  state = securityMissionReducer(state, {
    type: "choose-tool",
    toolId: "nmap",
  });

  assert.equal(state.project.objectiveId, null);
  assert.equal(state.project.toolId, "nmap");
  assert.equal(state.stepId, "objective");
});

test("choosing an action seeds its controls and advances to its first form", () => {
  let state = createSecurityMissionState();
  state = securityMissionReducer(state, {
    type: "choose-tool",
    toolId: "nmap",
  });
  state = securityMissionReducer(state, {
    type: "choose-action",
    actionId: "nmap-host-discovery",
  });

  assert.equal(state.stepId, "target");
  assert.equal(state.project.target.network, "10.10.10.0/24");
  assert.equal(state.project.options.network, undefined);
});

test("choosing a workflow initializes workflow mode, objective, and steps", () => {
  const state = securityMissionReducer(createSecurityMissionState(), {
    type: "choose-workflow",
    workflowId: "host-discovery",
  });

  assert.equal(state.project.mode, "workflow");
  assert.equal(state.project.workflowId, "host-discovery");
  assert.equal(
    state.project.objectiveId,
    "host-discovery-port-scanning",
  );
  assert.equal(state.project.workflow.activeStepId, "step-1");
  assert.equal(state.project.workflow.steps.length, 2);
  assert.equal(state.stepId, "target");
});

test("patch-project-value writes the registry path instead of flattening it", () => {
  const state = securityMissionReducer(createSecurityMissionState(), {
    type: "patch-project-value",
    valuePath: "target.network",
    value: "10.20.30.0/24",
  });

  assert.equal(state.project.target.network, "10.20.30.0/24");
  assert.equal(state.project.options["target.network"], undefined);
});

test("a failed imported project keeps the active project", () => {
  const original = createSecurityMissionState();
  const state = securityMissionReducer(original, {
    type: "import-project",
    project: null,
  });

  assert.equal(state.project, original.project);
  assert.match(state.importError, /valid project/i);
});

test("import sanitizes secrets while restoring allowed project choices", () => {
  const state = securityMissionReducer(createSecurityMissionState(), {
    type: "import-project",
    project: {
      schemaVersion: 1,
      mode: "command",
      authorizationContext: "personal-lab",
      learningLevel: "advanced",
      platform: "linux",
      shell: "bash",
      objectiveId: "host-discovery-port-scanning",
      toolId: "nmap",
      actionId: "nmap-tcp-scan",
      target: { host: "10.10.10.10" },
      options: { password: "do-not-keep", ports: "80,443" },
      output: { includeLabValues: true, format: "single-line" },
    },
  });

  assert.equal(state.project.learningLevel, "advanced");
  assert.equal(state.project.actionId, "nmap-tcp-scan");
  assert.equal(state.project.options.ports, "80,443");
  assert.equal(state.project.options.password, "<REDACTED>");
  assert.equal(state.stepId, "review");
});

test("import rejects unknown registry identifiers without replacing the project", () => {
  const original = createSecurityMissionState();
  const state = securityMissionReducer(original, {
    type: "import-project",
    project: {
      ...original.project,
      toolId: "not-a-real-tool",
    },
  });

  assert.equal(state.project, original.project);
  assert.match(state.importError, /unknown tool/i);
});
