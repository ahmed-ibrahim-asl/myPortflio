"use client";

import {
  useId,
  useState,
} from "react";

import styles from "./SecurityMission.module.css";

export type ExplanationData = {
  what?: string;
  why?: string;
  useWhen?: string;
  avoidWhen?: string;
  tradeoff?: string;
  codeEffect?: string;
};

export function SecurityExplanation({
  explanation,
}: {
  explanation?: ExplanationData;
}) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  if (!explanation) return null;

  const rows = [
    ["What it is", explanation.what],
    ["Why it matters", explanation.why],
    ["Use it when", explanation.useWhen],
    ["Avoid it when", explanation.avoidWhen],
    ["Trade-off", explanation.tradeoff],
    ["Command effect", explanation.codeEffect],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className={styles.explanation}>
      <button
        type="button"
        className={styles.explanationButton}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Hide explanation" : "Explain this choice"}
      </button>
      {expanded && (
        <dl id={panelId} className={styles.explanationPanel}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
