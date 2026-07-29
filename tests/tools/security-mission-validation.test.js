import test from "node:test";
import assert from "node:assert/strict";
import {
  validateControlValue,
  validateSecurityProject,
} from "../../lib/tools/security-mission/validation.js";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";
import { getSecurityControls } from "../../lib/tools/security-mission/control-registry.js";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";
import { patchSecurityProjectValue } from "../../lib/tools/security-mission/project-paths.js";

test("typed values reject command separators and malformed targets", () => {
  assert.notDeepEqual(validateControlValue({ controlType: "host" }, "10.10.10.10; whoami"), []);
  assert.notDeepEqual(validateControlValue({ controlType: "port" }, 70000), []);
  assert.notDeepEqual(validateControlValue({ controlType: "cidr" }, "10.10.0.0/99"), []);
  assert.notDeepEqual(validateControlValue({ controlType: "bssid" }, "not-a-bssid"), []);
});

test("unsafe output paths fail", () => {
  for (const value of ["../loot.txt", "C:\\absolute.txt", "/tmp/absolute.txt", "logs/a\nb.txt"]) {
    assert.notDeepEqual(validateControlValue({ controlType: "output-path" }, value), []);
  }
});

test("integrated validation reads required values from registry-owned project paths", () => {
  const action = getSecurityAction("nmap-host-discovery");
  const project = {
    ...createDefaultSecurityMissionProject(),
    toolId: "nmap",
    actionId: action.id,
  };
  const controls = getSecurityControls({
    actionId: action.id,
    stepId: "target",
    learningLevel: "advanced",
    project,
  });

  const missing = validateSecurityProject(project, action, controls);
  assert.match(missing.errors["target.network"], /required/i);

  const unsafeProject = patchSecurityProjectValue(
    project,
    "target.network",
    "10.10.10.0/24; whoami",
  );
  const unsafe = validateSecurityProject(unsafeProject, action, controls);
  assert.match(
    unsafe.errors["target.network"],
    /control characters|separators/i,
  );
});
