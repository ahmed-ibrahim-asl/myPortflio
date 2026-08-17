import { quoteShellArgument } from "./quoting.js";
import { evaluateSecurityRule } from "./control-registry.js";
import { getSecurityFlagDescription } from "./flag-glossary.js";

function resolveValue(project, valuePath) {
  if (!project || !valuePath) return undefined;
  return valuePath.split('.').reduce((o, k) => (o || {})[k], project);
}

export function compileSecurityCommand(project, action) {
  if (!action.verification || (!["local-help", "official-docs"].includes(action.verification.evidenceTier))) {
    throw new Error("Action is missing public verification evidence.");
  }
  if (action.verification.evidenceTier === "official-docs" && (!Array.isArray(action.verification.sourceUrls) || action.verification.sourceUrls.length === 0)) {
    throw new Error("Action with official-docs evidence is missing source URLs.");
  }

  const shell = project.shell || "bash";
  const executable = action.executable[project.platform] || action.executable.linux;
  const tokens = [
    { type: "executable", value: executable, sourcePath: null },
  ];
  const placeholders = [];
  let commandParts = [executable];

  if (action.fixedTokens) {
    for (const ft of action.fixedTokens) {
      if (ft.type === "flag") {
        commandParts.push(ft.value);
        tokens.push({
          type: "flag",
          value: ft.value,
          sourcePath: null,
          flagDescription: getSecurityFlagDescription(action.toolId, ft.value),
        });
      }
    }
  }

  if (action.argumentRules) {
    for (const rule of action.argumentRules) {
      if (rule.when && !evaluateSecurityRule(rule.when, project)) continue;

      const value = resolveValue(project, rule.valuePath);
      
      if (value === undefined || value === null || value === "") {
        if (rule.omitWhenEmpty) continue;
        placeholders.push(rule.valuePath);
        tokens.push({
          type: "placeholder",
          value: `<${rule.valuePath}>`,
          sourcePath: rule.valuePath,
        });
      }

      if (rule.positional) {
        if (value) {
          const quoted = quoteShellArgument(value, shell);
          commandParts.push(quoted);
          tokens.push({
            type: "positional",
            value,
            quoted,
            sourcePath: rule.valuePath,
          });
        }
      } else if (rule.flag) {
        commandParts.push(rule.flag);
        tokens.push({
          type: "flag",
          value: rule.flag,
          sourcePath: rule.valuePath,
          flagDescription: getSecurityFlagDescription(action.toolId, rule.flag),
        });
        if (value !== undefined && value !== null && value !== "" && typeof value !== "boolean") {
          const quoted = quoteShellArgument(value, shell);
          commandParts.push(quoted);
          tokens.push({
            type: "value",
            value,
            quoted,
            sourcePath: rule.valuePath,
          });
        }
      }
    }
  }

  const command = commandParts.join(" ");
  const formatted = commandParts.join(" \\\n  ");

  return {
    actionId: action.id,
    toolId: action.toolId,
    shell,
    command,
    formatted,
    tokens,
    summary: `Compiled ${action.title || action.id}`,
    warnings: [],
    placeholders,
    evidenceId: action.verification.evidenceId,
    sourceUrls: action.verification.sourceUrls || [],
  };
}
