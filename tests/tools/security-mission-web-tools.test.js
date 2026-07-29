import test from "node:test";
import assert from "node:assert/strict";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";

test("web tools are registered and verified", () => {
  const expected = [
    "curl-request", "curl-authenticated-request", "curl-proxy-request",
    "curl-timing", "wget-download", "wget-bounded-mirror", "whatweb-fingerprint",
    "nikto-scan", "ffuf-content-discovery", "ffuf-vhost-discovery",
    "gobuster-directory", "gobuster-dns", "gobuster-vhost", "feroxbuster-content",
    "dirsearch-content", "wfuzz-request", "wpscan-enumerate", "sqlmap-identify",
    "sqlmap-request-file", "burp-suite-checklist", "owasp-zap-checklist"
  ];
  for (const actionId of expected) {
    const action = getSecurityAction(actionId);
    assert.ok(action, actionId);
    assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
  }
});
