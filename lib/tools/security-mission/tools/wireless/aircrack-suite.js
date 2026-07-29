import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "airodump-ng-capture": [{ flag: "-b", valuePath: "target.bssid", omitWhenEmpty: true }, { flag: "-c", valuePath: "target.channel", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
  "aireplay-ng-deauth": [{ flag: "-b", valuePath: "target.bssid", omitWhenEmpty: true }, { flag: "-c", valuePath: "target.channel", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
  "aircrack-ng-crack": [{ flag: "-b", valuePath: "target.bssid", omitWhenEmpty: true }, { flag: "-c", valuePath: "target.channel", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.wordlist", omitWhenEmpty: true }, { positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
};

export const AIRCRACK_SUITE_ACTIONS = Object.freeze([
  "airodump-ng-capture", "aireplay-ng-deauth", "aircrack-ng-crack"
].map(id => ({
  id,
  toolId: id.split('-').slice(0, 2).join('-'),
  title: id.replace(/-/g, ' '),
  objectiveIds: ["wireless-assessment"],
  risk: "high",
  executable: { linux: id.split('-').slice(0, 2).join('-'), windows: id.split('-').slice(0, 2).join('-'), macos: id.split('-').slice(0, 2).join('-') },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
