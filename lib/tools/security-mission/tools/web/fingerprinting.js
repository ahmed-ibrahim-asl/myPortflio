import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "whatweb-fingerprint": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "nikto-scan": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
};

export const FINGERPRINTING_ACTIONS = Object.freeze([
  "whatweb-fingerprint", "nikto-scan"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["web-enumeration"],
  risk: "low",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
