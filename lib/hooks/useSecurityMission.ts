"use client";

import {
  useCallback,
  useMemo,
  useReducer,
} from "react";

import {
  createSecurityMissionState,
  securityMissionReducer,
} from "../tools/security-mission/state.js";
import {
  getSecurityAction,
  getSecurityObjective,
  getSecurityTool,
} from "../tools/security-mission/catalog.js";
import {
  getCompatibleActions,
  getCompatibleObjectives,
  getCompatibleTools,
  getStepGuard,
} from "../tools/security-mission/selectors.js";
import {
  getSecurityWorkflow,
  resolveWorkflowBindings,
} from "../tools/security-mission/workflow-registry.js";
import {
  getSecurityControls,
} from "../tools/security-mission/control-registry.js";
import {
  validateSecurityProject,
} from "../tools/security-mission/validation.js";
import {
  compileSecurityCommand,
} from "../tools/security-mission/compiler.js";
import {
  getSecurityRecommendation,
} from "../tools/security-mission/recommendations.js";
import {
  buildSecurityProjectExport,
  buildWorkflowRunbook,
} from "../tools/security-mission/exports.js";

function downloadText(
  text: string,
  type: string,
  filename: string,
): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function controlsForWorkflow(
  workflow: any,
  stepId: string,
  project: any,
): any[] {
  if (!workflow || !["target", "configure"].includes(stepId)) return [];
  const activeStep = workflow.steps.find(
    (step: any) => step.id === project.workflow?.activeStepId,
  ) ?? workflow.steps[0];
  if (!activeStep) return [];
  return getSecurityControls({
    actionId: activeStep.actionId,
    stepId,
    learningLevel: project.learningLevel,
    project,
  });
}

export function useSecurityMission() {
  const [state, dispatch] = useReducer(
    securityMissionReducer,
    null,
    createSecurityMissionState,
  );

  const objective = useMemo(
    () => state.project.objectiveId
      ? getSecurityObjective(state.project.objectiveId)
      : null,
    [state.project.objectiveId],
  );
  const tool = useMemo(
    () => state.project.toolId
      ? getSecurityTool(state.project.toolId)
      : null,
    [state.project.toolId],
  );
  const action = useMemo(
    () => state.project.actionId
      ? getSecurityAction(state.project.actionId)
      : null,
    [state.project.actionId],
  );
  const workflow = useMemo(
    () => state.project.workflowId
      ? getSecurityWorkflow(state.project.workflowId)
      : null,
    [state.project.workflowId],
  );
  const activeWorkflowAction = useMemo(() => {
    if (!workflow) return null;
    const activeStep = workflow.steps.find(
      (step: any) => step.id === state.project.workflow?.activeStepId,
    ) ?? workflow.steps[0];
    return activeStep ? getSecurityAction(activeStep.actionId) : null;
  }, [state.project.workflow?.activeStepId, workflow]);
  const effectiveAction = action ?? activeWorkflowAction;

  const compatibleObjectives = useMemo(
    () => getCompatibleObjectives({ project: state.project }),
    [state.project],
  );
  const compatibleTools = useMemo(
    () => getCompatibleTools({
      project: state.project,
      objectiveId: state.navigatorTab === "tool"
        && state.stepId === "objective"
        ? null
        : state.project.objectiveId,
    }),
    [state.navigatorTab, state.project, state.stepId],
  );
  const compatibleActions = useMemo(
    () => getCompatibleActions({ project: state.project }),
    [state.project],
  );

  const controls = useMemo(() => {
    if (state.project.mode === "workflow") {
      return controlsForWorkflow(workflow, state.stepId, state.project);
    }
    if (!action) return [];
    return getSecurityControls({
      actionId: action.id,
      stepId: state.stepId,
      learningLevel: state.project.learningLevel,
      project: state.project,
    });
  }, [action, state.project, state.stepId, workflow]);

  const allActionControls = useMemo(() => {
    if (!effectiveAction) return [];
    return [
      ...getSecurityControls({
        actionId: effectiveAction.id,
        stepId: "target",
        learningLevel: "advanced",
        project: state.project,
      }),
      ...getSecurityControls({
        actionId: effectiveAction.id,
        stepId: "configure",
        learningLevel: "advanced",
        project: state.project,
      }),
    ];
  }, [effectiveAction, state.project]);

  const validation = useMemo(
    () => validateSecurityProject(
      state.project,
      effectiveAction,
      allActionControls,
    ) as { errors: Record<string, string>; warnings: string[] },
    [allActionControls, effectiveAction, state.project],
  );
  const stepValidation = useMemo(
    () => validateSecurityProject(
      state.project,
      effectiveAction,
      ["target", "configure"].includes(state.stepId)
        ? controls
        : allActionControls,
    ) as { errors: Record<string, string>; warnings: string[] },
    [
      allActionControls,
      controls,
      effectiveAction,
      state.project,
      state.stepId,
    ],
  );
  const stepGuard = useMemo(
    () => getStepGuard({
      project: state.project,
      stepId: state.stepId,
      validation: stepValidation,
    }),
    [state.project, state.stepId, stepValidation],
  );

  const commandResult = useMemo(() => {
    if (!action) {
      return { command: null, error: "" };
    }
    try {
      return {
        command: compileSecurityCommand(state.project, action),
        error: "",
      };
    } catch (error) {
      return {
        command: null,
        error: error instanceof Error
          ? error.message
          : "Command generation failed.",
      };
    }
  }, [action, state.project]);

  const compiledWorkflowSteps = useMemo(() => {
    if (!workflow || state.project.mode !== "workflow") return [];
    const resolved = resolveWorkflowBindings(state.project, workflow);
    return resolved.steps
      .map((step: any, index: number) => {
        const stepAction = getSecurityAction(step.actionId);
        if (!stepAction) return null;
        const stepProject = {
          ...state.project,
          toolId: step.toolId,
          actionId: step.actionId,
          target: step.target,
          options: step.options,
        };
        const stepControls = [
          ...getSecurityControls({
            actionId: stepAction.id,
            stepId: "target",
            learningLevel: "advanced",
            project: stepProject,
          }),
          ...getSecurityControls({
            actionId: stepAction.id,
            stepId: "configure",
            learningLevel: "advanced",
            project: stepProject,
          }),
        ];
        const stepValidation = validateSecurityProject(
          stepProject,
          stepAction,
          stepControls,
        ) as { errors: Record<string, string>; warnings: string[] };
        const compiled = compileSecurityCommand(stepProject, stepAction);
        return {
          ...compiled,
          action: stepAction,
          hostRole: workflow.steps[index]?.hostRole ?? "operator",
          title: workflow.steps[index]?.title ?? stepAction.title,
          purpose: workflow.steps[index]?.purpose ?? "",
          evidenceHints: workflow.steps[index]?.evidenceHints ?? [],
          validation: stepValidation,
          ready: Object.keys(stepValidation.errors).length === 0,
        };
      })
      .filter(Boolean);
  }, [state.project, workflow]);

  const recommendations = useMemo(
    () => getSecurityRecommendation({
      objectiveId: state.project.objectiveId,
      actionId: state.project.actionId,
    }),
    [state.project.actionId, state.project.objectiveId],
  );

  const copyCommand = useCallback(async (text?: string) => {
    const value = text ?? commandResult.command?.command;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      dispatch({ type: "set-copy-status", status: "copied" });
    } catch {
      dispatch({ type: "set-copy-status", status: "failed" });
    }
    window.setTimeout(() => {
      dispatch({ type: "set-copy-status", status: "idle" });
    }, 1800);
  }, [commandResult.command]);

  const downloadProject = useCallback(() => {
    downloadText(
      buildSecurityProjectExport(state.project),
      "application/json;charset=utf-8",
      "security-mission-project.json",
    );
  }, [state.project]);

  const downloadRunbook = useCallback(() => {
    const compiled = compiledWorkflowSteps.length > 0
      ? compiledWorkflowSteps
      : commandResult.command
        ? [commandResult.command]
        : [];
    if (compiled.length === 0) return;
    if (compiled.some((step: any) => step.ready === false)) return;
    downloadText(
      buildWorkflowRunbook(state.project, workflow, compiled),
      "text/markdown;charset=utf-8",
      "security-mission-runbook.md",
    );
  }, [
    commandResult.command,
    compiledWorkflowSteps,
    state.project,
    workflow,
  ]);

  const importProject = useCallback((jsonString: string) => {
    try {
      dispatch({
        type: "import-project",
        project: JSON.parse(jsonString),
      });
      return true;
    } catch {
      dispatch({ type: "import-project", project: null });
      return false;
    }
  }, []);

  return {
    state,
    dispatch,
    objective,
    tool,
    action,
    workflow,
    compatibleObjectives,
    compatibleTools,
    compatibleActions,
    controls,
    allActionControls,
    validation,
    stepValidation,
    stepGuard,
    generatedCommand: commandResult.command,
    generationError: commandResult.error,
    compiledWorkflowSteps,
    recommendations,
    copyStatus: state.copyStatus,
    copyCommand,
    downloadProject,
    downloadRunbook,
    importProject,
  };
}
