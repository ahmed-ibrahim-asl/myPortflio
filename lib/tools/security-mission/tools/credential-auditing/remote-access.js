import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "ssh-connect": [{ flag: "-i", valuePath: "options.identityFile", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.port", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "evil-winrm-connect": [{ flag: "-i", valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }],
  "xfreerdp-connect": [{ flag: "/v:", valuePath: "target.host", omitWhenEmpty: true }, { flag: "/u:", valuePath: "options.username", omitWhenEmpty: true }, { flag: "/p:", valuePath: "options.password", omitWhenEmpty: true }],
};

export const REMOTE_ACCESS_ACTIONS = Object.freeze([
  "ssh-connect", "evil-winrm-connect", "xfreerdp-connect"
].map(id => ({
  id,
  toolId: id.replace('-connect', ''),
  title: id.replace(/-/g, ' '),
  objectiveIds: ["remote-service-brute-force"],
  risk: "high",
  executable: { linux: id.replace('-connect', ''), windows: id.replace('-connect', ''), macos: id.replace('-connect', '') },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
