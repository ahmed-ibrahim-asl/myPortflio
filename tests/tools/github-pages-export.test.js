import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { calculators } from "../../data/calculators.js";

test("the GitHub Pages export preserves Next.js _next assets", { timeout: 120_000 }, () => {
  const npmCommand = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
  const npmArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd", "run", "build"] : ["run", "build"];
  const result = spawnSync(npmCommand, npmArgs, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      NEXT_TELEMETRY_DISABLED: "1"
    },
    encoding: "utf8",
    timeout: 110_000
  });

  assert.equal(result.status, 0, `GitHub Pages build failed:\n${result.stdout}\n${result.stderr}`);
  assert.equal(
    existsSync(join(process.cwd(), "out", ".nojekyll")),
    true,
    "out/.nojekyll must exist so GitHub Pages serves the _next directory"
  );
  const nextAssets = join(process.cwd(), "out", "_next");
  assert.equal(
    existsSync(nextAssets) && readdirSync(nextAssets).length > 0,
    true,
    "out/_next must contain the exported Next.js assets"
  );

  for (const { slug } of calculators) {
    assert.equal(
      existsSync(join(process.cwd(), "out", "tools", slug, "index.html")),
      true,
      `missing exported calculator route: ${slug}`
    );
  }
});
