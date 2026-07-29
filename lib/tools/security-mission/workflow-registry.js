import { SECURITY_ACTIONS } from "./catalog.js";
import { getAllSecurityControls } from "./control-registry.js";

const ACTION_BY_ID = new Map(
  SECURITY_ACTIONS.map((action) => [action.id, action]),
);
const CONTROL_BY_PATH = new Map(
  getAllSecurityControls().map((control) => [control.valuePath, control]),
);
const RISK_RANK = Object.freeze({ low: 0, elevated: 1, high: 2 });

function workflow({
  id,
  title,
  objectiveId,
  steps,
  platform = null,
  prerequisites = ["Explicit authorization for the selected laboratory scope"],
}) {
  const normalizedSteps = steps.map((stepDefinition, index) => {
    const [actionId, hostRole = "operator"] = Array.isArray(stepDefinition)
      ? stepDefinition
      : [stepDefinition, "operator"];
    const action = ACTION_BY_ID.get(actionId);
    return Object.freeze({
      id: `step-${index + 1}`,
      title: action?.title ?? actionId,
      purpose: action?.summary
        ?? `Complete the ${title.toLowerCase()} stage.`,
      toolId: action?.toolId ?? "",
      actionId,
      hostRole,
      defaults: {},
      acceptsBindings: Object.freeze(
        (action?.argumentRules ?? []).map(({ valuePath }) => valuePath),
      ),
      evidenceHints: Object.freeze(
        action?.evidenceHints?.length
          ? [...action.evidenceHints]
          : [`Record the output from ${action?.title ?? actionId}.`],
      ),
    });
  });
  const risk = normalizedSteps.reduce((highest, step) => {
    const stepRisk = ACTION_BY_ID.get(step.actionId)?.risk ?? "low";
    return RISK_RANK[stepRisk] > RISK_RANK[highest] ? stepRisk : highest;
  }, "low");
  const supportedPlatforms = normalizedSteps.reduce((shared, step, index) => {
    const actionPlatforms = Object.keys(
      ACTION_BY_ID.get(step.actionId)?.executable ?? {},
    );
    if (index === 0) return actionPlatforms;
    return shared.filter((candidate) => actionPlatforms.includes(candidate));
  }, []);
  const resolvedPlatform = platform
    ?? (supportedPlatforms.length === 1
      ? supportedPlatforms[0]
      : "cross-platform");

  return Object.freeze({
    id,
    title,
    objectiveIds: Object.freeze([objectiveId]),
    description:
      `${title} connects verified command recipes into an editable authorized-lab runbook.`,
    platform: resolvedPlatform,
    prerequisites: Object.freeze(prerequisites),
    risk,
    steps: Object.freeze(normalizedSteps),
  });
}

export const SECURITY_WORKFLOWS = Object.freeze([
  workflow({
    id: "local-network-orientation",
    title: "Local Network Orientation",
    objectiveId: "network-foundations",
    steps: ["ip-address-show", "ip-route-show"],
  }),
  workflow({
    id: "host-discovery",
    title: "Host Discovery",
    objectiveId: "host-discovery-port-scanning",
    steps: ["nmap-host-discovery", "nmap-tcp-scan"],
  }),
  workflow({
    id: "full-tcp-port-discovery",
    title: "Full TCP Port Discovery",
    objectiveId: "host-discovery-port-scanning",
    steps: ["masscan-port-discovery", "nmap-tcp-scan"],
  }),
  workflow({
    id: "targeted-service-default-script-enumeration",
    title: "Targeted Service and Default-Script Enumeration",
    objectiveId: "service-enumeration",
    steps: ["nmap-service-enumeration", "nmap-nse-scan"],
  }),
  workflow({
    id: "udp-service-discovery",
    title: "UDP Service Discovery",
    objectiveId: "service-enumeration",
    steps: ["nmap-udp-scan", "nmap-service-enumeration"],
  }),
  workflow({
    id: "dns-enumeration",
    title: "DNS Enumeration",
    objectiveId: "service-enumeration",
    steps: ["whois-domain", "dig-records", "dnsrecon-standard"],
  }),
  workflow({
    id: "smb-rpc-enumeration",
    title: "SMB and RPC Enumeration",
    objectiveId: "service-enumeration",
    steps: [
      "nbtscan-network",
      "enum4linux-enumerate",
      "smbclient-list-shares",
      "rpcclient-query",
    ],
  }),
  workflow({
    id: "snmp-enumeration",
    title: "SNMP Enumeration",
    objectiveId: "service-enumeration",
    steps: ["onesixtyone-community-audit", "snmpwalk-oid"],
  }),
  workflow({
    id: "tls-certificate-inspection",
    title: "TLS Certificate Inspection",
    objectiveId: "service-enumeration",
    steps: ["openssl-tls-inspect", "curl-request"],
  }),
  workflow({
    id: "username-discovery-validation",
    title: "Username Discovery and Validation",
    objectiveId: "username-enumeration",
    steps: ["kerbrute-user-enumeration", "netexec-auth-check"],
  }),
  workflow({
    id: "lockout-aware-password-spray-preparation",
    title: "Lockout-Aware Password Spray Preparation",
    objectiveId: "password-spraying",
    steps: ["kerbrute-user-enumeration", "kerbrute-password-spray"],
    prerequisites: [
      "Explicit authorization",
      "Documented account lockout and rate limits",
    ],
  }),
  workflow({
    id: "remote-service-credential-audit",
    title: "Remote-Service Credential Audit",
    objectiveId: "remote-service-brute-force",
    steps: ["ncrack-service-audit", "hydra-service-audit"],
  }),
  workflow({
    id: "credential-verification-selected-protocol",
    title: "Credential Verification Through the Selected Protocol",
    objectiveId: "remote-service-brute-force",
    steps: ["netexec-auth-check", "ssh-connect"],
  }),
  workflow({
    id: "web-surface-identification",
    title: "Web Surface Identification",
    objectiveId: "web-enumeration",
    steps: ["whatweb-fingerprint", "nikto-scan"],
  }),
  workflow({
    id: "content-virtual-host-discovery",
    title: "Content and Virtual-Host Discovery",
    objectiveId: "web-enumeration",
    steps: ["ffuf-content-discovery", "gobuster-vhost"],
  }),
  workflow({
    id: "request-reproduction-with-curl",
    title: "Request Reproduction with curl",
    objectiveId: "web-evidence-and-credentials",
    steps: ["curl-request", "curl-timing"],
  }),
  workflow({
    id: "login-form-audit-preparation",
    title: "Login-Form Audit Preparation",
    objectiveId: "web-login-audit",
    steps: ["curl-request", "hydra-http-form-audit"],
  }),
  workflow({
    id: "sql-injection-identification-confirmation",
    title: "SQL Injection Identification and Confirmation",
    objectiveId: "web-vulnerability-validation",
    steps: ["sqlmap-identify", "sqlmap-request-file"],
  }),
  workflow({
    id: "outdated-component-identification",
    title: "Outdated Component Identification",
    objectiveId: "outdated-web-components",
    steps: ["whatweb-fingerprint", "wpscan-enumerate"],
  }),
  workflow({
    id: "evidence-capture-for-finding",
    title: "Evidence Capture for a Finding",
    objectiveId: "reporting-and-evidence",
    steps: ["curl-request", "burp-suite-checklist"],
  }),
  workflow({
    id: "search-inspect-copy-public-exploit",
    title: "Search, Inspect, and Copy a Public Exploit",
    objectiveId: "service-exploitation",
    steps: ["searchsploit-search", "searchsploit-copy"],
  }),
  workflow({
    id: "prepare-laboratory-payload-listener",
    title: "Prepare a Laboratory Payload and Listener",
    objectiveId: "service-exploitation",
    steps: [
      ["msfvenom-generate-lab-payload", "operator"],
      ["netcat-listen", "listener"],
    ],
  }),
  workflow({
    id: "establish-document-netcat-connection",
    title: "Establish and Document a Netcat Connection",
    objectiveId: "service-exploitation",
    steps: [
      ["netcat-listen", "listener"],
      ["netcat-connect", "source-host"],
    ],
  }),
  workflow({
    id: "authorized-lab-file-transfer",
    title: "Transfer a File in an Authorized Lab",
    objectiveId: "service-exploitation",
    steps: [
      ["python-http-server", "source-host"],
      ["wget-file-transfer", "destination-host"],
    ],
  }),
  workflow({
    id: "linux-local-enumeration",
    title: "Linux Local Enumeration",
    objectiveId: "privilege-escalation",
    platform: "linux",
    steps: ["linpeas-run", "pspy-monitor"],
  }),
  workflow({
    id: "windows-local-enumeration",
    title: "Windows Local Enumeration",
    objectiveId: "privilege-escalation",
    platform: "windows",
    steps: ["winpeas-run", "netstat-sockets"],
  }),
  workflow({
    id: "hash-identification-offline-audit",
    title: "Hash Identification and Offline Audit",
    objectiveId: "hash-auditing",
    steps: ["hashid-identify", "hashcat-audit"],
  }),
  workflow({
    id: "evidence-collection-cleanup-reminders",
    title: "Evidence Collection and Cleanup Reminders",
    objectiveId: "reporting-and-evidence",
    steps: ["ss-sockets", "ip-route-show"],
  }),
  workflow({
    id: "ssh-local-forwarding",
    title: "SSH Local Forwarding",
    objectiveId: "pivoting-and-tunneling",
    steps: ["ssh-connect", "ssh-local-forward"],
  }),
  workflow({
    id: "ssh-dynamic-forwarding-proxychains",
    title: "SSH Dynamic Forwarding with ProxyChains",
    objectiveId: "pivoting-and-tunneling",
    steps: ["ssh-dynamic-forward", "proxychains-wrap"],
  }),
  workflow({
    id: "reverse-tunnel-setup",
    title: "Reverse Tunnel Setup",
    objectiveId: "pivoting-and-tunneling",
    steps: [
      ["ssh-remote-forward", "pivot-host"],
      ["netcat-listen", "operator"],
    ],
  }),
  workflow({
    id: "route-lab-subnet-sshuttle",
    title: "Route a Lab Subnet with sshuttle",
    objectiveId: "pivoting-and-tunneling",
    platform: "linux",
    steps: ["ip-route-show", "sshuttle-route"],
  }),
  workflow({
    id: "chisel-two-host-setup",
    title: "Chisel Two-Host Setup",
    objectiveId: "pivoting-and-tunneling",
    steps: [
      ["chisel-server", "operator"],
      ["chisel-client", "pivot-host"],
    ],
  }),
  workflow({
    id: "ligolo-multi-host-setup",
    title: "Ligolo-ng Multi-Host Setup",
    objectiveId: "pivoting-and-tunneling",
    steps: [
      ["ligolo-proxy", "operator"],
      ["ligolo-agent", "pivot-host"],
      ["ligolo-route", "operator"],
    ],
  }),
  workflow({
    id: "inspect-binary-protections",
    title: "Inspect a Binary and Its Protections",
    objectiveId: "exploit-code-adaptation",
    platform: "linux",
    steps: ["file-inspect", "checksec-file", "readelf-inspect"],
  }),
  workflow({
    id: "cyclic-pattern-find-offset",
    title: "Generate a Cyclic Pattern and Find the Offset",
    objectiveId: "memory-corruption",
    platform: "linux",
    steps: ["pattern-create", "pattern-offset"],
  }),
  workflow({
    id: "compile-debug-build",
    title: "Compile a Debug Build",
    objectiveId: "exploit-code-adaptation",
    platform: "linux",
    steps: ["gcc-debug-build", "file-inspect"],
  }),
  workflow({
    id: "inspect-crash-gdb",
    title: "Inspect a Crash in GDB",
    objectiveId: "memory-corruption",
    platform: "linux",
    steps: ["gdb-debug", "gdb-core"],
  }),
  workflow({
    id: "pwntools-exploit-skeleton",
    title: "Start a Pwntools Exploit Skeleton",
    objectiveId: "exploit-code-adaptation",
    platform: "linux",
    steps: ["pwntools-project-checklist", "python-run-script"],
  }),
  workflow({
    id: "discover-domain-context",
    title: "Discover Domain Context",
    objectiveId: "ad-enumeration",
    steps: ["ipconfig-all", "nslookup-query"],
  }),
  workflow({
    id: "enumerate-ldap-smb-users-groups-shares",
    title: "Enumerate LDAP, SMB, Users, Groups, and Shares",
    objectiveId: "ad-enumeration",
    steps: [
      "ldapsearch-query",
      "netexec-smb",
      "powerview-get-domainuser",
      "smbclient-list-shares",
    ],
  }),
  workflow({
    id: "validate-usernames-kerberos",
    title: "Validate Usernames with Kerberos",
    objectiveId: "username-enumeration",
    steps: ["nslookup-query", "kerbrute-user-enumeration"],
  }),
  workflow({
    id: "identify-asrep-roastable-accounts",
    title: "Identify AS-REP Roastable Accounts",
    objectiveId: "asrep-roasting",
    steps: ["kerbrute-user-enumeration", "getnpusers-asreproast"],
  }),
  workflow({
    id: "enumerate-service-accounts-request-tickets",
    title: "Enumerate Service Accounts and Request Test Tickets",
    objectiveId: "ad-enumeration",
    steps: ["powerview-get-domainuser", "getuserspns-kerberoast"],
  }),
  workflow({
    id: "collect-bloodhound-data-set",
    title: "Collect a BloodHound Data Set",
    objectiveId: "ad-enumeration",
    steps: ["bloodhound-python-ingest", "sharphound-ingest"],
  }),
  workflow({
    id: "authorized-pass-the-hash-access",
    title: "Test Authorized Pass-the-Hash Access",
    objectiveId: "ad-pass-the-hash",
    steps: ["netexec-auth-check", "psexec-connect"],
  }),
  workflow({
    id: "pass-the-ticket-laboratory-session",
    title: "Prepare a Pass-the-Ticket Laboratory Session",
    objectiveId: "ad-pass-the-ticket",
    steps: ["gettgt-request", "getst-request"],
  }),
  workflow({
    id: "compare-remote-management-methods",
    title: "Compare Supported Remote-Management Methods",
    objectiveId: "domain-admin-validation",
    steps: ["evil-winrm-connect", "wmiexec-connect", "xfreerdp-connect"],
  }),
  workflow({
    id: "record-domain-privilege-evidence",
    title: "Record Domain Privilege Evidence",
    objectiveId: "reporting-and-evidence",
    steps: ["powerview-get-domainuser", "ldapdomaindump-extract"],
  }),
  workflow({
    id: "prepare-wireless-monitor-mode",
    title: "Prepare a Wireless Interface for Monitor Mode",
    objectiveId: "wireless-assessment",
    platform: "linux",
    steps: ["iw-interface-info", "airmon-ng-monitor"],
  }),
  workflow({
    id: "observe-authorized-wireless-network",
    title: "Observe an Authorized Wireless Network",
    objectiveId: "wireless-assessment",
    platform: "linux",
    steps: ["iw-interface-info", "airodump-ng-capture"],
  }),
  workflow({
    id: "capture-verify-authorized-handshake",
    title: "Capture and Verify an Authorized Handshake",
    objectiveId: "wireless-assessment",
    platform: "linux",
    steps: ["airodump-ng-capture", "aircrack-ng-crack"],
  }),
  workflow({
    id: "offline-wireless-password-audit",
    title: "Perform an Offline Wireless Password Audit",
    objectiveId: "wireless-assessment",
    platform: "linux",
    steps: ["aircrack-ng-crack", "hashcat-audit"],
  }),
  workflow({
    id: "bounded-hping3-packet-test",
    title: "Build a Bounded hping3 Packet Test",
    objectiveId: "traffic-analysis",
    platform: "linux",
    steps: ["tcpdump-capture", "hping3-bounded-send"],
  }),
  workflow({
    id: "capture-filter-tcpdump-tshark",
    title: "Capture and Filter Traffic with tcpdump or tshark",
    objectiveId: "traffic-analysis",
    steps: ["tcpdump-capture", "tshark-capture"],
  }),
]);

export function getSecurityWorkflow(id) {
  return SECURITY_WORKFLOWS.find((candidate) => candidate.id === id) ?? null;
}

export function validateSecurityWorkflowRegistry(
  workflows = SECURITY_WORKFLOWS,
  actions = SECURITY_ACTIONS,
) {
  const errors = [];
  const workflowIds = new Set();
  const actionById = new Map(actions.map((action) => [action.id, action]));

  for (const item of workflows) {
    if (!item.id || workflowIds.has(item.id)) {
      errors.push(`Duplicate or missing workflow id: ${item.id}`);
    }
    workflowIds.add(item.id);
    if (!item.title || !item.description) {
      errors.push(`Workflow ${item.id} needs display metadata.`);
    }
    if (!Array.isArray(item.objectiveIds) || item.objectiveIds.length === 0) {
      errors.push(`Workflow ${item.id} needs an objective.`);
    }
    if (!item.steps || item.steps.length < 2) {
      errors.push(`Workflow ${item.id} must contain at least 2 steps.`);
      continue;
    }

    const stepIds = new Set();
    for (const step of item.steps) {
      if (!step.id || stepIds.has(step.id)) {
        errors.push(`Workflow ${item.id} has a duplicate step id: ${step.id}`);
      }
      stepIds.add(step.id);
      const action = actionById.get(step.actionId);
      if (!action) {
        errors.push(`Workflow ${item.id} references unknown action ${step.actionId}.`);
      } else if (action.toolId !== step.toolId) {
        errors.push(`Workflow ${item.id}:${step.id} has a mismatched tool.`);
      }
      if (!step.hostRole) {
        errors.push(`Workflow ${item.id}:${step.id} needs a host role.`);
      }
      for (const binding of step.acceptsBindings ?? []) {
        if (!/^(target|options|output)\.[A-Za-z0-9]+$/.test(binding)) {
          errors.push(
            `Workflow ${item.id}:${step.id} has invalid binding ${binding}.`,
          );
        }
      }
    }
  }

  return errors;
}

function getPath(source, valuePath) {
  return valuePath
    .split(".")
    .reduce((current, key) => current?.[key], source);
}

function setPath(target, valuePath, value) {
  const [root, key] = valuePath.split(".");
  if (!["target", "options", "output"].includes(root) || !key) return;
  target[root] = { ...target[root], [key]: value };
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

export function resolveWorkflowBindings(project, selectedWorkflow) {
  if (!selectedWorkflow?.steps) return { steps: [] };

  const existingById = new Map(
    (project.workflow?.steps ?? []).map((step) => [step.stepId, step]),
  );
  const steps = selectedWorkflow.steps.map((step) => {
    const action = ACTION_BY_ID.get(step.actionId);
    const existing = existingById.get(step.id) ?? {};
    const resolved = {
      stepId: step.id,
      toolId: step.toolId,
      actionId: step.actionId,
      target: {
        ...(step.defaults?.target ?? {}),
        ...(existing.target ?? {}),
      },
      options: {
        ...(step.defaults?.options ?? {}),
        ...(existing.options ?? {}),
      },
      output: {
        ...(project.output ?? {}),
        ...(step.defaults?.output ?? {}),
        ...(existing.output ?? {}),
      },
    };

    for (const { valuePath } of action?.argumentRules ?? []) {
      const sharedValue = step.acceptsBindings.includes(valuePath)
        ? getPath(project, valuePath)
        : undefined;
      if (hasValue(sharedValue)) {
        setPath(resolved, valuePath, sharedValue);
        continue;
      }
      if (hasValue(getPath(resolved, valuePath))) continue;
      const defaultValue = CONTROL_BY_PATH.get(valuePath)?.defaultValue;
      if (hasValue(defaultValue)) {
        setPath(resolved, valuePath, defaultValue);
      }
    }

    return resolved;
  });

  return { steps };
}
