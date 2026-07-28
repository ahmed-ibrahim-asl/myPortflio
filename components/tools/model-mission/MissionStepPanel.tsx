import {
  ConfigurationField,
  type GeneratorField,
} from "@/components/tools/ml-generator/ConfigurationField";
import {
  type LoadedMlRecipe,
} from "@/lib/hooks/useMlGeneratorRecipe";
import {
  getRecipeFieldOptions,
} from "@/lib/tools/ml-generator/engine";
import {
  CLASSICAL_DATASETS,
  CLASSICAL_MODELS,
} from "@/lib/tools/ml-generator/workbench/classical-generator";
import {
  NEURAL_PRESETS,
  normalizeNeuralConfig,
} from "@/lib/tools/ml-generator/workbench/neural-generator";

import { MissionField } from "./MissionField";
import { NeuralLayerEditor } from "./NeuralLayerEditor";
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
  dispatch: (action: {
    type: string;
    [key: string]: unknown;
  }) => void;
  patchLegacyField: (
    fieldId: string,
    value: unknown,
  ) => void;
};

const STEP_COPY: Record<string, {
  title: string;
  description: string;
}> = {
  goal: {
    title: "What do you want the model to do?",
    description:
      "Start with the prediction you need. The technical name stays visible so you learn the vocabulary while building.",
  },
  data: {
    title: "Choose the data source",
    description:
      "Use a learning dataset or point the generated script at your own files.",
  },
  inspect: {
    title: "Decide what to inspect",
    description:
      "Understand columns, shapes, missing values, and targets before training.",
  },
  split: {
    title: "Protect the final test",
    description:
      "Choose how much data trains, tunes, and honestly tests the model.",
  },
  prepare: {
    title: "Prepare data for the algorithm",
    description:
      "Handle missing values, scaling, categories, imbalance, or task-specific transforms.",
  },
  model: {
    title: "Choose and shape the model",
    description:
      "Begin with a readable baseline, then expose the parameters that change model behavior.",
  },
  train: {
    title: "Configure learning",
    description:
      "Set repeatable training values such as seed, epochs, batch size, and learning rate.",
  },
  evaluate: {
    title: "Choose evidence that matches the goal",
    description:
      "The generated script reports task-compatible metrics and keeps the test set separate.",
  },
  generate: {
    title: "Review the mission",
    description:
      "Your complete Python script updates in the code workspace as every decision changes.",
  },
};

function options(
  items: ReadonlyArray<{ id: string; label: string }>,
) {
  return items.map(({ id, label }) => ({
    value: id,
    label,
  }));
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
  const patch = (
    section: keyof Project,
    value: Record<string, unknown>,
  ) => dispatch({
    type: "patch-section",
    section,
    patch: value,
  });
  const isClassical = task.adapterId === "classical";
  const isNeural = task.adapterId === "neural";
  const classicalTask =
    task.id === "regression"
      ? "regression"
      : "classification";

  const renderLegacyFields = () => {
    if (!legacyRecipe) {
      return (
        <div className={styles.loadingBox} role="status">
          Loading the configuration for {task.technicalTerm}…
        </div>
      );
    }
    if (visibleLegacyFields.length === 0) {
      return (
        <div className={styles.lessonBox}>
          <strong>No syntax choices are required here.</strong>
          <p>
            This workflow handles the step with safe defaults. Continue
            to see the next decisions.
          </p>
        </div>
      );
    }
    return (
      <div className={styles.fieldGrid}>
        {visibleLegacyFields.map((field) => (
          <ConfigurationField
            key={field.id}
            templateId={legacyRecipe.id}
            field={field}
            value={legacyConfig[field.id]}
            rawNumericValue={
              field.inputType === "number"
                ? String(legacyConfig[field.id] ?? "")
                : undefined
            }
            options={getRecipeFieldOptions(
              legacyRecipe,
              field.id,
              legacyConfig,
              project.learningLevel === "guided"
                ? "starter"
                : "production",
            )}
            onValueChange={patchLegacyField}
            onRawNumericChange={(fieldId, value) =>
              patchLegacyField(
                fieldId,
                value === "" ? 0 : Number(value),
              )
            }
            onNumericCommit={() => {}}
          />
        ))}
      </div>
    );
  };

  const classicalContent = () => {
    if (stepId === "data") {
      const datasets = CLASSICAL_DATASETS[classicalTask];
      const selected = datasets.find(
        ({ id }) => id === project.data.dataset,
      ) ?? datasets[0];
      return (
        <>
          <div className={styles.fieldGrid}>
            <MissionField
              id="dataset"
              label="Learning dataset"
              help="Public datasets are bundled through scikit-learn; choose My CSV to use your own table."
              type="select"
              value={String(project.data.dataset ?? datasets[0].id)}
              options={options(datasets)}
              onChange={(dataset) => patch("data", { dataset })}
            />
            {project.data.dataset === "custom-csv" ? (
              <>
                <MissionField
                  id="dataPath"
                  label="CSV path"
                  help="A path relative to the generated Python script."
                  value={String(project.data.dataPath ?? "data/dataset.csv")}
                  onChange={(dataPath) => patch("data", { dataPath })}
                />
                <MissionField
                  id="targetColumn"
                  label="Target column"
                  help="The column the model should learn to predict."
                  value={String(project.data.targetColumn ?? "target")}
                  onChange={(targetColumn) => patch("data", { targetColumn })}
                />
              </>
            ) : null}
          </div>
          <div className={styles.datasetNote}>
            <strong>{selected.label}</strong>
            <span>{selected.difficulty} · {selected.source}</span>
            <p>{selected.lesson}</p>
            {selected.sourceUrl ? (
              <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open dataset source ↗
              </a>
            ) : null}
          </div>
        </>
      );
    }

    if (stepId === "inspect") {
      const toggles = [
        ["showHead", "Show first rows", "Preview values and confirm columns."],
        ["showShape", "Show rows and columns", "Check how much data is available."],
        ["showStatistics", "Describe numeric columns", "Inspect range, center, and spread."],
        ["showMissing", "Count missing values", "Find columns that need imputation."],
        ["showTarget", "Inspect the target", "See class counts or the numeric target distribution."],
      ];
      return (
        <div className={styles.toggleGrid}>
          {toggles.map(([id, label, help]) => (
            <MissionField
              key={id}
              id={id}
              label={label}
              help={help}
              type="toggle"
              value={Boolean(project.inspection[id])}
              onChange={(value) => patch(
                "inspection",
                { [id]: value },
              )}
            />
          ))}
        </div>
      );
    }

    if (stepId === "split") {
      const strategy = String(
        project.split.splitStrategy
        ?? "train-validation-test",
      );
      return (
        <>
          <div className={styles.fieldGrid}>
            <MissionField
              id="splitStrategy"
              label="Split plan"
              help="Validation helps tune choices without looking at the final test."
              type="select"
              value={strategy}
              options={[
                { value: "train-validation-test", label: "Train + validation + test" },
                { value: "train-test", label: "Train + test" },
              ]}
              onChange={(splitStrategy) => patch(
                "split",
                { splitStrategy },
              )}
            />
            <MissionField
              id="testRatio"
              label="Test ratio"
              help="Keep this untouched until the final evaluation."
              type="number"
              min={0.1}
              max={0.4}
              step={0.05}
              value={Number(project.split.testRatio ?? 0.15)}
              onChange={(testRatio) => patch("split", { testRatio })}
            />
            {strategy === "train-validation-test" ? (
              <MissionField
                id="validationRatio"
                label="Validation ratio"
                help="Used while comparing models and tuning settings."
                type="number"
                min={0.1}
                max={0.3}
                step={0.05}
                value={Number(project.split.validationRatio ?? 0.15)}
                onChange={(validationRatio) => patch(
                  "split",
                  { validationRatio },
                )}
              />
            ) : null}
          </div>
          {classicalTask === "classification" ? (
            <MissionField
              id="stratify"
              label="Preserve class ratios"
              help="Stratification keeps each class represented across splits."
              type="toggle"
              value={Boolean(project.split.stratify)}
              onChange={(stratify) => patch("split", { stratify })}
            />
          ) : null}
        </>
      );
    }

    if (stepId === "prepare") {
      return (
        <div className={styles.fieldGrid}>
          <MissionField
            id="numericImputer"
            label="Missing numeric values"
            help="Median is robust when numeric data has outliers."
            type="select"
            value={String(project.preparation.numericImputer ?? "median")}
            options={[
              { value: "mean", label: "Fill with mean" },
              { value: "median", label: "Fill with median" },
              { value: "most_frequent", label: "Use most frequent" },
              { value: "constant", label: "Use a constant" },
            ]}
            onChange={(numericImputer) => patch(
              "preparation",
              { numericImputer },
            )}
          />
          <MissionField
            id="scaling"
            label="Feature scaling"
            help="Scaling matters for linear, distance, and kernel models."
            type="select"
            value={String(project.preparation.scaling ?? "standard")}
            options={[
              { value: "none", label: "No scaling" },
              { value: "standard", label: "Standard scaler" },
              { value: "robust", label: "Robust scaler" },
              { value: "minmax", label: "Min-max scaler" },
            ]}
            onChange={(scaling) => patch("preparation", { scaling })}
          />
          <MissionField
            id="encoding"
            label="Category encoding"
            help="Convert text categories into numbers the model can use."
            type="select"
            value={String(project.preparation.encoding ?? "onehot")}
            options={[
              { value: "onehot", label: "One-hot encoding" },
              { value: "ordinal", label: "Ordinal encoding" },
            ]}
            onChange={(encoding) => patch("preparation", { encoding })}
          />
          {classicalTask === "classification" ? (
            <MissionField
              id="balance"
              label="Class imbalance"
              help="SMOTE creates training-only synthetic minority examples; class weights change error cost."
              type="select"
              value={String(project.preparation.balance ?? "none")}
              options={[
                { value: "none", label: "No balancing" },
                { value: "class-weight", label: "Balanced class weights" },
                { value: "smote", label: "SMOTE oversampling" },
              ]}
              onChange={(balance) => patch(
                "preparation",
                { balance },
              )}
            />
          ) : null}
        </div>
      );
    }

    if (stepId === "model") {
      return (
        <div className={styles.modelGrid}>
          {CLASSICAL_MODELS[classicalTask].map((model) => {
            const selected = model.id === project.model.model;
            return (
              <button
                type="button"
                key={model.id}
                data-model-id={model.id}
                data-selected={selected ? "true" : "false"}
                aria-pressed={selected}
                onClick={() => patch("model", {
                  model: model.id,
                })}
              >
                <span>{model.family}</span>
                <strong>{model.label}</strong>
                <p>{model.description}</p>
              </button>
            );
          })}
        </div>
      );
    }

    if (stepId === "train") {
      const selectedModel = String(project.model.model);
      return (
        <div className={styles.fieldGrid}>
          <MissionField
            id="randomSeed"
            label="Random seed"
            help="Use the same seed to reproduce the same split and model randomness."
            type="number"
            min={0}
            max={999999}
            step={1}
            value={Number(project.training.randomSeed ?? 42)}
            onChange={(randomSeed) => patch("training", { randomSeed })}
          />
          {selectedModel.includes("forest") ? (
            <>
              <MissionField
                id="nEstimators"
                label="Number of trees"
                help="More trees are usually more stable but take longer."
                type="number"
                min={10}
                max={2000}
                step={10}
                value={Number(project.training.nEstimators ?? 200)}
                onChange={(nEstimators) => patch(
                  "training",
                  { nEstimators },
                )}
              />
              <MissionField
                id="maxDepth"
                label="Maximum depth"
                help="Lower depth reduces complexity and overfitting."
                type="number"
                min={1}
                max={100}
                step={1}
                value={Number(project.model.maxDepth ?? 8)}
                onChange={(maxDepth) => patch("model", { maxDepth })}
              />
            </>
          ) : null}
          {["ridge", "lasso", "elastic-net"].includes(selectedModel) ? (
            <MissionField
              id="alpha"
              label="Regularization strength"
              help="Higher alpha constrains coefficients more strongly."
              type="number"
              min={0.0001}
              max={1000}
              step={0.1}
              value={Number(project.model.alpha ?? 1)}
              onChange={(alpha) => patch("model", { alpha })}
            />
          ) : null}
          {selectedModel.includes("gradient") ? (
            <MissionField
              id="learningRate"
              label="Learning rate"
              help="Smaller steps often need more estimators."
              type="number"
              min={0.001}
              max={1}
              step={0.01}
              value={Number(project.training.learningRate ?? 0.05)}
              onChange={(learningRate) => patch(
                "training",
                { learningRate },
              )}
            />
          ) : null}
        </div>
      );
    }

    if (stepId === "evaluate") {
      return (
        <div className={styles.lessonGrid}>
          {(classicalTask === "classification"
            ? [
                ["Accuracy", "Overall correct predictions; useful when classes are balanced."],
                ["Balanced accuracy", "Gives each class equal importance when counts differ."],
                ["F1 and report", "Shows precision and recall for every class."],
              ]
            : [
                ["MAE", "Average absolute error in the target’s original unit."],
                ["RMSE", "Penalizes large prediction errors more strongly."],
                ["R²", "Shows how much target variation the model explains."],
              ]
          ).map(([title, description]) => (
            <div className={styles.lessonBox} key={title}>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.summaryGrid}>
        <div>
          <span>Problem</span>
          <strong>{task.technicalTerm}</strong>
        </div>
        <div>
          <span>Dataset</span>
          <strong>{String(project.data.dataset)}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{String(project.model.model)}</strong>
        </div>
        <div>
          <span>Split</span>
          <strong>{String(project.split.splitStrategy)}</strong>
        </div>
      </div>
    );
  };

  const neuralContent = () => {
    const normalized = normalizeNeuralConfig({
      ...project.model,
      ...project.training,
    }) as {
      framework: string;
      preset: string;
      task: string;
      inputShape: number[];
      numClasses: number;
      layers: Array<Record<string, unknown>>;
      epochs: number;
      batchSize: number;
      learningRate: number;
    };

    if (stepId === "data") {
      return (
        <div className={styles.fieldGrid}>
          <MissionField
            id="inputShape"
            label="Input shape"
            help="Comma-separated dimensions without the batch: features, time × channels, or height × width × channels."
            value={normalized.inputShape.join(", ")}
            onChange={(value) => {
              const inputShape = String(value)
                .split(",")
                .map((item) => Number(item.trim()))
                .filter((item) => Number.isFinite(item) && item > 0);
              if (inputShape.length > 0) {
                patch("model", { inputShape });
              }
            }}
          />
          <MissionField
            id="numClasses"
            label="Number of classes"
            help="Use two for binary classification. Regression presets create one numeric output."
            type="number"
            min={2}
            max={100000}
            step={1}
            value={normalized.numClasses}
            onChange={(numClasses) => patch("model", { numClasses })}
          />
        </div>
      );
    }

    if (stepId === "inspect") {
      return (
        <div className={styles.lessonGrid}>
          <div className={styles.lessonBox}>
            <strong>Current tensor</strong>
            <p>[{normalized.inputShape.join(", ")}] before the batch dimension.</p>
          </div>
          <div className={styles.lessonBox}>
            <strong>Shape rule</strong>
            <p>Every layer must accept the output shape of the layer before it.</p>
          </div>
        </div>
      );
    }

    if (stepId === "split") {
      return (
        <div className={styles.lessonBox}>
          <strong>Generated loader contract</strong>
          <p>
            Keep train, validation, and test sets separate. The generated
            architecture leaves clear connection points for your chosen
            dataset loader.
          </p>
        </div>
      );
    }

    if (stepId === "prepare") {
      return (
        <div className={styles.fieldGrid}>
          <MissionField
            id="framework"
            label="Python framework"
            help="The same conceptual design translates to either framework."
            type="select"
            value={normalized.framework}
            options={[
              { value: "keras", label: "Keras / TensorFlow" },
              { value: "pytorch", label: "PyTorch" },
            ]}
            onChange={(framework) => patch("model", { framework })}
          />
          <MissionField
            id="preset"
            label="Starting architecture"
            help="A preset gives compatible shapes; you can edit every layer next."
            type="select"
            value={normalized.preset}
            options={options(NEURAL_PRESETS)}
            onChange={(presetId) => {
              const preset = NEURAL_PRESETS.find(
                ({ id }) => id === presetId,
              ) ?? NEURAL_PRESETS[0];
              patch("model", {
                preset: preset.id,
                task: preset.task,
                inputShape: [...preset.inputShape],
                layers: preset.layers.map((layer) => ({ ...layer })),
              });
            }}
          />
        </div>
      );
    }

    if (stepId === "model") {
      return (
        <NeuralLayerEditor
          model={project.model}
          training={project.training}
          onChange={(layers) => patch("model", { layers })}
        />
      );
    }

    if (stepId === "train") {
      return (
        <div className={styles.fieldGrid}>
          <MissionField
            id="epochs"
            label="Epochs"
            help="One epoch is one complete pass through the training data."
            type="number"
            min={1}
            max={100000}
            step={1}
            value={normalized.epochs}
            onChange={(epochs) => patch("training", { epochs })}
          />
          <MissionField
            id="batchSize"
            label="Batch size"
            help="Examples processed before one optimizer update."
            type="number"
            min={1}
            max={65536}
            step={1}
            value={normalized.batchSize}
            onChange={(batchSize) => patch("training", { batchSize })}
          />
          <MissionField
            id="learningRate"
            label="Learning rate"
            help="Controls the size of every optimizer update."
            type="number"
            min={0.0000001}
            max={10}
            step={0.0001}
            value={normalized.learningRate}
            onChange={(learningRate) => patch(
              "training",
              { learningRate },
            )}
          />
        </div>
      );
    }

    if (stepId === "evaluate") {
      return (
        <div className={styles.lessonGrid}>
          <div className={styles.lessonBox}>
            <strong>Loss</strong>
            <p>The generator chooses a compatible classification or regression loss.</p>
          </div>
          <div className={styles.lessonBox}>
            <strong>Validation</strong>
            <p>Early stopping watches validation loss and restores the best weights.</p>
          </div>
          <div className={styles.lessonBox}>
            <strong>Final test</strong>
            <p>Evaluate once after architecture and training choices are settled.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.summaryGrid}>
        <div><span>Framework</span><strong>{normalized.framework}</strong></div>
        <div><span>Preset</span><strong>{normalized.preset}</strong></div>
        <div><span>Layers</span><strong>{normalized.layers.length}</strong></div>
        <div><span>Input</span><strong>[{normalized.inputShape.join(", ")}]</strong></div>
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
          onChoose={(taskId) => dispatch({
            type: "choose-task",
            taskId,
          })}
        />
      ) : isClassical
        ? classicalContent()
        : isNeural
          ? neuralContent()
          : renderLegacyFields()}
    </section>
  );
}
