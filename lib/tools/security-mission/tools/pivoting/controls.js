export const CONTROLS = Object.freeze([
  {
    "id": "pivot-target-host",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.host",
    "level": "guided",
    "label": "Pivot Host / Jump Server",
    "technicalTerm": "Proxy/SSH Jump Host",
    "controlType": "host",
    "defaultValue": "10.10.10.1",
    "shortHelp": "SSH or proxy relay host",
    "explanation": {
      "what": "Relay host for network tunneling",
      "why": "Establishes pivot channel into internal network",
      "useWhen": "Routing traffic through pivot host",
      "avoidWhen": "Direct network access available",
      "tradeoff": "Adds latency",
      "codeEffect": "Target host argument"
    },
    "validation": {},
    "actionIds": [
      "ssh-local-forward",
      "ssh-remote-forward",
      "proxychains-wrap",
      "sshuttle-route",
      "chisel-server",
      "chisel-client",
      "ligolo-proxy"
    ]
  }
]);
