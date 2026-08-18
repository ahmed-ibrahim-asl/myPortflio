import React from "react";

interface IndexedBadgeProps {
  index: number | string;
  prefix?: string;
}

export function IndexedBadge({ index, prefix = "L" }: IndexedBadgeProps) {
  const number = typeof index === "number" ? index : Number.parseInt(index, 10);
  const formatted = Number.isFinite(number)
    ? String(number).padStart(2, "0")
    : String(index).padStart(2, "0");

  return (
    <span className="indexed-badge mono" aria-label={`Item ${formatted}`}>
      <span className="indexed-badge-prefix" aria-hidden="true">{prefix}</span>
      <span className="indexed-badge-number" aria-hidden="true">{formatted}</span>
    </span>
  );
}
