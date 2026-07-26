"use client";

import React from "react";

type GeneratorCodePanelProps = {
  status: "idle" | "loading" | "ready" | "error";
  filename: string;
  code: string;
  validationErrors: Record<string, string>;
  warnings: string[];
  errorMessage?: string;
  copyStatus: "idle" | "copied" | "failed";
  onCopy: () => void;
  onRetry: () => void;
};

export function GeneratorCodePanel({
  status,
  filename,
  code,
  validationErrors,
  warnings,
  errorMessage,
  copyStatus,
  onCopy,
  onRetry,
}: GeneratorCodePanelProps) {
  const hasErrors = Object.keys(validationErrors).length > 0;
  const copyLabel = copyStatus === "copied" ? "Copied" : "Copy Python";
  const statusMessage =
    copyStatus === "copied"
      ? "Python script copied to the clipboard."
      : copyStatus === "failed"
        ? "Copy failed. Select the code and copy it manually."
        : "";

  return (
    <div
      className="ml-generator-code-panel"
      data-load-state={status}
      aria-busy={status === "loading"}
    >
      <div className="ml-generator-actions">
        <div className="ml-generator-file" title={filename}>
          <span aria-hidden="true">&gt;</span>
          <span>{filename || "script.py"}</span>
        </div>
        <button
          type="button"
          className="ml-generator-copy"
          disabled={status !== "ready" || !code}
          onClick={onCopy}
        >
          {copyLabel}
        </button>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {status === "loading"
          ? "Loading the selected script recipe."
          : statusMessage}
      </p>

      {status === "ready" && hasErrors ? (
        <div className="ml-generator-validation" role="status">
          <strong>Configuration blocked</strong>
          <span>Resolve the highlighted configuration fields to generate the script.</span>
        </div>
      ) : null}

      {status === "ready" && warnings.length > 0 ? (
        <div className="ml-generator-warnings" aria-label="Configuration warnings">
          <span className="ml-generator-panel-kicker">Runtime notes</span>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="ml-generator-code-shell">
        {status === "loading" || status === "idle" ? (
          <div
            className="ml-generator-code-empty ml-generator-code-loading"
            role="status"
          >
            <span aria-hidden="true">LOADING_RECIPE</span>
            <p>Opening the selected workflow and preparing its Python generator.</p>
          </div>
        ) : status === "error" ? (
          <div
            className="ml-generator-code-empty ml-generator-code-error"
            role="alert"
          >
            <span aria-hidden="true">LOAD_FAILED</span>
            <p>{errorMessage || "The selected workflow could not be loaded."}</p>
            <button
              type="button"
              className="ml-generator-retry"
              onClick={onRetry}
            >
              Retry recipe
            </button>
          </div>
        ) : code ? (
          <pre className="ml-generator-code" tabIndex={0}>
            <code>{code}</code>
          </pre>
        ) : (
          <div className="ml-generator-code-empty">
            <span aria-hidden="true">NO_OUTPUT</span>
            <p>Complete the required configuration to open the Python preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}
