export const CONTROLS = Object.freeze([
  {
    "id": "traffic-interface",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "options.interface",
    "level": "guided",
    "label": "Network Interface",
    "technicalTerm": "Network Device",
    "controlType": "text",
    "defaultValue": "eth0",
    "shortHelp": "Network interface name (e.g., eth0, wlan0)",
    "explanation": {
      "what": "Network interface for packet capture/sending",
      "why": "Binds capture or packet crafting to specific NIC",
      "useWhen": "Sniffing or crafting network traffic",
      "avoidWhen": "Default interface is sufficient",
      "tradeoff": "None",
      "codeEffect": "-i flag"
    },
    "validation": {},
    "actionIds": [
      "hping3-bounded-send",
      "tcpdump-capture",
      "tshark-capture",
      "wireshark-analyze"
    ]
  }
]);
