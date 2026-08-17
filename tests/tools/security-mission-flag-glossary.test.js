import test from "node:test";
import assert from "node:assert/strict";

import { SECURITY_ACTIONS } from "../../lib/tools/security-mission/catalog.js";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";
import { compileSecurityCommand } from "../../lib/tools/security-mission/compiler.js";
import {
  SECURITY_FLAG_GLOSSARY,
  getSecurityFlagDescription,
} from "../../lib/tools/security-mission/flag-glossary.js";

function collectRegistryFlagPairs() {
  const pairs = new Set();
  for (const action of SECURITY_ACTIONS) {
    for (const ft of action.fixedTokens ?? []) {
      if (ft.type === "flag") pairs.add(`${action.toolId} ${ft.value}`);
    }
    for (const rule of action.argumentRules ?? []) {
      if (rule.flag) pairs.add(`${action.toolId} ${rule.flag}`);
    }
  }
  return pairs;
}

test("every glossary entry references a (toolId, flag) pair that actually exists in the registry", () => {
  const registryPairs = collectRegistryFlagPairs();
  for (const [toolId, flags] of Object.entries(SECURITY_FLAG_GLOSSARY)) {
    for (const flag of Object.keys(flags)) {
      assert.ok(
        registryPairs.has(`${toolId} ${flag}`),
        `glossary has a stale entry for ${toolId} ${flag} that no action defines`,
      );
    }
  }
});

test("every fixed/flag token in the registry has a glossary description", () => {
  const registryPairs = collectRegistryFlagPairs();
  const missing = [];
  for (const pair of registryPairs) {
    const [toolId, flag] = pair.split(" ");
    if (!getSecurityFlagDescription(toolId, flag)) missing.push(pair);
  }
  assert.deepStrictEqual(
    missing,
    [],
    `expected full glossary coverage; missing entries for: ${missing.join(", ")}`,
  );
});

test("getSecurityFlagDescription returns null rather than throwing for an unknown tool or flag", () => {
  assert.strictEqual(getSecurityFlagDescription("not-a-real-tool", "-x"), null);
  assert.strictEqual(getSecurityFlagDescription("nmap", "-not-a-real-flag"), null);
});

test("compileSecurityCommand attaches a flag description to a known token (ffuf -u)", () => {
  const action = SECURITY_ACTIONS.find((a) => a.id === "ffuf-content-discovery");
  assert.ok(action, "expected the ffuf-content-discovery action to exist in the catalog");

  const project = createDefaultSecurityMissionProject();
  project.target = { ...project.target, url: "http://example.test" };
  project.options = { ...project.options, wordlist: "/usr/share/wordlists/common.txt" };

  const compiled = compileSecurityCommand(project, action);
  const uToken = compiled.tokens.find((t) => t.type === "flag" && t.value === "-u");
  assert.ok(uToken, "expected a -u flag token in the compiled command");
  assert.strictEqual(uToken.flagDescription, getSecurityFlagDescription("ffuf", "-u"));
  assert.ok(uToken.flagDescription.length > 0);
});

test("compileSecurityCommand surfaces sourceUrls for the doc citation link", () => {
  const action = SECURITY_ACTIONS.find((a) => a.id === "ffuf-content-discovery");
  const project = createDefaultSecurityMissionProject();
  const compiled = compileSecurityCommand(project, action);
  assert.ok(Array.isArray(compiled.sourceUrls));
  assert.ok(compiled.sourceUrls.length > 0);
  assert.ok(compiled.sourceUrls[0].startsWith("http"));
});

test("kerbrute and netexec subcommand tokens (userenum, smb, ldap, ...) are described even though they aren't -x style flags", () => {
  const action = SECURITY_ACTIONS.find((a) => a.id === "netexec-smb");
  assert.ok(action, "expected the netexec-smb action to exist in the catalog");
  const project = createDefaultSecurityMissionProject();
  const compiled = compileSecurityCommand(project, action);
  const subcommandToken = compiled.tokens.find((t) => t.type === "flag" && t.value === "smb");
  assert.ok(subcommandToken);
  assert.ok(subcommandToken.flagDescription.length > 0);
});
