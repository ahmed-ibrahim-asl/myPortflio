import { verificationFor } from "../../verification-helpers.js";
const ACTION_RULES = {
  "whois-domain": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "dig-records": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "dig-reverse": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "dig-trace": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "host-lookup": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "nslookup-query": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "dnsrecon-standard": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
  "dnsenum-domain": [{ positional: true, valuePath: "target.domain", omitWhenEmpty: true }],
};

export const DNS_ACTIONS = Object.freeze([
  "whois-domain", "dig-records", "dig-reverse",
  "dig-trace", "host-lookup", "nslookup-query", "dnsrecon-standard",
  "dnsenum-domain"
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
