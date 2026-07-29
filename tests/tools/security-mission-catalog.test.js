import test from "node:test";
import assert from "node:assert/strict";

import {
  EXPECTED_SECURITY_TOOL_IDS,
  SECURITY_MISSION_STEPS,
  getSecurityObjective,
  validateSecurityCatalog,
} from "../../lib/tools/security-mission/catalog.js";

test("Security Mission exposes one eight-step workflow", () => {
  assert.deepEqual(
    SECURITY_MISSION_STEPS.map(({ id }) => id),
    ["scope", "objective", "tool", "action", "target", "configure", "review", "generate"],
  );
});

test("the catalog reserves every approved tool family", () => {
  for (const id of ["nmap", "hashcat", "netcat", "ncat", "hydra", "hping3", "airmon-ng"]) {
    assert.equal(EXPECTED_SECURITY_TOOL_IDS.has(id), true, id);
  }
  assert.deepEqual(validateSecurityCatalog(), []);
});

test("current eCPPT objectives retain their official source text", () => {
  const objective = getSecurityObjective("host-discovery-port-scanning");
  assert.equal(objective.certification.name, "eCPPT");
  assert.equal(objective.domain, "reconnaissance");
  assert.match(objective.certification.sourceUrl, /ine\.com/);
});
