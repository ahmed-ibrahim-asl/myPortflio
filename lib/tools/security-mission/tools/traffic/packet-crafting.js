import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "hping3-bounded-send": [{ flag: "-p", valuePath: "target.port", omitWhenEmpty: true }, { flag: "-c", valuePath: "options.count", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
};

export const PACKET_CRAFTING_ACTIONS = Object.freeze([
  "hping3-bounded-send"
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
