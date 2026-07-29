import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "iw-interface-info": [{ positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
  "rfkill-unblock": [{ positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
  "airmon-ng-monitor": [{ positional: true, valuePath: "options.interface", omitWhenEmpty: true }],
};

export const INTERFACE_MANAGEMENT_ACTIONS = Object.freeze([
  "iw-interface-info", "rfkill-unblock", "airmon-ng-monitor"
].map(id => ({
  id,
  toolId: id.startsWith("airmon") ? "airmon-ng" : id.split("-")[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["wireless-assessment"],
  risk: "high",
  executable: { linux: id.startsWith("airmon") ? "airmon-ng" : id.split("-")[0], windows: id.startsWith("airmon") ? "airmon-ng" : id.split("-")[0], macos: id.startsWith("airmon") ? "airmon-ng" : id.split("-")[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
