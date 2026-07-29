import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

test("audit evidence accounts for public actions and current eCPPT objectives", async () => {
  const evidencePath = path.join(rootDir, "docs/reports/2026-07-29-security-mission-evidence.json");
  const auditPath = path.join(rootDir, "docs/reports/2026-07-29-security-mission-audit.md");

  const evidenceRaw = await fs.readFile(evidencePath, "utf8");
  const evidence = JSON.parse(evidenceRaw);

  const auditMd = await fs.readFile(auditPath, "utf8");

  assert.equal(evidence.tool_name, "Security Mission");
  assert.equal(evidence.route, "/tools/security-command-builder/");
  assert.equal(evidence.pending_public_actions, 0);
  assert.equal(evidence.ecppt_objectives.covered, evidence.ecppt_objectives.total);
  assert.ok(evidence.commands.reviewed > 0);
  assert.equal(evidence.safety.server_execution, false);

  assert.match(auditMd, /Security Mission/);
  assert.match(auditMd, /Limitations/);
  assert.doesNotMatch(auditMd, /guaranteed exam success|endorsed by INE|affiliated with INE/i);
});
