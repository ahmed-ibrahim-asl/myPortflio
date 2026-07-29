import { useState, useCallback, useRef } from "react";
import { createSecurityMissionBuilder } from "./builder.js";

export function useSecurityMissionBuilder(initialState) {
  const builderRef = useRef(null);
  if (!builderRef.current) {
    builderRef.current = createSecurityMissionBuilder(initialState);
  }

  const [context, setContext] = useState(() => builderRef.current.getState());

  const dispatch = useCallback((action) => {
    const newState = builderRef.current.dispatch(action);
    setContext(newState);
  }, []);

  const boundActions = {
    chooseMode: (mode) => dispatch({ type: "choose-mode", mode }),
    setAuthorizationContext: (context) => dispatch({ type: "set-authorization-context", context }),
    setLearningLevel: (level) => dispatch({ type: "set-learning-level", level }),
    setPlatform: (platform) => dispatch({ type: "set-platform", platform }),
    setShell: (shell) => dispatch({ type: "set-shell", shell }),
    chooseObjective: (objectiveId) => dispatch({ type: "choose-objective", objectiveId }),
    chooseTool: (toolId) => dispatch({ type: "choose-tool", toolId }),
    chooseAction: (actionId) => dispatch({ type: "choose-action", actionId }),
    chooseWorkflow: (workflowId) => dispatch({ type: "choose-workflow", workflowId }),
    patchTarget: (patch) => dispatch({ type: "patch-target", patch }),
    patchOptions: (patch) => dispatch({ type: "patch-options", patch }),
    patchOutput: (patch) => dispatch({ type: "patch-output", patch }),
    patchWorkflowStep: (stepKey, patch) => dispatch({ type: "patch-workflow-step", stepKey, patch }),
    goToStep: (stepId) => dispatch({ type: "go-to-step", stepId }),
    nextStep: () => dispatch({ type: "next-step" }),
    previousStep: () => dispatch({ type: "previous-step" }),
    setWorkspaceTab: (tab) => dispatch({ type: "set-workspace-tab", tab }),
    setCopyStatus: (status) => dispatch({ type: "set-copy-status", status }),
    importProject: (project) => dispatch({ type: "import-project", project }),
    resetProject: () => dispatch({ type: "reset-project" }),
  };

  return {
    ...context,
    ...boundActions,
    dispatch
  };
}
