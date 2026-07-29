import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityControls, evaluateSecurityRule } from "../../lib/tools/security-mission/control-registry.js";

test("control levels remain cumulative", () => {
  const controls = [
    { id: "host", actionIds: ["fixture"], step: "configure", level: "guided" },
    { id: "timeout", actionIds: ["fixture"], step: "configure", level: "customize" },
    { id: "debug", actionIds: ["fixture"], step: "configure", level: "advanced" },
  ];
  const project = { toolId: "fixture", actionId: "fixture", options: {} };
  const guided = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "guided", project, controls });
  const customize = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "customize", project, controls });
  const advanced = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "advanced", project, controls });
  assert.ok(guided.every(({ id }) => customize.some((item) => item.id === id)));
  assert.ok(customize.every(({ id }) => advanced.some((item) => item.id === id)));
});

test("rules support all, any, not, equality, inclusion, and truthy checks", () => {
  const project = { platform: "linux", options: { udp: true, scripts: ["safe"] } };
  assert.equal(evaluateSecurityRule({ all: [
    { path: "platform", equals: "linux" },
    { path: "options.udp", truthy: true },
  ] }, project), true);
  assert.equal(evaluateSecurityRule({ not: { path: "platform", equals: "windows" } }, project), true);
});
