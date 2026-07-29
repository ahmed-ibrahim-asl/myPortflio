import {
  createDefaultSecurityMissionProject,
} from "./project-config.js";
import {
  migrateSecurityMissionProject,
} from "./project-config-migrations.js";
import {
  getSecurityAction,
  getSecurityTool,
} from "./catalog.js";
import {
  getSecurityControls,
} from "./control-registry.js";
import {
  getSecurityProjectValue,
  patchSecurityProjectValue,
} from "./project-paths.js";
import {
  getCompatibleActions,
} from "./selectors.js";
import {
  getSecurityWorkflow,
  resolveWorkflowBindings,
} from "./workflow-registry.js";
import {
  sanitizeImportedProject,
} from "./sensitive-values.js";

export const SECURITY_MISSION_STEP_ORDER = Object.freeze([
  "scope",
  "objective",
  "tool",
  "action",
  "target",
  "configure",
  "review",
  "generate",
]);

export function createSecurityMissionState() {
  return {
    project: createDefaultSecurityMissionProject(),
    stepId: "scope",
    workspaceTab: "configure",
    navigatorTab: "objective",
    copyStatus: "idle",
    importError: "",
    importMessage: "",
    guardMessage: "",
    focusedValuePath: null,
  };
}

function hasCompatibleAction(project) {
  return getCompatibleActions({ project }).length > 0;
}

function clearWorkflow(project) {
  return {
    ...project,
    mode: "command",
    workflowId: null,
    workflow: {
      activeStepId: null,
      steps: [],
    },
  };
}

function seedActionValues(project, action) {
  let nextProject = {
    ...project,
    target: {},
    options: {},
  };
  const controls = [
    ...getSecurityControls({
      actionId: action.id,
      stepId: "target",
      learningLevel: "advanced",
      project,
    }),
    ...getSecurityControls({
      actionId: action.id,
      stepId: "configure",
      learningLevel: "advanced",
      project,
    }),
  ];
  for (const control of controls) {
    const currentValue = getSecurityProjectValue(
      project,
      control.valuePath,
    );
    const value = currentValue ?? control.defaultValue;
    if (value !== undefined) {
      nextProject = patchSecurityProjectValue(
        nextProject,
        control.valuePath,
        value,
      );
    }
  }
  return nextProject;
}

function firstActionFormStep(project, action) {
  const hasTarget = getSecurityControls({
    actionId: action.id,
    stepId: "target",
    learningLevel: "advanced",
    project,
  }).length > 0;
  if (hasTarget) return "target";
  const hasOptions = getSecurityControls({
    actionId: action.id,
    stepId: "configure",
    learningLevel: "advanced",
    project,
  }).length > 0;
  return hasOptions ? "configure" : "review";
}

function initializeWorkflowProject(project, workflow) {
  const objectiveId = workflow.objectiveIds?.[0] ?? project.objectiveId;
  let baseProject = {
    ...project,
    mode: "workflow",
    objectiveId,
    toolId: null,
    actionId: null,
    workflowId: workflow.id,
  };
  for (const workflowStep of workflow.steps) {
    const stepAction = getSecurityAction(workflowStep.actionId);
    if (!stepAction) continue;
    const stepControls = [
      ...getSecurityControls({
        actionId: stepAction.id,
        stepId: "target",
        learningLevel: "advanced",
        project: baseProject,
      }),
      ...getSecurityControls({
        actionId: stepAction.id,
        stepId: "configure",
        learningLevel: "advanced",
        project: baseProject,
      }),
    ];
    for (const control of stepControls) {
      const currentValue = getSecurityProjectValue(
        baseProject,
        control.valuePath,
      );
      if (
        (currentValue === undefined || currentValue === null)
        && control.defaultValue !== undefined
      ) {
        baseProject = patchSecurityProjectValue(
          baseProject,
          control.valuePath,
          control.defaultValue,
        );
      }
    }
  }
  const resolved = resolveWorkflowBindings(baseProject, workflow);
  return {
    ...baseProject,
    workflow: {
      activeStepId: resolved.steps[0]?.stepId ?? null,
      steps: resolved.steps,
    },
  };
}

function assertKnownImportedIdentifiers(project) {
  if (project.toolId && !getSecurityTool(project.toolId)) {
    throw new Error(`Unknown tool identifier: ${project.toolId}`);
  }
  const importedAction = project.actionId
    ? getSecurityAction(project.actionId)
    : null;
  if (project.actionId && !importedAction) {
    throw new Error(`Unknown action identifier: ${project.actionId}`);
  }
  if (
    importedAction
    && project.toolId
    && importedAction.toolId !== project.toolId
  ) {
    throw new Error("Imported action does not belong to the selected tool.");
  }
  if (project.workflowId && !getSecurityWorkflow(project.workflowId)) {
    throw new Error(`Unknown workflow identifier: ${project.workflowId}`);
  }
}

export function securityMissionReducer(state, action) {
  switch (action.type) {
    case "choose-mode":
      return {
        ...state,
        project: { ...state.project, mode: action.mode },
      };
    case "choose-entry-mode":
    case "set-navigator-tab":
      {
        const navigatorTab = action.mode ?? action.tab;
        if (!["objective", "tool", "workflow"].includes(navigatorTab)) {
          return state;
        }
        const project = navigatorTab === "tool"
          ? {
              ...clearWorkflow(state.project),
              objectiveId: null,
              toolId: null,
              actionId: null,
              target: {},
              options: {},
            }
          : state.project;
        return {
          ...state,
          project,
          navigatorTab,
          stepId: "objective",
          guardMessage: "",
        };
      }
    case "set-authorization-context":
      return {
        ...state,
        project: {
          ...state.project,
          authorizationContext: action.context,
        },
      };
    case "set-learning-level":
      return {
        ...state,
        project: {
          ...state.project,
          learningLevel: action.level,
        },
      };
    case "set-platform":
      return {
        ...state,
        project: {
          ...state.project,
          platform: action.platform,
          toolId: null,
          actionId: null,
          target: {},
          options: {},
        },
        stepId: "objective",
      };
    case "set-shell":
      return {
        ...state,
        project: { ...state.project, shell: action.shell },
      };
    case "choose-objective": {
      let project = clearWorkflow({
        ...state.project,
        objectiveId: action.objectiveId,
      });
      if (project.toolId && !hasCompatibleAction(project)) {
        project = {
          ...project,
          toolId: null,
          actionId: null,
          target: {},
          options: {},
        };
      } else if (project.actionId && !hasCompatibleAction(project)) {
        project = {
          ...project,
          actionId: null,
          target: {},
          options: {},
        };
      }
      return {
        ...state,
        project,
        stepId: project.toolId ? "action" : "tool",
        guardMessage: "",
      };
    }
    case "choose-tool": {
      let project = clearWorkflow({
        ...state.project,
        toolId: action.toolId,
        actionId: null,
        options: {},
      });
      if (project.objectiveId && !hasCompatibleAction(project)) {
        project = {
          ...project,
          objectiveId: null,
          target: {},
        };
      }
      return {
        ...state,
        project,
        stepId: project.objectiveId ? "action" : "objective",
        navigatorTab: project.objectiveId
          ? state.navigatorTab
          : "objective",
        guardMessage: "",
      };
    }
    case "choose-action": {
      const selectedAction = getSecurityAction(action.actionId);
      if (!selectedAction) return state;
      const candidate = {
        ...clearWorkflow(state.project),
        toolId: selectedAction.toolId,
        actionId: selectedAction.id,
      };
      if (!hasCompatibleAction(candidate)) return state;
      const project = seedActionValues(candidate, selectedAction);
      return {
        ...state,
        project,
        stepId: firstActionFormStep(project, selectedAction),
        guardMessage: "",
      };
    }
    case "choose-workflow": {
      const workflow = getSecurityWorkflow(action.workflowId);
      if (!workflow) return state;
      const project = initializeWorkflowProject(state.project, workflow);
      const hasTarget = workflow.steps.some((step) =>
        getSecurityControls({
          actionId: step.actionId,
          stepId: "target",
          learningLevel: "advanced",
          project,
        }).length > 0);
      return {
        ...state,
        project,
        stepId: hasTarget ? "target" : "configure",
        navigatorTab: "workflow",
        guardMessage: "",
      };
    }
    case "patch-project-value":
      return {
        ...state,
        project: patchSecurityProjectValue(
          state.project,
          action.valuePath,
          action.value,
        ),
        guardMessage: "",
      };
    case "patch-target":
      return {
        ...state,
        project: {
          ...state.project,
          target: { ...state.project.target, ...action.patch },
        },
      };
    case "patch-options":
      return {
        ...state,
        project: {
          ...state.project,
          options: { ...state.project.options, ...action.patch },
        },
      };
    case "patch-output":
      return {
        ...state,
        project: {
          ...state.project,
          output: { ...state.project.output, ...action.patch },
        },
      };
    case "patch-workflow-step": {
      const stepKey = action.stepKey;
      if (!stepKey) return state;
      return {
        ...state,
        project: {
          ...state.project,
          workflow: {
            ...state.project.workflow,
            steps: state.project.workflow.steps.map((step) =>
              step.stepId === stepKey
                ? { ...step, ...action.patch }
                : step),
          },
        },
      };
    }
    case "set-active-workflow-step": {
      const selectedWorkflow = getSecurityWorkflow(state.project.workflowId);
      if (
        !selectedWorkflow?.steps.some(
          (step) => step.id === action.activeStepId,
        )
      ) {
        return state;
      }
      return {
        ...state,
        project: {
          ...state.project,
          workflow: {
            ...state.project.workflow,
            activeStepId: action.activeStepId,
          },
        },
      };
    }
    case "go-to-step":
      if (!SECURITY_MISSION_STEP_ORDER.includes(action.stepId)) return state;
      if (action.allowed === false) {
        return {
          ...state,
          guardMessage: action.reason ?? "Complete the current step first.",
        };
      }
      return {
        ...state,
        stepId: action.stepId,
        guardMessage: "",
      };
    case "next-step": {
      if (action.allowed === false) {
        return {
          ...state,
          guardMessage: action.reason ?? "Complete the current step first.",
        };
      }
      const currentIndex = SECURITY_MISSION_STEP_ORDER.indexOf(state.stepId);
      const nextIndex = Math.min(
        currentIndex + 1,
        SECURITY_MISSION_STEP_ORDER.length - 1,
      );
      return {
        ...state,
        stepId: SECURITY_MISSION_STEP_ORDER[nextIndex],
        guardMessage: "",
      };
    }
    case "previous-step": {
      const currentIndex = SECURITY_MISSION_STEP_ORDER.indexOf(state.stepId);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...state,
        stepId: SECURITY_MISSION_STEP_ORDER[prevIndex],
        guardMessage: "",
      };
    }
    case "set-workspace-tab":
      if (!["configure", "command"].includes(action.tab)) return state;
      return { ...state, workspaceTab: action.tab };
    case "set-copy-status":
      return { ...state, copyStatus: action.status };
    case "set-focused-value-path":
      return { ...state, focusedValuePath: action.valuePath ?? null };
    case "import-project":
      try {
        if (!action.project) {
          throw new Error("Choose a valid project file.");
        }
        assertKnownImportedIdentifiers(action.project);
        return {
          ...state,
          project: migrateSecurityMissionProject(
            sanitizeImportedProject(action.project),
          ),
          importError: "",
          importMessage: "Project imported and normalized.",
          stepId: "review",
        };
      } catch (error) {
        return {
          ...state,
          importError: error instanceof Error
            ? error.message
            : "Choose a valid project file.",
          importMessage: "",
        };
      }
    case "reset-project":
      return createSecurityMissionState();
    default:
      return state;
  }
}
