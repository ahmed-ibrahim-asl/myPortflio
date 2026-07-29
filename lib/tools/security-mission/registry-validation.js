const REQUIRED_TOOL_FIELDS = Object.freeze([
  "id",
  "name",
  "aliases",
  "description",
  "categories",
  "platforms",
  "shells",
  "interface",
  "executableNames",
  "installNotes",
  "privilege",
]);

function findDuplicateIds(records, label) {
  const errors = [];
  const seen = new Set();
  for (const record of records) {
    if (!record?.id) {
      errors.push(`${label} is missing an id.`);
      continue;
    }
    if (seen.has(record.id)) {
      errors.push(`Duplicate ${label} id: ${record.id}`);
    }
    seen.add(record.id);
  }
  return errors;
}

export function validateSecurityRegistry({
  objectives = [],
  tools = [],
  actions = [],
  controls = [],
  workflows = [],
}) {
  const errors = [
    ...findDuplicateIds(objectives, "objective"),
    ...findDuplicateIds(tools, "tool"),
    ...findDuplicateIds(actions, "action"),
    ...findDuplicateIds(controls, "control"),
    ...findDuplicateIds(workflows, "workflow"),
  ];
  const objectiveIds = new Set(objectives.map(({ id }) => id));
  const toolIds = new Set(tools.map(({ id }) => id));
  const actionIds = new Set(actions.map(({ id }) => id));

  for (const tool of tools) {
    for (const field of REQUIRED_TOOL_FIELDS) {
      const value = tool[field];
      if (
        value === undefined
        || value === null
        || (typeof value === "string" && value.length === 0)
        || (Array.isArray(value) && value.length === 0
          && !["aliases", "installNotes"].includes(field))
      ) {
        errors.push(`Tool ${tool.id ?? "(unknown)"} has invalid ${field}.`);
      }
    }
  }

  for (const action of actions) {
    if (!toolIds.has(action.toolId)) {
      errors.push(`Action ${action.id} references unknown tool ${action.toolId}.`);
    }
    for (const objectiveId of action.objectiveIds ?? []) {
      if (!objectiveIds.has(objectiveId)) {
        errors.push(
          `Action ${action.id} references unknown objective ${objectiveId}.`,
        );
      }
    }
  }

  for (const control of controls) {
    for (const actionId of control.actionIds ?? []) {
      if (!actionIds.has(actionId)) {
        errors.push(
          `Control ${control.id} references unknown action ${actionId}.`,
        );
      }
    }
  }

  for (const workflow of workflows) {
    for (const step of workflow.steps ?? []) {
      if (!toolIds.has(step.toolId) || !actionIds.has(step.actionId)) {
        errors.push(
          `Workflow ${workflow.id} has an unknown tool or action in ${step.id}.`,
        );
      }
    }
  }

  return errors;
}
