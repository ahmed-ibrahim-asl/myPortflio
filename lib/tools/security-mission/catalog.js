import { SECURITY_OBJECTIVES } from "./objective-registry.js";
import {
  NETWORK_ACTIONS,
  NETWORK_CONTROLS,
  NETWORK_TOOLS,
} from "./tools/network/index.js";
import {
  CREDENTIAL_ACTIONS,
  CREDENTIAL_CONTROLS,
  CREDENTIAL_TOOLS,
} from "./tools/credential-auditing/index.js";
import { WEB_ACTIONS, WEB_CONTROLS, WEB_TOOLS } from "./tools/web/index.js";
import {
  EXPLOITATION_ACTIONS,
  EXPLOITATION_CONTROLS,
  EXPLOITATION_TOOLS,
} from "./tools/exploitation/index.js";
import {
  PIVOTING_ACTIONS,
  PIVOTING_CONTROLS,
  PIVOTING_TOOLS,
} from "./tools/pivoting/index.js";
import {
  EXPLOIT_DEVELOPMENT_ACTIONS,
  EXPLOIT_DEVELOPMENT_CONTROLS,
  EXPLOIT_DEVELOPMENT_TOOLS,
} from "./tools/exploit-development/index.js";
import {
  ACTIVE_DIRECTORY_ACTIONS,
  ACTIVE_DIRECTORY_CONTROLS,
  ACTIVE_DIRECTORY_TOOLS,
} from "./tools/active-directory/index.js";
import {
  TRAFFIC_ACTIONS,
  TRAFFIC_CONTROLS,
  TRAFFIC_TOOLS,
} from "./tools/traffic/index.js";
import {
  WIRELESS_ACTIONS,
  WIRELESS_CONTROLS,
  WIRELESS_TOOLS,
} from "./tools/wireless/index.js";

export const SECURITY_MISSION_STEPS = Object.freeze([
  { id: "scope", title: "Scope" },
  { id: "objective", title: "Objective" },
  { id: "tool", title: "Tool" },
  { id: "action", title: "Action" },
  { id: "target", title: "Target" },
  { id: "configure", title: "Configure" },
  { id: "review", title: "Review" },
  { id: "generate", title: "Generate" },
]);

export const EXPECTED_SECURITY_TOOL_IDS = new Set([
  "ip", "ipconfig", "ping", "fping", "arp", "arp-scan", "netdiscover",
  "traceroute", "route", "ss", "netstat", "nmap", "masscan", "rustscan",
  "whois", "dig", "host", "nslookup", "dnsrecon", "dnsenum", "snmpwalk",
  "onesixtyone", "nbtscan", "enum4linux-ng", "smbclient", "rpcclient",
  "ldapsearch", "openssl", "netcat", "ncat", "hydra", "medusa", "ncrack",
  "kerbrute", "netexec", "ssh", "evil-winrm", "xfreerdp", "curl", "wget",
  "whatweb", "nikto", "ffuf", "gobuster", "feroxbuster", "dirsearch",
  "wfuzz", "wpscan", "sqlmap", "burp-suite", "owasp-zap", "searchsploit",
  "msfconsole", "msfvenom", "socat", "python-http-server",
  "impacket-smbserver", "linpeas", "winpeas", "pspy", "hashid", "hashcat",
  "john", "secretsdump", "proxychains", "sshuttle", "chisel", "ligolo-ng",
  "file", "strings", "objdump", "readelf", "checksec", "gdb", "pwndbg",
  "pattern-create", "pattern-offset", "gcc", "nasm", "python", "pwntools",
  "responder", "getnpusers", "getuserspns", "psexec", "wmiexec", "smbexec",
  "atexec", "ntlmrelayx", "gettgt", "getst", "ticketer",
  "bloodhound-python", "sharphound", "ldapdomaindump", "mimikatz", "rubeus",
  "powerview", "certipy", "hping3", "tcpdump", "tshark", "wireshark",
  "iw", "rfkill", "airmon-ng", "airodump-ng", "aireplay-ng", "aircrack-ng",
]);

export const SECURITY_TOOLS = Object.freeze([
  ...NETWORK_TOOLS, ...CREDENTIAL_TOOLS, ...WEB_TOOLS, ...EXPLOITATION_TOOLS,
  ...PIVOTING_TOOLS, ...EXPLOIT_DEVELOPMENT_TOOLS, ...ACTIVE_DIRECTORY_TOOLS,
  ...TRAFFIC_TOOLS, ...WIRELESS_TOOLS,
]);

export const SECURITY_ACTIONS = Object.freeze([
  ...NETWORK_ACTIONS, ...CREDENTIAL_ACTIONS, ...WEB_ACTIONS,
  ...EXPLOITATION_ACTIONS, ...PIVOTING_ACTIONS, ...EXPLOIT_DEVELOPMENT_ACTIONS,
  ...ACTIVE_DIRECTORY_ACTIONS, ...TRAFFIC_ACTIONS, ...WIRELESS_ACTIONS,
]);

export const SECURITY_CONTROLS = Object.freeze([
  ...NETWORK_CONTROLS, ...CREDENTIAL_CONTROLS, ...WEB_CONTROLS,
  ...EXPLOITATION_CONTROLS, ...PIVOTING_CONTROLS,
  ...EXPLOIT_DEVELOPMENT_CONTROLS, ...ACTIVE_DIRECTORY_CONTROLS,
  ...TRAFFIC_CONTROLS, ...WIRELESS_CONTROLS,
]);

export function getSecurityObjective(id) {
  return SECURITY_OBJECTIVES.find((item) => item.id === id) ?? null;
}

export function getSecurityTool(id) {
  return SECURITY_TOOLS.find((item) => item.id === id) ?? null;
}

export function getSecurityAction(id) {
  return SECURITY_ACTIONS.find((item) => item.id === id) ?? null;
}

export function validateSecurityCatalog(input) {
  const tools = input?.tools ?? SECURITY_TOOLS;
  const actions = input?.actions ?? SECURITY_ACTIONS;
  const errors = [];
  const toolIds = new Set();
  for (const tool of tools) {
    if (toolIds.has(tool.id)) errors.push(`Duplicate tool id: ${tool.id}`);
    toolIds.add(tool.id);
  }
  const actionIds = new Set();
  for (const action of actions) {
    if (actionIds.has(action.id)) errors.push(`Duplicate action id: ${action.id}`);
    actionIds.add(action.id);
  }
  return errors;
}
