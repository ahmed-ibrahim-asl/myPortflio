"use client";

import styles from "./SecurityMission.module.css";

export function WorkflowStepRail({
  workflow,
  activeStepId,
  onSelectStep,
}: {
  workflow: any;
  activeStepId?: string | null;
  onSelectStep: (stepId: string) => void;
}) {
  if (!workflow?.steps?.length) return null;

  return (
    <section
      className={styles.workflowStepRail}
      data-workflow-step-rail
    >
      <header>
        <span>Workflow steps</span>
        <strong>
          Configure one verified command at a time. Shared values update every
          compatible step.
        </strong>
      </header>
      <div role="tablist" aria-label={`${workflow.title} command steps`}>
        {workflow.steps.map((step: any, index: number) => (
          <button
            type="button"
            role="tab"
            key={step.id}
            data-workflow-step
            aria-selected={activeStepId === step.id}
            data-active={activeStepId === step.id ? "true" : "false"}
            onClick={() => onSelectStep(step.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <small>{step.hostRole}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
