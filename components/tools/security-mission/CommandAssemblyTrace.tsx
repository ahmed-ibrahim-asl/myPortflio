"use client";

import styles from "./SecurityMission.module.css";

export function CommandAssemblyTrace({
  generatedCommand,
  controls,
  focusedValuePath,
  onChooseSource,
}: {
  generatedCommand: any;
  controls: any[];
  focusedValuePath?: string | null;
  onChooseSource?: (valuePath: string) => void;
}) {
  if (!generatedCommand?.tokens?.length) return null;
  const labels = new Map(
    controls.map((control) => [control.valuePath, control.label]),
  );

  return (
    <section className={styles.trace} aria-label="Command assembly trace">
      <header>
        <span>Command assembly trace</span>
        <small>Select a token to find its source field</small>
      </header>
      <div className={styles.traceTokens}>
        {generatedCommand.tokens.map((token: any, index: number) => {
          const text = token.quoted ?? token.value;
          const label = token.sourcePath
            ? labels.get(token.sourcePath) ?? token.sourcePath
            : token.type === "executable"
              ? "Selected tool"
              : "Verified action recipe";
          if (!token.sourcePath) {
            return (
              <span
                key={`${token.type}-${index}`}
                className={styles.traceToken}
                data-token-type={token.type}
                title={label}
              >
                {text}
              </span>
            );
          }
          return (
            <button
              type="button"
              key={`${token.type}-${index}`}
              className={styles.traceToken}
              data-token-type={token.type}
              data-active={
                focusedValuePath === token.sourcePath ? "true" : "false"
              }
              title={`Source: ${label}`}
              onClick={() => onChooseSource?.(token.sourcePath)}
            >
              {text}
            </button>
          );
        })}
      </div>
      <dl className={styles.traceLegend}>
        <div><dt>Tool</dt><dd>executable</dd></div>
        <div><dt>Recipe</dt><dd>verified flag</dd></div>
        <div><dt>Your value</dt><dd>quoted argument</dd></div>
      </dl>
    </section>
  );
}
