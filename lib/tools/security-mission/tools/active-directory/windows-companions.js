import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "mimikatz-sekurlsa": [],
  "rubeus-asktgt": [],
  "rubeus-asreproast": [],
  "rubeus-kerberoast": [],
  "powerview-get-domainuser": [],
};

export const WINDOWS_COMPANIONS_ACTIONS = Object.freeze([
  "mimikatz-sekurlsa", "rubeus-asktgt", "rubeus-asreproast", "rubeus-kerberoast",
  "powerview-get-domainuser"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["ad-enumeration", "ad-weak-password-audit", "asrep-roasting", "ad-pass-the-hash", "ad-pass-the-ticket", "domain-admin-validation", "local-credential-discovery"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
