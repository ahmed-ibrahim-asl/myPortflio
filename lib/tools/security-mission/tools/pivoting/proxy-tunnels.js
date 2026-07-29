import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "proxychains-wrap": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "sshuttle-route": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "chisel-server": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "chisel-client": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "ligolo-proxy": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "ligolo-agent": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "ligolo-route": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
  "socat-forward": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.tunnelSpec", omitWhenEmpty: true }],
};

export const PROXY_TUNNELS_ACTIONS = Object.freeze([
  "proxychains-wrap", "sshuttle-route", "chisel-server", "chisel-client",
  "ligolo-proxy", "ligolo-agent", "ligolo-route", "socat-forward"
].map(id => ({
  id,
  toolId: id.startsWith("ligolo") ? "ligolo-ng" : id.split("-")[0],
  title: id.replace(/-/g, ' '),
  objectiveIds: ["pivoting-and-tunneling"],
  risk: "high",
  executable: { linux: id.startsWith("ligolo") ? "ligolo-ng" : id.split("-")[0], windows: id.startsWith("ligolo") ? "ligolo-ng" : id.split("-")[0], macos: id.startsWith("ligolo") ? "ligolo-ng" : id.split("-")[0] },
  argumentRules: ACTION_RULES[id] ?? [],
  verification: verificationFor(id),
})));
