import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Model Mission uses the portfolio flat token system safely", async () => {
  const css = await readFile(
    new URL(
      "../../components/tools/model-mission/ModelMission.module.css",
      import.meta.url,
    ),
    "utf8",
  );

  assert.doesNotMatch(
    css,
    /linear-gradient|radial-gradient|backdrop-filter/,
  );
  assert.doesNotMatch(css, /overflow:\s*(hidden|clip)/);
  assert.match(css, /\.explanation/);
  assert.match(css, /\.recommendation/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  for (const token of [
    "--night",
    "--panel",
    "--panel-raised",
    "--ink",
    "--muted",
    "--line",
    "--pixel-cyan",
    "--pixel-green",
    "--pixel-gold",
    "--pixel-shadow",
  ]) {
    assert.match(css, new RegExp(`var\\(${token}\\)`));
  }
});
