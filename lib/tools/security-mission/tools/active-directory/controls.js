export const CONTROLS = Object.freeze([
  {
    "id": "ad-target-domain",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.domain",
    "level": "guided",
    "label": "Active Directory Domain",
    "technicalTerm": "FQDN Domain Name",
    "controlType": "text",
    "defaultValue": "corp.local",
    "shortHelp": "Fully qualified domain name",
    "explanation": {
      "what": "Active Directory domain name",
      "why": "Identifies domain for Kerberos and LDAP queries",
      "useWhen": "Interacting with AD domain services",
      "avoidWhen": "Workgroup environment",
      "tradeoff": "None",
      "codeEffect": "-d / --domain flag"
    },
    "validation": {},
    "actionIds": [
      "netexec-smb",
      "getnpusers-asreproast",
      "getuserspns-kerberoast",
      "psexec-connect",
      "wmiexec-connect",
      "responder-analyze",
      "bloodhound-python-ingest",
      "sharphound-ingest",
      "ldapdomaindump-extract",
      "certipy-find"
    ]
  }
]);
