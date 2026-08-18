import {
  MODEL_MISSION_TASKS,
} from "@/lib/tools/ml-generator/model-mission/catalog";

import styles from "./ModelMission.module.css";

type TaskChooserProps = {
  selectedTaskId: string;
  onChoose: (taskId: string) => void;
};

const LEVEL_LABELS = {
  beginner: "Start here",
  intermediate: "Build experience",
  advanced: "Advanced missions",
} as const;

export function TaskChooser({
  selectedTaskId,
  onChoose,
}: TaskChooserProps) {
  return (
    <div className={styles.taskGroups}>
      {Object.entries(LEVEL_LABELS).map(([level, label]) => (
        <section className={styles.taskGroup} key={level}>
          <div className={styles.taskGroupHeading}>
            <span>{label}</span>
            <small>
              {level === "beginner"
                ? "Core ML"
                : level === "intermediate"
                  ? "Applied workflows"
                  : "Vision and custom networks"}
            </small>
          </div>
          <div className={styles.taskGrid}>
            {MODEL_MISSION_TASKS
              .filter((task) => task.level === level)
              .map((task) => {
                const selected = task.id === selectedTaskId;
                return (
                  <button
                    className={styles.taskCard}
                    data-mission-task={task.id}
                    data-selected={selected ? "true" : "false"}
                    type="button"
                    aria-pressed={selected}
                    key={task.id}
                    onClick={() => onChoose(task.id)}
                  >
                    <span className={styles.taskOrder}>
                      {String(task.order).padStart(2, "0")}
                    </span>
                    <strong>{task.title}</strong>
                    <span className={styles.technicalTerm}>
                      {task.technicalTerm}
                    </span>
                    <p>{task.description}</p>
                    <span className={styles.taskMeta}>{task.modality}</span>
                    <span
                      className={styles.taskExamples}
                      data-mission-task-examples
                    >
                      <span>Examples</span>
                      <span className={styles.exampleList}>
                        {task.examples.map((example: string) => (
                          <span key={example}>{example}</span>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
