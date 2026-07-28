"use client";

import { useState } from "react";

import styles from "./ModelMission.module.css";

type MissionExplanationProps = {
  id: string;
  explanation: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect: string;
  };
};

export function MissionExplanation({
  id,
  explanation,
}: MissionExplanationProps) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-explanation`;

  return (
    <div className={styles.explanation}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide explanation" : "Learn this choice"}
      </button>
      {open ? (
        <div id={panelId} className={styles.explanationBody}>
          <p><strong>What it is:</strong> {explanation.what}</p>
          <p><strong>Why it matters:</strong> {explanation.why}</p>
          <p><strong>Use it when:</strong> {explanation.useWhen}</p>
          {explanation.avoidWhen ? (
            <p><strong>Avoid it when:</strong> {explanation.avoidWhen}</p>
          ) : null}
          {explanation.tradeoff ? (
            <p><strong>Trade-off:</strong> {explanation.tradeoff}</p>
          ) : null}
          <p><strong>Python effect:</strong> {explanation.codeEffect}</p>
        </div>
      ) : null}
    </div>
  );
}