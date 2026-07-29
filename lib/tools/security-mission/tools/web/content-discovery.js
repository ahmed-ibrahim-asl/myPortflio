import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "ffuf-content-discovery": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "ffuf-vhost-discovery": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "gobuster-directory": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "gobuster-dns": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "gobuster-vhost": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "feroxbuster-content": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "dirsearch-content": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
  "wfuzz-request": [{ flag: "-u", valuePath: "target.url", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }],
};

export const CONTENT_DISCOVERY_ACTIONS = Object.freeze([
  "ffuf-content-discovery", "ffuf-vhost-discovery",
  "gobuster-directory", "gobuster-dns", "gobuster-vhost", "feroxbuster-content",
  "dirsearch-content", "wfuzz-request"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["web-enumeration"],
  risk: "low",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
