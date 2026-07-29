"use client";

import styles from "./SecurityMission.module.css";

export function ObjectiveBrowser({
  objectives,
  selectedId,
  onSelectObjective,
}: {
  objectives: any[];
  selectedId?: string | null;
  onSelectObjective: (id: string) => void;
}) {
  const certified = objectives.filter(
    (objective) => objective.certification?.name === "eCPPT",
  );
  const supporting = objectives.filter(
    (objective) => !objective.certification?.name,
  );

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <section className={styles.browserGroup}>
        <header className={styles.browserGroupHeader}>
          <h3>{title}</h3>
          <span>{items.length} outcomes</span>
        </header>
        <div className={styles.cardGrid}>
          {items.map((objective) => (
            <button
              type="button"
              key={objective.id}
              className={styles.choiceCard}
              data-objective-id={objective.id}
              data-selected={selectedId === objective.id ? "true" : "false"}
              aria-pressed={selectedId === objective.id}
              onClick={() => onSelectObjective(objective.id)}
            >
              <span className={styles.cardTopline}>
                <strong>{objective.title}</strong>
                <span className={styles.badge}>{objective.domain}</span>
              </span>
              <span className={styles.cardDescription}>
                {objective.description}
              </span>
              <span className={styles.cardFoot}>
                <span>{objective.technicalTerm}</span>
                <span>{objective.difficulty ?? "guided"}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={styles.browser}>
      {renderGroup("eCPPT mission outcomes", certified)}
      {renderGroup("Supporting lab outcomes", supporting)}
    </div>
  );
}
