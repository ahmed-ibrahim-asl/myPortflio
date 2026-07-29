import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "curl-request": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "curl-authenticated-request": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "curl-proxy-request": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "curl-timing": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "wget-download": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
  "wget-bounded-mirror": [{ positional: true, valuePath: "target.url", omitWhenEmpty: true }],
};

export const HTTP_CLIENTS_ACTIONS = Object.freeze([
  "curl-request", "curl-authenticated-request", "curl-proxy-request",
  "curl-timing", "wget-download", "wget-bounded-mirror"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["web-enumeration", "web-evidence-and-credentials"],
  risk: "low",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
