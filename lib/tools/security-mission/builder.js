import { securityMissionReducer, createSecurityMissionState } from "./state.js";
import { SECURITY_TOOLS, SECURITY_ACTIONS, getSecurityAction } from "./catalog.js";
import { getSecurityControls } from "./control-registry.js";
import { compileSecurityCommand } from "./compiler.js";
import { getSecurityRecommendation } from "./recommendations.js";

export function createSecurityMissionBuilder(initialState = createSecurityMissionState()) {
  let state = initialState;

  function dispatch(action) {
    state = securityMissionReducer(state, action);
    return getState();
  }

  function getState() {
    const project = state.project;
    
    // Filter tools based on objective
    const tools = project.objectiveId 
      ? SECURITY_TOOLS.filter(t => 
          SECURITY_ACTIONS.some(a => a.toolId === t.id && a.objectiveIds.includes(project.objectiveId))
        )
      : [];

    // Filter actions based on selected tool and objective
    const actions = project.toolId
      ? SECURITY_ACTIONS.filter(a => a.toolId === project.toolId && a.objectiveIds.includes(project.objectiveId))
      : [];

    // Available controls
    const controls = getSecurityControls({ 
      actionId: project.actionId, 
      stepId: state.stepId, 
      learningLevel: project.learningLevel, 
      project 
    });

    // Command generation
    let command = null;
    let warnings = [];
    let recommendation = null;

    if (project.objectiveId) {
      recommendation = getSecurityRecommendation({ objectiveId: project.objectiveId, actionId: project.actionId, project });
    }

    if (project.actionId) {
      const actionDef = getSecurityAction(project.actionId);
      if (actionDef) {
        command = compileSecurityCommand(project, actionDef);
      }
    }

    return {
      state,
      project,
      tools,
      actions,
      controls,
      command,
      warnings,
      recommendation
    };
  }

  return {
    dispatch,
    getState
  };
}
