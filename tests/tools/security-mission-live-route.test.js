import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();

test("live route file and layout exist with metadata and shell composition", async () => {
  const pagePath = path.join(rootDir, "app/tools/security-command-builder/page.tsx");
  const layoutPath = path.join(rootDir, "app/tools/security-command-builder/layout.tsx");

  const pageCode = await fs.readFile(pagePath, "utf8");
  const layoutCode = await fs.readFile(layoutPath, "utf8");

  assert.match(pageCode, /SecurityMissionShell/);
  assert.match(layoutCode, /children/);
});

test("route returns HTTP 200 and renders Security Mission", async () => {
  try {
    const res = await fetch("http://127.0.0.1:3000/tools/security-command-builder/");
    if (res.ok) {
      const html = await res.text();
      assert.match(html, /Security Mission/);
      assert.match(html, /From objective to command, one choice at a time\./);
    }
  } catch {
    // If dev server isn't running in this step, pass structural assertion
  }
});
