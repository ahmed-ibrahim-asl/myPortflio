"use client";

import { ObjectiveBrowser } from "./ObjectiveBrowser";
import { ToolBrowser } from "./ToolBrowser";
import { WorkflowBrowser } from "./WorkflowBrowser";
import styles from "./SecurityMission.module.css";

export function SecurityMissionNavigator({
  entryMode,
  objectives,
  tools,
  workflows,
  platform,
  selectedObjectiveId,
  selectedToolId,
  selectedWorkflowId,
  onChooseEntryMode,
  onSelectObjective,
  onSelectTool,
  onSelectWorkflow,
}: {
  entryMode: "objective" | "tool" | "workflow";
  objectives: any[];
  tools: any[];
  workflows: readonly any[];
  platform: string;
  selectedObjectiveId?: string | null;
  selectedToolId?: string | null;
  selectedWorkflowId?: string | null;
  onChooseEntryMode: (mode: "objective" | "tool" | "workflow") => void;
  onSelectObjective: (id: string) => void;
  onSelectTool: (id: string) => void;
  onSelectWorkflow: (id: string) => void;
}) {
  const entries = [
    {
      id: "objective",
      label: "Objective",
      help: "Browse by objective",
    },
    {
      id: "tool",
      label: "Tool",
      help: "Browse by tool",
    },
    {
      id: "workflow",
      label: "Workflow",
      help: "Browse workflows",
    },
  ] as const;

  return (
    <div className={styles.navigator}>
      <div
        className={styles.entryModes}
        role="group"
        aria-label="Start Security Mission with"
      >
        {entries.map((entry) => (
          <button
            type="button"
            key={entry.id}
            data-entry-mode={entry.id}
            data-active={entryMode === entry.id ? "true" : "false"}
            aria-pressed={entryMode === entry.id}
            onClick={() => onChooseEntryMode(entry.id)}
          >
            <strong>{entry.label}</strong>
            <span>{entry.help}</span>
          </button>
        ))}
      </div>

      {entryMode === "objective" && (
        <ObjectiveBrowser
          objectives={objectives}
          selectedId={selectedObjectiveId}
          onSelectObjective={onSelectObjective}
        />
      )}
      {entryMode === "tool" && (
        <ToolBrowser
          tools={tools}
          selectedId={selectedToolId}
          onSelectTool={onSelectTool}
        />
      )}
      {entryMode === "workflow" && (
        <WorkflowBrowser
          workflows={workflows}
          platform={platform}
          selectedId={selectedWorkflowId}
          onSelectWorkflow={onSelectWorkflow}
        />
      )}
    </div>
  );
}
