import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("network tools are registered and verified", () => {
  const expected = [
    "ip-address-show", "ip-link-show", "ip-route-show", "ip-neighbor-show",
    "ipconfig-all", "ping-host", "fping-targets", "arp-table", "arp-scan-local",
    "netdiscover-range", "traceroute-host", "route-table", "ss-sockets",
    "netstat-sockets", "nmap-host-discovery", "nmap-tcp-scan", "nmap-udp-scan",
    "nmap-service-enumeration", "nmap-nse-scan", "masscan-port-discovery",
    "rustscan-port-discovery", "whois-domain", "dig-records", "dig-reverse",
    "dig-trace", "host-lookup", "nslookup-query", "dnsrecon-standard",
    "dnsenum-domain", "snmpwalk-oid", "onesixtyone-community-audit",
    "nbtscan-network", "enum4linux-enumerate", "smbclient-list-shares",
    "smbclient-browse-share", "rpcclient-query", "ldapsearch-query",
    "openssl-tls-inspect", "netcat-connect", "netcat-listen",
    "netcat-udp-connect", "netcat-banner-input", "ncat-tls-connect",
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
