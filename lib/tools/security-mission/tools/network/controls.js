export const CONTROLS = Object.freeze([
  {
    "id": "network-target-host",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.host",
    "level": "guided",
    "label": "Target Host / IP",
    "technicalTerm": "Destination IP/Hostname",
    "controlType": "host",
    "defaultValue": "192.168.1.1",
    "shortHelp": "Target IP or hostname for network operations",
    "explanation": {
      "what": "Target IP address or hostname",
      "why": "Specifies destination for network scanning",
      "useWhen": "Executing network discovery",
      "avoidWhen": "No target defined",
      "tradeoff": "None",
      "codeEffect": "Appends target host argument"
    },
    "validation": {},
    "actionIds": [
      "nmap-host-discovery",
      "nmap-tcp-scan",
      "ping-host",
      "traceroute-host",
      "whois-domain",
      "dig-records"
    ]
  }
]);
