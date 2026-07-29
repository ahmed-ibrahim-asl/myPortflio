import test from "node:test";
import assert from "node:assert/strict";
import { validateVerificationLedger } from "../../lib/tools/security-mission/source-ledger.js";
import { SECURITY_ACTIONS } from "../../lib/tools/security-mission/catalog.js";
import verificationLedger from "../../docs/reports/2026-07-29-security-mission-tool-verification.json" with { type: "json" };

test("public actions require versioned source evidence", () => {
  const errors = validateVerificationLedger({
    records: [{
      evidenceId: "nmap-host-discovery",
      toolId: "nmap",
      actionId: "nmap-host-discovery",
      toolVersion: "",
      verifiedAt: "2026-07-29",
      evidenceTier: "pending",
      sourceUrls: [],
      helpCommand: "",
      notes: "",
    }],
  }, { publicActionIds: ["nmap-host-discovery"] });
  assert.ok(errors.some((error) => error.includes("toolVersion")));
  assert.ok(errors.some((error) => error.includes("pending")));
});

test("production verification ledger is complete and passes validation for all catalog actions", () => {
  const publicActionIds = SECURITY_ACTIONS.map(a => a.id);
  const errors = validateVerificationLedger(verificationLedger, { publicActionIds });
  assert.deepEqual(errors, [], "Verification ledger has validation errors");
});
