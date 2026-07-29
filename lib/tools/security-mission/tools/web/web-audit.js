import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "wpscan-enumerate": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "--url", valuePath: "target.url", omitWhenEmpty: true }],
  "sqlmap-identify": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "--url", valuePath: "target.url", omitWhenEmpty: true }],
  "sqlmap-request-file": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "--url", valuePath: "target.url", omitWhenEmpty: true }],
};

export const WEB_AUDIT_ACTIONS = Object.freeze([
  "wpscan-enumerate", "sqlmap-identify", "sqlmap-request-file"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["web-vulnerability-validation", "web-login-audit", "outdated-web-components"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
