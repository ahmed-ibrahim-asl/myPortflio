# Security Mission Command Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a registry-driven Security Mission tool that teaches, validates, and generates commands for the current eCPPT domains and the approved broader security-training catalog.

**Architecture:** Pure JavaScript registry, state, validation, quoting, compiler, workflow, and export modules provide deterministic behavior that Node's built-in test runner can exercise. TypeScript React components render the shared registry through one Next.js route. Nemotron 3 Ultra proposes catalog content from its trained knowledge, then verifies each public action against installed help or official upstream documentation.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2.7, TypeScript 6.0.3, ECMAScript modules, CSS Modules, Node `node:test`, Chrome or Edge DevTools Protocol for responsive tests, OpenCode with Nemotron 3 Ultra.

## Global Constraints

- Work from `D:\work\portflioWebsite\myPortfolio`.
- Read `D:\work\portflioWebsite\myPortfolio\AGENTS.md` before code changes.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`, `11-css.md`, and `node_modules/next/dist/docs/03-architecture/accessibility.md` before route or component work.
- Start from the completed portfolio and Model Mission state on an isolated `feature/security-mission-command-builder` branch or worktree.
- Preserve all unrelated tracked, staged, deleted, and untracked files.
- Public route: `/tools/security-command-builder/`.
- Product name: `Security Mission`.
- Tagline: `From objective to command, one choice at a time.`
- Generate commands in the browser. Do not execute commands, connect to targets, or add a server API.
- Support Bash, PowerShell, and Windows Command Prompt only where a verified tool action supports that shell.
- Build commands from typed tokens. Do not interpolate user input into raw shell strings.
- Use `local-help` or `official-docs` evidence for each public action. Keep `pending` actions out of the public catalog.
- Use Nemotron's trained knowledge to propose actions and explanations. Training data does not count as verification evidence.
- Store no real credentials, tokens, hashes, client names, private keys, or target data in fixtures, snapshots, reports, or commits.
- Exclude unbounded packet floods, destructive disk operations, persistence deployment, automatic data exfiltration, and arbitrary user-authored shell templates.
- Preserve Guided, Customize, and Advanced values when the user changes disclosure level.
- Use flat dark panels, cyan/green/gold signals, hard borders, square corners, and no gradients or blur.
- Keep the page within the viewport from 320 pixels through desktop widths.
- Use pure JavaScript for domain modules so `node --test` can import them without a TypeScript test runtime.
- Add no runtime dependency for schemas, shell quoting, command compilation, or exports.
- Start each task with behavior-focused failing tests.
- Run focused tests before shared regression tests.
- Update `docs/reports/2026-07-29-security-mission-implementation-progress.md` after each task.
- Commit each task separately. Do not combine unrelated tasks in one commit.
- Stop a task when official documentation conflicts with local help, a flag cannot be verified, or a required source is unavailable. Record the action as deferred.

## Execution Preflight

Nemotron must run these read-only checks before Task 1:

```powershell
Set-Location -LiteralPath 'D:\work\portflioWebsite\myPortfolio'
git status --short --branch
git rev-parse --show-toplevel
git branch --show-current
git log -5 --oneline --decorate
```

Expected:

- repository root is `D:/work/portflioWebsite/myPortfolio`;
- the base contains the completed Next.js migration and Model Mission;
- unrelated changes remain untouched.

If the current checkout is active or dirty, create an isolated worktree through
the environment's worktree workflow. Use this target path and branch:

```text
Worktree: D:\work\portflioWebsite\securityMissionWorktree
Branch: feature/security-mission-command-builder
```

Do not guess the base commit. Select the reviewed commit that contains the
completed portfolio and Model Mission implementation.

## File Responsibility Map

### Domain core

- `lib/tools/security-mission/catalog.js`: step IDs, aggregate lookups, public-catalog filtering.
- `lib/tools/security-mission/objective-registry.js`: eCPPT and supporting objective records.
- `lib/tools/security-mission/control-registry.js`: control validation, disclosure levels, visibility, enablement.
- `lib/tools/security-mission/project-config.js`: canonical defaults and normalization.
- `lib/tools/security-mission/project-config-migrations.js`: versioned import migrations.
- `lib/tools/security-mission/state.js`: reducer and UI state transitions.
- `lib/tools/security-mission/validation.js`: typed field and cross-field validation.
- `lib/tools/security-mission/quoting.js`: Bash, PowerShell, and CMD argument handling.
- `lib/tools/security-mission/sensitive-values.js`: secret classification and export sanitization.
- `lib/tools/security-mission/compiler.js`: typed command-token compilation.
- `lib/tools/security-mission/exports.js`: JSON, text, Markdown runbook, and low-risk script exports.
- `lib/tools/security-mission/recommendations.js`: deterministic tool and option recommendations.
- `lib/tools/security-mission/source-ledger.js`: verification-record lookup and validation.
- `lib/tools/security-mission/workflow-registry.js`: curated workflow definitions and binding validation.

### Catalog slices

- `lib/tools/security-mission/tools/network/`: network foundations, Nmap, fast scanners, DNS, SMB/RPC/LDAP, SNMP, TLS, Netcat.
- `lib/tools/security-mission/tools/credential-auditing/`: Hydra, Medusa, Ncrack, Kerbrute, NetExec authentication checks, remote access.
- `lib/tools/security-mission/tools/web/`: HTTP clients, fingerprinting, content discovery, web-audit tools, GUI companions.
- `lib/tools/security-mission/tools/exploitation/`: SearchSploit, Metasploit, msfvenom, file transfer, local enumeration, offline hash auditing.
- `lib/tools/security-mission/tools/pivoting/`: SSH forwarding, ProxyChains, sshuttle, Chisel, Ligolo-ng, Socat relays.
- `lib/tools/security-mission/tools/exploit-development/`: binary inspection, debugger/build tools, pattern tools, Pwntools companion.
- `lib/tools/security-mission/tools/active-directory/`: NetExec, Impacket, BloodHound collection, Responder, Kerberos and Windows companions.
- `lib/tools/security-mission/tools/traffic/`: hping3, tcpdump, tshark, Wireshark filter companion.
- `lib/tools/security-mission/tools/wireless/`: iw, rfkill, Aircrack-ng suite.

### Interface

- `lib/hooks/useSecurityMission.ts`: reducer, resolved project, validation, compilation, imports, exports, and copy state.
- `components/tools/security-mission/SecurityMissionShell.tsx`: page composition.
- `components/tools/security-mission/SecurityMissionNavigator.tsx`: objective/tool/workflow entry views.
- `components/tools/security-mission/SecurityMissionRail.tsx`: eight-step outer navigation.
- `components/tools/security-mission/SecurityMissionStepPanel.tsx`: current-step lesson and controls.
- `components/tools/security-mission/SecurityControlRenderer.tsx`: typed registry controls.
- `components/tools/security-mission/SecurityField.tsx`: field label, help, errors, and disclosure.
- `components/tools/security-mission/SecurityExplanation.tsx`: long-form educational content.
- `components/tools/security-mission/SecurityRecommendation.tsx`: advisory recommendation.
- `components/tools/security-mission/SecurityWarningPanel.tsx`: authorization, privilege, and rate warnings.
- `components/tools/security-mission/CommandPreviewPanel.tsx`: command summary, formatted output, copy, and downloads.
- `components/tools/security-mission/WorkflowPreviewPanel.tsx`: ordered steps, host roles, bindings, and runbook.
- `components/tools/security-mission/ToolBrowser.tsx`: searchable tool view.
- `components/tools/security-mission/ObjectiveBrowser.tsx`: certification and supporting objectives.
- `components/tools/security-mission/WorkflowBrowser.tsx`: workflow cards.
- `components/tools/security-mission/SecurityMission.module.css`: responsive visual contract.

### Route and evidence

- `app/tools/security-command-builder/page.tsx`: public route.
- `app/tools/security-command-builder/layout.tsx`: route layout.
- `app/tools/security-command-builder/template.tsx`: route template.
- `data/tools.js`: tools-index card.
- `docs/reports/2026-07-29-security-mission-tool-verification.json`: command-source evidence.
- `docs/reports/2026-07-29-security-mission-implementation-progress.md`: execution ledger.
- `docs/reports/2026-07-29-security-mission-audit.md`: final reader-facing audit.
- `docs/reports/2026-07-29-security-mission-evidence.json`: final machine-readable evidence.

---

### Task 1: Lock registry contracts, eCPPT coverage, and verification evidence

**Files:**
- Create: `lib/tools/security-mission/catalog.js`
- Create: `lib/tools/security-mission/objective-registry.js`
- Create: `lib/tools/security-mission/source-ledger.js`
- Create: `lib/tools/security-mission/tools/network/index.js`
- Create: `lib/tools/security-mission/tools/credential-auditing/index.js`
- Create: `lib/tools/security-mission/tools/web/index.js`
- Create: `lib/tools/security-mission/tools/exploitation/index.js`
- Create: `lib/tools/security-mission/tools/pivoting/index.js`
- Create: `lib/tools/security-mission/tools/exploit-development/index.js`
- Create: `lib/tools/security-mission/tools/active-directory/index.js`
- Create: `lib/tools/security-mission/tools/traffic/index.js`
- Create: `lib/tools/security-mission/tools/wireless/index.js`
- Create: `tests/tools/security-mission-catalog.test.js`
- Create: `tests/tools/security-mission-coverage.test.js`
- Create: `tests/tools/security-mission-source-ledger.test.js`
- Create: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Create: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `SECURITY_MISSION_STEPS`, `SECURITY_OBJECTIVES`, `EXPECTED_SECURITY_TOOL_IDS`.
- Produces: `SECURITY_TOOLS`, `SECURITY_ACTIONS`, `SECURITY_CONTROLS`.
- Produces: `getSecurityObjective(id)`, `getSecurityTool(id)`, `getSecurityAction(id)`.
- Produces: `validateSecurityCatalog(input?) -> string[]`.
- Produces: `validateVerificationLedger(ledger) -> string[]`.
- Produces: verification record shape `{ evidenceId, toolId, actionId, toolVersion, verifiedAt, evidenceTier, sourceUrls, helpCommand, notes }`.

**Authoritative source:**
- INE eCPPT objectives: `https://ine.com/security/certifications/ecppt-certification`
- Local repository conventions: `lib/tools/ml-generator/model-mission/catalog.js` and `control-registry.js`

- [ ] **Step 1: Create failing catalog and objective tests**

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  EXPECTED_SECURITY_TOOL_IDS,
  SECURITY_MISSION_STEPS,
  getSecurityObjective,
  validateSecurityCatalog,
} from "../../lib/tools/security-mission/catalog.js";

test("Security Mission exposes one eight-step workflow", () => {
  assert.deepEqual(
    SECURITY_MISSION_STEPS.map(({ id }) => id),
    ["scope", "objective", "tool", "action", "target", "configure", "review", "generate"],
  );
});

test("the catalog reserves every approved tool family", () => {
  for (const id of ["nmap", "hashcat", "netcat", "ncat", "hydra", "hping3", "airmon-ng"]) {
    assert.equal(EXPECTED_SECURITY_TOOL_IDS.has(id), true, id);
  }
  assert.deepEqual(validateSecurityCatalog(), []);
});

test("current eCPPT objectives retain their official source text", () => {
  const objective = getSecurityObjective("host-discovery-port-scanning");
  assert.equal(objective.certification.name, "eCPPT");
  assert.equal(objective.domain, "reconnaissance");
  assert.match(objective.certification.sourceUrl, /ine\.com/);
});
```

- [ ] **Step 2: Run the tests and confirm the missing-module failure**

Run:

```powershell
node --test tests/tools/security-mission-catalog.test.js tests/tools/security-mission-coverage.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/tools/security-mission/catalog.js`.

- [ ] **Step 3: Implement objective and catalog contracts**

Create `objective-registry.js` with explicit records for:

```js
export const SECURITY_OBJECTIVE_IDS = Object.freeze([
  "host-discovery-port-scanning",
  "service-enumeration",
  "username-enumeration",
  "password-spraying",
  "remote-service-brute-force",
  "web-enumeration",
  "web-vulnerability-validation",
  "web-login-audit",
  "outdated-web-components",
  "web-evidence-and-credentials",
  "service-exploitation",
  "privilege-escalation",
  "hash-auditing",
  "local-credential-discovery",
  "exploit-code-adaptation",
  "memory-corruption",
  "ad-enumeration",
  "ad-weak-password-audit",
  "asrep-roasting",
  "ad-pass-the-hash",
  "ad-pass-the-ticket",
  "domain-admin-validation",
  "network-foundations",
  "traffic-analysis",
  "wireless-assessment",
  "pivoting-and-tunneling",
  "reporting-and-evidence",
]);
```

Each of the first 22 records must copy the matching published objective text,
set `certification.name` to `eCPPT`, and set the reviewed source date to
`2026-07-29`. Supporting records use `certification.name: null`.

Create each tool-family `index.js` with three empty frozen arrays. For example:

```js
export const NETWORK_TOOLS = Object.freeze([]);
export const NETWORK_ACTIONS = Object.freeze([]);
export const NETWORK_CONTROLS = Object.freeze([]);
```

Create `catalog.js` by importing each family index and aggregating its arrays:

```js
import { SECURITY_OBJECTIVES } from "./objective-registry.js";
import {
  NETWORK_ACTIONS,
  NETWORK_CONTROLS,
  NETWORK_TOOLS,
} from "./tools/network/index.js";
import {
  CREDENTIAL_ACTIONS,
  CREDENTIAL_CONTROLS,
  CREDENTIAL_TOOLS,
} from "./tools/credential-auditing/index.js";
import { WEB_ACTIONS, WEB_CONTROLS, WEB_TOOLS } from "./tools/web/index.js";
import {
  EXPLOITATION_ACTIONS,
  EXPLOITATION_CONTROLS,
  EXPLOITATION_TOOLS,
} from "./tools/exploitation/index.js";
import {
  PIVOTING_ACTIONS,
  PIVOTING_CONTROLS,
  PIVOTING_TOOLS,
} from "./tools/pivoting/index.js";
import {
  EXPLOIT_DEVELOPMENT_ACTIONS,
  EXPLOIT_DEVELOPMENT_CONTROLS,
  EXPLOIT_DEVELOPMENT_TOOLS,
} from "./tools/exploit-development/index.js";
import {
  ACTIVE_DIRECTORY_ACTIONS,
  ACTIVE_DIRECTORY_CONTROLS,
  ACTIVE_DIRECTORY_TOOLS,
} from "./tools/active-directory/index.js";
import {
  TRAFFIC_ACTIONS,
  TRAFFIC_CONTROLS,
  TRAFFIC_TOOLS,
} from "./tools/traffic/index.js";
import {
  WIRELESS_ACTIONS,
  WIRELESS_CONTROLS,
  WIRELESS_TOOLS,
} from "./tools/wireless/index.js";

export const SECURITY_MISSION_STEPS = Object.freeze([
  { id: "scope", title: "Scope" },
  { id: "objective", title: "Objective" },
  { id: "tool", title: "Tool" },
  { id: "action", title: "Action" },
  { id: "target", title: "Target" },
  { id: "configure", title: "Configure" },
  { id: "review", title: "Review" },
  { id: "generate", title: "Generate" },
]);

export const EXPECTED_SECURITY_TOOL_IDS = new Set([
  "ip", "ipconfig", "ping", "fping", "arp", "arp-scan", "netdiscover",
  "traceroute", "route", "ss", "netstat", "nmap", "masscan", "rustscan",
  "whois", "dig", "host", "nslookup", "dnsrecon", "dnsenum", "snmpwalk",
  "onesixtyone", "nbtscan", "enum4linux-ng", "smbclient", "rpcclient",
  "ldapsearch", "openssl", "netcat", "ncat", "hydra", "medusa", "ncrack",
  "kerbrute", "netexec", "ssh", "evil-winrm", "xfreerdp", "curl", "wget",
  "whatweb", "nikto", "ffuf", "gobuster", "feroxbuster", "dirsearch",
  "wfuzz", "wpscan", "sqlmap", "burp-suite", "owasp-zap", "searchsploit",
  "msfconsole", "msfvenom", "socat", "python-http-server",
  "impacket-smbserver", "linpeas", "winpeas", "pspy", "hashid", "hashcat",
  "john", "secretsdump", "proxychains", "sshuttle", "chisel", "ligolo-ng",
  "file", "strings", "objdump", "readelf", "checksec", "gdb", "pwndbg",
  "pattern-create", "pattern-offset", "gcc", "nasm", "python", "pwntools",
  "responder", "getnpusers", "getuserspns", "psexec", "wmiexec", "smbexec",
  "atexec", "ntlmrelayx", "gettgt", "getst", "ticketer",
  "bloodhound-python", "sharphound", "ldapdomaindump", "mimikatz", "rubeus",
  "powerview", "certipy", "hping3", "tcpdump", "tshark", "wireshark",
  "iw", "rfkill", "airmon-ng", "airodump-ng", "aireplay-ng", "aircrack-ng",
]);

export const SECURITY_TOOLS = Object.freeze([
  ...NETWORK_TOOLS, ...CREDENTIAL_TOOLS, ...WEB_TOOLS, ...EXPLOITATION_TOOLS,
  ...PIVOTING_TOOLS, ...EXPLOIT_DEVELOPMENT_TOOLS, ...ACTIVE_DIRECTORY_TOOLS,
  ...TRAFFIC_TOOLS, ...WIRELESS_TOOLS,
]);

export const SECURITY_ACTIONS = Object.freeze([
  ...NETWORK_ACTIONS, ...CREDENTIAL_ACTIONS, ...WEB_ACTIONS,
  ...EXPLOITATION_ACTIONS, ...PIVOTING_ACTIONS, ...EXPLOIT_DEVELOPMENT_ACTIONS,
  ...ACTIVE_DIRECTORY_ACTIONS, ...TRAFFIC_ACTIONS, ...WIRELESS_ACTIONS,
]);

export const SECURITY_CONTROLS = Object.freeze([
  ...NETWORK_CONTROLS, ...CREDENTIAL_CONTROLS, ...WEB_CONTROLS,
  ...EXPLOITATION_CONTROLS, ...PIVOTING_CONTROLS,
  ...EXPLOIT_DEVELOPMENT_CONTROLS, ...ACTIVE_DIRECTORY_CONTROLS,
  ...TRAFFIC_CONTROLS, ...WIRELESS_CONTROLS,
]);

export function getSecurityObjective(id) {
  return SECURITY_OBJECTIVES.find((item) => item.id === id) ?? null;
}

export function getSecurityTool(id) {
  return SECURITY_TOOLS.find((item) => item.id === id) ?? null;
}

export function getSecurityAction(id) {
  return SECURITY_ACTIONS.find((item) => item.id === id) ?? null;
}
```

`validateSecurityCatalog()` must check unique IDs, valid domains, valid
certification mappings, and duplicate aliases. It must allow reserved tools to
remain unregistered until their catalog task lands.

- [ ] **Step 4: Add the verification ledger and its failing tests**

```js
test("public actions require versioned source evidence", () => {
  const errors = validateVerificationLedger({
    records: [{
      evidenceId: "nmap-host-discovery",
      toolId: "nmap",
      actionId: "nmap-host-discovery",
      toolVersion: "",
      verifiedAt: "2026-07-29",
      evidenceTier: "pending",
      sourceUrls: [],
      helpCommand: "",
      notes: "",
    }],
  });
  assert.ok(errors.some((error) => error.includes("toolVersion")));
  assert.ok(errors.some((error) => error.includes("pending")));
});
```

Create `source-ledger.js` with:

```js
import verificationLedger from "../../../docs/reports/2026-07-29-security-mission-tool-verification.json" with { type: "json" };

export const PUBLIC_EVIDENCE_TIERS = new Set(["local-help", "official-docs"]);

export function getVerificationRecord(ledger, actionId) {
  return ledger.records.find((record) => record.actionId === actionId) ?? null;
}

export function verificationFor(actionId) {
  return getVerificationRecord(verificationLedger, actionId);
}

export function validateVerificationLedger(ledger, { publicActionIds = [] } = {}) {
  const errors = [];
  const seen = new Set();
  for (const record of ledger?.records ?? []) {
    if (!record.evidenceId || seen.has(record.evidenceId)) {
      errors.push(`Verification record has a missing or duplicate evidenceId: ${record.evidenceId ?? "<missing>"}.`);
    }
    seen.add(record.evidenceId);
    if (!record.toolVersion) errors.push(`${record.evidenceId} is missing toolVersion.`);
    if (!record.verifiedAt) errors.push(`${record.evidenceId} is missing verifiedAt.`);
    if (record.evidenceTier === "official-docs" && record.sourceUrls.length === 0) {
      errors.push(`${record.evidenceId} is missing an official source URL.`);
    }
    if (publicActionIds.includes(record.actionId) && !PUBLIC_EVIDENCE_TIERS.has(record.evidenceTier)) {
      errors.push(`${record.evidenceId} cannot ship with evidence tier ${record.evidenceTier}.`);
    }
  }
  return errors;
}
```

Initialize the JSON ledger:

```json
{
  "schemaVersion": 1,
  "reviewedAt": "2026-07-29",
  "records": []
}
```

- [ ] **Step 5: Run Task 1 tests**

Run:

```powershell
node --test tests/tools/security-mission-catalog.test.js tests/tools/security-mission-coverage.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Create the progress ledger**

```markdown
# Security Mission Implementation Progress

## Baseline

- Specification: `docs/superpowers/specs/2026-07-29-security-mission-command-builder-design.md`
- Plan: `docs/superpowers/plans/2026-07-29-security-mission-command-builder.md`
- Branch: `feature/security-mission-command-builder`
- Current task: Task 1 complete
- Deferred actions: none
```

- [ ] **Step 7: Commit Task 1**

```powershell
git add -- lib/tools/security-mission/catalog.js lib/tools/security-mission/objective-registry.js lib/tools/security-mission/source-ledger.js lib/tools/security-mission/tools tests/tools/security-mission-catalog.test.js tests/tools/security-mission-coverage.test.js tests/tools/security-mission-source-ledger.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: define Security Mission registry contracts"
```

### Task 2: Add canonical project state and migrations

**Files:**
- Create: `lib/tools/security-mission/project-config.js`
- Create: `lib/tools/security-mission/project-config-migrations.js`
- Create: `lib/tools/security-mission/state.js`
- Create: `tests/tools/security-mission-project-config.test.js`
- Create: `tests/tools/security-mission-state.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: `SECURITY_MISSION_STEPS`.
- Produces: `SECURITY_MISSION_SCHEMA_VERSION = 1`.
- Produces: `createDefaultSecurityMissionProject()`.
- Produces: `normalizeSecurityMissionProject(input)`.
- Produces: `migrateSecurityMissionProject(input)`.
- Produces: `createSecurityMissionState()` and `securityMissionReducer(state, action)`.

- [ ] **Step 1: Write failing project and reducer tests**

```js
test("default project starts in a certification lab with no target values", () => {
  const project = createDefaultSecurityMissionProject();
  assert.equal(project.schemaVersion, 1);
  assert.equal(project.authorizationContext, "certification-lab");
  assert.equal(project.learningLevel, "guided");
  assert.equal(project.mode, "command");
  assert.deepEqual(project.target, {});
  assert.deepEqual(project.options, {});
});

test("level changes preserve hidden options", () => {
  let state = createSecurityMissionState();
  state = securityMissionReducer(state, { type: "patch-options", patch: { timing: "T3" } });
  state = securityMissionReducer(state, { type: "set-learning-level", level: "advanced" });
  state = securityMissionReducer(state, { type: "set-learning-level", level: "guided" });
  assert.equal(state.project.options.timing, "T3");
});

test("choosing an incompatible tool clears action-specific values", () => {
  let state = createSecurityMissionState();
  state = securityMissionReducer(state, { type: "choose-tool", toolId: "nmap" });
  state = securityMissionReducer(state, { type: "choose-action", actionId: "nmap-tcp-scan" });
  state = securityMissionReducer(state, { type: "patch-options", patch: { ports: "80,443" } });
  state = securityMissionReducer(state, { type: "choose-tool", toolId: "curl" });
  assert.equal(state.project.actionId, null);
  assert.deepEqual(state.project.options, {});
});
```

- [ ] **Step 2: Confirm RED**

Run:

```powershell
node --test tests/tools/security-mission-project-config.test.js tests/tools/security-mission-state.test.js
```

Expected: FAIL with missing exports.

- [ ] **Step 3: Implement project normalization**

```js
export const SECURITY_MISSION_SCHEMA_VERSION = 1;

export function createDefaultSecurityMissionProject() {
  return {
    schemaVersion: SECURITY_MISSION_SCHEMA_VERSION,
    mode: "command",
    authorizationContext: "certification-lab",
    learningLevel: "guided",
    platform: "linux",
    shell: "bash",
    objectiveId: "host-discovery-port-scanning",
    toolId: null,
    actionId: null,
    workflowId: null,
    target: {},
    options: {},
    output: {
      format: "multi-line",
      includeComments: true,
      includeLabValues: false,
    },
    workflow: {
      activeStepId: null,
      steps: [],
    },
  };
}
```

`normalizeSecurityMissionProject()` must clone JSON-compatible values, restrict
enums to approved values, and drop unknown top-level keys. Migration must accept
only plain JSON records and reject functions, symbols, cyclic values, and
prototype-pollution keys.

- [ ] **Step 4: Implement reducer actions**

Support these exact action types:

```text
choose-mode
set-authorization-context
set-learning-level
set-platform
set-shell
choose-objective
choose-tool
choose-action
choose-workflow
patch-target
patch-options
patch-output
patch-workflow-step
go-to-step
next-step
previous-step
set-workspace-tab
set-copy-status
import-project
reset-project
```

State shape:

```js
{
  project: createDefaultSecurityMissionProject(),
  stepId: "scope",
  workspaceTab: "configure",
  navigatorTab: "objective",
  copyStatus: "idle",
  importError: "",
}
```

- [ ] **Step 5: Run Task 2 and Task 1 tests**

```powershell
node --test tests/tools/security-mission-project-config.test.js tests/tools/security-mission-state.test.js tests/tools/security-mission-catalog.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

Record Task 2 files, test results, and commit intent in the progress ledger.

```powershell
git add -- lib/tools/security-mission/project-config.js lib/tools/security-mission/project-config-migrations.js lib/tools/security-mission/state.js tests/tools/security-mission-project-config.test.js tests/tools/security-mission-state.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: manage Security Mission project state"
```

### Task 3: Add controls, rules, and deterministic recommendations

**Files:**
- Create: `lib/tools/security-mission/control-registry.js`
- Create: `lib/tools/security-mission/recommendations.js`
- Create: `tests/tools/security-mission-control-registry.test.js`
- Create: `tests/tools/security-mission-recommendations.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `SECURITY_LEARNING_LEVEL_RANK`.
- Produces: `evaluateSecurityRule(rule, project)`.
- Produces: `getSecurityControls({ actionId, stepId, learningLevel, project, controls = SECURITY_CONTROLS })`.
- Produces: `validateSecurityControlRegistry(controls)`.
- Produces: `getSecurityRecommendation({ objectiveId, actionId, controlId, project })`.

- [ ] **Step 1: Write failing cumulative-level and rule tests**

```js
test("control levels remain cumulative", () => {
  const controls = [
    { id: "host", actionIds: ["fixture"], step: "configure", level: "guided" },
    { id: "timeout", actionIds: ["fixture"], step: "configure", level: "customize" },
    { id: "debug", actionIds: ["fixture"], step: "configure", level: "advanced" },
  ];
  const project = { toolId: "fixture", actionId: "fixture", options: {} };
  const guided = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "guided", project, controls });
  const customize = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "customize", project, controls });
  const advanced = getSecurityControls({ actionId: project.actionId, stepId: "configure", learningLevel: "advanced", project, controls });
  assert.ok(guided.every(({ id }) => customize.some((item) => item.id === id)));
  assert.ok(customize.every(({ id }) => advanced.some((item) => item.id === id)));
});

test("rules support all, any, not, equality, inclusion, and truthy checks", () => {
  const project = { platform: "linux", options: { udp: true, scripts: ["safe"] } };
  assert.equal(evaluateSecurityRule({ all: [
    { path: "platform", equals: "linux" },
    { path: "options.udp", truthy: true },
  ] }, project), true);
  assert.equal(evaluateSecurityRule({ not: { path: "platform", equals: "windows" } }, project), true);
});
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-recommendations.test.js
```

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement frozen control definitions and rule evaluation**

Each control must contain:

```js
{
  id: "targetHost",
  actionIds: ["nmap-tcp-scan"],
  step: "target",
  section: "target",
  configKey: "host",
  level: "guided",
  label: "Target host",
  technicalTerm: "IPv4, IPv6, or hostname",
  controlType: "host",
  defaultValue: "",
  shortHelp: "Enter one authorized lab host.",
  explanation: {
    what: "The host or address that receives the scan.",
    why: "A specific target keeps the generated command inside the selected scope.",
    useWhen: "Use one host while learning or validating a finding.",
    avoidWhen: "Avoid entering systems outside the approved lab or client scope.",
    tradeoff: "A single host provides less network coverage than a CIDR target.",
    codeEffect: "The compiler appends the quoted host as the final target argument.",
  },
  validation: [{ type: "host" }],
}
```

The validator must reject missing keys, duplicate IDs per action, invalid
levels, invalid steps, and incomplete explanation fields.

- [ ] **Step 4: Implement recommendation records**

Add deterministic records for:

```text
general service discovery -> nmap
known HTTP request reproduction -> curl
content discovery -> ffuf or gobuster
basic TCP/UDP check -> netcat
TLS Netcat action -> ncat
offline hash audit -> hashcat or john
multi-protocol AD checks -> netexec
Kerberos-specific task -> matching Impacket action
fast packet capture -> tcpdump
structured CLI packet analysis -> tshark
interactive inspection -> GUI companion
```

Return `{ label, reason, toolId, actionId? }`. Do not mutate the project.

- [ ] **Step 5: Run Task 3 tests and regressions**

```powershell
node --test tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-recommendations.test.js tests/tools/security-mission-project-config.test.js tests/tools/security-mission-state.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/control-registry.js lib/tools/security-mission/recommendations.js tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-recommendations.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: teach Security Mission controls"
```

### Task 4: Secure typed validation, quoting, and sensitive values

**Files:**
- Create: `lib/tools/security-mission/validation.js`
- Create: `lib/tools/security-mission/quoting.js`
- Create: `lib/tools/security-mission/sensitive-values.js`
- Create: `tests/tools/security-mission-validation.test.js`
- Create: `tests/tools/security-mission-quoting.test.js`
- Create: `tests/tools/security-mission-sensitive-values.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `validateControlValue(control, value) -> string[]`.
- Produces: `validateSecurityProject(project, action) -> { errors, warnings }`.
- Produces: `quoteShellArgument(value, shell) -> string`.
- Produces: `sanitizeImportedProject(project)` and `sanitizeProjectForExport(project)`.
- Produces: `SECRET_PLACEHOLDERS`.

- [ ] **Step 1: Write failing typed-validation tests**

```js
test("typed values reject command separators and malformed targets", () => {
  assert.notDeepEqual(validateControlValue({ controlType: "host" }, "10.10.10.10; whoami"), []);
  assert.notDeepEqual(validateControlValue({ controlType: "port" }, 70000), []);
  assert.notDeepEqual(validateControlValue({ controlType: "cidr" }, "10.10.0.0/99"), []);
  assert.notDeepEqual(validateControlValue({ controlType: "bssid" }, "not-a-bssid"), []);
});

test("unsafe output paths fail", () => {
  for (const value of ["../loot.txt", "C:\\absolute.txt", "/tmp/absolute.txt", "logs/a\nb.txt"]) {
    assert.notDeepEqual(validateControlValue({ controlType: "output-path" }, value), []);
  }
});
```

- [ ] **Step 2: Write failing shell-quoting tests**

```js
test("Bash keeps one user value inside one argument", () => {
  assert.equal(quoteShellArgument("a b'c;whoami", "bash"), "'a b'\"'\"'c;whoami'");
});

test("PowerShell keeps metacharacters inside a literal string", () => {
  assert.equal(quoteShellArgument("a b'; Get-Process", "powershell"), "'a b''; Get-Process'");
});

test("CMD rejects expansion characters that cannot be represented safely", () => {
  assert.throws(() => quoteShellArgument("%PATH%", "cmd"), /CMD expansion/);
  assert.throws(() => quoteShellArgument("hello!name", "cmd"), /CMD expansion/);
});
```

- [ ] **Step 3: Confirm RED**

```powershell
node --test tests/tools/security-mission-validation.test.js tests/tools/security-mission-quoting.test.js tests/tools/security-mission-sensitive-values.test.js
```

Expected: FAIL with missing exports.

- [ ] **Step 4: Implement validators**

Use explicit parsers for:

```text
host
cidr
url
domain
port
port-range
username
path
output-path
duration
rate
bssid
channel
sid
spn
placeholder-secret
```

Reject control characters, NUL, CR, LF, and values longer than each control's
declared maximum. Parse IP and CIDR values without accepting shell syntax.

- [ ] **Step 5: Implement shell quoting**

```js
function quoteBash(value) {
  return "'" + String(value).replaceAll("'", "'\"'\"'") + "'";
}

function quotePowerShell(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function quoteCmd(value) {
  const text = String(value);
  if (/[%!\r\n\0]/.test(text)) {
    throw new Error("CMD expansion characters are not supported in user values.");
  }
  return `"${text.replaceAll('"', '""')}"`;
}
```

`quoteShellArgument()` selects the correct implementation and rejects unknown
shells.

- [ ] **Step 6: Implement secret sanitization**

```js
export const SECRET_PLACEHOLDERS = Object.freeze({
  password: "<PASSWORD>",
  token: "<TOKEN>",
  cookie: "<COOKIE>",
  hash: "<HASH>",
  privateKeyPath: "<PRIVATE_KEY_PATH>",
});
```

Mark controls through `sensitiveKind`. Imports replace secret-shaped values.
Exports remove credentials, cookies, authorization headers, inline hashes, and
private-key contents. Exports replace targets unless
`project.output.includeLabValues === true`.

- [ ] **Step 7: Run focused and shared tests**

```powershell
node --test tests/tools/security-mission-validation.test.js tests/tools/security-mission-quoting.test.js tests/tools/security-mission-sensitive-values.test.js tests/tools/security-mission-project-config.test.js
```

Expected: PASS.

- [ ] **Step 8: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/validation.js lib/tools/security-mission/quoting.js lib/tools/security-mission/sensitive-values.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-quoting.test.js tests/tools/security-mission-sensitive-values.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: secure Security Mission command values"
```

### Task 5: Build the deterministic compiler and sanitized exports

**Files:**
- Create: `lib/tools/security-mission/compiler.js`
- Create: `lib/tools/security-mission/exports.js`
- Create: `tests/tools/security-mission-compiler.test.js`
- Create: `tests/tools/security-mission-exports.test.js`
- Create: `tests/tools/security-mission-command-snapshots.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: action records, validation, quoting, sensitive-value handling.
- Produces: `compileSecurityCommand(project, action) -> GeneratedSecurityCommand`.
- Produces: `buildSecurityProjectExport(project)`.
- Produces: `buildWorkflowRunbook(project, workflow, compiledSteps)`.
- Produces: `buildPlainTextCommandList(compiledSteps)`.
- Produces: `buildLowRiskScript(project, workflow, compiledSteps)`.

- [ ] **Step 1: Write compiler tests around a verified fixture action**

```js
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
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-compiler.test.js tests/tools/security-mission-exports.test.js tests/tools/security-mission-command-snapshots.test.js
```

Expected: FAIL with missing compiler and export modules.

- [ ] **Step 3: Implement typed-token compilation**

Use this result shape:

```js
{
  actionId,
  toolId,
  shell,
  command,
  formatted,
  tokens,
  summary,
  warnings,
  placeholders,
  evidenceId,
}
```

The compiler:

1. validates the project and action;
2. selects a verified platform executable;
3. appends registry-owned flags and operators;
4. reads user values from declared paths;
5. quotes user values;
6. assembles one-line and formatted output;
7. returns warnings and placeholder names.

The compiler must reject actions with missing public verification evidence.

- [ ] **Step 4: Implement sanitized exports**

`buildSecurityProjectExport()` returns formatted JSON from the sanitized
project. `buildWorkflowRunbook()` returns Markdown with:

```text
authorization context
objective
prerequisites
host role per step
step purpose
formatted command
warnings
placeholder list
evidence filename hints
```

`buildLowRiskScript()` succeeds only when all steps share one supported shell,
use `risk: "low"`, and contain no unresolved secret placeholder. It inserts
comments and role-change pauses. Other workflows export Markdown and plain text.

- [ ] **Step 5: Test malicious values and export privacy**

Add assertions that:

```text
one user field cannot add a second command
default JSON export replaces target values
credentials never appear in JSON, Markdown, text, or scripts
high-risk workflows cannot become executable scripts
fixed pipelines remain registry-owned
```

- [ ] **Step 6: Run Tasks 1 through 5**

```powershell
node --test tests/tools/security-mission-catalog.test.js tests/tools/security-mission-source-ledger.test.js tests/tools/security-mission-project-config.test.js tests/tools/security-mission-state.test.js tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-quoting.test.js tests/tools/security-mission-sensitive-values.test.js tests/tools/security-mission-compiler.test.js tests/tools/security-mission-exports.test.js tests/tools/security-mission-command-snapshots.test.js
```

Expected: PASS.

- [ ] **Step 7: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/compiler.js lib/tools/security-mission/exports.js tests/tools/security-mission-compiler.test.js tests/tools/security-mission-exports.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: compile and export Security Mission commands"
```

### Task 6: Add verified network, reconnaissance, service-enumeration, and Netcat tools

**Files:**
- Create: `lib/tools/security-mission/tools/network/network-foundations.js`
- Create: `lib/tools/security-mission/tools/network/nmap.js`
- Create: `lib/tools/security-mission/tools/network/fast-scanners.js`
- Create: `lib/tools/security-mission/tools/network/dns.js`
- Create: `lib/tools/security-mission/tools/network/snmp.js`
- Create: `lib/tools/security-mission/tools/network/windows-services.js`
- Create: `lib/tools/security-mission/tools/network/tls-netcat.js`
- Modify: `lib/tools/security-mission/tools/network/index.js`
- Create: `tests/tools/security-mission-network-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `NETWORK_TOOLS`, `NETWORK_ACTIONS`, `NETWORK_CONTROLS`.
- Registers verified actions through the aggregate catalog.

**Evidence to collect:**

```text
nmap: https://nmap.org/book/man.html and local `nmap --version`, `nmap --help`
masscan: https://github.com/robertdavidgraham/masscan and local `masscan --help`
rustscan: https://github.com/RustScan/RustScan and local `rustscan --help`
Ncat: https://nmap.org/ncat/guide/index.html and local `ncat --help`
BIND tools: https://bind9.readthedocs.io/ and local help
OpenSSL: https://docs.openssl.org/ and local `openssl s_client -help`
remaining tools: official upstream repository plus captured local help where installed
```

- [ ] **Step 1: Write the action-presence and verification tests**

Require these exact action IDs:

```js
const expected = [
  "ip-address-show", "ip-link-show", "ip-route-show", "ip-neighbor-show",
  "ipconfig-all", "ping-host", "fping-targets", "arp-table", "arp-scan-local",
  "netdiscover-range", "traceroute-host", "route-table", "ss-sockets",
  "netstat-sockets", "nmap-host-discovery", "nmap-tcp-scan", "nmap-udp-scan",
  "nmap-service-enumeration", "nmap-nse-scan", "masscan-port-discovery",
  "rustscan-port-discovery", "whois-domain", "dig-records", "dig-reverse",
  "dig-trace", "host-lookup", "nslookup-query", "dnsrecon-standard",
  "dnsenum-domain", "snmpwalk-oid", "onesixtyone-community-audit",
  "nbtscan-network", "enum4linux-enumerate", "smbclient-list-shares",
  "smbclient-browse-share", "rpcclient-query", "ldapsearch-query",
  "openssl-tls-inspect", "netcat-connect", "netcat-listen",
  "netcat-udp-connect", "netcat-banner-input", "ncat-tls-connect",
];
for (const actionId of expected) {
  const action = getSecurityAction(actionId);
  assert.ok(action, actionId);
  assert.ok(["local-help", "official-docs"].includes(action.verification.evidenceTier), actionId);
}
```

Add command snapshots for at least:

```text
Nmap host discovery
Nmap targeted TCP service scan with normal output
Nmap bounded UDP scan
Masscan with explicit rate
dig record lookup
smbclient share listing with placeholders
ldapsearch query with bind placeholder
OpenSSL certificate inspection
Netcat TCP client
Netcat listener
Ncat TLS client
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-network-tools.test.js tests/tools/security-mission-command-snapshots.test.js
```

Expected: FAIL because the network slice is absent.

- [ ] **Step 3: Verify versions and populate the source ledger**

Run available local commands with harmless help/version arguments. Record one
JSON record per action. Use `official-docs` when the tool is not installed.
Record unsupported or ambiguous actions in the progress ledger and omit them
from `NETWORK_ACTIONS`.

- [ ] **Step 4: Implement network definitions**

Use frozen records with this pattern:

```js
export const NMAP_ACTIONS = Object.freeze([
  {
    id: "nmap-host-discovery",
    toolId: "nmap",
    title: "Discover live hosts",
    objectiveIds: ["host-discovery-port-scanning"],
    risk: "low",
    executable: { linux: "nmap", windows: "nmap.exe", macos: "nmap" },
    fixedTokens: [{ type: "flag", value: "-sn" }],
    argumentRules: [
      { positional: true, valuePath: "target.network" },
      { flag: "-oA", valuePath: "options.outputBase", omitWhenEmpty: true },
    ],
    verification: verificationFor("nmap-host-discovery"),
  },
]);
```

Each action must declare controls, compatibility rules, warnings, and evidence
hints. Nmap NSE controls expose reviewed safe, default, version, discovery, and
selected service-script categories. They do not accept arbitrary script text.
Masscan requires an explicit bounded rate. Netcat aliases must preserve the
syntax differences between traditional `nc`, OpenBSD `nc`, and Ncat through
separate tool/action records or version rules.

- [ ] **Step 5: Run network, compiler, validation, and ledger tests**

```powershell
node --test tests/tools/security-mission-network-tools.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-compiler.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/network lib/tools/security-mission/catalog.js tests/tools/security-mission-network-tools.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified network commands"
```

### Task 7: Add verified credential-auditing, remote-access, and web tools

**Files:**
- Create: `lib/tools/security-mission/tools/credential-auditing/auditors.js`
- Create: `lib/tools/security-mission/tools/credential-auditing/remote-access.js`
- Modify: `lib/tools/security-mission/tools/credential-auditing/index.js`
- Create: `lib/tools/security-mission/tools/web/http-clients.js`
- Create: `lib/tools/security-mission/tools/web/fingerprinting.js`
- Create: `lib/tools/security-mission/tools/web/content-discovery.js`
- Create: `lib/tools/security-mission/tools/web/web-audit.js`
- Create: `lib/tools/security-mission/tools/web/gui-companions.js`
- Modify: `lib/tools/security-mission/tools/web/index.js`
- Create: `tests/tools/security-mission-credential-tools.test.js`
- Create: `tests/tools/security-mission-web-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `CREDENTIAL_TOOLS`, `CREDENTIAL_ACTIONS`, `CREDENTIAL_CONTROLS`.
- Produces: `WEB_TOOLS`, `WEB_ACTIONS`, `WEB_CONTROLS`.

**Evidence to collect:**

```text
Hydra: https://github.com/vanhauser-thc/thc-hydra and local `hydra -h`
Medusa: https://github.com/jmk-foofus/medusa and local `medusa -h`
Ncrack: https://nmap.org/ncrack/man.html and local `ncrack --help`
Kerbrute: https://github.com/ropnop/kerbrute
NetExec: https://www.netexec.wiki/
Evil-WinRM: https://github.com/Hackplayers/evil-winrm
curl: https://curl.se/docs/manpage.html and local `curl --version`, `curl --help all`
GNU Wget: https://www.gnu.org/software/wget/manual/wget.html
ffuf: https://github.com/ffuf/ffuf
Gobuster: https://github.com/OJ/gobuster
Feroxbuster: https://github.com/epi052/feroxbuster
sqlmap: https://github.com/sqlmapproject/sqlmap/wiki/Usage
other tools: official upstream repository and local help
```

- [ ] **Step 1: Write failing catalog tests**

Require:

```text
hydra-service-audit
hydra-http-form-audit
medusa-service-audit
ncrack-service-audit
kerbrute-user-enumeration
kerbrute-password-spray
netexec-auth-check
ssh-connect
evil-winrm-connect
xfreerdp-connect
curl-request
curl-authenticated-request
curl-proxy-request
curl-timing
wget-download
wget-bounded-mirror
whatweb-fingerprint
nikto-scan
ffuf-content-discovery
ffuf-vhost-discovery
gobuster-directory
gobuster-dns
gobuster-vhost
feroxbuster-content
dirsearch-content
wfuzz-request
wpscan-enumerate
sqlmap-identify
sqlmap-request-file
burp-suite-checklist
owasp-zap-checklist
```

Credential-audit assertions must require a nonzero bounded rate, task count, or
delay. Tests must reject configurations with no bound.

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-credential-tools.test.js tests/tools/security-mission-web-tools.test.js
```

Expected: FAIL because the slices are missing.

- [ ] **Step 3: Verify and record each action**

Capture versions and help output where available. Confirm Hydra's service and
HTTP-form syntax per the selected version. Confirm content-discovery match and
filter flags per tool. Confirm sqlmap option names without adding automatic
exfiltration actions.

- [ ] **Step 4: Implement credential and remote-access records**

All password controls use placeholders or file paths. Do not accept a stored
real password. Require:

```js
validationRules: [
  { type: "authorization-context" },
  { type: "credential-rate-bound", paths: ["options.tasks", "options.delay", "options.rate"] },
]
```

Show lockout warnings for username enumeration, password spraying, and
brute-force actions. Separate verification commands from high-volume audit
commands.

- [ ] **Step 5: Implement web records**

curl supports methods, headers, body-file paths, credential placeholders,
proxy, TLS verification choice, redirects, cookies as placeholders, timing, and
output. Discovery tools require an authorized URL/domain and wordlist path.
sqlmap Guided exposes identification and confirmation. Customize and Advanced
expose verified risk, level, technique, request-file, session, and output
controls without data-exfiltration presets.

GUI companion records produce checklists rather than fake CLI commands.

- [ ] **Step 6: Run focused and shared tests**

```powershell
node --test tests/tools/security-mission-credential-tools.test.js tests/tools/security-mission-web-tools.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 7: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/credential-auditing lib/tools/security-mission/tools/web lib/tools/security-mission/catalog.js tests/tools/security-mission-credential-tools.test.js tests/tools/security-mission-web-tools.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified access and web commands"
```

### Task 8: Add verified exploitation, post-exploitation, hash, and transfer tools

**Files:**
- Create: `lib/tools/security-mission/tools/exploitation/search-and-payloads.js`
- Create: `lib/tools/security-mission/tools/exploitation/netcat-socat.js`
- Create: `lib/tools/security-mission/tools/exploitation/file-transfer.js`
- Create: `lib/tools/security-mission/tools/exploitation/local-enumeration.js`
- Create: `lib/tools/security-mission/tools/exploitation/hash-auditing.js`
- Modify: `lib/tools/security-mission/tools/exploitation/index.js`
- Create: `tests/tools/security-mission-exploitation-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: verified Netcat/Ncat connection and listener actions from Task 6.
- Produces: `EXPLOITATION_TOOLS`, `EXPLOITATION_ACTIONS`, `EXPLOITATION_CONTROLS`.

**Evidence to collect:**

```text
SearchSploit: https://www.exploit-db.com/searchsploit
Metasploit and msfvenom: https://docs.metasploit.com/
Ncat: https://nmap.org/ncat/guide/index.html
Python HTTP server: https://docs.python.org/3/library/http.server.html
Impacket examples: https://github.com/fortra/impacket
PEASS-ng: https://github.com/peass-ng/PEASS-ng
pspy: https://github.com/DominicBreuker/pspy
Hashcat: https://hashcat.net/wiki/
John: https://www.openwall.com/john/doc/
Socat: local `socat -h` and official project documentation
```

- [ ] **Step 1: Write failing action and safety tests**

Require:

```text
searchsploit-search
searchsploit-copy
msfconsole-launch
msfvenom-generate-lab-payload
netcat-file-send
netcat-file-receive
socat-relay
python-http-server
impacket-smbserver
curl-file-transfer
wget-file-transfer
linpeas-run
winpeas-run
pspy-monitor
linux-native-enumeration
windows-native-enumeration
hashid-identify
hashcat-audit
hashcat-restore
hashcat-show
john-audit
john-restore
john-show
secretsdump-local
secretsdump-authorized-remote
```

Tests must reject:

```text
absolute or traversal output paths
embedded secret values
unverified msfvenom payload names
arbitrary Metasploit resource commands
arbitrary Socat endpoint strings
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-exploitation-tools.test.js
```

Expected: FAIL because the exploitation slice is absent.

- [ ] **Step 3: Verify and record actions**

Use the installed version's payload listing for msfvenom. The public registry
may expose only payloads captured in the versioned evidence record. Represent
Socat endpoints as typed endpoint records, never as raw user-authored endpoint
syntax.

- [ ] **Step 4: Implement exploitation and transfer records**

Metasploit console receives launcher, workspace, database, and module-search
helpers. It does not accept arbitrary console scripts. msfvenom exposes
verified payload selection, format, architecture, bad-character input, and safe
relative output.

File-transfer actions use placeholder lab URLs and paths. Native enumeration
records contain fixed, reviewed commands grouped by identity, permissions,
services, tasks, processes, sockets, and capabilities.

- [ ] **Step 5: Implement hash-auditing records**

Hashcat and John records expose:

```text
hash format or mode
attack mode
hash-file path
wordlist path
mask
rule-file path
device selection
session name
restore
show
bounded workload controls
```

No fixture contains a real leaked hash. Use synthetic test values such as
`<HASH_FILE>` and `fixtures/lab.hashes`.

- [ ] **Step 6: Run focused and shared tests**

```powershell
node --test tests/tools/security-mission-exploitation-tools.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-compiler.test.js tests/tools/security-mission-sensitive-values.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 7: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/exploitation lib/tools/security-mission/catalog.js tests/tools/security-mission-exploitation-tools.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified exploitation commands"
```

### Task 9: Add verified pivoting and exploit-development tools

**Files:**
- Create: `lib/tools/security-mission/tools/pivoting/ssh-tunnels.js`
- Create: `lib/tools/security-mission/tools/pivoting/proxy-tunnels.js`
- Modify: `lib/tools/security-mission/tools/pivoting/index.js`
- Create: `lib/tools/security-mission/tools/exploit-development/binary-inspection.js`
- Create: `lib/tools/security-mission/tools/exploit-development/debugging-build.js`
- Modify: `lib/tools/security-mission/tools/exploit-development/index.js`
- Create: `tests/tools/security-mission-pivoting-tools.test.js`
- Create: `tests/tools/security-mission-exploit-development-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: typed endpoint and compiler contracts from Tasks 4 and 5.
- Produces: `PIVOTING_TOOLS`, `PIVOTING_ACTIONS`, `PIVOTING_CONTROLS`.
- Produces: `EXPLOIT_DEVELOPMENT_TOOLS`, `EXPLOIT_DEVELOPMENT_ACTIONS`, `EXPLOIT_DEVELOPMENT_CONTROLS`.

**Evidence to collect:**

```text
OpenSSH: https://man.openbsd.org/ssh and local `ssh -V`, `ssh -h`
ProxyChains-ng: https://github.com/rofl0r/proxychains-ng
sshuttle: https://sshuttle.readthedocs.io/
Chisel: https://github.com/jpillora/chisel
Ligolo-ng: https://github.com/nicocha30/ligolo-ng
GNU Binutils: https://sourceware.org/binutils/docs/
GDB: https://sourceware.org/gdb/documentation/
GCC: https://gcc.gnu.org/onlinedocs/
NASM: https://www.nasm.us/docs.php
Pwntools: https://docs.pwntools.com/
Pwndbg: https://pwndbg.re/
checksec: official upstream repository and local help
```

- [ ] **Step 1: Write failing action tests**

Require:

```text
ssh-local-forward
ssh-remote-forward
ssh-dynamic-forward
proxychains-wrap
sshuttle-route
chisel-server
chisel-client
ligolo-proxy
ligolo-agent
ligolo-route
socat-forward
file-inspect
strings-extract
objdump-headers
objdump-disassemble
readelf-inspect
checksec-file
gdb-debug
gdb-core
pattern-create
pattern-offset
gcc-debug-build
nasm-assemble
python-run-script
pwntools-project-checklist
pwndbg-checklist
```

Tests must verify host-role metadata for server/client actions and reject raw
tunnel strings.

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-pivoting-tools.test.js tests/tools/security-mission-exploit-development-tools.test.js
```

Expected: FAIL.

- [ ] **Step 3: Verify and implement pivot records**

Represent tunnel mappings with typed fields:

```js
{
  bindHost,
  bindPort,
  destinationHost,
  destinationPort,
  remoteHost,
  remoteUser,
}
```

Compiler adapters translate the typed object into the verified tool syntax.
Each action declares `hostRole: "operator" | "pivot" | "target"` and workflow
exports show the role above the command.

- [ ] **Step 4: Verify and implement exploit-development records**

Keep binary paths, output files, architecture, compiler protections, debug
symbols, pattern lengths, and offsets as typed fields. GUI companions produce
checklists. They do not generate debugger scripts from arbitrary text.

- [ ] **Step 5: Run focused and shared tests**

```powershell
node --test tests/tools/security-mission-pivoting-tools.test.js tests/tools/security-mission-exploit-development-tools.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/pivoting lib/tools/security-mission/tools/exploit-development lib/tools/security-mission/catalog.js tests/tools/security-mission-pivoting-tools.test.js tests/tools/security-mission-exploit-development-tools.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified pivot and exploit dev commands"
```

### Task 10: Add verified Active Directory tools

**Files:**
- Create: `lib/tools/security-mission/tools/active-directory/netexec.js`
- Create: `lib/tools/security-mission/tools/active-directory/impacket.js`
- Create: `lib/tools/security-mission/tools/active-directory/enumeration.js`
- Create: `lib/tools/security-mission/tools/active-directory/windows-companions.js`
- Modify: `lib/tools/security-mission/tools/active-directory/index.js`
- Create: `tests/tools/security-mission-active-directory-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: `evil-winrm-connect` from Task 7 and SMB/RPC/LDAP actions from Task 6.
- Produces: `ACTIVE_DIRECTORY_TOOLS`, `ACTIVE_DIRECTORY_ACTIONS`, `ACTIVE_DIRECTORY_CONTROLS`.

**Evidence to collect:**

```text
NetExec: https://www.netexec.wiki/
Impacket: https://github.com/fortra/impacket
BloodHound Python collector: https://github.com/dirkjanm/BloodHound.py
SharpHound: https://bloodhound.specterops.io/collect-data/ce-collection/sharphound
Responder: https://github.com/lgandx/Responder
ldapdomaindump: https://github.com/dirkjanm/ldapdomaindump
Evil-WinRM: https://github.com/Hackplayers/evil-winrm
Rubeus: https://github.com/GhostPack/Rubeus
PowerView: https://github.com/PowerShellMafia/PowerSploit
Certipy: https://github.com/ly4k/Certipy
Mimikatz: https://github.com/gentilkiwi/mimikatz
```

- [ ] **Step 1: Write failing domain-coverage and action tests**

Require:

```text
netexec-smb
netexec-ldap
netexec-winrm
netexec-rdp
netexec-mssql
responder-analyze
responder-authorized-listen
impacket-getnpusers
impacket-getuserspns
impacket-secretsdump
impacket-psexec
impacket-wmiexec
impacket-smbexec
impacket-atexec
impacket-ntlmrelayx
impacket-gettgt
impacket-getst
impacket-ticketer
bloodhound-python-collect
sharphound-checklist
ldapdomaindump
mimikatz-checklist
rubeus-checklist
powerview-checklist
certipy-find
certipy-request
```

Map public actions across:

```text
ad-enumeration
ad-weak-password-audit
asrep-roasting
ad-pass-the-hash
ad-pass-the-ticket
domain-admin-validation
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-active-directory-tools.test.js tests/tools/security-mission-coverage.test.js
```

Expected: FAIL because AD actions are absent.

- [ ] **Step 3: Verify installed versions and official syntax**

Record version-specific executable names. Modern Impacket installations may use
prefixed console scripts. The registry must support verified aliases without
mixing old and new syntax in one action.

Record credential input as placeholders:

```text
<DOMAIN>
<USERNAME>
<PASSWORD>
<NTLM_HASH>
<AES_KEY>
<CCACHE_PATH>
<DC_IP>
<TARGET_HOST>
```

- [ ] **Step 4: Implement AD records and controls**

Use structured identity fields:

```js
{
  domain,
  username,
  authenticationMode: "password" | "ntlm-hash" | "aes-key" | "kerberos-cache",
  secretPlaceholder,
  domainController,
  targetHost,
}
```

Keep password, hash, key, and ticket-cache values out of persisted state.
Actions show privilege and lateral-movement warnings. Mimikatz, Rubeus,
PowerView, and SharpHound companions provide verified command references and
checklists without arbitrary PowerShell input.

- [ ] **Step 5: Run AD, coverage, privacy, and compiler tests**

```powershell
node --test tests/tools/security-mission-active-directory-tools.test.js tests/tools/security-mission-coverage.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-sensitive-values.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/active-directory lib/tools/security-mission/catalog.js tests/tools/security-mission-active-directory-tools.test.js tests/tools/security-mission-coverage.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified Active Directory commands"
```

### Task 11: Add verified traffic, hping3, and wireless tools

**Files:**
- Create: `lib/tools/security-mission/tools/traffic/packet-tools.js`
- Modify: `lib/tools/security-mission/tools/traffic/index.js`
- Create: `lib/tools/security-mission/tools/wireless/wireless-tools.js`
- Modify: `lib/tools/security-mission/tools/wireless/index.js`
- Create: `tests/tools/security-mission-traffic-tools.test.js`
- Create: `tests/tools/security-mission-wireless-tools.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-tool-verification.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `TRAFFIC_TOOLS`, `TRAFFIC_ACTIONS`, `TRAFFIC_CONTROLS`.
- Produces: `WIRELESS_TOOLS`, `WIRELESS_ACTIONS`, `WIRELESS_CONTROLS`.

**Evidence to collect:**

```text
hping3: https://github.com/antirez/hping and local `hping3 --help`
tcpdump: https://www.tcpdump.org/manpages/tcpdump.1.html
tshark and Wireshark filters: https://www.wireshark.org/docs/
Aircrack-ng suite: https://www.aircrack-ng.org/documentation.html
iw: https://wireless.docs.kernel.org/en/latest/en/users/documentation/iw.html
rfkill: local `rfkill --help` and Linux util-linux documentation
```

- [ ] **Step 1: Write failing action and bounded-rate tests**

Require:

```text
hping3-tcp-test
hping3-udp-test
hping3-icmp-test
tcpdump-capture
tcpdump-read
tshark-capture
tshark-read-fields
tshark-statistics
wireshark-capture-filter
wireshark-display-filter
iw-interface-info
iw-link-info
rfkill-status
rfkill-unblock-wireless
airmon-check
airmon-start
airmon-stop
airodump-observe
aireplay-injection-test
aireplay-replay-lab
aircrack-handshake-audit
```

Tests must reject hping3 flood flags, zero/unbounded packet counts, unbounded
request rates, arbitrary Wireshark filter shell text, and wireless actions on a
non-Linux platform.

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-traffic-tools.test.js tests/tools/security-mission-wireless-tools.test.js
```

Expected: FAIL.

- [ ] **Step 3: Verify and implement traffic actions**

hping3 actions require packet count and interval. Exclude flood mode. Represent
TCP flags through a reviewed multi-select. tcpdump and tshark filters use typed
filter builders or registry-owned filter fragments. User values remain quoted
filter operands.

- [ ] **Step 4: Verify and implement wireless actions**

Display authorization, privilege, interface-disruption, and radio-interference
warnings. Require interface, channel, BSSID, bounded action count where
supported, capture path, and wordlist placeholders. Do not expose unbounded
deauthentication presets.

- [ ] **Step 5: Run focused and safety regressions**

```powershell
node --test tests/tools/security-mission-traffic-tools.test.js tests/tools/security-mission-wireless-tools.test.js tests/tools/security-mission-command-snapshots.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-source-ledger.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/tools/traffic lib/tools/security-mission/tools/wireless lib/tools/security-mission/catalog.js tests/tools/security-mission-traffic-tools.test.js tests/tools/security-mission-wireless-tools.test.js tests/tools/security-mission-command-snapshots.test.js docs/reports/2026-07-29-security-mission-tool-verification.json docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: generate verified traffic and wireless commands"
```

### Task 12: Build curated workflows and binding validation

**Files:**
- Create: `lib/tools/security-mission/workflow-registry.js`
- Create: `lib/tools/security-mission/workflows/network.js`
- Create: `lib/tools/security-mission/workflows/credential-auditing.js`
- Create: `lib/tools/security-mission/workflows/web.js`
- Create: `lib/tools/security-mission/workflows/exploitation.js`
- Create: `lib/tools/security-mission/workflows/pivoting.js`
- Create: `lib/tools/security-mission/workflows/exploit-development.js`
- Create: `lib/tools/security-mission/workflows/active-directory.js`
- Create: `lib/tools/security-mission/workflows/traffic.js`
- Create: `lib/tools/security-mission/workflows/wireless.js`
- Create: `tests/tools/security-mission-workflows.test.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: `SECURITY_WORKFLOWS`.
- Produces: `getSecurityWorkflow(id)`.
- Produces: `validateSecurityWorkflowRegistry(workflows)`.
- Produces: `resolveWorkflowBindings(project, workflow)`.

- [ ] **Step 1: Write failing workflow contract tests**

Require these workflow IDs:

```text
local-network-orientation
host-discovery
tcp-service-enumeration
udp-service-enumeration
dns-enumeration
smb-rpc-enumeration
snmp-enumeration
tls-inspection
username-validation
password-spray-preparation
remote-service-audit
web-surface-identification
web-content-discovery
curl-request-reproduction
web-login-audit
sqli-identification-confirmation
outdated-component-review
finding-evidence
public-exploit-review
lab-payload-listener
netcat-connectivity
authorized-file-transfer
linux-local-enumeration
windows-local-enumeration
offline-hash-audit
ssh-local-forward
ssh-socks-forward
reverse-tunnel
sshuttle-lab-route
chisel-two-host
ligolo-multi-host
binary-inspection
cyclic-pattern-offset
debug-build
gdb-crash-inspection
pwntools-project-start
ad-domain-context
ad-ldap-smb-enumeration
kerberos-user-validation
asrep-account-audit
service-account-ticket-audit
bloodhound-collection
authorized-pass-the-hash
pass-the-ticket-lab
remote-management-comparison
domain-privilege-evidence
wireless-monitor-preparation
wireless-network-observation
wireless-handshake-verification
wireless-offline-password-audit
bounded-packet-test
traffic-capture-analysis
```

Each workflow must contain at least two steps, except single-command learning
cards, which remain actions and must not appear here.

- [ ] **Step 2: Write binding tests**

```js
test("Nmap discoveries bind explicit target and ports into later steps", () => {
  const workflow = getSecurityWorkflow("tcp-service-enumeration");
  const resolved = resolveWorkflowBindings({
    target: { host: "10.10.10.10" },
    options: { ports: "22,80" },
  }, workflow);
  assert.equal(resolved.steps.at(-1).target.host, "10.10.10.10");
  assert.equal(resolved.steps.at(-1).options.ports, "22,80");
});

test("workflow bindings reject incompatible destination types", () => {
  const errors = validateSecurityWorkflowRegistry([invalidPortToBssidWorkflow]);
  assert.ok(errors.some((error) => error.includes("binding type")));
});
```

- [ ] **Step 3: Confirm RED**

```powershell
node --test tests/tools/security-mission-workflows.test.js
```

Expected: FAIL.

- [ ] **Step 4: Implement workflow records**

Each step declares:

```js
{
  id,
  title,
  purpose,
  toolId,
  actionId,
  hostRole,
  defaults,
  acceptsBindings,
  evidenceHints,
}
```

Bindings may transfer only typed explicit values:

```text
host
network
ports
url
domain
username-file path
capture-file path
output-file path
BSSID
channel
```

No workflow parses command output. The UI instructs the user to enter discovered
values before the next command.

- [ ] **Step 5: Run workflow, export, and catalog tests**

```powershell
node --test tests/tools/security-mission-workflows.test.js tests/tools/security-mission-exports.test.js tests/tools/security-mission-catalog.test.js tests/tools/security-mission-coverage.test.js
```

Expected: PASS.

- [ ] **Step 6: Update progress and commit**

```powershell
git add -- lib/tools/security-mission/workflow-registry.js lib/tools/security-mission/workflows lib/tools/security-mission/catalog.js tests/tools/security-mission-workflows.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: guide Security Mission workflows"
```

### Task 13: Connect the React state hook and generic control components

**Files:**
- Create: `lib/hooks/useSecurityMission.ts`
- Create: `components/tools/security-mission/SecurityControlRenderer.tsx`
- Create: `components/tools/security-mission/SecurityField.tsx`
- Create: `components/tools/security-mission/SecurityExplanation.tsx`
- Create: `components/tools/security-mission/SecurityRecommendation.tsx`
- Create: `components/tools/security-mission/SecurityWarningPanel.tsx`
- Create: `tests/tools/security-mission-ui-contract.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: reducer, controls, validation, compiler, workflows, exports.
- Produces: `useSecurityMission()`.
- Produces: generic control components with no tool-specific flags.

- [ ] **Step 1: Read the installed Next.js client-component guide**

Read:

```text
node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
node_modules/next/dist/docs/03-architecture/accessibility.md
```

- [ ] **Step 2: Write failing source and behavior contracts**

`security-mission-ui-contract.test.js` must read the component sources and
assert:

```text
useSecurityMission calls securityMissionReducer
the hook resolves controls and validation from registry modules
the hook compiles the active command without a fetch call
the control renderer switches on controlType
fields expose aria-describedby
errors expose role=alert or a connected error description
Learn this choice uses aria-expanded
recommendations remain advisory
warnings render authorization and privilege messages
no component contains hard-coded nmap, hashcat, hydra, or aircrack flags
```

- [ ] **Step 3: Confirm RED**

```powershell
node --test tests/tools/security-mission-ui-contract.test.js
```

Expected: FAIL because the hook and components do not exist.

- [ ] **Step 4: Implement `useSecurityMission`**

Return:

```ts
{
  state,
  dispatch,
  objective,
  tool,
  action,
  workflow,
  controls,
  validation: { errors, warnings },
  generatedCommand,
  compiledWorkflowSteps,
  recommendations,
  copyCommand,
  downloadProject,
  downloadRunbook,
  importProject,
}
```

Use `useMemo` for derived registry resolution and compilation. Use browser APIs
only in event handlers. Catch copy/import/export failures and expose stable
status strings.

- [ ] **Step 5: Implement generic fields**

Support the control types defined in the spec. Use native inputs and selects.
Render secret controls as named placeholders. The renderer writes project
patches through callbacks; it does not import tool modules.

- [ ] **Step 6: Run UI and domain regressions**

```powershell
node --test tests/tools/security-mission-ui-contract.test.js tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-state.test.js tests/tools/security-mission-compiler.test.js
```

Expected: PASS.

- [ ] **Step 7: Update progress and commit**

```powershell
git add -- lib/hooks/useSecurityMission.ts components/tools/security-mission/SecurityControlRenderer.tsx components/tools/security-mission/SecurityField.tsx components/tools/security-mission/SecurityExplanation.tsx components/tools/security-mission/SecurityRecommendation.tsx components/tools/security-mission/SecurityWarningPanel.tsx tests/tools/security-mission-ui-contract.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: render Security Mission controls"
```

### Task 14: Build navigation, workflow, preview, and shell components

**Files:**
- Create: `components/tools/security-mission/SecurityMissionShell.tsx`
- Create: `components/tools/security-mission/SecurityMissionNavigator.tsx`
- Create: `components/tools/security-mission/SecurityMissionRail.tsx`
- Create: `components/tools/security-mission/SecurityMissionStepPanel.tsx`
- Create: `components/tools/security-mission/CommandPreviewPanel.tsx`
- Create: `components/tools/security-mission/WorkflowPreviewPanel.tsx`
- Create: `components/tools/security-mission/ToolBrowser.tsx`
- Create: `components/tools/security-mission/ObjectiveBrowser.tsx`
- Create: `components/tools/security-mission/WorkflowBrowser.tsx`
- Create: `tests/tools/security-mission-shell.test.js`
- Modify: `tests/tools/security-mission-ui-contract.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Consumes: `useSecurityMission`.
- Produces: one complete client-side workspace with objective, tool, and workflow entry paths.

- [ ] **Step 1: Write failing shell contracts**

Assert source and rendered structure contains:

```text
data-security-mission
Security Mission
From objective to command, one choice at a time.
Browse by objective
Browse by tool
Browse workflows
Guided
Customize
Advanced
Scope
Objective
Tool
Action
Target
Configure
Review
Generate
Configure mobile tab
Command mobile tab
authorization context
copy command
download runbook
export configuration
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-shell.test.js tests/tools/security-mission-ui-contract.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implement navigator and browsers**

Tool search matches names and aliases case-insensitively. Filters cover category,
platform, CLI/GUI companion, and eCPPT domain. Objective cards separate current
eCPPT domains from supporting areas. Workflow cards show tools, step count,
platform, prerequisites, risk, and evidence.

- [ ] **Step 4: Implement rail and step panel**

Use `aria-current="step"` for the active step. Prevent Next when blocking errors
exist. Render short step lessons and registry controls. Workflow mode adds an
inner workflow-step list without replacing the outer eight-step rail.

- [ ] **Step 5: Implement command and workflow previews**

Command preview shows shell, platform, summary, warnings, placeholders,
formatted command, single-line command, evidence source, and action buttons.
Workflow preview groups steps by host role and exposes fields for explicit
binding values.

- [ ] **Step 6: Compose the shell**

`SecurityMissionShell.tsx` starts with `"use client"`, calls
`useSecurityMission()`, and composes the level switch, rail, mobile tabs,
configuration panel, and preview panel. Do not duplicate domain resolution
inside the component.

- [ ] **Step 7: Run shell and UI tests**

```powershell
node --test tests/tools/security-mission-shell.test.js tests/tools/security-mission-ui-contract.test.js tests/tools/security-mission-workflows.test.js tests/tools/security-mission-exports.test.js
```

Expected: PASS.

- [ ] **Step 8: Update progress and commit**

```powershell
git add -- components/tools/security-mission/SecurityMissionShell.tsx components/tools/security-mission/SecurityMissionNavigator.tsx components/tools/security-mission/SecurityMissionRail.tsx components/tools/security-mission/SecurityMissionStepPanel.tsx components/tools/security-mission/CommandPreviewPanel.tsx components/tools/security-mission/WorkflowPreviewPanel.tsx components/tools/security-mission/ToolBrowser.tsx components/tools/security-mission/ObjectiveBrowser.tsx components/tools/security-mission/WorkflowBrowser.tsx tests/tools/security-mission-shell.test.js tests/tools/security-mission-ui-contract.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: build the Security Mission workspace"
```

### Task 15: Add the public route, tools-index card, and responsive styling

**Files:**
- Create: `app/tools/security-command-builder/page.tsx`
- Create: `app/tools/security-command-builder/layout.tsx`
- Create: `app/tools/security-command-builder/template.tsx`
- Create: `components/tools/security-mission/SecurityMission.module.css`
- Create: `tests/tools/security-mission-live-route.test.js`
- Create: `tests/tools/security-mission-style.test.js`
- Create: `tests/tools/security-mission-responsive.test.js`
- Modify: `components/tools/security-mission/SecurityMissionShell.tsx`
- Modify: `data/tools.js`
- Modify: `package.json`
- Modify: `app/sitemap.js` only if the sitemap uses a static route list
- Modify: `app/tools/page.tsx` only if current copy excludes security tools
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`

**Interfaces:**
- Produces: public route `/tools/security-command-builder/`.
- Produces: `npm run test:security-mission` and `npm run test:security-mission:responsive`.

- [ ] **Step 1: Read installed routing and CSS documentation**

Read:

```text
node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md
node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
```

- [ ] **Step 2: Write failing route and style tests**

Route source test requires:

```tsx
import { SecurityMissionShell } from "@/components/tools/security-mission/SecurityMissionShell";

export default function SecurityCommandBuilderPage() {
  return <SecurityMissionShell />;
}
```

Live route test checks:

```text
HTTP 200
data-security-mission
Security Mission
approved tagline
Nmap
Hashcat
Netcat
Hydra
no server-execution form
```

Style test rejects:

```text
linear-gradient
radial-gradient
backdrop-filter
filter: blur
unbounded width
```

- [ ] **Step 3: Confirm RED**

```powershell
node --test tests/tools/security-mission-live-route.test.js tests/tools/security-mission-style.test.js
```

Expected: FAIL because the route and CSS do not exist.

- [ ] **Step 4: Implement route and tools card**

Add this `data/tools.js` record:

```js
{
  id: "security-command-builder",
  title: "Security Mission",
  description:
    "Build, validate, and learn security-tool commands for authorized labs without memorizing every flag.",
  href: "/tools/security-command-builder",
  icon: "SECURITY_CLI",
}
```

Use `createPageMetadata()` on the route with a factual description and canonical
pathname. Keep layout and template as typed pass-through components, matching
the installed Next.js route conventions.

- [ ] **Step 5: Implement responsive CSS**

Required layout:

```css
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

.configurePanel,
.previewPanel {
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Use flat token colors. Long labels wrap. Code scrolls inside the preview. Sticky
actions remain inside the panel and leave room for the final field.

- [ ] **Step 6: Implement responsive browser test**

Use the existing Chrome/Edge discovery and CDP harness from
`tests/tools/model-mission-responsive.test.js`, but target:

```text
http://127.0.0.1:3000/tools/security-command-builder/
```

At each required viewport assert:

```js
const geometry = await evaluate(`
  (() => ({
    viewport: window.innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    rootWidth: document.querySelector("[data-security-mission]").getBoundingClientRect().width,
    panelOverlap: (() => {
      const a = document.querySelector("[data-security-configure]").getBoundingClientRect();
      const b = document.querySelector("[data-security-preview]").getBoundingClientRect();
      return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    })(),
  }))()
`);
assert.equal(geometry.pageWidth, geometry.viewport);
assert.ok(geometry.rootWidth <= geometry.viewport);
```

On widths at or below 900 pixels, assert that only the selected Configure or
Command tab panel is visible and state survives tab changes.

- [ ] **Step 7: Add package scripts**

```json
"test:security-mission": "node --test tests/tools/security-mission-*.test.js",
"test:security-mission:responsive": "node --no-warnings --test tests/tools/security-mission-responsive.test.js"
```

- [ ] **Step 8: Run route, style, TypeScript, and responsive tests**

Run the development server in one terminal:

```powershell
npm run dev
```

Run in another:

```powershell
npm run test:security-mission
npx tsc --noEmit
npm run test:security-mission:responsive
```

Expected: all tests PASS and TypeScript exits zero.

- [ ] **Step 9: Update progress and commit**

```powershell
git add -- app/tools/security-command-builder components/tools/security-mission/SecurityMission.module.css components/tools/security-mission/SecurityMissionShell.tsx data/tools.js package.json tests/tools/security-mission-live-route.test.js tests/tools/security-mission-style.test.js tests/tools/security-mission-responsive.test.js docs/reports/2026-07-29-security-mission-implementation-progress.md
git commit -m "feat: publish the Security Mission builder"
```

Inspect `git diff -- app/sitemap.js app/tools/page.tsx`. Add either path before
the commit only when Task 15 made a deliberate Security Mission change there.

### Task 16: Run the final verification and publish audit evidence

**Files:**
- Create: `scripts/build_security_mission_audit_artifacts.py`
- Create: `docs/reports/2026-07-29-security-mission-audit.md`
- Create: `docs/reports/2026-07-29-security-mission-evidence.json`
- Modify: `docs/reports/2026-07-29-security-mission-implementation-progress.md`
- Modify: `package-lock.json` only when `package.json` changed it through `npm install`

**Interfaces:**
- Consumes: all public catalog, workflow, test, build, and verification results.
- Produces: a reader-facing audit and machine-readable evidence.

- [ ] **Step 1: Write failing audit-artifact test**

Add `tests/tools/security-mission-audit-artifacts.test.js` and assert:

```js
test("audit evidence accounts for public actions and current eCPPT objectives", async () => {
  const evidence = JSON.parse(await readFile(
    new URL("../../docs/reports/2026-07-29-security-mission-evidence.json", import.meta.url),
    "utf8",
  ));
  assert.equal(evidence.tool_name, "Security Mission");
  assert.equal(evidence.route, "/tools/security-command-builder/");
  assert.equal(evidence.pending_public_actions, 0);
  assert.equal(evidence.ecppt_objectives.covered, evidence.ecppt_objectives.total);
  assert.ok(evidence.commands.reviewed > 0);
  assert.equal(evidence.safety.server_execution, false);
});
```

- [ ] **Step 2: Confirm RED**

```powershell
node --test tests/tools/security-mission-audit-artifacts.test.js
```

Expected: FAIL because audit evidence does not exist.

- [ ] **Step 3: Implement the audit builder**

`build_security_mission_audit_artifacts.py` reads only repository JSON and test
evidence. It must calculate:

```text
public tool count
public action count
verified action count by evidence tier
deferred action count
eCPPT objective coverage
supporting objective coverage
workflow count
command snapshot count
platform and shell coverage
responsive viewport results
privacy and injection test results
build and TypeScript results
```

The Markdown audit states limitations and names deferred actions. It does not
claim INE affiliation or guaranteed exam success.

- [ ] **Step 4: Run complete verification**

Run the Security Mission tests except the audit-artifact test:

```powershell
$securityMissionTests = Get-ChildItem -LiteralPath 'tests\tools' -Filter 'security-mission-*.test.js' |
  Where-Object Name -ne 'security-mission-audit-artifacts.test.js' |
  ForEach-Object FullName
node --test $securityMissionTests
npx tsc --noEmit
npm run build
npm run test:ml:model-mission
node --test tests/tools/battery-math.test.js tests/tools/pid-engine.test.js tests/tools/sensor-generator.test.js
```

With the production server running:

```powershell
npm run test:security-mission:responsive
```

Record exact commands, exit codes, pass counts, skips, and durations in the
progress ledger.

- [ ] **Step 5: Generate and verify audit artifacts**

```powershell
python scripts/build_security_mission_audit_artifacts.py
node --test tests/tools/security-mission-audit-artifacts.test.js
npm run test:security-mission
git diff --check
```

Expected: PASS and no whitespace errors.

- [ ] **Step 6: Inspect final scope**

```powershell
git status --short
git diff --stat HEAD~1..HEAD
git log --oneline --decorate -20
```

Confirm Security Mission commits contain no unrelated Model Mission or portfolio
migration changes. Confirm the verification ledger contains no `pending` public
action and no secret or real target.

- [ ] **Step 7: Update progress and commit**

```powershell
git add -- scripts/build_security_mission_audit_artifacts.py docs/reports/2026-07-29-security-mission-audit.md docs/reports/2026-07-29-security-mission-evidence.json docs/reports/2026-07-29-security-mission-implementation-progress.md tests/tools/security-mission-audit-artifacts.test.js
git commit -m "test: audit the Security Mission command builder"
```

## Nemotron Task Handoff Template

OpenCode should start with this prompt and implement the first unchecked task:

```text
Implement the first unchecked task from:
D:\work\portflioWebsite\securityMissionWorktree\docs\superpowers\plans\2026-07-29-security-mission-command-builder.md

Workspace:
D:\work\portflioWebsite\securityMissionWorktree

Required source of truth:
D:\work\portflioWebsite\securityMissionWorktree\docs\superpowers\specs\2026-07-29-security-mission-command-builder-design.md

Follow the task's exact file scope, interfaces, RED-GREEN test cycle, evidence
requirements, progress-ledger update, and commit message. Use trained knowledge
to propose candidate flags, then verify each public flag against installed help
or official upstream documentation. Stop and record a deferred action when
evidence is unavailable or conflicts. Preserve unrelated changes. Return the
commit, files changed, evidence records, tests and results, deferred actions,
and risks.
```

## Final Review Checklist

- [ ] All current eCPPT objectives map to verified public actions.
- [ ] The approved broader catalog includes Netcat, Ncat, Hashcat, Hydra, hping3, and the Aircrack-ng suite.
- [ ] Each public action has versioned `local-help` or `official-docs` evidence.
- [ ] No `pending` action reaches the public catalog.
- [ ] The compiler treats each user value as data.
- [ ] Bash, PowerShell, and supported CMD snapshots pass.
- [ ] Exports remove secrets and sanitize targets by default.
- [ ] Workflows transfer explicit typed values without output parsing.
- [ ] Credential and packet actions enforce bounds and warnings.
- [ ] The app contains no server execution path.
- [ ] Objective, tool, and workflow entry views use one project state.
- [ ] Guided, Customize, and Advanced preserve values.
- [ ] The route works at `/tools/security-command-builder/`.
- [ ] The tools index links to Security Mission.
- [ ] Responsive tests pass at all specified viewports.
- [ ] Computed and source styles contain no gradients or blur.
- [ ] TypeScript, production build, existing Model Mission tests, and Security Mission tests pass.
- [ ] The audit records limitations without claiming INE affiliation or guaranteed exam success.
