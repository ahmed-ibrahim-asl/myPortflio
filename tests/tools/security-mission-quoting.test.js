import test from "node:test";
import assert from "node:assert/strict";
import { quoteShellArgument } from "../../lib/tools/security-mission/quoting.js";

test("Bash keeps one user value inside one argument", () => {
  assert.equal(quoteShellArgument("a b'c;whoami", "bash"), "'a b'\"'\"'c;whoami'");
});

test("PowerShell keeps metacharacters inside a literal string", () => {
  assert.equal(quoteShellArgument("a b'; Get-Process", "powershell"), "'a b''; Get-Process'");
});

test("CMD rejects expansion characters that cannot be represented safely", () => {
  assert.throws(() => quoteShellArgument("%PATH%", "cmd"), /CMD expansion/);
  assert.throws(() => quoteShellArgument("hello!name", "cmd"), /CMD expansion/);
});
