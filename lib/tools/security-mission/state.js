import { createDefaultSecurityMissionProject } from "./project-config.js";

export const SECURITY_MISSION_STEP_ORDER = Object.freeze([
  "scope", "objective", "tool", "action", "target", "configure", "review", "generate",
]);

export function createSecurityMissionState() {
  return {
    project: createDefaultSecurityMissionProject(),
    stepId: "scope",
    workspaceTab: "configure",
    navigatorTab: "objective",
    copyStatus: "idle",
    importError: "",
    workflowSteps: {},
  };
}

export function securityMissionReducer(state, action) {
  switch (action.type) {
    case "choose-mode":
      return { ...state, project: { ...state.project, mode: action.mode } };
    case "set-authorization-context":
      return { ...state, project: { ...state.project, authorizationContext: action.context } };
    case "set-learning-level":
      return { ...state, project: { ...state.project, learningLevel: action.level } };
    case "set-platform":
      return { ...state, project: { ...state.project, platform: action.platform } };
    case "set-shell":
      return { ...state, project: { ...state.project, shell: action.shell } };
    case "choose-objective":
      return { ...state, project: { ...state.project, objectiveId: action.objectiveId, toolId: null, actionId: null, options: {}, target: {} } };
    case "choose-tool":
      return { ...state, project: { ...state.project, toolId: action.toolId, actionId: null, options: {} } };
    case "choose-action":
      return { ...state, project: { ...state.project, actionId: action.actionId, options: {} } };
    case "choose-workflow":
      return { ...state, project: { ...state.project, workflowId: action.workflowId } };
    case "patch-target":
      return { ...state, project: { ...state.project, target: { ...state.project.target, ...action.patch } } };
    case "patch-options":
      return { ...state, project: { ...state.project, options: { ...state.project.options, ...action.patch } } };
    case "patch-output":
      return { ...state, project: { ...state.project, output: { ...state.project.output, ...action.patch } } };
    case "patch-workflow-step": {
      const stepKey = action.stepKey;
      if (!stepKey) return state;
      return {
        ...state,
        workflowSteps: {
          ...state.workflowSteps,
          [stepKey]: { ...(state.workflowSteps[stepKey] ?? {}), ...action.patch },
        },
      };
    }
    case "go-to-step":
      if (!SECURITY_MISSION_STEP_ORDER.includes(action.stepId)) return state;
      return { ...state, stepId: action.stepId };
    case "next-step": {
      const currentIndex = SECURITY_MISSION_STEP_ORDER.indexOf(state.stepId);
      const nextIndex = Math.min(currentIndex + 1, SECURITY_MISSION_STEP_ORDER.length - 1);
      return { ...state, stepId: SECURITY_MISSION_STEP_ORDER[nextIndex] };
    }
    case "previous-step": {
      const currentIndex = SECURITY_MISSION_STEP_ORDER.indexOf(state.stepId);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return { ...state, stepId: SECURITY_MISSION_STEP_ORDER[prevIndex] };
    }
    case "set-workspace-tab":
      return { ...state, workspaceTab: action.tab };
    case "set-copy-status":
      return { ...state, copyStatus: action.status };
    case "import-project":
      return { ...state, project: action.project, importError: "" };
    case "reset-project":
      return createSecurityMissionState();
    default:
      return state;
  }
}
