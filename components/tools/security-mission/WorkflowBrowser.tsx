"use client";

import { SECURITY_WORKFLOWS } from "@/lib/tools/security-mission/workflow-registry.js";

export function WorkflowBrowser({
  onSelectWorkflow,
}: {
  onSelectWorkflow: (workflowId: string) => void;
}) {
  return (
    <div className="workflow-browser font-mono text-xs space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SECURITY_WORKFLOWS.map((wf: any) => (
          <div
            key={wf.id}
            onClick={() => onSelectWorkflow(wf.id)}
            className="p-3 bg-zinc-900 border border-zinc-700 hover:border-cyan-500 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-zinc-100">{wf.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800">
                {wf.steps?.length ?? 0} Steps
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-2">{wf.description}</p>
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Platform: {wf.platform}</span>
              <span>Risk: {wf.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
