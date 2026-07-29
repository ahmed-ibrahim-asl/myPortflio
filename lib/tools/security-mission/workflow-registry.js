export const SECURITY_WORKFLOWS = Object.freeze([
  {
    id: "local-network-orientation",
    title: "Local Network Orientation",
    objectiveIds: ["network-foundations"],
    description: "Inspect local interfaces, routing table, and ARP neighbors before starting active network discovery.",
    platform: "cross-platform",
    prerequisites: ["Local network connection"],
    risk: "low",
    steps: [
      {
        id: "step-1",
        title: "Interface Inspection",
        purpose: "Display configured interfaces and IP addresses.",
        toolId: "ip",
        actionId: "ip-address-show",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: [],
        evidenceHints: ["Save ip addr or ipconfig /all output."],
      },
      {
        id: "step-2",
        title: "Route Table Inspection",
        purpose: "Inspect gateway and local subnet routes.",
        toolId: "ip",
        actionId: "ip-route-show",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: [],
        evidenceHints: ["Save route table information."],
      },
    ],
  },
  {
    id: "host-discovery",
    title: "Host Discovery & Active Enumeration",
    objectiveIds: ["host-discovery-port-scanning"],
    description: "Discover active hosts on the target subnet and perform targeted TCP service enumeration.",
    platform: "cross-platform",
    prerequisites: ["Authorized IP range"],
    risk: "low",
    steps: [
      {
        id: "step-1",
        title: "Ping Sweep Discovery",
        purpose: "Identify responsive hosts on the lab subnet.",
        toolId: "nmap",
        actionId: "nmap-host-discovery",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: [],
        evidenceHints: ["Save live host list."],
      },
      {
        id: "step-2",
        title: "Targeted TCP Scan",
        purpose: "Enumerate open ports and service versions on discovered hosts.",
        toolId: "nmap",
        actionId: "nmap-tcp-scan",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: ["host"],
        evidenceHints: ["Save Nmap output files (-oA)."],
      },
    ],
  },
  {
    id: "web-content-discovery",
    title: "Web Content & Virtual Host Discovery",
    objectiveIds: ["web-enumeration"],
    description: "Discover hidden directories, files, and virtual hosts on a target web server.",
    platform: "cross-platform",
    prerequisites: ["Target HTTP/HTTPS URL"],
    risk: "low",
    steps: [
      {
        id: "step-1",
        title: "Directory Fuzzing",
        purpose: "Fuzz directories and files using ffuf.",
        toolId: "ffuf",
        actionId: "ffuf-content-discovery",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: ["url"],
        evidenceHints: ["Record discovered web endpoints."],
      },
      {
        id: "step-2",
        title: "Virtual Host Enumeration",
        purpose: "Probe for unlinked virtual hosts.",
        toolId: "gobuster",
        actionId: "gobuster-vhost",
        hostRole: "operator",
        defaults: {},
        acceptsBindings: ["domain"],
        evidenceHints: ["Record responsive vhosts in hosts file."],
      },
    ],
  },
]);

export function getSecurityWorkflow(id) {
  return SECURITY_WORKFLOWS.find((wf) => wf.id === id) ?? null;
}

export function validateSecurityWorkflowRegistry(workflows = SECURITY_WORKFLOWS) {
  const errors = [];
  const seen = new Set();
  for (const wf of workflows) {
    if (!wf.id || seen.has(wf.id)) {
      errors.push(`Duplicate or missing workflow id: ${wf.id}`);
    }
    seen.add(wf.id);
    if (!wf.steps || wf.steps.length < 2) {
      errors.push(`Workflow ${wf.id} must contain at least 2 steps.`);
    }
  }
  return errors;
}

export function resolveWorkflowBindings(project, workflow) {
  if (!workflow || !workflow.steps) return { steps: [] };

  const steps = workflow.steps.map((step) => {
    const target = { ...step.defaults };
    const options = { ...step.defaults };

    if (step.acceptsBindings.includes("host") && project.target?.host) {
      target.host = project.target.host;
    }
    if (step.acceptsBindings.includes("url") && project.target?.url) {
      target.url = project.target.url;
    }
    if (step.acceptsBindings.includes("domain") && project.target?.domain) {
      target.domain = project.target.domain;
    }
    if (step.acceptsBindings.includes("ports") && project.options?.ports) {
      options.ports = project.options.ports;
    }

    return {
      stepId: step.id,
      toolId: step.toolId,
      actionId: step.actionId,
      target,
      options,
    };
  });

  return { steps };
}
