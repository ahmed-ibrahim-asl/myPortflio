"use client";

import {
  useState,
} from "react";

import { CommandAssemblyTrace } from "./CommandAssemblyTrace";
import { SecurityWarningPanel } from "./SecurityWarningPanel";
import styles from "./SecurityMission.module.css";

export function CommandPreviewPanel({
  generatedCommand,
  generationError,
  authorizationContext,
  privilege,
  copyStatus,
  validation,
  controls,
  focusedValuePath,
  onChooseSource,
  onCopyCommand,
  onDownloadRunbook,
  onExportProject,
}: {
  generatedCommand: any;
  generationError?: string;
  authorizationContext?: string;
  privilege?: string;
  copyStatus: string;
  validation: { errors: Record<string, string>; warnings: string[] };
  controls: any[];
  focusedValuePath?: string | null;
  onChooseSource: (valuePath: string) => void;
  onCopyCommand: (command?: string) => void;
  onDownloadRunbook: () => void;
  onExportProject: () => void;
}) {
  const [format, setFormat] = useState<"single" | "formatted">("single");
  const commandText = format === "formatted"
    ? generatedCommand?.formatted
    : generatedCommand?.command;
  const errorCount = Object.keys(validation.errors).length;
  const canUseCommand = Boolean(commandText) && errorCount === 0;

  return (
    <div className={styles.commandPanel}>
      <header className={styles.commandHeader}>
        <div>
          <span>Live command</span>
          <strong>
            {generatedCommand
              ? `${generatedCommand.toolId} / ${generatedCommand.shell}`
              : "Waiting for an action"}
          </strong>
        </div>
        <div className={styles.formatSwitch} role="group" aria-label="Command format">
          <button
            type="button"
            aria-pressed={format === "single"}
            onClick={() => setFormat("single")}
          >
            Single line
          </button>
          <button
            type="button"
            aria-pressed={format === "formatted"}
            onClick={() => setFormat("formatted")}
          >
            Formatted
          </button>
        </div>
      </header>

      <SecurityWarningPanel
        authorizationContext={authorizationContext}
        privilege={privilege}
        warnings={validation.warnings}
      />

      <div className={styles.commandCode}>
        <span aria-hidden="true">$</span>
        {commandText ? (
          <pre>
            <code data-command-output>{commandText}</code>
          </pre>
        ) : (
          <p data-command-output>
            {generationError || "Choose a tool and action to assemble a command."}
          </p>
        )}
      </div>

      <CommandAssemblyTrace
        generatedCommand={generatedCommand}
        controls={controls}
        focusedValuePath={focusedValuePath}
        onChooseSource={onChooseSource}
      />

      {errorCount > 0 && (
        <div className={styles.validationSummary} role="alert">
          <strong>
            {errorCount} {errorCount === 1 ? "correction" : "corrections"} needed
          </strong>
          <ul>
            {Object.entries(validation.errors).map(([path, message]) => (
              <li key={path}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className={styles.commandActions}>
        <button
          type="button"
          className={styles.primaryAction}
          disabled={!canUseCommand}
          onClick={() => onCopyCommand(commandText)}
        >
          {copyStatus === "copied"
            ? "Copied"
            : copyStatus === "failed"
              ? "Copy failed"
              : "Copy command"}
        </button>
        <button
          type="button"
          disabled={!canUseCommand}
          onClick={onDownloadRunbook}
        >
          Download runbook
        </button>
        <button type="button" onClick={onExportProject}>
          Export project
        </button>
        <span className={styles.srOnly} aria-live="polite">
          {copyStatus === "copied" ? "Command copied." : ""}
        </span>
      </footer>
      {!canUseCommand && generatedCommand && (
        <p className={styles.disabledReason}>
          Resolve validation errors before copying or downloading this command.
        </p>
      )}
      {generatedCommand?.evidenceId && (
        <p className={styles.evidenceLine}>
          Evidence record: <code>{generatedCommand.evidenceId}</code>
        </p>
      )}
    </div>
  );
}
