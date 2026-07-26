"use client";

import React from "react";

type GeneratorCodePanelProps = {
  filename: string;
  code: string;
  validationErrors: Record<string, string>;
  warnings: string[];
  copyStatus: "idle" | "copied" | "failed";
  onCopy: () => void;
};

export function GeneratorCodePanel({
  filename,
  code,
  validationErrors,
  warnings,
  copyStatus,
  onCopy,
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
    <div className="ml-generator-code-panel">
      <div className="ml-generator-actions">
        <div className="ml-generator-file" title={filename}>
          <span aria-hidden="true">&gt;</span>
          <span>{filename || "script.py"}</span>
        </div>
        <button
          type="button"
          className="ml-generator-copy"
          disabled={!code}
          onClick={onCopy}
        >
          {copyLabel}
        </button>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>

      {hasErrors ? (
        <div className="ml-generator-validation" role="status">
          <strong>Configuration blocked</strong>
          <span>Resolve the highlighted configuration fields to generate the script.</span>
        </div>
      ) : null}

      {warnings.length > 0 ? (
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
        {code ? (
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
