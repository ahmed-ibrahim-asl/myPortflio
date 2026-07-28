# Model Mission Learning Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Model Mission into a progressive, registry-driven ML learning builder with truthful advanced controls, complete neural training, model-aware feature scaling, and downloadable starter projects.

**Architecture:** Keep one versioned `ProjectConfig` and one nine-step builder. Add a serializable control registry that owns disclosure level, explanations, compatibility, validation, and recommendations; keep generator adapters pure and deterministic. Extend the shared result contract so a local project-bundle service can produce documented ZIP archives without a server or LLM.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 6, JavaScript ES modules, Node test runner, deterministic Python template generation, browser `Blob` downloads, dependency-free stored ZIP encoding.

## Global Constraints

- Preserve the public route `/tools/ai-script-generator/`.
- Preserve the Model Mission name and tagline.
- Keep the workflow order: Goal, Data, Inspect, Split, Prepare, Model, Train, Evaluate, Generate.
- Guided, Customize, and Advanced share one project state and never delete hidden values.
- Guided exposes essentials, Customize exposes common tuning, and Advanced exposes specialist research and production controls.
- Every important control explains what it is, why it matters, when to use it, when to avoid it, its trade-off, and its generated-code effect.
- Keep flat site colors, square corners, hard borders, and existing font variables.
- Do not add gradients, glass effects, or blurred decorative backgrounds.
- Do not add an LLM dependency or server-side arbitrary code execution.
- Generate deterministic output for a resolved configuration.
- Fit learned preprocessing only on training data.
- Keep resampling inside the training pipeline.
- Keep validation and final-test semantics visibly distinct.
- Keep page width equal to viewport width at 320, 360, 390, 768, 900, 1024, and 1440-pixel widths.
- Preserve user changes outside Model Mission files.
- The current checkout contains required untracked workbench files and modified package files; execution must not assume `HEAD` alone is a complete Next.js baseline.

---

## File Structure

### Shared configuration and teaching metadata

- Create `lib/tools/ml-generator/model-mission/control-registry.js` — registry validation, level visibility, compatibility, and control lookup.
- Create `lib/tools/ml-generator/model-mission/control-definitions.js` — shared, classical, neural, sensor, image, and YOLO control records.
- Create `lib/tools/ml-generator/model-mission/recommendations.js` — deterministic model-aware recommendations.
- Modify `lib/tools/ml-generator/model-mission/catalog.js` — task metadata and legacy-field level mapping only.
- Modify `lib/tools/ml-generator/model-mission/state.js` — defaults for new fields while preserving values across levels.
- Modify `lib/tools/ml-generator/workbench/project-config-migrations.js` — schema version 2 migration.
- Modify `lib/tools/ml-generator/workbench/types.ts` — typed learning, split, preprocessing, training, and output sections.

### Builder UI

- Create `components/tools/model-mission/MissionExplanation.tsx` — accessible expanded teaching content.
- Create `components/tools/model-mission/MissionRecommendation.tsx` — recommended-choice and incompatibility message.
- Create `components/tools/model-mission/MissionControlRenderer.tsx` — registry-driven project-section field renderer.
- Modify `components/tools/model-mission/MissionField.tsx` — technical term, badges, disabled reason, error, and explanation slot.
- Modify `components/tools/model-mission/MissionStepPanel.tsx` — compose registry controls and specialized layer editor; remove duplicated hardcoded controls.
- Modify `components/tools/model-mission/ModelMissionShell.tsx` — level summaries and project-download action.
- Modify `components/tools/model-mission/MissionCodePanel.tsx` — separate Python and project downloads, versioned dependencies.
- Modify `components/tools/model-mission/NeuralLayerEditor.tsx` — advanced layer parameters with shape-safe updates.
- Modify `components/tools/model-mission/ModelMission.module.css` — responsive explanation, recommendation, grouped-control, and action styles.

### Generators

- Modify `lib/tools/ml-generator/workbench/classical-generator.js` — advanced scalers, split strategies, search, calibration, thresholds, and task-specific artifact names.
- Modify `lib/tools/ml-generator/recipes/applied/yolo-shared.js` — explicit optimizer behavior and separate validation/prediction confidence.
- Modify `lib/tools/ml-generator/workbench/neural-generator.js` — real data loading, training, validation, test evaluation, saving, and inference for Keras and PyTorch.
- Modify `lib/tools/ml-generator/model-mission/adapters.js` — pass all project sections and preserve structured dependencies and resolved configuration.

### Project export

- Create `lib/tools/ml-generator/model-mission/project-bundle.js` — README, requirements, config, train, predict, data guide, test, and `.gitignore` file map.
- Create `lib/tools/ml-generator/model-mission/stored-zip.js` — CRC32 and ZIP “store” writer returning `Uint8Array`.

### Tests

- Create `tests/tools/model-mission-control-registry.test.js`.
- Create `tests/tools/model-mission-recommendations.test.js`.
- Create `tests/tools/model-mission-project-bundle.test.js`.
- Create `tests/tools/model-mission-stored-zip.test.js`.
- Modify `tests/tools/model-mission-catalog.test.js`.
- Modify `tests/tools/model-mission-state.test.js`.
- Modify `tests/tools/model-mission-adapters.test.js`.
- Modify `tests/tools/model-mission-live-route.test.js`.
- Modify `tests/tools/model-mission-responsive.test.js`.
- Modify `tests/tools/model-mission-style.test.js`.
- Modify `tests/tools/model-mission-generated-code.test.js`.
- Modify `tests/tools/ml-classical-generator-v2.test.js`.
- Modify `tests/tools/ml-neural-generator.test.js`.
- Modify `tests/tools/ml-generator-parity.test.js`.

---

### Task 1: Version the project configuration and introduce the control registry

**Files:**
- Create: `lib/tools/ml-generator/model-mission/control-registry.js`
- Create: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `lib/tools/ml-generator/workbench/project-config-migrations.js`
- Modify: `lib/tools/ml-generator/workbench/types.ts`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Test: `tests/tools/model-mission-control-registry.test.js`
- Test: `tests/tools/ml-project-config-hardening.test.js`

**Interfaces:**
- Produces: `LEARNING_LEVEL_RANK: Readonly<Record<string, number>>`
- Produces: `MODEL_MISSION_CONTROLS: readonly MissionControl[]`
- Produces: `getMissionControls({ taskId, stepId, learningLevel, project }): MissionControlState[]`
- Produces: `getMissionControl(controlId): MissionControl | null`
- Produces: `validateMissionControlRegistry(): string[]`
- Produces: `CURRENT_PROJECT_CONFIG_VERSION = 2`
- Consumes: existing task IDs and workflow step IDs from `catalog.js`

- [ ] **Step 1: Write failing registry and migration tests**

```js
test("control registry is valid and levels are cumulative", () => {
  assert.deepEqual(validateMissionControlRegistry(), []);

  const project = createProjectForTask("classification");
  const guided = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "guided",
    project,
  });
  const customize = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "customize",
    project,
  });
  const advanced = getMissionControls({
    taskId: "classification",
    stepId: "prepare",
    learningLevel: "advanced",
    project,
  });

  assert.ok(guided.some(({ id }) => id === "scaling"));
  assert.ok(customize.length > guided.length);
  assert.ok(advanced.length > customize.length);
  assert.ok(guided.every(({ id }) => customize.some((item) => item.id === id)));
  assert.ok(customize.every(({ id }) => advanced.some((item) => item.id === id)));
});

test("version one projects migrate to version two without losing sections", () => {
  const migrated = migrateProjectConfig({
    schemaVersion: 1,
    taskId: "classification",
    learningLevel: "advanced",
    preparation: { scaling: "robust" },
  });

  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.preparation.scaling, "robust");
  assert.equal(migrated.output.projectName, "model-mission-project");
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
node --test tests/tools/model-mission-control-registry.test.js tests/tools/ml-project-config-hardening.test.js
```

Expected: FAIL because the registry exports and schema version 2 do not exist.

- [ ] **Step 3: Add schema version 2 and the registry contract**

Implement the migration:

```js
export const CURRENT_PROJECT_CONFIG_VERSION = 2;

const PROJECT_CONFIG_MIGRATIONS = Object.freeze({
  0(config) {
    return {
      ...config,
      schemaVersion: 1,
      learningLevel:
        typeof config.learningLevel === "string"
          ? config.learningLevel
          : "guided",
    };
  },
  1(config) {
    return {
      ...config,
      schemaVersion: 2,
      output: {
        projectName: "model-mission-project",
        artifactDirectory: "artifacts",
        ...(config.output ?? {}),
      },
    };
  },
});
```

Implement the level gate:

```js
export const LEARNING_LEVEL_RANK = Object.freeze({
  guided: 0,
  customize: 1,
  advanced: 2,
});

export function getMissionControls({
  taskId,
  stepId,
  learningLevel,
  project,
}) {
  const rank = LEARNING_LEVEL_RANK[learningLevel] ?? 0;
  return MODEL_MISSION_CONTROLS
    .filter((control) =>
      control.taskIds.includes(taskId)
      && control.step === stepId
      && LEARNING_LEVEL_RANK[control.level] <= rank
    )
    .filter((control) =>
      control.visibleWhen
        ? evaluateRule(control.visibleWhen, project)
        : true
    )
    .map((control) => ({
      ...control,
      disabledReason:
        control.enabledWhen
        && !evaluateRule(control.enabledWhen, project)
          ? control.enabledWhen.reason
          : "",
    }));
}
```

Every record must include `id`, `taskIds`, `section`, `step`, `level`, `label`,
`controlType`, `defaultValue`, `shortHelp`, and all required explanation keys.
Registry validation must reject duplicate `(taskId, section, id)` combinations,
invalid levels, invalid steps, and missing explanation content.

- [ ] **Step 4: Run focused tests and full configuration tests**

Run:

```powershell
node --test tests/tools/model-mission-control-registry.test.js tests/tools/ml-project-config-hardening.test.js tests/tools/ml-project-config.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/control-registry.js lib/tools/ml-generator/model-mission/control-definitions.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/workbench/project-config-migrations.js lib/tools/ml-generator/workbench/types.ts tests/tools/model-mission-control-registry.test.js tests/tools/ml-project-config-hardening.test.js
git commit -m "feat: register progressive Model Mission controls"
```

---

### Task 2: Render genuinely different levels with accessible explanations

**Files:**
- Create: `components/tools/model-mission/MissionExplanation.tsx`
- Create: `components/tools/model-mission/MissionRecommendation.tsx`
- Create: `components/tools/model-mission/MissionControlRenderer.tsx`
- Modify: `components/tools/model-mission/MissionField.tsx`
- Modify: `components/tools/model-mission/MissionStepPanel.tsx`
- Modify: `components/tools/model-mission/ModelMissionShell.tsx`
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `tests/tools/model-mission-live-route.test.js`
- Modify: `tests/tools/model-mission-responsive.test.js`
- Modify: `tests/tools/model-mission-style.test.js`

**Interfaces:**
- Consumes: `getMissionControls(...)` from Task 1
- Produces: `MissionExplanation({ id, explanation })`
- Produces: `MissionControlRenderer({ control, project, dispatch, recommendation })`
- Produces: `data-control-level`, `data-control-id`, and `data-learning-level` DOM hooks

- [ ] **Step 1: Add failing route assertions**

Add source and browser assertions that:

```js
assert.match(stepPanelSource, /getMissionControls/);
assert.match(stepPanelSource, /MissionControlRenderer/);
assert.match(fieldSource, /Learn this choice/);
assert.match(fieldSource, /aria-expanded/);
assert.match(shellSource, /data-learning-level/);
```

In the responsive browser test, count visible `[data-control-level]` elements
for one classical task and assert:

```js
assert.ok(customizeCount > guidedCount);
assert.ok(advancedCount > customizeCount);
```

Also set an Advanced-only value, switch to Guided and back to Advanced, and
assert that its input value is unchanged.

- [ ] **Step 2: Run the route and responsive tests and verify failure**

Run:

```powershell
npm run test:ml:model-mission
```

Expected: FAIL because the new components and DOM contracts do not exist.

- [ ] **Step 3: Implement the explanation component**

Use a real button and controlled content:

```tsx
export function MissionExplanation({
  id,
  explanation,
}: MissionExplanationProps) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-explanation`;

  return (
    <div className={styles.explanation}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide explanation" : "Learn this choice"}
      </button>
      {open ? (
        <div id={panelId} className={styles.explanationBody}>
          <p><strong>What it is:</strong> {explanation.what}</p>
          <p><strong>Why it matters:</strong> {explanation.why}</p>
          <p><strong>Use it when:</strong> {explanation.useWhen}</p>
          {explanation.avoidWhen ? (
            <p><strong>Avoid it when:</strong> {explanation.avoidWhen}</p>
          ) : null}
          {explanation.tradeoff ? (
            <p><strong>Trade-off:</strong> {explanation.tradeoff}</p>
          ) : null}
          <p><strong>Python effect:</strong> {explanation.codeEffect}</p>
        </div>
      ) : null}
    </div>
  );
}
```

`MissionField` must expose the technical term, recommended badge, disabled
reason, field error, and explanation without nesting interactive controls inside
a `<label>`.

- [ ] **Step 4: Replace hardcoded classical and neural field groups**

`MissionStepPanel` obtains controls from the registry and renders them through:

```tsx
const controls = getMissionControls({
  taskId: task.id,
  stepId,
  learningLevel: project.learningLevel,
  project,
});

<div className={styles.fieldGrid} data-learning-level={project.learningLevel}>
  {controls.map((control) => (
    <MissionControlRenderer
      key={`${control.section}:${control.id}`}
      control={control}
      project={project}
      dispatch={dispatch}
      recommendation={getMissionRecommendation(control.id, project)}
    />
  ))}
</div>
```

Keep `NeuralLayerEditor` as the specialized renderer for the neural Model step.
Keep legacy `ConfigurationField` for its input behavior, but filter fields by
the registry level and place each field beside `MissionExplanation`.

- [ ] **Step 5: Add responsive flat styling**

Add flat bordered blocks for explanation and recommendation content. Use
`min-width: 0`, `overflow-wrap: anywhere`, one-column collapse at narrow widths,
and no gradient declarations.

- [ ] **Step 6: Run Model Mission and responsive tests**

Run:

```powershell
npm run test:ml:model-mission
npm run test:ml:responsive
```

Expected: PASS at all configured viewports.

- [ ] **Step 7: Commit**

```powershell
git add components/tools/model-mission lib/tools/ml-generator/model-mission tests/tools/model-mission-live-route.test.js tests/tools/model-mission-responsive.test.js tests/tools/model-mission-style.test.js
git commit -m "feat: teach Model Mission controls progressively"
```

---

### Task 3: Add model-aware scaling and advanced classical workflows

**Files:**
- Create: `lib/tools/ml-generator/model-mission/recommendations.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `lib/tools/ml-generator/workbench/classical-generator.js`
- Modify: `lib/tools/ml-generator/model-mission/state.js`
- Test: `tests/tools/model-mission-recommendations.test.js`
- Test: `tests/tools/ml-classical-generator-v2.test.js`
- Test: `tests/tools/model-mission-generated-code.test.js`

**Interfaces:**
- Produces: `getMissionRecommendation(controlId, project): MissionRecommendation | null`
- Extends: `normalizeClassicalConfig` with `maxabs`, `power`, and `quantile`
- Extends: classical split with `random`, `group`, `time`, and `cross-validation`
- Extends: classical evaluation with `calibration` and `decisionThreshold`

- [ ] **Step 1: Add failing recommendation and scaling tests**

```js
test("scaling recommendations follow model behavior", () => {
  assert.equal(
    getMissionRecommendation("scaling", {
      taskId: "regression",
      model: { model: "random-forest" },
      preparation: { scaling: "standard" },
    }).recommendedValue,
    "none",
  );
  assert.equal(
    getMissionRecommendation("scaling", {
      taskId: "classification",
      model: { model: "logistic-regression" },
      preparation: { scaling: "none" },
    }).recommendedValue,
    "standard",
  );
});

test("advanced scalers remain inside the training pipeline", () => {
  for (const [scaling, expectedImport] of [
    ["maxabs", "MaxAbsScaler"],
    ["power", "PowerTransformer"],
    ["quantile", "QuantileTransformer"],
  ]) {
    const result = generateClassicalScript({
      task: "regression",
      dataset: "diabetes",
      model: "ridge",
      scaling,
    });
    assert.match(result.code, new RegExp(expectedImport));
    assert.ok(
      result.code.indexOf("train_test_split(")
      < result.code.indexOf(`("scaler", ${expectedImport}`),
    );
  }
});
```

Add group/time split assertions, cross-validation assertions, calibration only
for classification, and task-specific artifact filename assertions.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
node --test tests/tools/model-mission-recommendations.test.js tests/tools/ml-classical-generator-v2.test.js
```

Expected: FAIL for missing recommendations and unsupported advanced choices.

- [ ] **Step 3: Implement deterministic recommendations**

Use explicit model-family sets:

```js
const SCALE_SENSITIVE_MODELS = new Set([
  "logistic-regression",
  "linear-svm",
  "kernel-svm",
  "knn",
  "linear-regression",
  "ridge",
  "lasso",
  "elastic-net",
]);

const TREE_MODELS = new Set([
  "decision-tree",
  "random-forest",
  "gradient-boosting",
  "extra-trees",
]);
```

Return `{ recommendedValue, label, reason }` without changing the project.
Controls display the recommendation while retaining the user's explicit value.

- [ ] **Step 4: Extend the classical normalization and generator**

Add scaler mappings:

```js
const scalerImports = {
  none: "",
  standard: "StandardScaler",
  robust: "RobustScaler",
  minmax: "MinMaxScaler",
  maxabs: "MaxAbsScaler",
  power: "PowerTransformer",
  quantile: "QuantileTransformer",
};
```

Use `GroupShuffleSplit` for group splits, chronological slicing for time splits,
and `cross_validate`/`RandomizedSearchCV` only when selected. Require the
configured group or time column for the corresponding strategy. Keep a final
untouched test set.

Use:

```py
MODEL_PATH = "classification_pipeline.joblib"
```

or:

```py
MODEL_PATH = "regression_pipeline.joblib"
```

Calibration wraps only compatible classifiers. Decision thresholds apply only
to binary classification probabilities and produce a visible validation error
for incompatible estimators.

- [ ] **Step 5: Run focused and generated-code tests**

Run:

```powershell
node --test tests/tools/model-mission-recommendations.test.js tests/tools/ml-classical-generator-v2.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/recommendations.js lib/tools/ml-generator/model-mission/control-definitions.js lib/tools/ml-generator/model-mission/state.js lib/tools/ml-generator/workbench/classical-generator.js tests/tools/model-mission-recommendations.test.js tests/tools/ml-classical-generator-v2.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: explain scaling and advanced classical workflows"
```

---

### Task 4: Make YOLO optimizer and confidence controls truthful

**Files:**
- Modify: `lib/tools/ml-generator/recipes/applied/yolo-shared.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `tests/tools/ml-generator-parity.test.js`
- Modify: `tests/tools/model-mission-catalog.test.js`
- Modify: `tests/tools/model-mission-generated-code.test.js`

**Interfaces:**
- Adds legacy fields: `optimizer`, `validationConfidence`, `predictionConfidence`, `weightDecay`, `momentum`, `warmupEpochs`, `freezeLayers`, `iouThreshold`, `deterministic`
- Removes shared UI use of `confidenceThreshold`
- Preserves migration from saved `confidenceThreshold` to `predictionConfidence`

- [ ] **Step 1: Add failing YOLO tests**

```js
test("automatic YOLO optimizer does not claim manual learning-rate control", () => {
  const result = generateRecipe("yolo-detection-training", {
    optimizer: "auto",
    learningRate: 0.007,
  }, "starter");

  assert.match(result.code, /"optimizer": "auto"/);
  assert.doesNotMatch(result.code, /"learning_rate": 0\.007/);
  assert.match(result.warnings.join("\n"), /chooses its own learning rate/i);
});

test("explicit YOLO optimizer emits the selected learning rate", () => {
  const result = generateRecipe("yolo-detection-training", {
    optimizer: "AdamW",
    learningRate: 0.0007,
    validationConfidence: 0.001,
    predictionConfidence: 0.35,
  }, "production");

  assert.match(result.code, /optimizer=str\(CONFIG\["optimizer"\]\)/);
  assert.match(result.code, /lr0=float\(CONFIG\["learning_rate"\]\)/);
  assert.match(result.code, /conf=float\(CONFIG\["validation_confidence"\]\)/);
  assert.match(result.code, /conf=float\(CONFIG\["prediction_confidence"\]\)/);
});
```

- [ ] **Step 2: Run YOLO parity tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-generator-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: FAIL for missing fields and old shared confidence behavior.

- [ ] **Step 3: Extend field definitions, defaults, normalization, and validation**

Use `optimizer: "auto"` in Guided. Attach:

```js
enabledWhen: {
  path: "model.optimizer",
  operator: "not-equals",
  value: "auto",
  reason: "Automatic optimizer selection may choose its own learning rate.",
}
```

Default `validationConfidence` to `0.001` and
`predictionConfidence` to `0.25`. Validate both in `[0, 1]`. Validate
`iouThreshold` in `[0, 1]`, `freezeLayers >= 0`, and non-negative weight decay
and warmup.

- [ ] **Step 4: Generate separate training, validation, and inference arguments**

When optimizer is `auto`, omit `lr0` from `model.train`. When explicit, pass
both `optimizer` and `lr0`. Pass validation confidence only to `model.val` and
prediction confidence only to `model.predict`. Map Advanced controls to their
Ultralytics keyword arguments.

- [ ] **Step 5: Run parity and generated-code tests**

Run:

```powershell
node --test tests/tools/ml-generator-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/recipes/applied/yolo-shared.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/control-definitions.js tests/tools/ml-generator-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "fix: make YOLO tuning controls truthful"
```

---

### Task 5: Define complete neural data and training contracts

**Files:**
- Modify: `lib/tools/ml-generator/workbench/neural-generator.js`
- Modify: `lib/tools/ml-generator/model-mission/state.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`
- Modify: `tests/tools/ml-neural-generator.test.js`
- Modify: `tests/tools/model-mission-adapters.test.js`

**Interfaces:**
- Extends: `normalizeNeuralConfig(input)` with data, split, preparation, optimizer, callback, device, and output fields
- Produces normalized `dataContract` values: `tabular`, `image-folder`, `sequence-array`
- Produces: `buildNeuralDataSection(config, framework): string[]`
- Preserves: `inferLayerShapes(inputShape, layers)`

- [ ] **Step 1: Add failing normalization and adapter tests**

```js
test("neural normalization resolves a complete training contract", () => {
  const config = normalizeNeuralConfig({
    framework: "pytorch",
    preset: "tabular-mlp",
    task: "tabular-classification",
    dataSource: "breast-cancer",
    splitStrategy: "train-validation-test",
    validationRatio: 0.15,
    testRatio: 0.15,
    scaling: "standard",
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    weightDecay: 0.0001,
    patience: 8,
    gradientClip: 1,
    mixedPrecision: true,
    device: "auto",
    workers: 2,
    randomSeed: 42,
  });

  assert.equal(config.dataContract, "tabular");
  assert.equal(config.optimizer, "adamw");
  assert.equal(config.scheduler, "reduce-on-plateau");
  assert.equal(config.checkpointPath, "artifacts/best_neural_network.pt");
});
```

Add cases for image folders and sequence arrays, invalid split totals, invalid
paths, and classification/regression output compatibility.

- [ ] **Step 2: Run neural tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-adapters.test.js
```

Expected: FAIL because neural configuration only contains architecture and three
training values.

- [ ] **Step 3: Extend neural defaults and normalization**

Normalize:

```js
{
  dataSource,
  dataPath,
  targetColumn,
  dataContract,
  splitStrategy,
  validationRatio,
  testRatio,
  scaling,
  optimizer,
  scheduler,
  weightDecay,
  momentum,
  patience,
  minimumDelta,
  gradientClip,
  mixedPrecision,
  device,
  workers,
  randomSeed,
  checkpointPath,
  artifactPath
}
```

Data contracts derive from the selected preset and reject incompatible
combinations. Keras artifact paths end in `.keras`; PyTorch paths end in `.pt`.
All paths are safe relative paths.

- [ ] **Step 4: Pass all project sections through the neural adapter**

Replace model/training-only merging with:

```js
const generated = generateNeuralScript({
  ...projectSections(project),
  preset: normalizeNeuralPreset(project.model?.preset),
  framework: project.model?.framework ?? "keras",
});
```

Return validation errors keyed to `data`, `split`, `architecture`, or `training`
instead of one generic architecture key when the generator exposes a typed
configuration error.

- [ ] **Step 5: Run neural and adapter tests**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-adapters.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/workbench/neural-generator.js lib/tools/ml-generator/model-mission/state.js lib/tools/ml-generator/model-mission/control-definitions.js lib/tools/ml-generator/model-mission/adapters.js tests/tools/ml-neural-generator.test.js tests/tools/model-mission-adapters.test.js
git commit -m "feat: define complete neural training contracts"
```

---

### Task 6: Generate complete Keras training workflows

**Files:**
- Modify: `lib/tools/ml-generator/workbench/neural-generator.js`
- Modify: `tests/tools/ml-neural-generator.test.js`
- Modify: `tests/tools/model-mission-generated-code.test.js`

**Interfaces:**
- Consumes: normalized neural configuration from Task 5
- Produces: complete Keras Python with `load_data`, `build_model`, `train_model`, `evaluate_model`, `predict_sample`, and `main`

- [ ] **Step 1: Replace skeleton expectations with complete-workflow tests**

```js
test("Keras generator trains, validates, tests, saves, and predicts", () => {
  const result = generateNeuralScript({
    framework: "keras",
    preset: "tabular-mlp",
    task: "tabular-classification",
    dataSource: "breast-cancer",
    epochs: 4,
    batchSize: 16,
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    patience: 2,
  });

  assert.match(result.code, /def load_data\(\):/);
  assert.match(result.code, /train_test_split/);
  assert.match(result.code, /model\.fit\(/);
  assert.doesNotMatch(result.code, /# history = model\.fit/);
  assert.match(result.code, /EarlyStopping/);
  assert.match(result.code, /ModelCheckpoint/);
  assert.match(result.code, /model\.evaluate\(test_/);
  assert.match(result.code, /model\.save\(ARTIFACT_PATH\)/);
  assert.match(result.code, /def predict_sample/);
  assert.match(result.code, /if __name__ == "__main__":/);
});
```

Add image-folder and sequence-array Keras cases, binary, multiclass, and
regression loss/output cases, and Python AST parsing.

- [ ] **Step 2: Run neural tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: FAIL because `model.fit` and loader connections are commented.

- [ ] **Step 3: Implement Keras data sections**

- Tabular built-ins use scikit-learn datasets and leakage-safe
  `ColumnTransformer`/scaler fitting.
- Custom CSV validates target and columns before splitting.
- Image folders use `keras.utils.image_dataset_from_directory` with explicit
  train, validation, and test directories.
- Sequence arrays load `features` and `targets` from `.npz`, validate tensor
  shape, then split with the selected seed.

Use explicit constants for paths and ratios so every UI choice appears in the
script.

- [ ] **Step 4: Implement Keras training and evaluation**

Compile with the selected optimizer. Add:

```py
callbacks = [
    keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=PATIENCE,
        min_delta=MINIMUM_DELTA,
        restore_best_weights=True,
    ),
    keras.callbacks.ModelCheckpoint(
        CHECKPOINT_PATH,
        monitor="val_loss",
        save_best_only=True,
    ),
]
```

Add selected scheduler callback, real `model.fit`, final test evaluation once,
artifact saving, and one shaped inference example.

- [ ] **Step 5: Run neural and generated-code tests**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/workbench/neural-generator.js tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: generate complete Keras training workflows"
```

---

### Task 7: Generate complete PyTorch training workflows

**Files:**
- Modify: `lib/tools/ml-generator/workbench/neural-generator.js`
- Modify: `tests/tools/ml-neural-generator.test.js`
- Modify: `tests/tools/model-mission-generated-code.test.js`

**Interfaces:**
- Consumes: normalized neural configuration from Task 5
- Produces: complete PyTorch Python with datasets, data loaders, `train_epoch`, `evaluate`, early stopping, checkpointing, final test, and inference

- [ ] **Step 1: Add complete PyTorch workflow tests**

```js
test("PyTorch generator emits executable loaders and training loops", () => {
  const result = generateNeuralScript({
    framework: "pytorch",
    preset: "sequence-lstm",
    task: "sequence-classification",
    dataSource: "custom-npz",
    dataPath: "data/sequences.npz",
    epochs: 4,
    batchSize: 16,
    optimizer: "adamw",
    scheduler: "reduce-on-plateau",
    patience: 2,
    gradientClip: 1,
    mixedPrecision: true,
  });

  assert.match(result.code, /class ArrayDataset\(Dataset\)/);
  assert.match(result.code, /train_loader = DataLoader/);
  assert.match(result.code, /def train_epoch/);
  assert.match(result.code, /def evaluate/);
  assert.doesNotMatch(result.code, /# for epoch in range/);
  assert.match(result.code, /clip_grad_norm_/);
  assert.match(result.code, /autocast/);
  assert.match(result.code, /torch\.save\(/);
  assert.match(result.code, /model\.load_state_dict/);
  assert.match(result.code, /test_metrics = evaluate/);
  assert.match(result.code, /if __name__ == "__main__":/);
});
```

Add tabular and image-folder cases, optimizer/scheduler mappings, classification
target dtypes, regression shapes, and AST parsing.

- [ ] **Step 2: Run neural tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: FAIL because data loaders and training loops are comments.

- [ ] **Step 3: Implement PyTorch datasets and loaders**

- Tabular uses tensors created after leakage-safe scikit-learn preprocessing.
- Image folders use `torchvision.datasets.ImageFolder` and separate directories.
- Sequence arrays use an `ArrayDataset` with verified shape and dtype.
- Every loader uses selected batch size, workers, shuffle only for training, and
  deterministic worker seeding.

- [ ] **Step 4: Implement training, validation, stopping, and final test**

Use optimizer-specific constructors, optional scheduler, gradient clipping, and
`torch.amp` only when enabled and supported by the selected device. Save a
checkpoint dictionary containing:

```py
{
    "model_state": model.state_dict(),
    "input_shape": INPUT_SHAPE,
    "num_classes": NUM_CLASSES,
    "task": TASK,
}
```

Restore the best checkpoint before one final test evaluation and the inference
example.

- [ ] **Step 5: Run neural and generated-code tests**

Run:

```powershell
node --test tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/workbench/neural-generator.js tests/tools/ml-neural-generator.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: generate complete PyTorch training workflows"
```

---

### Task 8: Expose advanced neural and production controls without overwhelming Guided

**Files:**
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `components/tools/model-mission/NeuralLayerEditor.tsx`
- Modify: `components/tools/model-mission/MissionStepPanel.tsx`
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `tests/tools/model-mission-live-route.test.js`
- Modify: `tests/tools/model-mission-responsive.test.js`
- Modify: `tests/tools/ml-neural-generator.test.js`

**Interfaces:**
- Consumes: neural configuration fields from Task 5
- Produces: level-aware controls for optimizer, scheduler, regularization, callbacks, device, workers, precision, checkpointing, and layer-specific options
- Preserves: `onChange(layers)` shape-safe layer-editor contract

- [ ] **Step 1: Add failing level-specific neural UI tests**

Assert that Guided shows preset, framework, epochs, and batch size; Customize
adds optimizer, learning rate, early stopping, and dropout; Advanced adds
scheduler, weight decay, momentum, minimum delta, gradient clip, mixed
precision, device, workers, deterministic mode, initialization, and checkpoint
path.

Assert Advanced count is greater than Customize and that returning from Guided
restores an Advanced optimizer selection.

- [ ] **Step 2: Run route and responsive tests and verify failure**

Run:

```powershell
npm run test:ml:model-mission
npm run test:ml:responsive
```

Expected: FAIL because advanced neural controls are not rendered.

- [ ] **Step 3: Add neural control metadata and explanations**

Every advanced neural record uses the standard explanation structure. Example:

```js
{
  id: "gradientClip",
  taskIds: ["neural-network"],
  section: "training",
  step: "train",
  level: "advanced",
  label: "Gradient clipping",
  technicalTerm: "Global gradient-norm clipping",
  controlType: "number",
  defaultValue: 1,
  shortHelp: "Limits unusually large updates that can destabilize training.",
  explanation: {
    what: "Caps the combined gradient norm before the optimizer updates weights.",
    why: "Recurrent and deep networks can produce exploding gradients.",
    useWhen: "Training loss becomes unstable or recurrent models diverge.",
    avoidWhen: "Training is already stable and clipping hides a poor learning rate.",
    tradeoff: "A very small limit slows or prevents learning.",
    codeEffect: "Adds clip_grad_norm_ in PyTorch or clipnorm to the Keras optimizer.",
  },
}
```

- [ ] **Step 4: Extend the layer editor**

Add activation, initializer, units/filters, kernel/pool size, dropout rate,
normalization, and recurrent return-sequence controls only where compatible.
Show the inferred input/output shape beside each layer. Prevent removal or
reordering that creates an invalid stack from enabling downloads.

- [ ] **Step 5: Run UI, responsive, and neural tests**

Run:

```powershell
npm run test:ml:model-mission
npm run test:ml:responsive
node --test tests/tools/ml-neural-generator.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/control-definitions.js components/tools/model-mission/NeuralLayerEditor.tsx components/tools/model-mission/MissionStepPanel.tsx components/tools/model-mission/ModelMission.module.css tests/tools/model-mission-live-route.test.js tests/tools/model-mission-responsive.test.js tests/tools/ml-neural-generator.test.js
git commit -m "feat: expose advanced neural configuration safely"
```

---

### Task 9: Preserve versioned dependencies and resolved configuration

**Files:**
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`
- Modify: `lib/hooks/useModelMission.ts`
- Modify: `components/tools/model-mission/MissionCodePanel.tsx`
- Modify: `tests/tools/model-mission-adapters.test.js`
- Modify: `tests/tools/model-mission-live-route.test.js`

**Interfaces:**
- Produces shared result:

```ts
type MissionDependency = {
  package: string;
  version: string;
  purpose: string;
};

type MissionResult = {
  filename: string;
  code: string;
  dependencies: MissionDependency[];
  warnings: string[];
  summary: string;
  validationErrors: Record<string, string>;
  resolvedConfig: ProjectConfig;
};
```

- [ ] **Step 1: Add failing result-contract tests**

```js
assert.deepEqual(result.dependencies[0], {
  package: "scikit-learn",
  version: ">=1.5,<2",
  purpose: "modeling and preprocessing",
});
assert.equal(result.resolvedConfig.taskId, "classification");
```

For legacy results, assert supplied version and purpose survive adaptation.
Assert install text contains package and version.

- [ ] **Step 2: Run adapter and route tests and verify failure**

Run:

```powershell
node --test tests/tools/model-mission-adapters.test.js tests/tools/model-mission-live-route.test.js
```

Expected: FAIL because adapters flatten dependencies to package names.

- [ ] **Step 3: Normalize structured dependencies**

Add:

```js
function normalizeDependency(dependency) {
  if (typeof dependency === "string") {
    return {
      package: dependency,
      version: DEFAULT_DEPENDENCY_RANGES[dependency] ?? "",
      purpose: DEFAULT_DEPENDENCY_PURPOSES[dependency] ?? "runtime",
    };
  }
  return {
    package: String(dependency.package),
    version: String(dependency.version ?? ""),
    purpose: String(dependency.purpose ?? "runtime"),
  };
}
```

Include a cloned resolved project in every successful result. The install line
uses `${package}${version}`.

- [ ] **Step 4: Run adapter and route tests**

Run:

```powershell
node --test tests/tools/model-mission-adapters.test.js tests/tools/model-mission-live-route.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/adapters.js lib/hooks/useModelMission.ts components/tools/model-mission/MissionCodePanel.tsx tests/tools/model-mission-adapters.test.js tests/tools/model-mission-live-route.test.js
git commit -m "feat: preserve Model Mission dependency metadata"
```

---

### Task 10: Build documented project files

**Files:**
- Create: `lib/tools/ml-generator/model-mission/project-bundle.js`
- Create: `tests/tools/model-mission-project-bundle.test.js`
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`

**Interfaces:**
- Produces: `buildMissionProjectBundle({ result, project, task }): { rootName: string, files: Record<string, string> }`
- Produces base files: `README.md`, `requirements.txt`, `model_mission.json`, `.gitignore`, `data/README.md`, `src/train.py`, `src/predict.py`, `tests/test_generated_project.py`

- [ ] **Step 1: Write failing bundle tests**

```js
test("project bundle contains one documented reproducible project", () => {
  const result = generateSynchronousMissionResult(
    createProjectForTask("classification"),
  );
  const bundle = buildMissionProjectBundle({
    result,
    project: result.resolvedConfig,
    task: getModelMissionTask("classification"),
  });

  assert.equal(bundle.rootName, "model-mission-project");
  assert.deepEqual(Object.keys(bundle.files).sort(), [
    ".gitignore",
    "README.md",
    "data/README.md",
    "model_mission.json",
    "requirements.txt",
    "src/predict.py",
    "src/train.py",
    "tests/test_generated_project.py",
  ]);
  assert.match(bundle.files["README.md"], /Classification/);
  assert.match(bundle.files["README.md"], /python src\/train\.py/);
  assert.match(bundle.files["requirements.txt"], /scikit-learn>=1\.5,<2/);
  assert.deepEqual(
    JSON.parse(bundle.files["model_mission.json"]),
    result.resolvedConfig,
  );
  assert.equal(bundle.files["src/train.py"], result.code);
});
```

Add neural, YOLO, unsafe project-name, data-source link, artifact-name, and
README command consistency cases.

- [ ] **Step 2: Run bundle tests and verify failure**

Run:

```powershell
node --test tests/tools/model-mission-project-bundle.test.js
```

Expected: FAIL because the bundle service does not exist.

- [ ] **Step 3: Implement safe project and requirement generation**

Normalize `projectName` to lowercase letters, digits, and hyphens. Reject
absolute paths and `..` traversal. Build requirements from structured
dependencies:

```js
const requirements = result.dependencies
  .map(({ package: name, version }) => `${name}${version}`)
  .sort()
  .join("\n")
  .concat("\n");
```

- [ ] **Step 4: Generate task-aware README, data guide, prediction, and smoke test**

The README uses resolved choices and contains exact setup and run commands.
The data guide uses catalog source metadata and the expected directory shape.
The prediction script loads the task-specific artifact:

- classical: `joblib.load` and `data/inference.csv`;
- Keras: `keras.models.load_model`;
- PyTorch: reconstruct model using checkpoint metadata;
- YOLO: `YOLO(artifact_path)` and configured source.

The smoke test parses `src/train.py`, verifies required files, and checks that
the project configuration is valid JSON without starting a training job.

- [ ] **Step 5: Run bundle and adapter tests**

Run:

```powershell
node --test tests/tools/model-mission-project-bundle.test.js tests/tools/model-mission-adapters.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/project-bundle.js lib/tools/ml-generator/model-mission/adapters.js tests/tools/model-mission-project-bundle.test.js
git commit -m "feat: build documented Model Mission projects"
```

---

### Task 11: Encode and download project ZIP files locally

**Files:**
- Create: `lib/tools/ml-generator/model-mission/stored-zip.js`
- Create: `tests/tools/model-mission-stored-zip.test.js`
- Modify: `components/tools/model-mission/ModelMissionShell.tsx`
- Modify: `components/tools/model-mission/MissionCodePanel.tsx`
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `tests/tools/model-mission-live-route.test.js`
- Modify: `tests/tools/model-mission-responsive.test.js`

**Interfaces:**
- Produces: `encodeStoredZip(files: Record<string, string | Uint8Array>): Uint8Array`
- Produces: `downloadProjectBundle(bundle): void` inside the client shell
- Adds props: `onDownloadPython`, `onDownloadProject`

- [ ] **Step 1: Write failing ZIP structure tests**

```js
test("stored ZIP contains local and central directory records", () => {
  const bytes = encodeStoredZip({
    "README.md": "# Ready\n",
    "src/train.py": "print('ready')\n",
  });
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.ok(findSignature(bytes, 0x02014b50) >= 0);
  assert.ok(findSignature(bytes, 0x06054b50) >= 0);
  assert.match(new TextDecoder().decode(bytes), /README\.md/);
  assert.match(new TextDecoder().decode(bytes), /src\/train\.py/);
});
```

Add deterministic ordering, Unicode filename encoding, CRC32, and empty-file
tests.

- [ ] **Step 2: Run ZIP tests and verify failure**

Run:

```powershell
node --test tests/tools/model-mission-stored-zip.test.js
```

Expected: FAIL because the encoder does not exist.

- [ ] **Step 3: Implement the dependency-free stored ZIP writer**

Use UTF-8 filenames, method `0` (store), CRC32, local headers, central directory
headers, and one end-of-central-directory record. Sort paths before encoding so
the same files produce the same bytes. Reject absolute and traversal paths.

The public function returns a new `Uint8Array` and never mutates input values.

- [ ] **Step 4: Add separate download actions**

`Download Python` retains the current text blob behavior. `Download project
(.zip)` calls `buildMissionProjectBundle`, then `encodeStoredZip`, then downloads
a blob with `application/zip`. Disable both actions while generation is loading
or when validation errors block code.

Create and revoke each object URL in the same action. Use the sanitized project
name as the archive filename.

- [ ] **Step 5: Run ZIP, route, and responsive tests**

Run:

```powershell
node --test tests/tools/model-mission-stored-zip.test.js tests/tools/model-mission-live-route.test.js
npm run test:ml:responsive
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/model-mission/stored-zip.js components/tools/model-mission/ModelMissionShell.tsx components/tools/model-mission/MissionCodePanel.tsx components/tools/model-mission/ModelMission.module.css tests/tools/model-mission-stored-zip.test.js tests/tools/model-mission-live-route.test.js tests/tools/model-mission-responsive.test.js
git commit -m "feat: download complete Model Mission projects"
```

---

### Task 12: Run complete verification and repeat the end-user audit

**Files:**
- Modify: `scripts/build_model_mission_audit_artifacts.py`
- Create: `docs/reports/2026-07-29-model-mission-learning-engine-audit.md`
- Create: `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`
- Modify only if a failure proves necessary: files changed in Tasks 1–11

**Interfaces:**
- Consumes: final route, generators, project bundles, and existing audit harness
- Produces: evidence-backed revised score and remaining-gap report

- [ ] **Step 1: Run unit and generated-code suites**

Run:

```powershell
npm run test:ml
node --test tests/tools/ml-classical-generator-v2.test.js tests/tools/ml-neural-generator.test.js tests/tools/ml-project-config.test.js
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run TypeScript and production build**

First read the relevant Next.js 16 documentation under
`node_modules/next/dist/docs/` as required by `AGENTS.md`.

Run:

```powershell
npx tsc --noEmit
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 3: Run responsive browser verification**

Start the local server and run:

```powershell
npm run test:ml:responsive
```

Expected:

- no page overflow at 320, 360, 390, 768, 900, 1024, or 1440 pixels;
- no intersecting controls or panels;
- Configure/Code tabs preserve state;
- explanations stay within field cards;
- Advanced displays more controls than Customize;
- no computed Model Mission background contains a gradient.

- [ ] **Step 4: Generate and smoke-test representative projects**

Generate these configurations:

1. Guided logistic classification with Standard scaling.
2. Advanced regression with group split and Power transform.
3. Customized YOLO detection with AdamW.
4. Advanced YOLO segmentation with separate confidence values.
5. Guided Keras tabular network.
6. Advanced Keras image network.
7. Customized PyTorch sequence LSTM.
8. Advanced PyTorch tabular network.

For each:

- parse Python with `ast.parse`;
- open and inspect the ZIP;
- verify requirements and config;
- execute lightweight built-in-data projects with reduced epochs;
- verify the expected artifact name;
- record warnings and runtime outcomes.

- [ ] **Step 5: Repeat the student and expert usability audit**

Use the live route at desktop and mobile widths. Record:

- whether a student can explain the nine steps after one guided project;
- whether each scaling choice is understandable;
- whether Customize adds practical choices;
- whether Advanced adds meaningful specialist controls;
- whether YOLO descriptions match generated behavior;
- whether neural downloads train without uncommenting code;
- whether project archives explain installation, data, training, and prediction.

Write the evidence JSON and report with a score out of 10, verified strengths,
remaining gaps, and no unsupported claim of universal no-code coverage.

- [ ] **Step 6: Run the final clean verification**

Run:

```powershell
npm run test:ml
npm run test:ml:responsive
npx tsc --noEmit
npm run build
git diff --check
```

Expected: every command exits `0`.

- [ ] **Step 7: Commit audit artifacts**

```powershell
git add scripts/build_model_mission_audit_artifacts.py docs/reports/2026-07-29-model-mission-learning-engine-audit.md docs/reports/2026-07-29-model-mission-learning-engine-evidence.json
git commit -m "test: audit the Model Mission learning engine"
```

---

## Completion Checklist

- [ ] Guided, Customize, and Advanced have visibly different control counts.
- [ ] Hidden values survive level changes.
- [ ] Every registered control has complete educational metadata.
- [ ] Scaling recommendations match selected model families.
- [ ] All learned preprocessing is fit on training data only.
- [ ] YOLO automatic optimizer does not expose misleading learning-rate control.
- [ ] YOLO validation and prediction confidence values are separate.
- [ ] Keras scripts contain active data loading, fit, validation, test, saving, and inference.
- [ ] PyTorch scripts contain active loaders, train/validation loops, checkpoint restoration, final test, and inference.
- [ ] Python and project ZIP downloads both work.
- [ ] Project ZIPs contain the documented base contract and versioned requirements.
- [ ] TypeScript, build, ML tests, AST checks, runtime smoke tests, ZIP checks, and responsive tests pass.
- [ ] Final audit report states evidence, score, and remaining limitations.
