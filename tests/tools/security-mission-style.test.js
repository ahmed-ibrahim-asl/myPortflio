import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

test("CSS contains flat portfolio styling with no gradients, glass effects, or blur", async () => {
  const cssPath = path.join(rootDir, "components/tools/security-mission/SecurityMission.module.css");
  const cssCode = await fs.readFile(cssPath, "utf8");

  assert.doesNotMatch(cssCode, /linear-gradient|radial-gradient/i);
  assert.doesNotMatch(cssCode, /backdrop-filter/i);
  assert.doesNotMatch(cssCode, /filter:\s*blur/i);

  assert.match(cssCode, /grid-template-columns/);
});
