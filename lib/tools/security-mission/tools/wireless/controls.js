export const CONTROLS = Object.freeze([
  {
    "id": "wireless-interface",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "options.interface",
    "level": "guided",
    "label": "Wireless Interface",
    "technicalTerm": "802.11 NIC Name",
    "controlType": "text",
    "defaultValue": "wlan0mon",
    "shortHelp": "Wireless monitor mode interface",
    "explanation": {
      "what": "Wireless network adapter in monitor mode",
      "why": "Required for raw 802.11 frame injection and capture",
      "useWhen": "Performing wireless assessment",
      "avoidWhen": "Wired network testing",
      "tradeoff": "Requires compatible hardware",
      "codeEffect": "Interface positional/flag"
    },
    "validation": {},
    "actionIds": [
      "iw-interface-info",
      "rfkill-unblock",
      "airmon-ng-monitor",
      "airodump-ng-capture",
      "aireplay-ng-deauth",
      "aircrack-ng-crack"
    ]
  }
]);
