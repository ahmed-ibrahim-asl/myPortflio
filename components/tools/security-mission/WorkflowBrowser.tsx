"use client";

import {
  useMemo,
  useState,
} from "react";

import styles from "./SecurityMission.module.css";

export function WorkflowBrowser({
  workflows,
  platform,
  selectedId,
  onSelectWorkflow,
}: {
  workflows: readonly any[];
  platform: string;
  selectedId?: string | null;
  onSelectWorkflow: (workflowId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const visibleWorkflows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workflows;
    return workflows.filter((workflow) =>
      [
        workflow.title,
        workflow.description,
        ...(workflow.objectiveIds ?? []),
        ...(workflow.steps ?? []).flatMap((step: any) => [
          step.toolId,
          step.actionId,
        ]),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)));
  }, [search, workflows]);
  const resultLabel = `${visibleWorkflows.length} ${
    visibleWorkflows.length === 1 ? "workflow" : "workflows"
  }`;

  return (
    <div className={styles.browser}>
      <div className={styles.searchBar}>
        <label className={styles.searchField}>
          <span>Find a workflow</span>
          <input
            type="search"
            value={search}
            data-workflow-search
            placeholder="Search mission, tool, or objective"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div
        className={styles.resultCount}
        data-workflow-result-count
        aria-live="polite"
      >
        {resultLabel}
      </div>
      <div className={styles.cardGrid}>
        {visibleWorkflows.map((workflow) => {
          const compatible = workflow.platform === "cross-platform"
            || workflow.platform === platform;
          return (
            <button
              type="button"
              key={workflow.id}
              className={styles.choiceCard}
              data-workflow-id={workflow.id}
              data-compatible={compatible ? "true" : "false"}
              data-selected={selectedId === workflow.id ? "true" : "false"}
              aria-pressed={selectedId === workflow.id}
              disabled={!compatible}
              title={
                compatible
                  ? undefined
                  : `Requires ${workflow.platform}; current platform is ${platform}.`
              }
              onClick={() => onSelectWorkflow(workflow.id)}
            >
              <span className={styles.cardTopline}>
                <strong>{workflow.title}</strong>
                <span className={styles.badge}>
                  {workflow.steps?.length ?? 0} steps
                </span>
              </span>
              <span className={styles.cardDescription}>
                {workflow.description}
              </span>
              <span className={styles.cardFoot}>
                <span>
                  {compatible
                    ? workflow.platform
                    : `Requires ${workflow.platform}`}
                </span>
                <span>{workflow.risk} risk</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
