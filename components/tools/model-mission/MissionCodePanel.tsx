import styles from "./ModelMission.module.css";

type MissionResult = {
  filename: string;
  code: string;
  dependencies: string[];
  warnings: string[];
  summary: string;
  validationErrors: Record<string, string>;
};

type MissionCodePanelProps = {
  status: "loading" | "ready" | "error";
  result: MissionResult | null;
  error: Error | null;
  copyStatus: string;
  onCopy: () => void;
  onDownload: () => void;
  onRetry: () => void;
};

export function MissionCodePanel({
  status,
  result,
  error,
  copyStatus,
  onCopy,
  onDownload,
  onRetry,
}: MissionCodePanelProps) {
  const ready = status === "ready" && Boolean(result?.code);
  const errors = Object.entries(
    result?.validationErrors ?? {},
  );

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
            onClick={onDownload}
          >
            Download .py
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
            pip install {result.dependencies.join(" ")}
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
