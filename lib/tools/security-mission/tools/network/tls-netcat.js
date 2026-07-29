import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "openssl-tls-inspect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
  "netcat-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
  "netcat-listen": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
  "netcat-udp-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
  "netcat-banner-input": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
  "ncat-tls-connect": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "options.port", omitWhenEmpty: true }],
};

export const TLS_NETCAT_ACTIONS = Object.freeze([
  "openssl-tls-inspect", "netcat-connect", "netcat-listen",
  "netcat-udp-connect", "netcat-banner-input", "ncat-tls-connect"
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
