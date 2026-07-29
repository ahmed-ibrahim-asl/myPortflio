import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "netexec-smb": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }, { flag: "-H", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "netexec-ldap": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }, { flag: "-H", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "netexec-winrm": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }, { flag: "-H", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "netexec-rdp": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }, { flag: "-H", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "netexec-mssql": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }, { flag: "-H", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
};

const ACTION_FIXED_TOKENS = {
  "netexec-smb": [{ type: "flag", value: "smb" }],
  "netexec-ldap": [{ type: "flag", value: "ldap" }],
  "netexec-winrm": [{ type: "flag", value: "winrm" }],
  "netexec-rdp": [{ type: "flag", value: "rdp" }],
  "netexec-mssql": [{ type: "flag", value: "mssql" }],
};

export const NETEXEC_ACTIONS = Object.freeze([
  "netexec-smb", "netexec-ldap", "netexec-winrm", "netexec-rdp", "netexec-mssql"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["ad-enumeration", "ad-pass-the-hash", "domain-admin-validation"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  fixedTokens: ACTION_FIXED_TOKENS[id] ?? [],
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
