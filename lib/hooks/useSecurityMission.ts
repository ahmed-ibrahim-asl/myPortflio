"use client";

import { useReducer, useMemo, useState, useCallback } from "react";
import {
  createSecurityMissionState,
  securityMissionReducer,
} from "../tools/security-mission/state.js";
import {
  getSecurityObjective,
  getSecurityTool,
  getSecurityAction,
} from "../tools/security-mission/catalog.js";
import { getSecurityWorkflow } from "../tools/security-mission/workflow-registry.js";
import { getSecurityControls } from "../tools/security-mission/control-registry.js";
import { validateSecurityProject } from "../tools/security-mission/validation.js";
import { compileSecurityCommand } from "../tools/security-mission/compiler.js";
import { getSecurityRecommendation } from "../tools/security-mission/recommendations.js";
import {
  buildSecurityProjectExport,
  buildWorkflowRunbook,
} from "../tools/security-mission/exports.js";

export function useSecurityMission() {
  const [state, dispatch] = useReducer(
    securityMissionReducer,
    null,
    createSecurityMissionState
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const objective = useMemo(
    () => getSecurityObjective(state.project.objectiveId),
    [state.project.objectiveId]
  );

  const tool = useMemo(
    () => (state.project.toolId ? getSecurityTool(state.project.toolId) : null),
    [state.project.toolId]
  );

  const action = useMemo(
    () => (state.project.actionId ? getSecurityAction(state.project.actionId) : null),
    [state.project.actionId]
  );

  const workflow = useMemo(
    () => (state.project.workflowId ? getSecurityWorkflow(state.project.workflowId) : null),
    [state.project.workflowId]
  );

  const controls = useMemo(() => {
    if (!action) return [];
    return getSecurityControls({
      actionId: action.id,
      stepId: state.stepId,
      learningLevel: state.project.learningLevel,
      project: state.project,
    });
  }, [action, state.stepId, state.project.learningLevel, state.project]);

  const validation = useMemo(() => {
    return validateSecurityProject(state.project, action);
  }, [state.project, action]);

  const generatedCommand = useMemo(() => {
    if (!action) return null;
    return compileSecurityCommand(state.project, action);
  }, [state.project, action]);

  const compiledWorkflowSteps = useMemo(() => {
    if (!workflow || state.project.mode !== "workflow") return [];
    return state.project.workflow.steps.map((step: any) => {
      const stepAction = getSecurityAction(step.actionId);
      if (!stepAction) return null;
      const stepProject = {
        ...state.project,
        toolId: step.toolId,
        actionId: step.actionId,
        target: step.target,
        options: step.options,
      };
      return compileSecurityCommand(stepProject, stepAction);
    }).filter(Boolean);
  }, [workflow, state.project]);

  const recommendations = useMemo(() => {
    return getSecurityRecommendation({
      objectiveId: state.project.objectiveId,
      actionId: state.project.actionId,
    });
  }, [state.project.objectiveId, state.project.actionId]);

  const copyCommand = useCallback((text?: string) => {
    const toCopy = text ?? generatedCommand?.command;
    if (!toCopy) return;
    navigator.clipboard
      .writeText(toCopy)
      .then(() => {
        setCopyStatus("copied");
        setTimeout(() => setCopyStatus("idle"), 2000);
      })
      .catch(() => {
        setCopyStatus("error");
        setTimeout(() => setCopyStatus("idle"), 2000);
      });
  }, [generatedCommand]);

  const downloadProject = useCallback(() => {
    const exportJson = buildSecurityProjectExport(state.project);
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-mission-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.project]);

  const downloadRunbook = useCallback(() => {
    if (!generatedCommand && compiledWorkflowSteps.length === 0) return;
    const runbookMd = buildWorkflowRunbook(
      state.project,
      workflow,
      compiledWorkflowSteps.length > 0 ? compiledWorkflowSteps : [generatedCommand]
    );
    const blob = new Blob([runbookMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-mission-runbook-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.project, workflow, compiledWorkflowSteps, generatedCommand]);

  const importProject = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      dispatch({ type: "import-project", project: parsed });
      return true;
    } catch {
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
    controls,
    validation,
    generatedCommand,
    compiledWorkflowSteps,
    recommendations,
    copyStatus,
    copyCommand,
    downloadProject,
    downloadRunbook,
    importProject,
  };
}
