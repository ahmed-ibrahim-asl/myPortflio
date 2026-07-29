export const CONTROLS = Object.freeze([
  {
    "id": "cred-target-host",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.host",
    "level": "guided",
    "label": "Target Host / IP",
    "technicalTerm": "Authentication Endpoint",
    "controlType": "host",
    "defaultValue": "192.168.1.10",
    "shortHelp": "Target service host or IP address",
    "explanation": {
      "what": "Target server host",
      "why": "Specifies authentication service destination",
      "useWhen": "Auditing credentials",
      "avoidWhen": "Target scope not defined",
      "tradeoff": "None",
      "codeEffect": "Appends host argument to CLI"
    },
    "validation": {},
    "actionIds": [
      "hydra-service-audit",
      "medusa-service-audit",
      "ncrack-service-audit",
      "ssh-connect",
      "evil-winrm-connect",
      "xfreerdp-connect"
    ]
  }
]);
