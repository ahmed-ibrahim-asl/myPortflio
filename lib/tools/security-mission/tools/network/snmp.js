import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "snmpwalk-oid": [{ flag: "-c", valuePath: "options.community", omitWhenEmpty: true }, { flag: "-v", valuePath: "options.version", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "onesixtyone-community-audit": [{ flag: "-c", valuePath: "options.community", omitWhenEmpty: true }, { flag: "-v", valuePath: "options.version", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
};

export const SNMP_ACTIONS = Object.freeze([
  "snmpwalk-oid", "onesixtyone-community-audit"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["service-enumeration"],
  risk: "low",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
