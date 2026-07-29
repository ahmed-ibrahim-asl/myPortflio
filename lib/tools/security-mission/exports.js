import { sanitizeProjectForExport } from "./sensitive-values.js";

export function buildSecurityProjectExport(project) {
  const sanitized = sanitizeProjectForExport(project);
  return JSON.stringify(sanitized, null, 2);
}

export function buildWorkflowRunbook(project, workflow, compiledSteps) {
  return `# Runbook\n\nAuthorization context: ${project.authorizationContext}\nObjective: ${project.objectiveId}`;
}

export function buildPlainTextCommandList(compiledSteps) {
  return compiledSteps.map(s => s.command).join("\n");
}

export function buildLowRiskScript(project, workflow, compiledSteps) {
  const isAllLowRisk = compiledSteps.every(s => s.action?.risk === "low");
  if (!isAllLowRisk) {
    throw new Error("High risk workflows cannot be exported as scripts");
  }
  return `# Low Risk Script\n${compiledSteps.map(s => s.command).join("\n")}`;
}
