import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "masscan-port-discovery": [{ flag: "-p", valuePath: "options.ports", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "rustscan-port-discovery": [{ flag: "-p", valuePath: "options.ports", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
};

export const FAST_SCANNERS_ACTIONS = Object.freeze([
  "masscan-port-discovery", "rustscan-port-discovery"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["host-discovery-port-scanning"],
  risk: "low",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
