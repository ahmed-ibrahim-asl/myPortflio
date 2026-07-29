"use client";

import styles from "./SecurityMission.module.css";

export type RecommendationItem = {
  label: string;
  reason: string;
  toolId?: string;
  actionId?: string;
};

export function SecurityRecommendation({
  recommendation,
  onApply,
}: {
  recommendation?: RecommendationItem | null;
  onApply?: (recommendation: RecommendationItem) => void;
}) {
  if (!recommendation) return null;
  return (
    <aside className={styles.recommendation}>
      <span>Recommended next move</span>
      <div>
        <strong>{recommendation.label}</strong>
        <p>{recommendation.reason}</p>
      </div>
      {onApply && (recommendation.toolId || recommendation.actionId) && (
        <button type="button" onClick={() => onApply(recommendation)}>
          Apply recommendation
        </button>
      )}
    </aside>
  );
}
