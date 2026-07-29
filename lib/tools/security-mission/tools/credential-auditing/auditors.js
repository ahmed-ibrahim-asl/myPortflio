import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "hydra-service-audit": [{ flag: "-l", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-P", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "hydra-http-form-audit": [{ flag: "-l", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-P", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "medusa-service-audit": [{ flag: "-h", valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-P", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "ncrack-service-audit": [{ flag: "-user", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-P", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "kerbrute-user-enumeration": [{ flag: "--domain", valuePath: "target.domain", omitWhenEmpty: true }, { positional: true, valuePath: "options.wordlist", omitWhenEmpty: true }],
  "kerbrute-password-spray": [{ flag: "--domain", valuePath: "target.domain", omitWhenEmpty: true }, { positional: true, valuePath: "options.wordlist", omitWhenEmpty: true }],
  "netexec-auth-check": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { flag: "-u", valuePath: "options.username", omitWhenEmpty: true }, { flag: "-p", valuePath: "options.password", omitWhenEmpty: true }],
};

const ACTION_FIXED_TOKENS = {
  "kerbrute-user-enumeration": [{ type: "flag", value: "userenum" }],
  "kerbrute-password-spray": [{ type: "flag", value: "passwordspray" }],
  "netexec-auth-check": [{ type: "flag", value: "smb" }],
};

export const AUDITORS_ACTIONS = Object.freeze([
  "hydra-service-audit", "hydra-http-form-audit", "medusa-service-audit",
  "ncrack-service-audit", "kerbrute-user-enumeration", "kerbrute-password-spray",
  "netexec-auth-check"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["username-enumeration", "password-spraying", "remote-service-brute-force"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  fixedTokens: ACTION_FIXED_TOKENS[id] ?? [],
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
