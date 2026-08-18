import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the global motion system leaves portfolio content unobstructed", async () => {
  const system = await readFile(
    new URL("../../components/MotionSystem.tsx", import.meta.url),
    "utf8",
  );

  assert.match(system, /useScrollProgress\(\)/);
  assert.doesNotMatch(system, /MissionRail|useMissionObserver/);
});
