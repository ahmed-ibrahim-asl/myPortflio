import { CONTROLS as NETWORK_CONTROLS } from "./controls.js";
import { TOOLS as NETWORK_TOOLS } from "./tools.js";
import { NETWORK_FOUNDATIONS_ACTIONS } from "./network-foundations.js";
import { NMAP_ACTIONS } from "./nmap.js";
import { FAST_SCANNERS_ACTIONS } from "./fast-scanners.js";
import { DNS_ACTIONS } from "./dns.js";
import { SNMP_ACTIONS } from "./snmp.js";
import { WINDOWS_SERVICES_ACTIONS } from "./windows-services.js";
import { TLS_NETCAT_ACTIONS } from "./tls-netcat.js";

export const NETWORK_ACTIONS = [
  ...NETWORK_FOUNDATIONS_ACTIONS,
  ...NMAP_ACTIONS,
  ...FAST_SCANNERS_ACTIONS,
  ...DNS_ACTIONS,
  ...SNMP_ACTIONS,
  ...WINDOWS_SERVICES_ACTIONS,
  ...TLS_NETCAT_ACTIONS,
];

export { NETWORK_TOOLS };
export { NETWORK_CONTROLS };
