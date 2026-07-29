import test from "node:test";
import assert from "node:assert/strict";
import { validateControlValue } from "../../lib/tools/security-mission/validation.js";

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
