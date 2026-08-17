import React from "react";

export function ToolResultCard({ label, value, unit, children }: { label: string, value: string | number, unit?: string, children?: React.ReactNode }) {
  return (
    <div className="tool-result-card">
      <span className="hud-card-label mono">{label}</span>
      <div className="metric-value mono">
        {value} {unit && <span style={{ fontSize: "0.5em" }}>{unit}</span>}
      </div>
      {children}
    </div>
  );
}
