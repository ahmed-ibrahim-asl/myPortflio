"use client";

import { useEffect, useRef } from "react";

import {
  MODEL_MISSION_STEPS,
} from "@/lib/tools/ml-generator/model-mission/catalog";

import styles from "./ModelMission.module.css";

type WorkflowRailProps = {
  activeStepId: string;
  onChoose: (stepId: string) => void;
};

export function WorkflowRail({
  activeStepId,
  onChoose,
}: WorkflowRailProps) {
  const railRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const active = activeRef.current;
    if (!rail || !active) return;
    const centered =
      active.offsetLeft
      - (rail.clientWidth - active.clientWidth) / 2;
    rail.scrollTo({
      left: Math.max(0, centered),
      behavior: "smooth",
    });
  }, [activeStepId]);

  return (
    <nav
      className={styles.workflow}
      data-mission-workflow
      aria-label="Model Mission steps"
    >
      <ol ref={railRef}>
        {MODEL_MISSION_STEPS.map((step, index) => {
          const active = step.id === activeStepId;
          return (
            <li key={step.id}>
              <button
                ref={active ? activeRef : undefined}
                type="button"
                aria-current={active ? "step" : undefined}
                data-active={active ? "true" : "false"}
                onClick={() => onChoose(step.id)}
              >
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step.shortLabel}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
