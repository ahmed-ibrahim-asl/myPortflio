import test from "node:test";
import assert from "node:assert/strict";
import { compileSecurityCommand } from "../../lib/tools/security-mission/compiler.js";
import { getSecurityAction } from "../../lib/tools/security-mission/catalog.js";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";

const fixtureAction = {
  id: "fixture-connect",
  toolId: "fixture",
  title: "Connect",
  risk: "low",
  executable: { linux: "fixture", windows: "fixture.exe", macos: "fixture" },
  fixedTokens: [{ type: "flag", value: "--verbose" }],
  argumentRules: [
    { when: { path: "options.port", truthy: true }, flag: "--port", valuePath: "options.port" },
    { positional: true, valuePath: "target.host" },
  ],
  verification: {
    evidenceId: "fixture-connect",
    evidenceTier: "local-help",
    toolVersion: "1.0",
    verifiedAt: "2026-07-29",
    sourceUrls: [],
    helpCommand: "fixture --help",
  },
};

test("compiler produces equivalent one-line and formatted commands", () => {
  const result = compileSecurityCommand({
    ...createDefaultSecurityMissionProject(),
    toolId: "fixture",
    actionId: "fixture-connect",
    target: { host: "lab host" },
    options: { port: 443 },
  }, fixtureAction);
  assert.equal(result.command, "fixture --verbose --port '443' 'lab host'");
  assert.deepEqual(result.placeholders, []);
  assert.match(result.formatted, /\\\n/);
});

test("compiler tokens identify the project value that produced each argument", () => {
  const project = {
    ...createDefaultSecurityMissionProject(),
    toolId: "nmap",
    actionId: "nmap-host-discovery",
    target: { network: "10.20.30.0/24" },
  };
  const result = compileSecurityCommand(
    project,
    getSecurityAction("nmap-host-discovery"),
  );

  assert.deepEqual(result.tokens[0], {
    type: "executable",
    value: "nmap",
    sourcePath: null,
  });
  assert.ok(
    result.tokens.some((token) =>
      token.value === "10.20.30.0/24"
      && token.sourcePath === "target.network"),
  );
});
