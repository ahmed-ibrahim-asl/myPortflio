import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the global motion system hides mission UI until mission sections exist", async () => {
  const [hook, system] = await Promise.all([
    readFile(new URL("../../lib/hooks/useMissionObserver.ts", import.meta.url), "utf8"),
    readFile(new URL("../../components/MotionSystem.tsx", import.meta.url), "utf8")
  ]);

  assert.match(hook, /hasMissions:\s*boolean/);
  assert.match(hook, /useState<boolean>\(false\)/);
  assert.match(hook, /usePathname/);
  assert.match(hook, /setHasMissions\(hasSections\)/);
  assert.match(hook, /removeAttribute\("data-active-mission"\)/);
  assert.match(hook, /}, \[pathname\]\);/);
  assert.match(system, /hasMissions\s*\?\s*\(\s*<MissionRail/);
});
