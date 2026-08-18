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
  const selectedTask = MODEL_MISSION_TASKS.find(
    (task) => task.id === selectedTaskId,
  ) ?? MODEL_MISSION_TASKS[0];

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
                  </button>
                );
              })}
          </div>
        </section>
      ))}

      <aside
        className={styles.selectedTaskDetail}
        data-selected-task-detail
        data-task-id={selectedTask.id}
        aria-live="polite"
      >
        <div>
          <span className={styles.selectedTaskLabel}>Selected mission</span>
          <strong>{selectedTask.technicalTerm}</strong>
          <p>{selectedTask.modality}</p>
        </div>
        <div className={styles.selectedTaskExamples}>
          <span>Try it with</span>
          <div className={styles.exampleList}>
            {selectedTask.examples.map((example: string) => (
              <span data-selected-task-example key={example}>
                {example}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
