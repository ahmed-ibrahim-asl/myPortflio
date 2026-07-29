"use client";

import styles from "./SecurityMission.module.css";

export function WorkflowPreviewPanel({
  workflow,
  compiledSteps = [],
  copyStatus,
  onCopyCommand,
  onDownloadRunbook,
  onExportProject,
}: {
  workflow: any;
  compiledSteps?: any[];
  copyStatus: string;
  onCopyCommand: (command?: string) => void;
  onDownloadRunbook: () => void;
  onExportProject: () => void;
}) {
  if (!workflow) return null;
  const workflowReady = compiledSteps.length > 0
    && compiledSteps.every((step) => step.ready !== false);

  return (
    <div className={styles.commandPanel}>
      <header className={styles.commandHeader}>
        <div>
          <span>Workflow runbook</span>
          <strong>{workflow.title}</strong>
        </div>
        <span className={styles.badge}>{compiledSteps.length} commands</span>
      </header>
      <p className={styles.workflowDescription}>{workflow.description}</p>
      <ol className={styles.workflowSteps}>
        {compiledSteps.map((step, index) => (
          <li key={`${step.actionId}-${index}`}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step.title}</strong>
                <small>{step.hostRole} / {step.purpose}</small>
                {step.ready === false && (
                  <small>
                    {Object.keys(step.validation?.errors ?? {}).length} required
                    values need attention
                  </small>
                )}
              </div>
            </header>
            <pre><code>{step.formatted ?? step.command}</code></pre>
            <button
              type="button"
              disabled={step.ready === false}
              onClick={() => onCopyCommand(step.command)}
            >
              Copy step
            </button>
          </li>
        ))}
      </ol>
      <footer className={styles.commandActions}>
        <button
          type="button"
          className={styles.primaryAction}
          disabled={!workflowReady}
          onClick={onDownloadRunbook}
        >
          Download runbook
        </button>
        <button type="button" onClick={onExportProject}>
          Export project
        </button>
        <span className={styles.srOnly} aria-live="polite">
          {copyStatus === "copied" ? "Step command copied." : ""}
        </span>
      </footer>
      {!workflowReady && compiledSteps.length > 0 && (
        <p className={styles.disabledReason}>
          Complete each workflow step before copying or downloading its command.
        </p>
      )}
    </div>
  );
}
