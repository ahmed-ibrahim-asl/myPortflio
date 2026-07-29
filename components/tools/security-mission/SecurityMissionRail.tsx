"use client";

import { SECURITY_MISSION_STEPS } from "@/lib/tools/security-mission/catalog.js";

export function SecurityMissionRail({
  currentStepId,
  onGoToStep,
}: {
  currentStepId: string;
  onGoToStep: (stepId: string) => void;
}) {
  return (
    /* 8-step rail: Scope, Objective, Tool, Action, Target, Configure, Review, Generate */
    <nav aria-label="Security Mission Rail" className="security-mission-rail font-mono text-xs mb-6 overflow-x-auto">
      <ol className="flex items-center space-x-1 min-w-max border-b border-zinc-800 pb-2">
        {SECURITY_MISSION_STEPS.map((step: any, idx: number) => {
          const isCurrent = step.id === currentStepId;
          return (
            <li key={step.id} className="flex items-center">
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                className={`px-3 py-1.5 font-bold uppercase transition-colors rounded-none ${
                  isCurrent
                    ? "bg-cyan-600 text-zinc-950"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
                onClick={() => onGoToStep(step.id)}
              >
                {idx + 1}. {step.title}
              </button>
              {idx < SECURITY_MISSION_STEPS.length - 1 && (
                <span className="text-zinc-600 mx-1">&gt;</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
