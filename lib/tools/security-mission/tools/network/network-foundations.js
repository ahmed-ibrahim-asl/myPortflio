import { verificationFor } from "../../verification-helpers.js";
// Map action IDs to their correct tool IDs (overrides the default split('-')[0])
const TOOL_ID_OVERRIDES = {
  "arp-scan-local": "arp-scan",
  "netdiscover-range": "netdiscover",
};

// Map action IDs to their correct executable (overrides the default split('-')[0])
const EXECUTABLE_OVERRIDES = {
  "arp-scan-local": "arp-scan",
  "netdiscover-range": "netdiscover",
};

const ACTION_RULES = {
  "ip-address-show": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ip-link-show": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ip-route-show": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ip-neighbor-show": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ipconfig-all": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ping-host": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "fping-targets": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "arp-table": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "arp-scan-local": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "netdiscover-range": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "traceroute-host": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "route-table": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "ss-sockets": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
  "netstat-sockets": [{ positional: true, valuePath: "target.host", omitWhenEmpty: true }, { positional: true, valuePath: "target.network", omitWhenEmpty: true }],
};

export const NETWORK_FOUNDATIONS_ACTIONS = Object.freeze([
  "ip-address-show", "ip-link-show", "ip-route-show", "ip-neighbor-show",
  "ipconfig-all", "ping-host", "fping-targets", "arp-table", "arp-scan-local",
  "netdiscover-range", "traceroute-host", "route-table", "ss-sockets",
  "netstat-sockets"
].map(id => {
  const toolId = TOOL_ID_OVERRIDES[id] ?? id.split('-')[0];
  const exec = EXECUTABLE_OVERRIDES[id] ?? id.split('-')[0];
  return {
    id,
    toolId,
    title: id.replace(/-/g, ' '),
    objectiveIds: ["network-foundations", "host-discovery-port-scanning"],
    risk: "low",
    executable: { linux: exec, windows: exec, macos: exec },
    argumentRules: ACTION_RULES[id] ?? [],
    verification: verificationFor(id),
  };
}));
