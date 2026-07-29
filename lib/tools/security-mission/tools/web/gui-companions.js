import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "burp-suite-checklist": [],
  "owasp-zap-checklist": [],
};

export const GUI_COMPANIONS_ACTIONS = Object.freeze([
  "burp-suite-checklist", "owasp-zap-checklist"
].map(id => ({
  id,
  toolId: id.replace('-checklist', ''),
  title: id.replace(/-/g, ' '),
  objectiveIds: ["web-vulnerability-validation", "web-login-audit"],
  risk: "low",
  executable: { linux: id.replace('-checklist', ''), windows: id.replace('-checklist', ''), macos: id.replace('-checklist', '') },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
