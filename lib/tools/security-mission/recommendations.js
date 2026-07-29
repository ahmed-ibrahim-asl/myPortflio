const RECOMMENDATIONS = Object.freeze({
  "host-discovery-port-scanning": { label: "Network sweep with Nmap", reason: "Nmap provides a comprehensive baseline of open ports and available services.", toolId: "nmap" },
  "network-foundations": { label: "Interface and route inspection", reason: "ip/ipconfig establishes baseline network understanding before active scanning.", toolId: "ip" },
  "service-enumeration": { label: "Full service version scan", reason: "Nmap -sV -sC identifies service versions and runs default NSE scripts.", toolId: "nmap" },
  "username-enumeration": { label: "Kerbrute user enumeration", reason: "Kerbrute silently probes Kerberos pre-auth to enumerate valid domain accounts.", toolId: "kerbrute" },
  "password-spraying": { label: "Kerbrute password spray", reason: "Kerbrute performs low-noise password spraying without triggering LDAP lockouts.", toolId: "kerbrute" },
  "remote-service-brute-force": { label: "Hydra service audit", reason: "Hydra supports many protocols and can audit credential strength on any exposed service.", toolId: "hydra" },
  "web-enumeration": { label: "Content discovery with ffuf", reason: "ffuf is fast, flexible, and handles virtual-host and directory fuzzing.", toolId: "ffuf" },
  "web-vulnerability-validation": { label: "Nikto web scan", reason: "Nikto checks for known misconfigurations and outdated server components.", toolId: "nikto" },
  "web-login-audit": { label: "Hydra HTTP form audit", reason: "Hydra supports POST-form login brute-forcing with configurable success conditions.", toolId: "hydra" },
  "outdated-web-components": { label: "WPScan component enumeration", reason: "WPScan identifies outdated plugins, themes, and WordPress core versions.", toolId: "wpscan" },
  "web-evidence-and-credentials": { label: "curl targeted request", reason: "curl documents exact request/response pairs for evidence capture.", toolId: "curl" },
  "service-exploitation": { label: "Searchsploit vulnerability search", reason: "Searchsploit finds local exploit-db entries matching the target service version.", toolId: "searchsploit" },
  "privilege-escalation": { label: "LinPEAS enumeration", reason: "LinPEAS automatically finds common privilege escalation vectors on Linux targets.", toolId: "linpeas" },
  "hash-auditing": { label: "Hashcat offline audit", reason: "Hashcat uses GPU acceleration for fast rule-based password recovery.", toolId: "hashcat" },
  "local-credential-discovery": { label: "Secretsdump local extraction", reason: "secretsdump extracts credentials from SAM, LSA secrets, and NTDS.dit.", toolId: "secretsdump" },
  "exploit-code-adaptation": { label: "Searchsploit exploit copy", reason: "Copy and inspect the exploit source before modifying it for the target environment.", toolId: "searchsploit" },
  "memory-corruption": { label: "checksec binary analysis", reason: "checksec identifies protections (NX, ASLR, Canary, PIE) before exploitation planning.", toolId: "checksec" },
  "ad-enumeration": { label: "BloodHound Python collection", reason: "BloodHound visualizes AD attack paths and shortest-path to Domain Admin.", toolId: "bloodhound-python" },
  "ad-weak-password-audit": { label: "Kerberoasting with GetUserSPNs", reason: "Kerberoasting retrieves service ticket hashes for offline cracking without special privileges.", toolId: "getuserspns" },
  "asrep-roasting": { label: "GetNPUsers ASREPRoast", reason: "GetNPUsers identifies accounts without Kerberos pre-auth and retrieves their hashes.", toolId: "getnpusers" },
  "ad-pass-the-hash": { label: "NetExec lateral movement", reason: "NetExec validates PTH credentials and provides an interactive session over SMB/WinRM.", toolId: "netexec" },
  "ad-pass-the-ticket": { label: "Rubeus ticket request", reason: "Rubeus provides precise control over Kerberos ticket operations.", toolId: "rubeus" },
  "domain-admin-validation": { label: "Secretsdump remote extraction", reason: "secretsdump validates Domain Admin access by dumping NTDS.dit remotely.", toolId: "secretsdump" },
  "traffic-analysis": { label: "tcpdump packet capture", reason: "tcpdump produces .pcap files compatible with Wireshark for offline analysis.", toolId: "tcpdump" },
  "wireless-assessment": { label: "airodump-ng capture", reason: "airodump-ng captures beacon frames and client associations for the target network.", toolId: "airodump-ng" },
  "pivoting-and-tunneling": { label: "Chisel TCP tunnel", reason: "Chisel creates reliable reverse tunnels through restrictive firewalls.", toolId: "chisel" },
  "reporting-and-evidence": { label: "curl evidence capture", reason: "Document each finding with timestamped curl request/response pairs.", toolId: "curl" },
});

export function getSecurityRecommendation({ objectiveId, actionId }) {
  if (!objectiveId) return null;
  const rec = RECOMMENDATIONS[objectiveId];
  if (!rec) return null;
  // Once a tool is already chosen, no top-level recommendation needed
  if (actionId) return null;
  return rec;
}
