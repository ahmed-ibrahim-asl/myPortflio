import { SECURITY_OBJECTIVE_IDS } from "./objective-registry.js";

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

export function normalizeSecurityMissionProject(input) {
  const defaults = createDefaultSecurityMissionProject();
  if (!input || typeof input !== "object") return defaults;

  const validModes = ["command", "workflow"];
  const validContexts = ["personal-lab", "certification-lab", "ctf", "client-authorized"];
  const validLevels = ["guided", "customize", "advanced"];
  const validPlatforms = ["linux", "windows", "macos"];
  const validShells = ["bash", "powershell", "cmd"];
  const validFormats = ["single-line", "multi-line", "script"];

  return {
    schemaVersion: SECURITY_MISSION_SCHEMA_VERSION,
    mode: validModes.includes(input.mode) ? input.mode : defaults.mode,
    authorizationContext: validContexts.includes(input.authorizationContext) ? input.authorizationContext : defaults.authorizationContext,
    learningLevel: validLevels.includes(input.learningLevel) ? input.learningLevel : defaults.learningLevel,
    platform: validPlatforms.includes(input.platform) ? input.platform : defaults.platform,
    shell: validShells.includes(input.shell) ? input.shell : defaults.shell,
    objectiveId: SECURITY_OBJECTIVE_IDS.includes(input.objectiveId) ? input.objectiveId : defaults.objectiveId,
    toolId: typeof input.toolId === "string" ? input.toolId : null,
    actionId: typeof input.actionId === "string" ? input.actionId : null,
    workflowId: typeof input.workflowId === "string" ? input.workflowId : null,
    target: typeof input.target === "object" && input.target ? JSON.parse(JSON.stringify(input.target)) : {},
    options: typeof input.options === "object" && input.options ? JSON.parse(JSON.stringify(input.options)) : {},
    output: {
      format: input.output && validFormats.includes(input.output.format) ? input.output.format : defaults.output.format,
      includeComments: input.output && typeof input.output.includeComments === "boolean" ? input.output.includeComments : defaults.output.includeComments,
      includeLabValues: input.output && typeof input.output.includeLabValues === "boolean" ? input.output.includeLabValues : defaults.output.includeLabValues,
    },
    workflow: {
      activeStepId: input.workflow && typeof input.workflow.activeStepId === "string" ? input.workflow.activeStepId : defaults.workflow.activeStepId,
      steps: input.workflow && Array.isArray(input.workflow.steps) ? JSON.parse(JSON.stringify(input.workflow.steps)) : [],
    },
  };
}
