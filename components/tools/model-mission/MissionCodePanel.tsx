import styles from "./ModelMission.module.css";

import type {
  ProjectConfig,
} from "@/lib/tools/ml-generator/workbench/types";

type MissionDependency = {
  package: string;
  version: string;
  purpose: string;
};

type MissionResult = {
  filename: string;
  code: string;
  dependencies: MissionDependency[];
  warnings: string[];
  summary: string;
  validationErrors: Record<string, string>;
  resolvedConfig: ProjectConfig;
};

type MissionCodePanelProps = {
  status: "loading" | "ready" | "error";
  result: MissionResult | null;
  error: Error | null;
  copyStatus: string;
  onCopy: () => void;
  onDownloadPython: () => void;
  onDownloadProject: () => void;
  onRetry: () => void;
};

export function MissionCodePanel({
  status,
  result,
  error,
  copyStatus,
  onCopy,
  onDownloadPython,
  onDownloadProject,
  onRetry,
}: MissionCodePanelProps) {
  const errors = Object.entries(
    result?.validationErrors ?? {},
  );
  const ready =
    status === "ready"
    && Boolean(result?.code)
    && errors.length === 0;

  return (
    <section
      className={styles.codePanel}
      data-mission-code-panel
      data-load-state={status}
      aria-label="Generated Python"
      aria-busy={status === "loading"}
    >
      <header className={styles.codeHeader}>
        <div>
          <span>Python mission output</span>
          <strong>
            {result?.filename
              || (status === "loading"
                ? "Loading generator…"
                : "Configuration needs attention")}
          </strong>
        </div>
        <div className={styles.codeActions}>
          <button
            type="button"
            disabled={!ready}
            onClick={onCopy}
          >
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "failed"
                ? "Copy failed"
                : "Copy Python"}
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={onDownloadPython}
          >
            Download Python
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={onDownloadProject}
          >
            Download project (.zip)
          </button>
        </div>
      </header>

      {status === "loading" ? (
        <div className={styles.codeLoading} role="status">
          <span />
          <p>Loading only the selected generator recipe…</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.errorBox} role="alert">
          <strong>The selected generator did not load.</strong>
          <p>
            {error?.message
              ?? "Your configuration is still saved in this page."}
          </p>
          <button type="button" onClick={onRetry}>
            Retry generator
          </button>
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className={styles.errorBox} role="alert">
          <strong>Fix these choices to generate code</strong>
          {errors.map(([field, message]) => (
            <p key={field}>{field}: {message}</p>
          ))}
        </div>
      ) : null}

      {result?.warnings.length ? (
        <div className={styles.warningBox}>
          <strong>Check before running</strong>
          {result.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {result?.dependencies.length ? (
        <div className={styles.installBox}>
          <span>Install dependencies</span>
          <code>
            pip install {result.dependencies
              .map((dependency) =>
                `${dependency.package}${dependency.version}`
              )
              .join(" ")}
          </code>
        </div>
      ) : null}

      {result?.summary ? (
        <p className={styles.codeSummary}>{result.summary}</p>
      ) : null}

      {ready ? (
        <pre className={styles.code}>
          <code>{result?.code}</code>
        </pre>
      ) : null}
    </section>
  );
}
