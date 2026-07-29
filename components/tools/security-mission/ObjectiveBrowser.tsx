"use client";

import { SECURITY_OBJECTIVES } from "@/lib/tools/security-mission/objective-registry.js";

export function ObjectiveBrowser({
  onSelectObjective,
}: {
  onSelectObjective: (id: string) => void;
}) {
  const ecpptObjectives = SECURITY_OBJECTIVES.filter(
    (obj) => obj.certification?.name === "eCPPT"
  );
  const supportingObjectives = SECURITY_OBJECTIVES.filter(
    (obj) => !obj.certification?.name
  );

  return (
    <div className="objective-browser font-mono text-xs space-y-6">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider border-b border-cyan-900 pb-1">
          [eCPPT Certification Domains]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ecpptObjectives.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelectObjective(obj.id)}
              className="p-3 bg-zinc-900 border border-zinc-700 hover:border-cyan-500 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-zinc-100">{obj.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {obj.domain}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mb-2">{obj.description}</p>
              <div className="text-[10px] text-zinc-500">
                <span>Outcome: {obj.technicalTerm}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider border-b border-zinc-800 pb-1">
          [Supporting Laboratory Domains]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportingObjectives.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelectObjective(obj.id)}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-zinc-200">{obj.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {obj.domain}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mb-2">{obj.description}</p>
              <div className="text-[10px] text-zinc-500">
                <span>Outcome: {obj.technicalTerm}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
