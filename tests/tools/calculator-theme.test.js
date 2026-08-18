import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("calculator layouts use the active theme and collapse to one column", async () => {
  const css = await readFile(new URL("../../app/game-theme.css", import.meta.url), "utf8");
  assert.match(css, /\.tools-calculator-section/);
  assert.match(
    css,
    /\.calculator-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s
  );
  assert.match(css, /\.calculator-field-input/);
  assert.match(css, /\.calculator-results/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*760px\)[\s\S]*?\.calculator-grid\s*\{[^}]*grid-template-columns:\s*1fr/s
  );
});
