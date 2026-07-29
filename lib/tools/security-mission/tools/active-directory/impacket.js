import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "getnpusers-asreproast": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "getuserspns-kerberoast": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "psexec-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "wmiexec-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "smbexec-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "atexec-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "ntlmrelayx-relay": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "gettgt-request": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "getst-request": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
  "ticketer-forge": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-hashes", valuePath: "options.ntlmHash", omitWhenEmpty: true }],
};

export const IMPACKET_ACTIONS = Object.freeze([
  "getnpusers-asreproast", "getuserspns-kerberoast",
  "psexec-connect", "wmiexec-connect", "smbexec-connect", "atexec-connect",
  "ntlmrelayx-relay", "gettgt-request", "getst-request", "ticketer-forge"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["ad-pass-the-hash", "ad-pass-the-ticket", "asrep-roasting", "domain-admin-validation"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
