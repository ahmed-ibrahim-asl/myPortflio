import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "tcpdump-capture": [{ flag: "-i", valuePath: "options.interface", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.outputFile", omitWhenEmpty: true }],
  "tshark-capture": [{ flag: "-i", valuePath: "options.interface", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.outputFile", omitWhenEmpty: true }],
  "wireshark-analyze": [{ flag: "-i", valuePath: "options.interface", omitWhenEmpty: true }, { flag: "-w", valuePath: "options.outputFile", omitWhenEmpty: true }],
};

export const CAPTURE_AND_ANALYSIS_ACTIONS = Object.freeze([
  "tcpdump-capture", "tshark-capture", "wireshark-analyze"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["traffic-analysis"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
