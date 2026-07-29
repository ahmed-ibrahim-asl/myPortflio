"use client";

import React from "react";

export function WorkflowPreviewPanel({
  workflow,
  compiledSteps = [],
  onCopyCommand,
  onDownloadRunbook,
}: {
  workflow: any;
  compiledSteps?: any[];
  onCopyCommand: (cmd?: string) => void;
  onDownloadRunbook: () => void;
}) {
  if (!workflow) return null;

  return (
    <div className="workflow-preview-panel font-mono text-xs bg-zinc-950 p-4 border border-zinc-800 space-y-4">
      <div className="border-b border-zinc-800 pb-2">
        <span className="font-bold text-cyan-400 uppercase tracking-wider">
          [Workflow Runbook: {workflow.title}]
        </span>
        <p className="text-zinc-400 text-[11px] mt-1">{workflow.description}</p>
      </div>

      <div className="space-y-4">
        {compiledSteps.map((stepCmd, idx) => (
          <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
              <span>Step {idx + 1}: {stepCmd?.actionId}</span>
              <span className="text-[10px] text-zinc-500">Host Role: {stepCmd?.hostRole ?? "Operator"}</span>
            </div>
            <pre className="text-emerald-400 font-mono whitespace-pre-wrap break-all text-xs">
              {stepCmd?.formatted ?? stepCmd?.command}
            </pre>
            <button
              type="button"
              className="text-[10px] text-cyan-400 hover:underline"
              onClick={() => onCopyCommand(stepCmd?.command)}
            >
              Copy step command
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <button
          type="button"
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold rounded-none"
          onClick={onDownloadRunbook}
        >
          Download runbook
        </button>
      </div>
    </div>
  );
}
