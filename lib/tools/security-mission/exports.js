import { sanitizeProjectForExport } from "./sensitive-values.js";

const SECRET_KEY_PATTERN =
  /password|passwd|token|secret|privatekey|ntlmhash|hash|cookie/i;

function secretValues(project) {
  const values = [];
  function visit(value, key = "") {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, key));
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) =>
        visit(childValue, childKey));
      return;
    }
    if (
      SECRET_KEY_PATTERN.test(key)
      && typeof value === "string"
      && value.trim()
      && value !== "<REDACTED>"
    ) {
      values.push(value);
    }
  }
  visit(project);
  return [...new Set(values)].sort((a, b) => b.length - a.length);
}

function redactText(text, project) {
  return secretValues(project).reduce(
    (safeText, secret) => safeText.replaceAll(secret, "<REDACTED>"),
    String(text ?? ""),
  );
}

function markdownList(items, fallback) {
  const values = Array.isArray(items) && items.length > 0 ? items : [fallback];
  return values.map((item) => `- ${item}`).join("\n");
}

export function buildSecurityProjectExport(project) {
  const sanitized = sanitizeProjectForExport(project);
  return JSON.stringify(sanitized, null, 2);
}

export function buildWorkflowRunbook(project, workflow, compiledSteps) {
  const title = workflow?.title ?? "Security Mission Command Runbook";
  const prerequisites = markdownList(
    workflow?.prerequisites,
    "Confirm the selected authorization context before running commands.",
  );
  const steps = compiledSteps.map((step, index) => {
    const evidence = markdownList(
      step.evidenceHints,
      "Record the command output and execution time.",
    );
    const warnings = step.warnings?.length
      ? `\n\nWarnings:\n${markdownList(step.warnings, "")}`
      : "";
    const command = redactText(step.command, project);
    return [
      `## ${index + 1}. ${step.title ?? `Step ${index + 1}`}`,
      "",
      `**Host role:** ${step.hostRole ?? "operator"}`,
      "",
      step.purpose ?? "Run the verified command and record the result.",
      "",
      `\`\`\`${project.shell ?? "text"}`,
      command,
      "```",
      warnings,
      "",
      "Evidence:",
      evidence,
    ].filter((line) => line !== "").join("\n");
  }).join("\n\n");

  return [
    `# ${title}`,
    "",
    "> Generated locally. Review every command before use.",
    "",
    `- Authorization context: ${project.authorizationContext ?? "not selected"}`,
    `- Objective: ${project.objectiveId ?? "not selected"}`,
    `- Platform: ${project.platform ?? "not selected"}`,
    `- Shell: ${project.shell ?? "not selected"}`,
    "",
    "## Prerequisites",
    "",
    prerequisites,
    "",
    steps,
    "",
  ].join("\n");
}

export function buildPlainTextCommandList(compiledSteps) {
  if (!compiledSteps.length) return "";
  return `${compiledSteps.map((step) => step.command).join("\n")}\n`;
}

function scriptPreamble(shell) {
  if (shell === "bash") {
    return ["#!/usr/bin/env bash", "set -euo pipefail"];
  }
  if (shell === "powershell") {
    return [
      "#Requires -Version 5.1",
      '$ErrorActionPreference = "Stop"',
    ];
  }
  if (shell === "cmd") {
    return ["@echo off", "setlocal"];
  }
  throw new Error(`Unsupported script shell: ${shell}`);
}

function scriptComment(shell, text) {
  return shell === "cmd" ? `REM ${text}` : `# ${text}`;
}

export function buildLowRiskScript(project, workflow, compiledSteps) {
  const isAllLowRisk = compiledSteps.length > 0
    && workflow?.risk !== "high"
    && compiledSteps.every((step) => step.action?.risk === "low");
  if (!isAllLowRisk) {
    throw new Error("High risk workflows cannot be exported as scripts");
  }

  const shell = project.shell ?? "bash";
  const lines = [
    ...scriptPreamble(shell),
    "",
    scriptComment(
      shell,
      `Authorization context: ${project.authorizationContext ?? "not selected"}`,
    ),
    scriptComment(shell, `Workflow: ${workflow?.title ?? "Security Mission"}`),
    ...((workflow?.prerequisites ?? []).map((item) =>
      scriptComment(shell, `Prerequisite: ${item}`))),
    "",
  ];

  let previousRole = null;
  compiledSteps.forEach((step, index) => {
    if (previousRole && previousRole !== step.hostRole) {
      lines.push(
        "",
        scriptComment(
          shell,
          `Continue on host role: ${step.hostRole ?? "operator"}`,
        ),
      );
    }
    lines.push(
      scriptComment(
        shell,
        `${index + 1}. ${step.title ?? `Step ${index + 1}`} (${step.hostRole ?? "operator"})`,
      ),
      redactText(step.command, project),
      "",
    );
    previousRole = step.hostRole;
  });

  return `${lines.join("\n").trimEnd()}\n`;
}
