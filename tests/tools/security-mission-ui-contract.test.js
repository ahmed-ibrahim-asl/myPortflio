import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

test("UI components exist and satisfy contract rules", async () => {
  const hookPath = path.join(rootDir, "lib/hooks/useSecurityMission.ts");
  const rendererPath = path.join(rootDir, "components/tools/security-mission/SecurityControlRenderer.tsx");
  const fieldPath = path.join(rootDir, "components/tools/security-mission/SecurityField.tsx");
  const explanationPath = path.join(rootDir, "components/tools/security-mission/SecurityExplanation.tsx");
  const recommendationPath = path.join(rootDir, "components/tools/security-mission/SecurityRecommendation.tsx");
  const warningPath = path.join(rootDir, "components/tools/security-mission/SecurityWarningPanel.tsx");

  const hookCode = await fs.readFile(hookPath, "utf8");
  const rendererCode = await fs.readFile(rendererPath, "utf8");
  const fieldCode = await fs.readFile(fieldPath, "utf8");
  const warningCode = await fs.readFile(warningPath, "utf8");

  assert.match(hookCode, /useSecurityMission/);
  assert.match(rendererCode, /SecurityControlRenderer/);
  assert.match(fieldCode, /SecurityField/);
  assert.match(warningCode, /SecurityWarningPanel/);

  // Assert accessibility attributes
  assert.match(fieldCode, /aria-describedby/);

  // Assert renderer contains no hardcoded tool flags
  assert.doesNotMatch(rendererCode, /--script|-sV|-sC|-p80/);
});
