"use client";

import React, { useState } from "react";
import { useSecurityMission } from "@/lib/hooks/useSecurityMission";
import { SecurityMissionNavigator } from "./SecurityMissionNavigator";
import { SecurityMissionRail } from "./SecurityMissionRail";
import { SecurityMissionStepPanel } from "./SecurityMissionStepPanel";
import { CommandPreviewPanel } from "./CommandPreviewPanel";
import { WorkflowPreviewPanel } from "./WorkflowPreviewPanel";

export function SecurityMissionShell() {
  const {
    state,
    dispatch,
    objective,
    tool,
    action,
    workflow,
    controls,
    validation,
    generatedCommand,
    compiledWorkflowSteps,
    recommendations,
    copyStatus,
    copyCommand,
    downloadProject,
    downloadRunbook,
    importProject,
  } = useSecurityMission();

  const [activeTab, setActiveTab] = useState<"configure" | "command">("configure");

  const handleSelectObjective = (objId: string) => {
    dispatch({ type: "choose-objective", objectiveId: objId });
    dispatch({ type: "go-to-step", stepId: "tool" });
  };

  const handleSelectTool = (toolId: string) => {
    dispatch({ type: "choose-tool", toolId });
    dispatch({ type: "go-to-step", stepId: "action" });
  };

  const handleSelectWorkflow = (wfId: string) => {
    dispatch({ type: "choose-workflow", workflowId: wfId });
    dispatch({ type: "go-to-step", stepId: "configure" });
  };

  return (
    <div
      data-security-mission
      className="security-mission-container bg-zinc-950 text-zinc-100 min-h-screen font-mono p-4 md:p-6"
    >
      {/* Header */}
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-cyan-400">
              Security Mission
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              From objective to command, one choice at a time.
            </p>
          </div>

          {/* Disclosure level switch: Guided | Customize | Advanced */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1">
            <span className="text-[10px] text-zinc-500 uppercase px-2">Level:</span>
            {(["guided", "customize", "advanced"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`px-2.5 py-1 text-xs uppercase font-bold transition-colors rounded-none ${
                  state.project.learningLevel === lvl
                    ? "bg-cyan-600 text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                onClick={() =>
                  dispatch({ type: "set-learning-level", level: lvl })
                }
              >
                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Entry Navigator (Browse by objective / tool / workflow) */}
      <SecurityMissionNavigator
        onSelectObjective={handleSelectObjective}
        onSelectTool={handleSelectTool}
        onSelectWorkflow={handleSelectWorkflow}
      />

      {/* Outer 8-Step Rail */}
      <SecurityMissionRail
        currentStepId={state.stepId}
        onGoToStep={(stepId) => dispatch({ type: "go-to-step", stepId })}
      />

      {/* Mobile Tab Selectors (Configure / Command) */}
      <div className="flex md:hidden border-b border-zinc-800 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 font-bold text-xs uppercase text-center rounded-none ${
            activeTab === "configure"
              ? "bg-cyan-950 text-cyan-400 border-b-2 border-cyan-400"
              : "text-zinc-400"
          }`}
          onClick={() => setActiveTab("configure")}
        >
          Configure
        </button>
        <button
          type="button"
          className={`flex-1 py-2 font-bold text-xs uppercase text-center rounded-none ${
            activeTab === "command"
              ? "bg-cyan-950 text-cyan-400 border-b-2 border-cyan-400"
              : "text-zinc-400"
          }`}
          onClick={() => setActiveTab("command")}
        >
          Command
        </button>
      </div>

      {/* Workspace Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* Left Column: Configure Panel */}
        <section
          data-security-configure
          className={`space-y-4 min-w-0 ${
            activeTab === "configure" ? "block" : "hidden md:block"
          }`}
        >
          <div className="bg-zinc-900/50 p-4 border border-zinc-800 min-w-0">
            <h2 className="text-sm font-bold text-cyan-300 uppercase mb-4 tracking-wider">
              [{state.stepId.toUpperCase()}: STEP CONFIGURATION]
            </h2>
            <SecurityMissionStepPanel
              stepId={state.stepId}
              project={state.project}
              dispatch={dispatch}
              controls={controls}
              validation={validation as any}
              action={action}
            />
          </div>
        </section>

        {/* Right Column: Preview Panel */}
        <section
          data-security-preview
          className={`space-y-4 min-w-0 ${
            activeTab === "command" ? "block" : "hidden md:block"
          }`}
        >
          {state.project.mode === "workflow" && workflow ? (
            <WorkflowPreviewPanel
              workflow={workflow}
              compiledSteps={compiledWorkflowSteps}
              onCopyCommand={copyCommand}
              onDownloadRunbook={downloadRunbook}
            />
          ) : (
            <CommandPreviewPanel
              generatedCommand={generatedCommand}
              authorizationContext={state.project.authorizationContext}
              privilege={(action as any)?.privilege}
              copyStatus={copyStatus}
              onCopyCommand={copyCommand}
              onDownloadRunbook={downloadRunbook}
              onExportProject={downloadProject}
            />
          )}
        </section>
      </main>
    </div>
  );
}
