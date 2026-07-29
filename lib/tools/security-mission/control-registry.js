import {
  SECURITY_ACTIONS,
  SECURITY_CONTROLS,
} from "./catalog.js";

export const SECURITY_LEARNING_LEVEL_RANK = Object.freeze({
  guided: 0,
  customize: 1,
  advanced: 2,
});

const CONTROL_DETAILS = Object.freeze({
  "options.community": ["SNMP community", "Community string", "placeholder-secret", "guided", ""],
  "options.count": ["Request count", "Bounded request count", "number", "customize", 4],
  "options.dynamicPort": ["Dynamic port", "Dynamic forwarding port", "port", "customize", 1080],
  "options.format": ["Output format", "Artifact format", "text", "customize", ""],
  "options.hashFile": ["Hash file", "Relative hash input path", "output-path", "guided", "inputs/hashes.txt"],
  "options.hashType": ["Hash type", "Hash mode identifier", "text", "customize", ""],
  "options.identityFile": ["Identity file", "Relative private-key path", "output-path", "customize", "keys/lab-key"],
  "options.interface": ["Network interface", "Capture or wireless interface", "text", "guided", "eth0"],
  "options.lport": ["Listening port", "Local listener port", "port", "guided", 4444],
  "options.ntlmHash": ["NTLM hash", "NTLM credential material", "placeholder-secret", "advanced", ""],
  "options.outputBinary": ["Output binary", "Relative compiled binary path", "output-path", "customize", "build/lab-binary"],
  "options.outputFile": ["Output file", "Relative evidence path", "output-path", "customize", "evidence/output.txt"],
  "options.password": ["Password", "Laboratory password", "placeholder-secret", "guided", ""],
  "options.patternLength": ["Pattern length", "Cyclic pattern length", "number", "customize", 300],
  "options.patternValue": ["Pattern value", "Crash pattern value", "text", "customize", ""],
  "options.payload": ["Payload", "Verified payload identifier", "text", "advanced", ""],
  "options.port": ["Service port", "Destination service port", "port", "guided", 80],
  "options.ports": ["Ports", "Port or port range", "text", "customize", "80,443"],
  "options.searchTerm": ["Search term", "Exploit or service search term", "text", "guided", ""],
  "options.tunnelSpec": ["Tunnel specification", "Local or remote forwarding specification", "text", "customize", ""],
  "options.username": ["Username", "Laboratory account name", "text", "guided", ""],
  "options.version": ["Version", "Target software version", "text", "customize", ""],
  "options.wordlist": ["Wordlist", "Relative wordlist path", "output-path", "guided", "wordlists/lab.txt"],
  "target.binaryPath": ["Binary path", "Relative target binary path", "output-path", "guided", "bin/target"],
  "target.bssid": ["Access point BSSID", "Wireless access point address", "bssid", "guided", "00:11:22:33:44:55"],
  "target.channel": ["Wireless channel", "Access point channel", "number", "guided", 6],
  "target.domain": ["Target domain", "DNS or Active Directory domain", "domain", "guided", "target.lab"],
  "target.host": ["Target host", "Destination IP address or hostname", "host", "guided", "10.10.10.10"],
  "target.lhost": ["Local host", "Callback or listener address", "host", "guided", "10.10.10.5"],
  "target.network": ["Target network", "Authorized IPv4 CIDR range", "cidr", "guided", "10.10.10.0/24"],
  "target.port": ["Target port", "Destination port", "port", "guided", 80],
  "target.scriptPath": ["Script path", "Relative script path", "output-path", "guided", "scripts/lab.py"],
  "target.sourceFile": ["Source file", "Relative source path", "output-path", "guided", "src/lab.c"],
  "target.url": ["Target URL", "Authorized HTTP or HTTPS URL", "url", "guided", "https://target.lab"],
});

function createExplanation(label, technicalTerm, valuePath) {
  return {
    what: `${label} used by the selected command action.`,
    why: `The command needs this ${technicalTerm.toLowerCase()} to produce a complete invocation.`,
    useWhen: "Use the value assigned to the authorized laboratory target.",
    avoidWhen: "Leave it unchanged when the selected action does not consume it.",
    tradeoff: "Broader or faster settings can increase traffic and evidence volume.",
    codeEffect: `Supplies the compiler value at ${valuePath}.`,
  };
}

export const SECURITY_CONTROL_BLUEPRINTS = Object.freeze(
  Object.entries(CONTROL_DETAILS).map(
    ([valuePath, [label, technicalTerm, controlType, level, defaultValue]]) =>
      Object.freeze({
        id: `security-${valuePath.replaceAll(".", "-")}`,
        actionIds: [],
        step: valuePath.startsWith("target.") ? "target" : "configure",
        section: valuePath.startsWith("target.")
          ? "Authorized target"
          : "Command options",
        valuePath,
        configKey: valuePath,
        level,
        label,
        technicalTerm,
        controlType,
        defaultValue,
        required: false,
        options: [],
        shortHelp: technicalTerm,
        explanation: createExplanation(label, technicalTerm, valuePath),
        validation: {},
      }),
  ),
);

export function getAllSecurityControls({
  actions = SECURITY_ACTIONS,
  controls = SECURITY_CONTROLS,
} = {}) {
  const explicitByPath = new Map(
    controls.map((control) => [
      control.valuePath ?? control.configKey,
      control,
    ]),
  );

  return SECURITY_CONTROL_BLUEPRINTS.map((blueprint) => {
    const explicit = explicitByPath.get(blueprint.valuePath);
    return {
      ...blueprint,
      ...explicit,
      id: blueprint.id,
      actionIds: actions
        .filter((action) =>
          action.argumentRules?.some(
            ({ valuePath }) => valuePath === blueprint.valuePath,
          ))
        .map(({ id }) => id),
      valuePath: blueprint.valuePath,
      configKey: blueprint.valuePath,
      step: blueprint.step,
      controlType: blueprint.controlType,
      options: explicit?.options ?? blueprint.options,
    };
  });
}

export function getSecurityControls({
  actionId,
  stepId,
  learningLevel,
  project,
  controls = undefined,
}) {
  if (!actionId || !stepId || !learningLevel) return [];
  const rank = SECURITY_LEARNING_LEVEL_RANK[learningLevel] ?? 0;
  const sourceControls = controls ?? getAllSecurityControls();
  const action = SECURITY_ACTIONS.find(({ id }) => id === actionId);
  return sourceControls
    .filter((control) => {
      const valuePath = control.valuePath ?? control.configKey;
      const rule = action?.argumentRules?.find(
        (candidate) => candidate.valuePath === valuePath,
      );
      const required = Boolean(rule && rule.omitWhenEmpty !== true);
      const effectiveLevel = required ? "guided" : control.level;
      const controlRank = SECURITY_LEARNING_LEVEL_RANK[effectiveLevel] ?? 0;
      if (controlRank > rank) return false;
      if (control.step !== stepId) return false;
      if (!control.actionIds.includes(actionId)) return false;
      return true;
    })
    .map((control) => {
      const valuePath = control.valuePath ?? control.configKey;
      const rule = action?.argumentRules?.find(
        (candidate) => candidate.valuePath === valuePath,
      );
      return {
        ...control,
        valuePath,
        configKey: valuePath,
        required: Boolean(rule && rule.omitWhenEmpty !== true),
      };
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
