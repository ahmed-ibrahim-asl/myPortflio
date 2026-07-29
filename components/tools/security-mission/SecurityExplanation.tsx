"use client";

import React, { useState } from "react";

export type ExplanationData = {
  what?: string;
  why?: string;
  useWhen?: string;
  avoidWhen?: string;
  tradeoff?: string;
  codeEffect?: string;
};

export function SecurityExplanation({ explanation }: { explanation?: ExplanationData }) {
  const [expanded, setExpanded] = useState(false);

  if (!explanation) return null;

  return (
    <div className="security-explanation mt-2">
      <button
        type="button"
        className="text-xs text-cyan-400 hover:underline font-mono focus:outline-none"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "[-] Hide choice explanation" : "[+] Learn this choice"}
      </button>

      {expanded && (
        <div className="mt-2 p-3 bg-zinc-900 border border-zinc-700 text-xs font-mono space-y-2 text-zinc-300">
          {explanation.what && (
            <div>
              <span className="text-cyan-400 font-bold">WHAT: </span>
              {explanation.what}
            </div>
          )}
          {explanation.why && (
            <div>
              <span className="text-green-400 font-bold">WHY: </span>
              {explanation.why}
            </div>
          )}
          {explanation.useWhen && (
            <div>
              <span className="text-emerald-400 font-bold">USE WHEN: </span>
              {explanation.useWhen}
            </div>
          )}
          {explanation.avoidWhen && (
            <div>
              <span className="text-amber-400 font-bold">AVOID WHEN: </span>
              {explanation.avoidWhen}
            </div>
          )}
          {explanation.tradeoff && (
            <div>
              <span className="text-yellow-400 font-bold">TRADEOFF: </span>
              {explanation.tradeoff}
            </div>
          )}
          {explanation.codeEffect && (
            <div>
              <span className="text-cyan-300 font-bold">COMMAND EFFECT: </span>
              {explanation.codeEffect}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
