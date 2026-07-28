import {
  CLASSICAL_DATASETS,
  CLASSICAL_MODELS,
} from "@/lib/tools/ml-generator/workbench/classical-generator";
import { NEURAL_PRESETS } from "@/lib/tools/ml-generator/workbench/neural-generator";

import { MissionExplanation } from "./MissionExplanation";
import { MissionField } from "./MissionField";
import { MissionRecommendation } from "./MissionRecommendation";
import { NeuralLayerEditor } from "./NeuralLayerEditor";
import styles from "./ModelMission.module.css";

type MissionControl = {
  id: string;
  configKey?: string;
  section: "data" | "inspection" | "split" | "preparation" | "model" | "training" | "evaluation" | "output";
  level: string;
  label: string;
  controlType: string;
  defaultValue: string | number | boolean | string[] | null;
  shortHelp: string;
  explanation: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect: string;
  };
  disabledReason?: string;
};

type Project = {
  taskId: string;
  data: Record<string, unknown>;
  inspection: Record<string, unknown>;
  split: Record<string, unknown>;
  preparation: Record<string, unknown>;
  model: Record<string, unknown>;
  training: Record<string, unknown>;
  evaluation: Record<string, unknown>;
  output: Record<string, unknown>;
};

type MissionControlRendererProps = {
  control: MissionControl;
  project: Project;
  dispatch: (action: { type: string; [key: string]: unknown }) => void;
  recommendation: {
    recommendedValue: string;
    label: string;
    reason: string;
  } | null;
};

function selectOptions(control: MissionControl, taskId: string) {
  const classicalTask = taskId === "regression" ? "regression" : "classification";
  const options = (items: ReadonlyArray<{ id: string; label: string }>) =>
    items.map(({ id, label }) => ({ value: id, label }));

  if (control.id === "dataset") return options(CLASSICAL_DATASETS[classicalTask]);
  if (control.id === "splitStrategy") {
    return [
      { value: "train-validation-test", label: "Train + validation + test" },
      { value: "train-test", label: "Train + test" },
      { value: "random", label: "Random train + test" },
      { value: "group", label: "Group-aware train + test" },
      { value: "time", label: "Chronological train + test" },
      { value: "cross-validation", label: "Cross-validation + test" },
    ];
  }
  if (control.id === "numericImputer") {
    return ["mean", "median", "most_frequent", "constant"].map((value) => ({
      value,
      label: value.replace("_", " "),
    }));
  }
  if (control.id === "categoricalImputer") {
    return ["most_frequent", "constant"].map((value) => ({
      value,
      label: value.replace("_", " "),
    }));
  }
  if (control.id === "scaling") return ["none", "standard", "robust", "minmax", "maxabs", "power", "quantile"].map((value) => ({ value, label: value }));
  if (control.id === "encoding") return ["onehot", "ordinal"].map((value) => ({ value, label: value }));
  if (control.id === "balance") return ["none", "class-weight", "smote"].map((value) => ({ value, label: value }));
  if (control.id === "searchStrategy") return [
    { value: "none", label: "No parameter search" },
    { value: "randomized", label: "Randomized search" },
  ];
  if (control.id === "calibration") return [
    { value: "none", label: "No calibration" },
    { value: "sigmoid", label: "Sigmoid calibration" },
    { value: "isotonic", label: "Isotonic calibration" },
  ];
  if (control.id === "framework") {
    return [
      { value: "keras", label: "Keras / TensorFlow" },
      { value: "pytorch", label: "PyTorch" },
    ];
  }
  if (control.id === "preset") return options(NEURAL_PRESETS);
  return [];
}

function numericBounds(id: string) {
  const bounds: Record<string, [number, number, number]> = {
    testRatio: [0.1, 0.4, 0.05],
    validationRatio: [0.1, 0.3, 0.05],
    randomSeed: [0, 999999, 1],
    nEstimators: [10, 2000, 10],
    maxDepth: [1, 100, 1],
    alpha: [0.0001, 1000, 0.1],
    learningRate: [0.001, 1, 0.01],
    numClasses: [2, 100000, 1],
    epochs: [1, 100000, 1],
    batchSize: [1, 65536, 1],
    neuralLearningRate: [0.0000001, 10, 0.0001],
    cvFolds: [2, 10, 1],
    decisionThreshold: [0.01, 0.99, 0.01],
  };
  return bounds[id];
}

export function MissionControlRenderer({
  control,
  project,
  dispatch,
  recommendation,
}: MissionControlRendererProps) {
  const configKey = control.configKey ?? control.id;
  const section = project[control.section];
  const value = section[configKey] ?? control.defaultValue;
  const disabled = Boolean(control.disabledReason);
  const patch = (nextValue: string | number | boolean) => dispatch({
    type: "patch-section",
    section: control.section,
    patch: { [configKey]: nextValue },
  });
  const bounds = numericBounds(control.id);

  if (control.controlType === "neural-layers") {
    return (
      <div data-control-id={control.id} data-control-level={control.level}>
        <div className={styles.controlMeta}>
          <span>{control.id}</span>
          {recommendation ? <span className={styles.recommendedBadge}>Recommended</span> : null}
        </div>
        <NeuralLayerEditor
          model={project.model}
          training={project.training}
          onChange={(layers) => dispatch({
            type: "patch-section",
            section: "model",
            patch: { layers },
          })}
        />
        <MissionRecommendation recommendation={recommendation} />
        <MissionExplanation id={control.id} explanation={control.explanation} />
      </div>
    );
  }

  if (control.id === "model") {
    const taskKind = project.taskId === "regression" ? "regression" : "classification";
    return (
      <div data-control-id={control.id} data-control-level={control.level}>
        <div className={styles.modelGrid}>
          {CLASSICAL_MODELS[taskKind].map((model) => {
            const selected = model.id === value;
            return (
              <button
                type="button"
                key={model.id}
                data-model-id={model.id}
                data-selected={selected ? "true" : "false"}
                aria-pressed={selected}
                onClick={() => patch(model.id)}
              >
                <span>{model.family}</span>
                <strong>{model.label}</strong>
                <p>{model.description}</p>
              </button>
            );
          })}
        </div>
        <MissionRecommendation recommendation={recommendation} />
        <MissionExplanation id={control.id} explanation={control.explanation} />
      </div>
    );
  }

  const fieldValue = control.id === "inputShape" && Array.isArray(value)
    ? value.join(", ")
    : value === null ? "" : value as string | number | boolean;
  return (
    <div data-control-id={control.id} data-control-level={control.level}>
      <MissionField
        id={control.id}
        label={control.label}
        technicalTerm={control.id}
        help={control.shortHelp}
        type={control.controlType as "text" | "number" | "select" | "toggle"}
        value={fieldValue}
        options={selectOptions(control, project.taskId)}
        min={bounds?.[0]}
        max={bounds?.[1]}
        step={bounds?.[2]}
        disabled={disabled}
        disabledReason={control.disabledReason}
        recommended={Boolean(recommendation)}
        explanation={control.explanation}
        onChange={(nextValue) => {
          if (control.id === "inputShape") {
            const inputShape = String(nextValue)
              .split(",")
              .map((item) => Number(item.trim()))
              .filter((item) => Number.isFinite(item) && item > 0);
            if (inputShape.length > 0) {
              dispatch({
                type: "patch-section",
                section: "model",
                patch: { inputShape },
              });
            }
            return;
          }
          if (control.id === "preset") {
            const preset = NEURAL_PRESETS.find(({ id }) => id === nextValue) ?? NEURAL_PRESETS[0];
            dispatch({
              type: "patch-section",
              section: "model",
              patch: {
                preset: preset.id,
                task: preset.task,
                inputShape: [...preset.inputShape],
                layers: preset.layers.map((layer) => ({ ...layer })),
              },
            });
            return;
          }
          patch(nextValue);
        }}
      />
      <MissionRecommendation recommendation={recommendation} />
    </div>
  );
}
