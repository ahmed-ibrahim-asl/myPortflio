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
  "john", "rar2john", "zip2john", "secretsdump", "proxychains", "sshuttle", "chisel", "ligolo-ng",
  "file", "strings", "objdump", "readelf", "checksec", "gdb", "pwndbg",
  "pattern-create", "pattern-offset", "gcc", "nasm", "python", "pwntools",
  "responder", "getnpusers", "getuserspns", "psexec", "wmiexec", "smbexec",
  "atexec", "ntlmrelayx", "gettgt", "getst", "ticketer",
  "bloodhound-python", "sharphound", "ldapdomaindump", "mimikatz", "rubeus",
  "powerview", "certipy", "hping3", "tcpdump", "tshark", "wireshark",
  "iw", "rfkill", "airmon-ng", "airodump-ng", "aireplay-ng", "aircrack-ng",
]);

export const SECURITY_ACTIONS = Object.freeze([
  ...NETWORK_ACTIONS, ...CREDENTIAL_ACTIONS, ...WEB_ACTIONS,
  ...EXPLOITATION_ACTIONS, ...PIVOTING_ACTIONS, ...EXPLOIT_DEVELOPMENT_ACTIONS,
  ...ACTIVE_DIRECTORY_ACTIONS, ...TRAFFIC_ACTIONS, ...WIRELESS_ACTIONS,
]);

const TOOL_FAMILIES = Object.freeze([
  { category: "network", label: "network", tools: NETWORK_TOOLS },
  {
    category: "credential-auditing",
    label: "credential auditing",
    tools: CREDENTIAL_TOOLS,
  },
  { category: "web", label: "web application", tools: WEB_TOOLS },
  {
    category: "exploitation",
    label: "exploitation and post-exploitation",
    tools: EXPLOITATION_TOOLS,
  },
  { category: "pivoting", label: "pivoting and tunneling", tools: PIVOTING_TOOLS },
  {
    category: "exploit-development",
    label: "exploit development",
    tools: EXPLOIT_DEVELOPMENT_TOOLS,
  },
  {
    category: "active-directory",
    label: "Active Directory",
    tools: ACTIVE_DIRECTORY_TOOLS,
  },
  {
    category: "traffic",
    label: "traffic and packet analysis",
    tools: TRAFFIC_TOOLS,
  },
  { category: "wireless", label: "wireless", tools: WIRELESS_TOOLS },
]);

const TOOL_ALIASES = Object.freeze({
  "aircrack-ng": ["aircrack"],
  "airodump-ng": ["airodump"],
  "bloodhound-python": ["bloodhound"],
  "enum4linux-ng": ["enum4linux"],
  "impacket-smbserver": ["smbserver.py"],
  "msfconsole": ["metasploit"],
  "netcat": ["nc"],
  "ncat": ["nc"],
  "owasp-zap": ["zap"],
  "python-http-server": ["http.server"],
  "xfreerdp": ["freerdp"],
});

const GUI_COMPANION_IDS = new Set([
  "burp-suite",
  "owasp-zap",
  "wireshark",
]);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeSecurityTool(tool, category, categoryLabel) {
  const ownedActions = SECURITY_ACTIONS.filter(
    ({ toolId }) => toolId === tool.id,
  );
  const platforms = unique(
    ownedActions.flatMap(({ executable = {} }) => Object.keys(executable)),
  );
  const executableNames = unique(
    ownedActions.flatMap(({ executable = {} }) => Object.values(executable)),
  );
  const actionSummary = ownedActions
    .slice(0, 2)
    .map(({ title }) => title)
    .filter(Boolean)
    .join(" and ");
  const description = actionSummary
    ? `Use ${tool.name} for ${actionSummary.toLowerCase()} in an authorized lab.`
    : `Use ${tool.name} for authorized ${categoryLabel} laboratory work.`;
  const shells = unique([
    ...(platforms.includes("linux") || platforms.includes("macos")
      ? ["bash"]
      : []),
    ...(platforms.includes("windows") ? ["powershell", "cmd"] : []),
  ]);

  return Object.freeze({
    ...tool,
    aliases: Array.isArray(tool.aliases)
      ? tool.aliases
      : TOOL_ALIASES[tool.id] ?? [],
    description: tool.description ?? description,
    categories: Array.isArray(tool.categories)
      ? tool.categories
      : [category],
    platforms: Array.isArray(tool.platforms)
      ? tool.platforms
      : platforms,
    shells: Array.isArray(tool.shells) ? tool.shells : shells,
    interface: tool.interface
      ?? (GUI_COMPANION_IDS.has(tool.id) ? "gui-companion" : "cli"),
    executableNames: Array.isArray(tool.executableNames)
      ? tool.executableNames
      : executableNames,
    installNotes: Array.isArray(tool.installNotes)
      ? tool.installNotes
      : platforms.map((platform) => ({
          platform,
          text: `Install ${tool.name} from the platform's trusted package source.`,
        })),
    privilege: tool.privilege ?? "varies",
    homepage: tool.homepage ?? null,
  });
}

export const SECURITY_TOOLS = Object.freeze(
  TOOL_FAMILIES.flatMap(({ category, label, tools }) =>
    tools.map((tool) => normalizeSecurityTool(tool, category, label))),
);

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
