"use client";

import { ActionBrowser } from "./ActionBrowser";
import { SecurityControlRenderer } from "./SecurityControlRenderer";
import { SecurityMissionNavigator } from "./SecurityMissionNavigator";
import { SecurityProjectImport } from "./SecurityProjectImport";
import { ToolBrowser } from "./ToolBrowser";
import { WorkflowStepRail } from "./WorkflowStepRail";
import styles from "./SecurityMission.module.css";

const STEP_COPY: Record<string, { kicker: string; title: string; body: string }> = {
  scope: {
    kicker: "01 / Safe operating context",
    title: "Confirm where this command will run",
    body: "Set the authorized environment and output shell before choosing a security objective.",
  },
  objective: {
    kicker: "02 / Mission outcome",
    title: "What are you trying to accomplish?",
    body: "Start from an outcome, a familiar tool, or a curated multi-command workflow.",
  },
  tool: {
    kicker: "03 / Compatible tool",
    title: "Choose the instrument for this mission",
    body: "Only tools with a verified action for the selected objective and platform appear here.",
  },
  action: {
    kicker: "04 / Verified recipe",
    title: "Choose the command outcome",
    body: "Each action is a registry-owned recipe backed by source evidence.",
  },
  target: {
    kicker: "05 / Authorized target",
    title: "Define the lab target",
    body: "These values become quoted command arguments. Keep every target inside your approved scope.",
  },
  configure: {
    kicker: "06 / Command behavior",
    title: "Tune the command",
    body: "Guided shows necessary choices. Customize and Advanced reveal more controls without discarding values.",
  },
  review: {
    kicker: "07 / Preflight review",
    title: "Check the mission before copying",
    body: "Review scope, platform, selections, warnings, and every value that affects the command.",
  },
  generate: {
    kicker: "08 / Local artifacts",
    title: "Copy or download the result",
    body: "Security Mission generates text locally and never executes a command.",
  },
};

export function SecurityMissionStepPanel({
  stepId,
  project,
  dispatch,
  controls,
  validation,
  objective,
  tool,
  action,
  workflow,
  compatibleObjectives,
  compatibleTools,
  compatibleActions,
  workflows,
  entryMode,
  recommendation,
  importProject,
  importError,
  importMessage,
}: {
  stepId: string;
  project: any;
  dispatch: React.Dispatch<any>;
  controls: any[];
  validation: { errors: Record<string, string>; warnings: string[] };
  objective: any;
  tool: any;
  action: any;
  workflow: any;
  compatibleObjectives: any[];
  compatibleTools: any[];
  compatibleActions: any[];
  workflows: readonly any[];
  entryMode: "objective" | "tool" | "workflow";
  recommendation: any;
  importProject: (json: string) => boolean;
  importError?: string;
  importMessage?: string;
}) {
  const copy = STEP_COPY[stepId] ?? STEP_COPY.scope;
  let content: React.ReactNode = null;

  if (stepId === "scope") {
    content = (
      <div className={styles.scopeFields}>
        <label>
          <span>Authorization context</span>
          <select
            id="security-authorization-context"
            value={project.authorizationContext}
            onChange={(event) => dispatch({
              type: "set-authorization-context",
              context: event.target.value,
            })}
          >
            <option value="certification-lab">Certification lab</option>
            <option value="personal-lab">Personal or home lab</option>
            <option value="ctf">Capture the Flag environment</option>
            <option value="client-authorized">Client-authorized assessment</option>
          </select>
        </label>
        <label>
          <span>Command platform</span>
          <select
            id="security-platform"
            value={project.platform}
            onChange={(event) => dispatch({
              type: "set-platform",
              platform: event.target.value,
            })}
          >
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
          </select>
        </label>
        <label>
          <span>Shell format</span>
          <select
            id="security-shell"
            value={project.shell}
            onChange={(event) => dispatch({
              type: "set-shell",
              shell: event.target.value,
            })}
          >
            <option value="bash">Bash / POSIX</option>
            <option value="powershell">PowerShell</option>
            <option value="cmd">Windows CMD</option>
          </select>
        </label>
        <div className={styles.scopeAssurance}>
          <strong>Authorized use only</strong>
          <p>
            This tool creates local command text. It does not scan a target,
            store credentials, or send project data to a server.
          </p>
        </div>
      </div>
    );
  } else if (stepId === "objective") {
    content = (
      <SecurityMissionNavigator
        entryMode={entryMode}
        objectives={compatibleObjectives}
        tools={compatibleTools}
        workflows={workflows}
        platform={project.platform}
        selectedObjectiveId={project.objectiveId}
        selectedToolId={project.toolId}
        selectedWorkflowId={project.workflowId}
        onChooseEntryMode={(mode) => dispatch({
          type: "choose-entry-mode",
          mode,
        })}
        onSelectObjective={(objectiveId) => dispatch({
          type: "choose-objective",
          objectiveId,
        })}
        onSelectTool={(toolId) => dispatch({
          type: "choose-tool",
          toolId,
        })}
        onSelectWorkflow={(workflowId) => dispatch({
          type: "choose-workflow",
          workflowId,
        })}
      />
    );
  } else if (stepId === "tool") {
    content = (
      <ToolBrowser
        tools={compatibleTools}
        selectedId={project.toolId}
        onSelectTool={(toolId) => dispatch({
          type: "choose-tool",
          toolId,
        })}
      />
    );
  } else if (stepId === "action") {
    content = (
      <ActionBrowser
        actions={compatibleActions}
        selectedId={project.actionId}
        recommendation={recommendation}
        onSelectAction={(actionId) => dispatch({
          type: "choose-action",
          actionId,
        })}
      />
    );
  } else if (["target", "configure"].includes(stepId)) {
    content = (
      <>
        {workflow && (
          <WorkflowStepRail
            workflow={workflow}
            activeStepId={project.workflow.activeStepId}
            onSelectStep={(activeStepId) => dispatch({
              type: "set-active-workflow-step",
              activeStepId,
            })}
          />
        )}
        <SecurityControlRenderer
          controls={controls}
          project={project}
          errors={validation.errors}
          onChange={(valuePath, value) => dispatch({
            type: "patch-project-value",
            valuePath,
            value,
          })}
          onFocus={(valuePath) => dispatch({
            type: "set-focused-value-path",
            valuePath,
          })}
        />
      </>
    );
  } else {
    content = (
      <div className={styles.reviewGrid}>
        <article>
          <span>Scope</span>
          <strong>{project.authorizationContext.replaceAll("-", " ")}</strong>
          <small>{project.platform} / {project.shell}</small>
        </article>
        <article>
          <span>Objective</span>
          <strong>{objective?.title ?? "Workflow objective"}</strong>
          <small>{objective?.technicalTerm}</small>
        </article>
        <article>
          <span>{workflow ? "Workflow" : "Command"}</span>
          <strong>{workflow?.title ?? action?.title ?? "Not selected"}</strong>
          <small>{tool?.name ?? `${workflow?.steps?.length ?? 0} steps`}</small>
        </article>
        <article>
          <span>Validation</span>
          <strong>
            {Object.keys(validation.errors).length === 0
              ? "Ready"
              : `${Object.keys(validation.errors).length} corrections`}
          </strong>
          <small>{validation.warnings.length} warnings</small>
        </article>
        <SecurityProjectImport
          importError={importError}
          importMessage={importMessage}
          onImport={importProject}
        />
      </div>
    );
  }

  return (
    <div className={styles.stepPanel}>
      <header className={styles.stepHeader}>
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </header>
      {content}
    </div>
  );
}
