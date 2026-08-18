import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the sitemap includes every calculator and advanced workbench", async () => {
  const source = await readFile(new URL("../../app/sitemap.js", import.meta.url), "utf8");

  assert.match(source, /getAllTools/);
  assert.match(source, /\/tools\/\$\{tool\.slug\}/);
  for (const pathname of [
    "/tools/ai-script-generator",
    "/tools/security-command-builder",
    "/tools/sensor-code-generator"
  ]) {
    assert.match(source, new RegExp(pathname.replaceAll("/", "\\/")));
  }
});

test("llms.txt advertises the live tools using the repository's real base path", async () => {
  const source = await readFile(new URL("../../public/llms.txt", import.meta.url), "utf8");

  assert.doesNotMatch(source, /github\.io\/myPortfolio/);
  assert.match(source, /github\.io\/myPortflio\/tools\//);
  assert.match(source, /Electronics calculators/i);
  assert.match(source, /Model Mission/i);
  assert.match(source, /Sensor Code Generator/i);
});

