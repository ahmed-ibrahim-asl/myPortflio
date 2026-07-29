import verificationLedger from "../../../docs/reports/2026-07-29-security-mission-tool-verification.json" with { type: "json" };

export const PUBLIC_EVIDENCE_TIERS = new Set(["local-help", "official-docs"]);

export function getVerificationRecord(ledger, actionId) {
  return ledger.records.find((record) => record.actionId === actionId) ?? null;
}

export function verificationFor(actionId) {
  return getVerificationRecord(verificationLedger, actionId);
}

export function validateVerificationLedger(ledger, { publicActionIds = [] } = {}) {
  const errors = [];
  const seen = new Set();
  for (const record of ledger?.records ?? []) {
    if (!record.evidenceId || seen.has(record.evidenceId)) {
      errors.push(`Verification record has a missing or duplicate evidenceId: ${record.evidenceId ?? "<missing>"}.`);
    }
    seen.add(record.evidenceId);
    if (!record.toolVersion) errors.push(`${record.evidenceId} is missing toolVersion.`);
    if (!record.verifiedAt) errors.push(`${record.evidenceId} is missing verifiedAt.`);
    if (record.evidenceTier === "official-docs" && record.sourceUrls.length === 0) {
      errors.push(`${record.evidenceId} is missing an official source URL.`);
    }
    if (publicActionIds.includes(record.actionId) && !PUBLIC_EVIDENCE_TIERS.has(record.evidenceTier)) {
      errors.push(`${record.evidenceId} cannot ship with evidence tier ${record.evidenceTier}.`);
    }
  }
  return errors;
}
