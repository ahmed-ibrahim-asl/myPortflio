import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "nbtscan-network": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "enum4linux-enumerate": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "smbclient-list-shares": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "smbclient-browse-share": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "rpcclient-query": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "ldapsearch-query": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }],
};

export const WINDOWS_SERVICES_ACTIONS = Object.freeze([
  "nbtscan-network", "enum4linux-enumerate", "smbclient-list-shares",
  "smbclient-browse-share", "rpcclient-query", "ldapsearch-query"
].map(id => ({
  id,
  toolId: id.startsWith("enum4linux") ? "enum4linux-ng" : id.split("-")[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["service-enumeration"],
  risk: "low",
  executable: { linux: id.startsWith("enum4linux") ? "enum4linux-ng" : id.split("-")[0], windows: id.startsWith("enum4linux") ? "enum4linux-ng" : id.split("-")[0], macos: id.startsWith("enum4linux") ? "enum4linux-ng" : id.split("-")[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
