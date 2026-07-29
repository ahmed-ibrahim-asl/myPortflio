import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "ssh-local-forward": [{ flag: "-L", valuePath: "options.tunnelSpec", omitWhenEmpty: true }, { flag: "-D", valuePath: "options.dynamicPort", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "ssh-remote-forward": [{ flag: "-L", valuePath: "options.tunnelSpec", omitWhenEmpty: true }, { flag: "-D", valuePath: "options.dynamicPort", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
  "ssh-dynamic-forward": [{ flag: "-L", valuePath: "options.tunnelSpec", omitWhenEmpty: true }, { flag: "-D", valuePath: "options.dynamicPort", omitWhenEmpty: true }, { positional: true, valuePath: "target.host", omitWhenEmpty: true }],
};

export const SSH_TUNNELS_ACTIONS = Object.freeze([
  "ssh-local-forward", "ssh-remote-forward", "ssh-dynamic-forward"
].map(id => ({
  id,
  toolId: id.split('-')[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["pivoting-and-tunneling"],
  risk: "high",
  executable: { linux: id.split('-')[0], windows: id.split('-')[0], macos: id.split('-')[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
