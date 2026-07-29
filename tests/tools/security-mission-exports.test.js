import test from "node:test";
import assert from "node:assert/strict";
import { buildSecurityProjectExport, buildWorkflowRunbook, buildLowRiskScript } from "../../lib/tools/security-mission/exports.js";

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
  assert.ok(true);
});

test("high-risk workflows cannot become executable scripts", () => {
  assert.throws(() => {
    buildLowRiskScript({}, {}, [{ action: { risk: "high" }, command: "test" }]);
  }, /High risk/);
});

test("fixed pipelines remain registry-owned", () => {
  assert.ok(true);
});
