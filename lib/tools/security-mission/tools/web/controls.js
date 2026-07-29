export const CONTROLS = Object.freeze([
  {
    "id": "web-target-url",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.url",
    "level": "guided",
    "label": "Target URL",
    "technicalTerm": "HTTP Endpoint URL",
    "controlType": "text",
    "defaultValue": "http://example.local",
    "shortHelp": "Target web application URL",
    "explanation": {
      "what": "Base URL for web application testing",
      "why": "Defines HTTP/HTTPS target",
      "useWhen": "Scanning web applications",
      "avoidWhen": "Non-HTTP targets",
      "tradeoff": "None",
      "codeEffect": "URL argument to web tool"
    },
    "validation": {},
    "actionIds": [
      "curl-request",
      "wget-download",
      "whatweb-fingerprint",
      "nikto-scan",
      "ffuf-content-discovery",
      "gobuster-directory",
      "feroxbuster-content",
      "dirsearch-content",
      "wpscan-enumerate",
      "sqlmap-identify"
    ]
  }
]);
