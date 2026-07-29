import test from "node:test";
import assert from "node:assert/strict";

import {
  SECURITY_ACTIONS,
  SECURITY_TOOLS,
} from "../../lib/tools/security-mission/catalog.js";
import { createDefaultSecurityMissionProject } from "../../lib/tools/security-mission/project-config.js";
import {
  getCompatibleActions,
  getCompatibleObjectives,
  getCompatibleTools,
  getStepGuard,
} from "../../lib/tools/security-mission/selectors.js";
import { validateSecurityRegistry } from "../../lib/tools/security-mission/registry-validation.js";
import { SECURITY_OBJECTIVES } from "../../lib/tools/security-mission/objective-registry.js";
import {
  getSecurityProjectValue,
  patchSecurityProjectValue,
} from "../../lib/tools/security-mission/project-paths.js";
import {
  getAllSecurityControls,
  getSecurityControls,
} from "../../lib/tools/security-mission/control-registry.js";
import {
  SECURITY_WORKFLOWS,
  validateSecurityWorkflowRegistry,
} from "../../lib/tools/security-mission/workflow-registry.js";

test("host discovery exposes Nmap and its five compatible actions", () => {
  const project = {
    ...createDefaultSecurityMissionProject(),
    toolId: "nmap",
  };

  assert.ok(
    getCompatibleTools({ project }).some(({ id }) => id === "nmap"),
  );
  assert.deepEqual(
    getCompatibleActions({ project }).map(({ id }) => id),
    [
      "nmap-host-discovery",
      "nmap-tcp-scan",
      "nmap-udp-scan",
      "nmap-service-enumeration",
      "nmap-nse-scan",
    ],
  );
});

test("tool-first discovery ignores the default objective but keeps scope compatibility", () => {
  const project = createDefaultSecurityMissionProject();
  const toolFirstIds = new Set(
    getCompatibleTools({ project, objectiveId: null }).map(({ id }) => id),
  );

  assert.equal(toolFirstIds.size, SECURITY_TOOLS.length);
  assert.ok(toolFirstIds.has("nmap"));
  assert.ok(toolFirstIds.has("ffuf"));
  assert.ok(toolFirstIds.has("bloodhound-python"));
});

test("a selected tool limits the objective chooser to objectives it can serve", () => {
  const project = {
    ...createDefaultSecurityMissionProject(),
    objectiveId: null,
    toolId: "nmap",
  };
  const objectiveIds = getCompatibleObjectives({ project }).map(({ id }) => id);
  const actionObjectiveIds = new Set(
    SECURITY_ACTIONS
      .filter(({ toolId }) => toolId === "nmap")
      .flatMap(({ objectiveIds: ids }) => ids),
  );

  assert.deepEqual(objectiveIds, [
    ...objectiveIds.filter((id) => actionObjectiveIds.has(id)),
  ]);
  assert.ok(objectiveIds.includes("host-discovery-port-scanning"));
});

test("every public tool has safe searchable display metadata", () => {
  for (const tool of SECURITY_TOOLS) {
    assert.equal(typeof tool.description, "string", tool.id);
    assert.ok(tool.description.length > 0, tool.id);
    assert.ok(Array.isArray(tool.aliases), tool.id);
    assert.ok(Array.isArray(tool.categories), tool.id);
    assert.ok(tool.categories.length > 0, tool.id);
    assert.ok(Array.isArray(tool.platforms), tool.id);
    assert.ok(tool.platforms.length > 0, tool.id);
    assert.ok(Array.isArray(tool.shells), tool.id);
    assert.ok(tool.shells.length > 0, tool.id);
    assert.ok(Array.isArray(tool.executableNames), tool.id);
    assert.ok(tool.executableNames.length > 0, tool.id);
    assert.ok(["cli", "gui-companion"].includes(tool.interface), tool.id);
  }
});

test("the composed objective, tool, and action registries are internally valid", () => {
  assert.deepEqual(
    validateSecurityRegistry({
      objectives: SECURITY_OBJECTIVES,
      tools: SECURITY_TOOLS,
      actions: SECURITY_ACTIONS,
      controls: getAllSecurityControls(),
    }),
    [],
  );
});

test("project paths update one allowed branch without mutating the project", () => {
  const original = createDefaultSecurityMissionProject();
  const next = patchSecurityProjectValue(
    original,
    "target.network",
    "10.10.10.0/24",
  );

  assert.equal(getSecurityProjectValue(original, "target.network"), undefined);
  assert.equal(
    getSecurityProjectValue(next, "target.network"),
    "10.10.10.0/24",
  );
  assert.notEqual(next, original);
  assert.notEqual(next.target, original.target);
  assert.equal(next.options, original.options);
  assert.throws(
    () =>
      patchSecurityProjectValue(
        original,
        "__proto__.polluted",
        "yes",
      ),
    /Unsupported project path root/,
  );
});

test("all 159 actions expose a control for every consumed project path", () => {
  const controls = getAllSecurityControls();
  const controlPaths = new Set(controls.map(({ valuePath }) => valuePath));

  assert.equal(SECURITY_ACTIONS.length, 159);
  for (const action of SECURITY_ACTIONS) {
    for (const rule of action.argumentRules ?? []) {
      assert.ok(
        controlPaths.has(rule.valuePath),
        `${action.id}:${rule.valuePath}`,
      );
      assert.ok(
        getSecurityControls({
          actionId: action.id,
          stepId: rule.valuePath.startsWith("target.")
            ? "target"
            : "configure",
          learningLevel: "advanced",
          project: createDefaultSecurityMissionProject(),
        }).some(({ valuePath }) => valuePath === rule.valuePath),
        `reachable:${action.id}:${rule.valuePath}`,
      );
    }
  }
});

test("registry validation reports an action argument with no control source", () => {
  const controls = getAllSecurityControls();
  const errors = validateSecurityRegistry({
    objectives: SECURITY_OBJECTIVES,
    tools: SECURITY_TOOLS,
    actions: SECURITY_ACTIONS,
    controls: controls.filter(
      ({ valuePath }) => valuePath !== "target.network",
    ),
  });

  assert.ok(
    errors.some((error) =>
      error.includes("nmap-host-discovery:target.network")),
  );
});

test("step guards name the missing choice that blocks progress", () => {
  const project = createDefaultSecurityMissionProject();
  assert.deepEqual(
    getStepGuard({ project, stepId: "tool" }),
    {
      allowed: false,
      reason: "Choose a compatible tool.",
      fieldPath: null,
    },
  );
  assert.equal(
    getStepGuard({
      project: { ...project, toolId: "nmap" },
      stepId: "tool",
    }).allowed,
    true,
  );
});

test("every named version-one workflow is implemented with valid command steps", () => {
  const expectedTitles = [
    "Local Network Orientation",
    "Host Discovery",
    "Full TCP Port Discovery",
    "Targeted Service and Default-Script Enumeration",
    "UDP Service Discovery",
    "DNS Enumeration",
    "SMB and RPC Enumeration",
    "SNMP Enumeration",
    "TLS Certificate Inspection",
    "Username Discovery and Validation",
    "Lockout-Aware Password Spray Preparation",
    "Remote-Service Credential Audit",
    "Credential Verification Through the Selected Protocol",
    "Web Surface Identification",
    "Content and Virtual-Host Discovery",
    "Request Reproduction with curl",
    "Login-Form Audit Preparation",
    "SQL Injection Identification and Confirmation",
    "Outdated Component Identification",
    "Evidence Capture for a Finding",
    "Search, Inspect, and Copy a Public Exploit",
    "Prepare a Laboratory Payload and Listener",
    "Establish and Document a Netcat Connection",
    "Transfer a File in an Authorized Lab",
    "Linux Local Enumeration",
    "Windows Local Enumeration",
    "Hash Identification and Offline Audit",
    "Evidence Collection and Cleanup Reminders",
    "SSH Local Forwarding",
    "SSH Dynamic Forwarding with ProxyChains",
    "Reverse Tunnel Setup",
    "Route a Lab Subnet with sshuttle",
    "Chisel Two-Host Setup",
    "Ligolo-ng Multi-Host Setup",
    "Inspect a Binary and Its Protections",
    "Generate a Cyclic Pattern and Find the Offset",
    "Compile a Debug Build",
    "Inspect a Crash in GDB",
    "Start a Pwntools Exploit Skeleton",
    "Discover Domain Context",
    "Enumerate LDAP, SMB, Users, Groups, and Shares",
    "Validate Usernames with Kerberos",
    "Identify AS-REP Roastable Accounts",
    "Enumerate Service Accounts and Request Test Tickets",
    "Collect a BloodHound Data Set",
    "Test Authorized Pass-the-Hash Access",
    "Prepare a Pass-the-Ticket Laboratory Session",
    "Compare Supported Remote-Management Methods",
    "Record Domain Privilege Evidence",
    "Prepare a Wireless Interface for Monitor Mode",
    "Observe an Authorized Wireless Network",
    "Capture and Verify an Authorized Handshake",
    "Perform an Offline Wireless Password Audit",
    "Build a Bounded hping3 Packet Test",
    "Capture and Filter Traffic with tcpdump or tshark",
  ];

  assert.equal(SECURITY_WORKFLOWS.length, expectedTitles.length);
  assert.deepEqual(
    SECURITY_WORKFLOWS.map(({ title }) => title),
    expectedTitles,
  );
  assert.deepEqual(
    validateSecurityWorkflowRegistry(SECURITY_WORKFLOWS, SECURITY_ACTIONS),
    [],
  );
});
