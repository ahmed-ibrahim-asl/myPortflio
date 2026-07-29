"use client";

import styles from "./SecurityMission.module.css";

function actionTitle(action: any): string {
  return action.title
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

export function ActionBrowser({
  actions,
  selectedId,
  recommendation,
  onSelectAction,
}: {
  actions: any[];
  selectedId?: string | null;
  recommendation?: any;
  onSelectAction: (actionId: string) => void;
}) {
  if (actions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <strong>No compatible actions.</strong>
        <span>Choose another objective, tool, or platform.</span>
      </div>
    );
  }

  return (
    <div className={styles.browser}>
      <div className={styles.resultCount} aria-live="polite">
        {actions.length} {actions.length === 1 ? "action" : "actions"}
      </div>
      <div className={styles.cardGrid}>
        {actions.map((action) => {
          const isRecommended =
            recommendation?.actionId === action.id
            || (
              recommendation?.toolId === action.toolId
              && actions[0]?.id === action.id
            );
          return (
            <button
              type="button"
              key={action.id}
              className={styles.choiceCard}
              data-action-id={action.id}
              data-selected={selectedId === action.id ? "true" : "false"}
              aria-pressed={selectedId === action.id}
              onClick={() => onSelectAction(action.id)}
            >
              <span className={styles.cardTopline}>
                <strong>{actionTitle(action)}</strong>
                <span
                  className={styles.badge}
                  data-risk={action.risk ?? "low"}
                >
                  {action.risk ?? "low"} risk
                </span>
              </span>
              <span className={styles.cardDescription}>
                {action.summary
                  ?? `Build the verified ${actionTitle(action).toLowerCase()} command.`}
              </span>
              <span className={styles.cardFoot}>
                <span>{action.executable?.linux}</span>
                <span>{isRecommended ? "Recommended" : "Verified recipe"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
