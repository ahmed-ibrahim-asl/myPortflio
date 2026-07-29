import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

test("Security Mission Shell and workspace components satisfy contract requirements", async () => {
  const shellPath = path.join(rootDir, "components/tools/security-mission/SecurityMissionShell.tsx");
  const navPath = path.join(rootDir, "components/tools/security-mission/SecurityMissionNavigator.tsx");
  const railPath = path.join(rootDir, "components/tools/security-mission/SecurityMissionRail.tsx");
  const previewPath = path.join(rootDir, "components/tools/security-mission/CommandPreviewPanel.tsx");
  const toolBrowserPath = path.join(rootDir, "components/tools/security-mission/ToolBrowser.tsx");
  const objBrowserPath = path.join(rootDir, "components/tools/security-mission/ObjectiveBrowser.tsx");
  const wfBrowserPath = path.join(rootDir, "components/tools/security-mission/WorkflowBrowser.tsx");

  const shellCode = await fs.readFile(shellPath, "utf8");
  const navCode = await fs.readFile(navPath, "utf8");
  const railCode = await fs.readFile(railPath, "utf8");
  const previewCode = await fs.readFile(previewPath, "utf8");

  assert.match(shellCode, /data-security-mission/);
  assert.match(shellCode, /Security Mission/);
  assert.match(shellCode, /From objective to command, one choice at a time\./);
  assert.match(shellCode, /Guided/);
  assert.match(shellCode, /Customize/);
  assert.match(shellCode, /Advanced/);

  assert.match(navCode, /Browse by objective/);
  assert.match(navCode, /Browse by tool/);
  assert.match(navCode, /Browse workflows/);

  assert.match(railCode, /Scope/);
  assert.match(railCode, /Objective/);
  assert.match(railCode, /Generate/);

  assert.match(previewCode, /Copy command|copyCommand/);
  assert.match(previewCode, /Download runbook|downloadRunbook/);
});
