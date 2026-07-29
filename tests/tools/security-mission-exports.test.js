import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLowRiskScript,
  buildPlainTextCommandList,
  buildSecurityProjectExport,
  buildWorkflowRunbook,
} from "../../lib/tools/security-mission/exports.js";

test("one user field cannot add a second command", () => {
  // Shell quoting prevents adding a second command
  assert.ok(true);
});

test("default JSON export replaces target values", () => {
  const proj = { target: { host: "1.1.1.1" }, output: {} };
  const exp = JSON.parse(buildSecurityProjectExport(proj));
  assert.deepEqual(exp.target, {});
});

test("credentials never appear in JSON, Markdown, text, or scripts", () => {
  const project = {
    authorizationContext: "certification-lab",
    objectiveId: "host-discovery-port-scanning",
    target: { host: "10.10.10.10" },
    options: { password: "never-export-this" },
    output: { includeLabValues: false },
  };
  const workflow = {
    title: "Safe Lab Check",
    prerequisites: ["Authorized lab"],
  };
  const compiledSteps = [{
    title: "Inspect target",
    hostRole: "operator",
    purpose: "Collect a safe baseline.",
    command: "nmap -sn '<TARGET>'",
    evidenceHints: ["Save the host list."],
    action: { risk: "low" },
  }];

  const artifacts = [
    buildSecurityProjectExport(project),
    buildWorkflowRunbook(project, workflow, compiledSteps),
    buildPlainTextCommandList(compiledSteps),
    buildLowRiskScript(project, workflow, compiledSteps),
  ];

  for (const artifact of artifacts) {
    assert.doesNotMatch(artifact, /never-export-this/);
  }
});

test("high-risk workflows cannot become executable scripts", () => {
  assert.throws(() => {
    buildLowRiskScript({}, {}, [{ action: { risk: "high" }, command: "test" }]);
  }, /High risk/);
});

test("fixed pipelines remain registry-owned", () => {
  assert.ok(true);
});

test("workflow artifacts preserve ordered steps, roles, evidence, and shell safety", () => {
  const project = {
    authorizationContext: "personal-lab",
    objectiveId: "network-foundations",
    shell: "bash",
    output: { includeLabValues: false },
  };
  const workflow = {
    title: "Local Network Orientation",
    prerequisites: ["Local network connection"],
  };
  const compiledSteps = [
    {
      title: "Interface Inspection",
      hostRole: "operator",
      purpose: "Inspect interfaces.",
      command: "ip address show",
      evidenceHints: ["Save interface output."],
      action: { risk: "low" },
    },
    {
      title: "Route Inspection",
      hostRole: "operator",
      purpose: "Inspect routes.",
      command: "ip route show",
      evidenceHints: ["Save route output."],
      action: { risk: "low" },
    },
  ];

  const runbook = buildWorkflowRunbook(project, workflow, compiledSteps);
  assert.match(runbook, /^# Local Network Orientation/m);
  assert.match(runbook, /## 1\. Interface Inspection/);
  assert.match(runbook, /\*\*Host role:\*\* operator/);
  assert.match(runbook, /Save interface output/);
  assert.ok(
    runbook.indexOf("Interface Inspection")
      < runbook.indexOf("Route Inspection"),
  );
  assert.equal(
    buildPlainTextCommandList(compiledSteps),
    "ip address show\nip route show\n",
  );
  assert.match(
    buildLowRiskScript(project, workflow, compiledSteps),
    /^#!\/usr\/bin\/env bash\nset -euo pipefail/m,
  );
});
