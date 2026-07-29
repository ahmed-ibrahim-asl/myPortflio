import { SECURITY_CONTROLS } from "./catalog.js";

export const SECURITY_LEARNING_LEVEL_RANK = Object.freeze({
  guided: 0,
  customize: 1,
  advanced: 2,
});

export function getSecurityControls({ actionId, stepId, learningLevel, project, controls = SECURITY_CONTROLS }) {
  if (!actionId || !stepId || !learningLevel) return [];
  const rank = SECURITY_LEARNING_LEVEL_RANK[learningLevel] ?? 0;
  return controls
    .filter((control) => {
      const controlRank = SECURITY_LEARNING_LEVEL_RANK[control.level] ?? 0;
      if (controlRank > rank) return false;
      if (control.step !== stepId) return false;
      if (!control.actionIds.includes(actionId)) return false;
      return true;
    });
}

function evaluateRuleCondition(condition, project) {
  if (!condition) return false;
  
  if (condition.truthy !== undefined) {
    const value = getNestedValue(project, condition.path);
    return Boolean(value) === condition.truthy;
  }
  if (condition.equals !== undefined) {
    const value = getNestedValue(project, condition.path);
    return value === condition.equals;
  }
  if (condition.includes !== undefined) {
    const value = getNestedValue(project, condition.path);
    return Array.isArray(value) && value.includes(condition.includes);
  }
  return false;
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

export function evaluateSecurityRule(rule, project) {
  if (!rule) return true;
  if (rule.all) {
    return rule.all.every((cond) => evaluateRuleCondition(cond, project));
  }
  if (rule.any) {
    return rule.any.some((cond) => evaluateRuleCondition(cond, project));
  }
  if (rule.not) {
    if (rule.not.path) {
      return !evaluateRuleCondition(rule.not, project);
    }
    return !evaluateSecurityRule(rule.not, project);
  }
  return evaluateRuleCondition(rule, project);
}

export function validateSecurityControlRegistry(controls) {
  const errors = [];
  const expectedKeys = [
    "id", "actionIds", "step", "section", "configKey", "level", 
    "label", "technicalTerm", "controlType", "defaultValue", 
    "shortHelp", "explanation", "validation"
  ];
  const explanationKeys = ["what", "why", "useWhen", "avoidWhen", "tradeoff", "codeEffect"];

  const idByAction = new Map();

  for (let i = 0; i < controls.length; i++) {
    const control = controls[i];
    const prefix = `Control at index ${i}`;

    for (const key of expectedKeys) {
      if (control[key] === undefined) {
        errors.push(`${prefix} is missing key: ${key}`);
      }
    }

    if (control.level && SECURITY_LEARNING_LEVEL_RANK[control.level] === undefined) {
      errors.push(`${prefix} has invalid level: ${control.level}`);
    }

    if (control.step && !["target", "configure"].includes(control.step)) {
      errors.push(`${prefix} has invalid step: ${control.step}`);
    }

    if (control.explanation) {
      for (const key of explanationKeys) {
        if (!control.explanation[key]) {
          errors.push(`${prefix} explanation is missing key: ${key}`);
        }
      }
    }

    for (const actionId of control.actionIds || []) {
      const mapKey = `${actionId}:${control.id}`;
      if (idByAction.has(mapKey)) {
        errors.push(`Duplicate control ID '${control.id}' for action '${actionId}'`);
      }
      idByAction.set(mapKey, true);
    }
  }

  return errors;
}
