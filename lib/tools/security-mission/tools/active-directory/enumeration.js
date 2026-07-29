import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "responder-analyze": [{ flag: "-I", valuePath: "options.interface", omitWhenEmpty: true }],
  "bloodhound-python-ingest": [{ flag: "-d", valuePath: "target.domain", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }],
  "sharphound-ingest": [{ flag: "-d", valuePath: "target.domain", omitWhenEmpty: true }, { flag: "-dc-ip", valuePath: "target.host", omitWhenEmpty: true }],
  "ldapdomaindump-extract": [{ flag: "-d", valuePath: "target.domain", omitWhenEmpty: true }, { flag: "-dc-ip", valuePath: "target.host", omitWhenEmpty: true }],
  "certipy-find": [{ flag: "-target", valuePath: "target.host", omitWhenEmpty: true }],
  "certipy-req": [{ flag: "-target", valuePath: "target.host", omitWhenEmpty: true }],
};

export const ENUMERATION_ACTIONS = Object.freeze([
  "responder-analyze", "bloodhound-python-ingest", "sharphound-ingest", "ldapdomaindump-extract",
  "certipy-find", "certipy-req"
].map(id => ({
  id,
  toolId: id.split('-').slice(0, id.split('-').length - 1).join('-'),
  title: id.replace(/-/g, ' '),
  objectiveIds: ["ad-enumeration"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
