"use client";

import React, { useState } from "react";
import { ObjectiveBrowser } from "./ObjectiveBrowser";
import { ToolBrowser } from "./ToolBrowser";
import { WorkflowBrowser } from "./WorkflowBrowser";

export function SecurityMissionNavigator({
  onSelectObjective,
  onSelectTool,
  onSelectWorkflow,
}: {
  onSelectObjective: (id: string) => void;
  onSelectTool: (id: string) => void;
  onSelectWorkflow: (id: string) => void;
}) {
  const [tab, setTab] = useState<"objective" | "tool" | "workflow">("objective");

  return (
    <div className="security-mission-navigator font-mono text-xs mb-6">
      <div className="flex border-b border-zinc-800 mb-4">
        <button
          type="button"
          className={`px-4 py-2 font-bold uppercase transition-colors rounded-none ${
            tab === "objective"
              ? "bg-cyan-950 text-cyan-400 border-b-2 border-cyan-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => setTab("objective")}
        >
          Browse by objective
        </button>
        <button
          type="button"
          className={`px-4 py-2 font-bold uppercase transition-colors rounded-none ${
            tab === "tool"
              ? "bg-cyan-950 text-cyan-400 border-b-2 border-cyan-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => setTab("tool")}
        >
          Browse by tool
        </button>
        <button
          type="button"
          className={`px-4 py-2 font-bold uppercase transition-colors rounded-none ${
            tab === "workflow"
              ? "bg-cyan-950 text-cyan-400 border-b-2 border-cyan-400"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => setTab("workflow")}
        >
          Browse workflows
        </button>
      </div>

      {tab === "objective" && (
        <ObjectiveBrowser onSelectObjective={onSelectObjective} />
      )}
      {tab === "tool" && <ToolBrowser onSelectTool={onSelectTool} />}
      {tab === "workflow" && (
        <WorkflowBrowser onSelectWorkflow={onSelectWorkflow} />
      )}
    </div>
  );
}
