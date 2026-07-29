import {
  SECURITY_ACTIONS,
  SECURITY_TOOLS,
} from "./catalog.js";
import { SECURITY_OBJECTIVES } from "./objective-registry.js";

function supportsPlatform(action, platform) {
  if (!platform) return true;
  return Boolean(action.executable?.[platform]);
}

export function getCompatibleActions({
  project,
  actions = SECURITY_ACTIONS,
}) {
  if (!project) return [];
  return actions.filter((action) =>
    (!project.toolId || action.toolId === project.toolId)
    && (!project.objectiveId
      || action.objectiveIds?.includes(project.objectiveId))
    && supportsPlatform(action, project.platform),
  );
}

export function getCompatibleTools({
  project,
  tools = SECURITY_TOOLS,
  actions = SECURITY_ACTIONS,
  objectiveId = project?.objectiveId,
}) {
  if (!project) return [];
  const compatibleToolIds = new Set(
    actions
      .filter((action) =>
        (!objectiveId || action.objectiveIds?.includes(objectiveId))
        && supportsPlatform(action, project.platform))
      .map(({ toolId }) => toolId),
  );
  return tools.filter(({ id }) => compatibleToolIds.has(id));
}

export function getCompatibleObjectives({
  project,
  objectives = SECURITY_OBJECTIVES,
  actions = SECURITY_ACTIONS,
}) {
  if (!project) return [];
  const compatibleObjectiveIds = new Set(
    actions
      .filter((action) =>
        (!project.toolId || action.toolId === project.toolId)
        && supportsPlatform(action, project.platform))
      .flatMap(({ objectiveIds = [] }) => objectiveIds),
  );
  return objectives.filter(({ id }) => compatibleObjectiveIds.has(id));
}
