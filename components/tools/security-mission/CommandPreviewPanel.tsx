"use client";

import React, { useState } from "react";
import { SecurityWarningPanel } from "./SecurityWarningPanel";

export function CommandPreviewPanel({
  generatedCommand,
  authorizationContext,
  privilege,
  copyStatus,
  onCopyCommand,
  onDownloadRunbook,
  onExportProject,
}: {
  generatedCommand: any;
  authorizationContext?: string;
  privilege?: string;
  copyStatus: string;
  onCopyCommand: (cmd?: string) => void;
  onDownloadRunbook: () => void;
  onExportProject: () => void;
}) {
  const [format, setFormat] = useState<"single" | "multi">("multi");

  const cmdText =
    format === "multi"
      ? generatedCommand?.formatted ?? generatedCommand?.command
      : generatedCommand?.command;

  return (
    <div className="command-preview-panel font-mono text-xs bg-zinc-950 p-4 border border-zinc-800 space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <span className="font-bold text-cyan-400 uppercase tracking-wider">
          [Command Output Preview]
        </span>
        <div className="flex gap-1 text-[10px]">
          <button
            type="button"
            className={`px-2 py-0.5 border rounded-none ${
              format === "multi"
                ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"
            }`}
            onClick={() => setFormat("multi")}
          >
            Multi-line
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 border rounded-none ${
              format === "single"
                ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"
            }`}
            onClick={() => setFormat("single")}
          >
            Single-line
          </button>
        </div>
      </div>

      <SecurityWarningPanel
        authorizationContext={authorizationContext}
        privilege={privilege}
        warnings={generatedCommand?.warnings ?? []}
      />

      <div className="p-3 bg-zinc-900 border border-zinc-800 overflow-x-auto min-h-24">
        {cmdText ? (
          <pre className="text-emerald-400 font-mono whitespace-pre-wrap break-all text-xs">
            {cmdText}
          </pre>
        ) : (
          <div className="text-zinc-600 italic">Select an action to generate command.</div>
        )}
      </div>

      {generatedCommand?.summary && (
        <div className="text-[11px] text-zinc-400">
          <span className="text-zinc-200 font-bold">Summary: </span>
          {generatedCommand.summary}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
        <button
          type="button"
          disabled={!cmdText}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-zinc-950 font-bold rounded-none"
          onClick={() => onCopyCommand(cmdText)}
        >
          {copyStatus === "copied" ? "Copied!" : "Copy command"}
        </button>
        <button
          type="button"
          disabled={!cmdText}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold rounded-none"
          onClick={onDownloadRunbook}
        >
          Download runbook
        </button>
        <button
          type="button"
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold rounded-none"
          onClick={onExportProject}
        >
          Export configuration
        </button>
      </div>
    </div>
  );
}
