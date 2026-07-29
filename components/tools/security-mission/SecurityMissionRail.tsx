"use client";

import {
  SECURITY_MISSION_STEPS,
} from "@/lib/tools/security-mission/catalog.js";

import styles from "./SecurityMission.module.css";

export function SecurityMissionRail({
  currentStepId,
  onGoToStep,
}: {
  currentStepId: string;
  onGoToStep: (stepId: string) => void;
}) {
  const currentIndex = SECURITY_MISSION_STEPS.findIndex(
    ({ id }) => id === currentStepId,
  );

  return (
    <nav aria-label="Security Mission progress" className={styles.rail}>
      <ol>
        {SECURITY_MISSION_STEPS.map((step: any, index: number) => {
          const isCurrent = step.id === currentStepId;
          return (
            <li key={step.id}>
              <button
                type="button"
                data-step-id={step.id}
                data-state={
                  isCurrent
                    ? "current"
                    : index < currentIndex
                      ? "complete"
                      : "upcoming"
                }
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onGoToStep(step.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
