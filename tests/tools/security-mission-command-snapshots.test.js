import test from "node:test";
import assert from "node:assert/strict";
import { createSecurityMissionBuilder } from "../../lib/tools/security-mission/builder.js";

test("representative commands compile to expected CLI snapshot strings", () => {
  const cases = [
    {
      objectiveId: "host-discovery-port-scanning",
      toolId: "nmap",
      actionId: "nmap-host-discovery",
      target: { network: "10.0.0.0/24" },
      expectedCommand: "nmap -sn '10.0.0.0/24'",
    },
    {
      objectiveId: "service-enumeration",
      toolId: "nmap",
      actionId: "nmap-tcp-scan",
      target: { network: "192.168.1.1" },
      expectedCommand: "nmap '192.168.1.1'",
    },
    {
      objectiveId: "web-enumeration",
      toolId: "curl",
      actionId: "curl-request",
      target: { url: "http://example.local" },
      expectedCommand: "curl 'http://example.local'",
    },
    {
      objectiveId: "username-enumeration",
      toolId: "kerbrute",
      actionId: "kerbrute-user-enumeration",
      target: { domain: "corp.local" },
      options: { wordlist: "users.txt" },
      expectedCommand: "kerbrute userenum --domain 'corp.local' 'users.txt'",
    },
  ];

  for (const c of cases) {
    const builder = createSecurityMissionBuilder();
    builder.dispatch({ type: "choose-objective", objectiveId: c.objectiveId });
    builder.dispatch({ type: "choose-tool", toolId: c.toolId });
    builder.dispatch({ type: "choose-action", actionId: c.actionId });
    if (c.target) builder.dispatch({ type: "patch-target", patch: c.target });
    if (c.options) builder.dispatch({ type: "patch-options", patch: c.options });

    const result = builder.getState();
    assert.ok(result.command, `No command generated for ${c.actionId}`);
    assert.equal(result.command.command, c.expectedCommand);
  }
});
