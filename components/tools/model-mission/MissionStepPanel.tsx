import {
  ConfigurationField,
  type GeneratorField,
} from "@/components/tools/ml-generator/ConfigurationField";
import { type LoadedMlRecipe } from "@/lib/hooks/useMlGeneratorRecipe";
import { getRecipeFieldOptions } from "@/lib/tools/ml-generator/engine";
import {
  getMissionControl,
  getMissionControls,
} from "@/lib/tools/ml-generator/model-mission/control-registry";
import {
  getMissionRecommendation,
} from "@/lib/tools/ml-generator/model-mission/recommendations";

import { MissionControlRenderer } from "./MissionControlRenderer";
import { MissionExplanation } from "./MissionExplanation";
import { MissionField } from "./MissionField";
import { TaskChooser } from "./TaskChooser";
import styles from "./ModelMission.module.css";

type Project = {
  taskId: string;
  learningLevel: string;
  data: Record<string, unknown>;
  inspection: Record<string, unknown>;
  split: Record<string, unknown>;
  preparation: Record<string, unknown>;
  model: Record<string, unknown>;
  training: Record<string, unknown>;
  evaluation: Record<string, unknown>;
  output: Record<string, unknown>;
};

type ProjectSection = Exclude<
  keyof Project,
  "taskId" | "learningLevel"
>;

type MissionTask = {
  id: string;
  title: string;
  technicalTerm: string;
  description: string;
  adapterId: string;
  recipeId: string | null;
};

type MissionStepPanelProps = {
  task: MissionTask;
  stepId: string;
  project: Project;
  legacyRecipe: LoadedMlRecipe | null;
  legacyConfig: Record<string, unknown>;
  visibleLegacyFields: GeneratorField[];
  dispatch: (action: { type: string; [key: string]: unknown }) => void;
  patchLegacyField: (fieldId: string, value: unknown) => void;
};

const STEP_COPY: Record<string, { title: string; description: string }> = {
  goal: { title: "What do you want the model to do?", description: "Start with the prediction you need. The technical name stays visible so you learn the vocabulary while building." },
  data: { title: "Choose the data source", description: "Use a learning dataset or point the generated script at your own files." },
  inspect: { title: "Decide what to inspect", description: "Understand columns, shapes, missing values, and targets before training." },
  split: { title: "Protect the final test", description: "Choose how much data trains, tunes, and honestly tests the model." },
  prepare: { title: "Prepare data for the algorithm", description: "Handle missing values, scaling, categories, imbalance, or task-specific transforms." },
  model: { title: "Choose and shape the model", description: "Begin with a readable baseline, then expose the parameters that change model behavior." },
  train: { title: "Configure learning", description: "Set repeatable training values such as seed, epochs, batch size, and learning rate." },
  evaluate: { title: "Choose evidence that matches the goal", description: "The generated script reports task-compatible metrics and keeps the test set separate." },
  generate: { title: "Review the mission", description: "Your complete Python script updates in the code workspace as every decision changes." },
};

function lessonFor(stepId: string) {
  if (stepId === "inspect") return "Use the displayed controls to inspect the data before making model choices.";
  if (stepId === "evaluate") return "The generated script reports task-compatible metrics while preserving the final test set.";
  if (stepId === "generate") return "Review the project summary in the Python workspace, then copy or download the script.";
  return "This workflow uses safe defaults for this step.";
}

export function MissionStepPanel({
  task,
  stepId,
  project,
  legacyRecipe,
  legacyConfig,
  visibleLegacyFields,
  dispatch,
  patchLegacyField,
}: MissionStepPanelProps) {
  const copy = STEP_COPY[stepId] ?? STEP_COPY.goal;
  const controls = getMissionControls({
    taskId: task.id,
    stepId,
    learningLevel: project.learningLevel,
    project,
  });

  const renderMissionControl = (control: (typeof controls)[number]) => {
    const recommendation = getMissionRecommendation(control.id, project);
    const configKey = control.configKey ?? control.id;
    const section = control.section as ProjectSection;
    const value = project[section][configKey]
      ?? control.defaultValue;

    if (control.readOnly) {
      return (
        <div
          key={`${control.section}:${control.id}`}
          data-control-id={control.id}
          data-control-level={control.level}
          className={styles.readOnlyControl}
        >
          <div className={styles.fieldHeading}>
            <label htmlFor={control.id}>{control.label}</label>
            <span>{control.technicalTerm ?? control.id}</span>
          </div>
          <input
            id={control.id}
            name={control.id}
            readOnly
            aria-describedby={`${control.id}-help ${control.id}-readonly`}
            value={value === true ? "Always on" : String(value)}
          />
          <small id={`${control.id}-help`}>{control.shortHelp}</small>
          <small id={`${control.id}-readonly`}>
            {control.readOnlyReason}
          </small>
          <MissionExplanation
            id={control.id}
            explanation={control.explanation}
          />
        </div>
      );
    }

    return (
      <MissionControlRenderer
        key={`${control.section}:${control.id}`}
        control={control}
        project={project}
        dispatch={dispatch}
        recommendation={recommendation}
      />
    );
  };

  const renderLegacyFields = () => {
    if (!legacyRecipe) {
      return <div className={styles.loadingBox} role="status">Loading the configuration for {task.technicalTerm}…</div>;
    }
    const controlsById = new Map(
      controls.map((control) => [control.id, control]),
    );
    const fields = visibleLegacyFields.filter((field) =>
      controlsById.has(field.id),
    );
    if (fields.length === 0) return <div className={styles.lessonBox}><strong>No syntax choices are required here.</strong><p>{lessonFor(stepId)}</p></div>;

    return (
      <div className={styles.fieldGrid} data-learning-level={project.learningLevel}>
        {fields.map((field) => {
          const control = controlsById.get(field.id)!;
          return (
            <div
              key={field.id}
              data-control-id={field.id}
              data-control-level={control.level}
            >
              <ConfigurationField
                templateId={legacyRecipe.id}
                field={field}
                value={legacyConfig[field.id]}
                rawNumericValue={field.inputType === "number" ? String(legacyConfig[field.id] ?? "") : undefined}
                options={getRecipeFieldOptions(legacyRecipe, field.id, legacyConfig, project.learningLevel === "guided" ? "starter" : "production")}
                onValueChange={patchLegacyField}
                onRawNumericChange={(fieldId, value) => patchLegacyField(fieldId, value === "" ? 0 : Number(value))}
                onNumericCommit={() => {}}
              />
              <MissionExplanation id={field.id} explanation={control.explanation} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className={styles.stepPanel}>
      <header className={styles.stepHeader}>
        <span>{task.technicalTerm}</span>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </header>
      {stepId === "goal" ? (
        <TaskChooser
          selectedTaskId={project.taskId}
          onChoose={(taskId) => dispatch({ type: "choose-task", taskId })}
        />
      ) : task.adapterId === "legacy" ? renderLegacyFields() : controls.length > 0 ? (
        <div className={styles.fieldGrid} data-learning-level={project.learningLevel}>
          {controls.map(renderMissionControl)}
        </div>
      ) : (
        <div className={styles.lessonBox}><strong>Keep this decision intentional.</strong><p>{lessonFor(stepId)}</p></div>
      )}
    </section>
  );
}
