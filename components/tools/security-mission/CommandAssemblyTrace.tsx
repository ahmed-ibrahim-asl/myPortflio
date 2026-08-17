"use client";

import { useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!generatedCommand?.tokens?.length) return null;
  const labels = new Map(
    controls.map((control) => [control.valuePath, control.label]),
  );

  const activeToken =
    activeIndex !== null ? generatedCommand.tokens[activeIndex] : null;
  const activeLabel = activeToken?.sourcePath
    ? labels.get(activeToken.sourcePath) ?? activeToken.sourcePath
    : activeToken?.type === "executable"
      ? "Selected tool"
      : "Verified action recipe";

  return (
    <section className={styles.trace} aria-label="Command assembly trace">
      <header>
        <span>Command assembly trace</span>
        <small>Hover or select a token to see what it does and where it came from</small>
      </header>
      <div className={styles.traceTokens}>
        {generatedCommand.tokens.map((token: any, index: number) => {
          const text = token.quoted ?? token.value;
          const label = token.sourcePath
            ? labels.get(token.sourcePath) ?? token.sourcePath
            : token.type === "executable"
              ? "Selected tool"
              : "Verified action recipe";
          const tooltip = token.flagDescription
            ? `${token.flagDescription} (source: ${label})`
            : `Source: ${label}`;
          const hoverProps = {
            onMouseEnter: () => setActiveIndex(index),
            onMouseLeave: () => setActiveIndex((i) => (i === index ? null : i)),
            onFocus: () => setActiveIndex(index),
            onBlur: () => setActiveIndex((i) => (i === index ? null : i)),
          };

          if (!token.sourcePath) {
            if (token.flagDescription) {
              return (
                <button
                  type="button"
                  key={`${token.type}-${index}`}
                  className={styles.traceToken}
                  data-token-type={token.type}
                  data-has-description="true"
                  title={tooltip}
                  {...hoverProps}
                >
                  {text}
                </button>
              );
            }
            return (
              <span
                key={`${token.type}-${index}`}
                className={styles.traceToken}
                data-token-type={token.type}
                title={tooltip}
                {...hoverProps}
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
              data-has-description={token.flagDescription ? "true" : "false"}
              data-active={
                focusedValuePath === token.sourcePath ? "true" : "false"
              }
              title={tooltip}
              onClick={() => onChooseSource?.(token.sourcePath)}
              {...hoverProps}
            >
              {text}
            </button>
          );
        })}
      </div>
      <p className={styles.traceDetail} aria-live="polite">
        {activeToken?.flagDescription
          ? activeToken.flagDescription
          : activeToken
            ? `Source: ${activeLabel}`
            : "Hover a token above for details."}
      </p>
      <dl className={styles.traceLegend}>
        <div><dt>Tool</dt><dd>executable</dd></div>
        <div><dt>Recipe</dt><dd>verified flag</dd></div>
        <div><dt>Your value</dt><dd>quoted argument</dd></div>
      </dl>
    </section>
  );
}
