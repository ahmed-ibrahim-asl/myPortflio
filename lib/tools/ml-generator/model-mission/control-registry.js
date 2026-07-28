import {
  MODEL_MISSION_STEP_IDS,
  MODEL_MISSION_TASK_IDS,
} from "./catalog.js";
import {
  MISSION_CONTROL_DEFINITIONS,
} from "./control-definitions.js";

export const LEARNING_LEVEL_RANK = Object.freeze({
  guided: 0,
  customize: 1,
  advanced: 2,
});

const REQUIRED_CONTROL_KEYS = Object.freeze([
  "id",
  "taskIds",
  "section",
  "step",
  "level",
  "label",
  "controlType",
  "defaultValue",
  "shortHelp",
]);
const REQUIRED_EXPLANATION_KEYS = Object.freeze([
  "what",
  "why",
  "useWhen",
  "codeEffect",
]);
const TASK_IDS = new Set(MODEL_MISSION_TASK_IDS);
const STEP_IDS = new Set(MODEL_MISSION_STEP_IDS);

function freezeControl(control) {
  return Object.freeze({
    ...control,
    taskIds: Object.freeze([...control.taskIds]),
    explanation: Object.freeze({ ...control.explanation }),
    ...(control.visibleWhen
      ? { visibleWhen: Object.freeze({ ...control.visibleWhen }) }
      : {}),
    ...(control.enabledWhen
      ? { enabledWhen: Object.freeze({ ...control.enabledWhen }) }
      : {}),
  });
}

export const MODEL_MISSION_CONTROLS = Object.freeze(
  MISSION_CONTROL_DEFINITIONS.map(freezeControl),
);

function readProjectPath(project, path) {
  return path.split(".").reduce(
    (value, key) => value && typeof value === "object" ? value[key] : undefined,
    project,
  );
}

export function evaluateRule(rule, project = {}) {
  if (!rule || typeof rule !== "object") return true;
  if (Array.isArray(rule.all)) {
    return rule.all.every((item) => evaluateRule(item, project));
  }
  if (Array.isArray(rule.any)) {
    return rule.any.some((item) => evaluateRule(item, project));
  }
  if (rule.not) return !evaluateRule(rule.not, project);
  if (typeof rule.path !== "string" || rule.path.length === 0) return false;

  const value = readProjectPath(project, rule.path);
  if ("equals" in rule) return value === rule.equals;
  if ("in" in rule && Array.isArray(rule.in)) return rule.in.includes(value);
  if ("includes" in rule) return typeof value === "string" && value.includes(rule.includes);
  if ("truthy" in rule) return Boolean(value) === Boolean(rule.truthy);
  return false;
}

export function getMissionControls({
  taskId,
  stepId,
  learningLevel,
  project,
} = {}) {
  const rank = LEARNING_LEVEL_RANK[learningLevel] ?? 0;
  return MODEL_MISSION_CONTROLS
    .filter((control) =>
      control.taskIds.includes(taskId)
      && control.step === stepId
      && LEARNING_LEVEL_RANK[control.level] <= rank
    )
    .filter((control) =>
      control.visibleWhen
        ? evaluateRule(control.visibleWhen, project)
        : true
    )
    .map((control) => ({
      ...control,
      disabledReason:
        control.enabledWhen
        && !evaluateRule(control.enabledWhen, project)
          ? String(control.enabledWhen.reason ?? "This choice is unavailable for the current project.")
          : "",
    }));
}

export function getMissionControl(controlId) {
  return MODEL_MISSION_CONTROLS.find(({ id }) => id === controlId) ?? null;
}

export function validateMissionControlRegistry() {
  const errors = [];
  const seenKeys = new Set();

  for (const control of MODEL_MISSION_CONTROLS) {
    for (const key of REQUIRED_CONTROL_KEYS) {
      if (control[key] === undefined || control[key] === null || control[key] === "") {
        errors.push(`Control ${control.id ?? "<unknown>"} is missing ${key}.`);
      }
    }
    if (!Array.isArray(control.taskIds) || control.taskIds.length === 0) {
      errors.push(`Control ${control.id ?? "<unknown>"} must target at least one task.`);
      continue;
    }
    if (!(control.level in LEARNING_LEVEL_RANK)) {
      errors.push(`Control ${control.id} has an invalid level: ${control.level}.`);
    }
    if (!STEP_IDS.has(control.step)) {
      errors.push(`Control ${control.id} has an invalid step: ${control.step}.`);
    }
    for (const taskId of control.taskIds) {
      if (!TASK_IDS.has(taskId)) {
        errors.push(`Control ${control.id} references an invalid task: ${taskId}.`);
      }
      const uniqueKey = `${taskId}:${control.section}:${control.id}`;
      if (seenKeys.has(uniqueKey)) {
        errors.push(`Control ${control.id} duplicates ${taskId}:${control.section}.`);
      }
      seenKeys.add(uniqueKey);
    }
    for (const key of REQUIRED_EXPLANATION_KEYS) {
      if (typeof control.explanation?.[key] !== "string" || control.explanation[key].trim() === "") {
        errors.push(`Control ${control.id} is missing explanation.${key}.`);
      }
    }
  }

  return errors;
}
