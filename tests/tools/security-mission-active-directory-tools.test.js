import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("active directory tools are registered and verified", () => {
  const expected = [
    "netexec-smb", "netexec-ldap", "netexec-winrm", "netexec-rdp", "netexec-mssql",
    "responder-analyze", "getnpusers-asreproast", "getuserspns-kerberoast",
    "psexec-connect", "wmiexec-connect", "smbexec-connect", "atexec-connect",
    "ntlmrelayx-relay", "gettgt-request", "getst-request", "ticketer-forge",
    "bloodhound-python-ingest", "sharphound-ingest", "ldapdomaindump-extract",
    "mimikatz-sekurlsa", "rubeus-asktgt", "rubeus-asreproast", "rubeus-kerberoast",
    "powerview-get-domainuser", "certipy-find", "certipy-req"
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
