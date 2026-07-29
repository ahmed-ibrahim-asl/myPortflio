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

export function getStepGuard({
  project,
  stepId,
  validation = { errors: {} },
}) {
  const errors = validation.errors ?? {};
  const errorPaths = Object.keys(errors);
  const fail = (reason, fieldPath = null) => ({
    allowed: false,
    reason,
    fieldPath,
  });
  const allowed = {
    allowed: true,
    reason: "",
    fieldPath: null,
  };

  switch (stepId) {
    case "scope":
      return project?.authorizationContext && project?.platform && project?.shell
        ? allowed
        : fail("Choose an authorization context, platform, and shell.");
    case "objective":
      return project?.objectiveId
        ? allowed
        : fail("Choose an objective.");
    case "tool":
      return project?.toolId
        ? allowed
        : fail("Choose a compatible tool.");
    case "action":
      return project?.mode === "workflow" || project?.actionId
        ? allowed
        : fail("Choose a command action.");
    case "target":
    case "configure":
    case "review":
    case "generate":
      return errorPaths.length === 0
        ? allowed
        : fail(String(errors[errorPaths[0]]), errorPaths[0]);
    default:
      return fail("Unknown Security Mission step.");
  }
}
