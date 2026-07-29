"use client";

import React from "react";

export type RecommendationItem = {
  label: string;
  reason: string;
  toolId?: string;
  actionId?: string;
};

export function SecurityRecommendation({
  recommendations,
  onApply,
}: {
  recommendations?: RecommendationItem | RecommendationItem[] | null;
  onApply?: (rec: RecommendationItem) => void;
}) {
  if (!recommendations) return null;
  const list = Array.isArray(recommendations) ? recommendations : [recommendations];
  if (list.length === 0) return null;

  return (
    <div className="security-recommendations mb-4 p-3 bg-zinc-900 border border-cyan-700 text-xs font-mono text-zinc-200">
      <div className="text-cyan-400 font-bold mb-1">[+] ADVISORY RECOMMENDATION</div>
      {list.map((rec, idx) => (
        <div key={idx} className="flex items-start justify-between gap-2 mt-1">
          <div>
            <span className="text-zinc-100 font-bold">{rec.label}: </span>
            <span className="text-zinc-400">{rec.reason}</span>
          </div>
          {onApply && (rec.toolId || rec.actionId) && (
            <button
              type="button"
              className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 text-xs rounded-none font-mono"
              onClick={() => onApply(rec)}
            >
              Apply
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
