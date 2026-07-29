import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("pivoting tools are registered and verified", () => {
  const expected = [
    "ssh-local-forward", "ssh-remote-forward", "ssh-dynamic-forward",
    "proxychains-wrap", "sshuttle-route", "chisel-server", "chisel-client",
    "ligolo-proxy", "ligolo-agent", "ligolo-route", "socat-forward"
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
