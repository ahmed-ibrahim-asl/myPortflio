import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("credential tools are registered and verified", () => {
  const expected = [
    "hydra-service-audit", "hydra-http-form-audit", "medusa-service-audit",
    "ncrack-service-audit", "kerbrute-user-enumeration", "kerbrute-password-spray",
    "netexec-auth-check", "ssh-connect", "evil-winrm-connect", "xfreerdp-connect"
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
