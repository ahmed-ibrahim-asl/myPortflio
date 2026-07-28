# Model Mission Unified Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three stacked AI/ML generator interfaces with one branded, responsive, progressively ordered Model Mission builder that generates classical, neural, YOLO, sensor, and edge Python from one workflow.

**Architecture:** Add a lightweight ordered task catalog and adapter layer above the existing deterministic generators. A single reducer owns a versioned `ProjectConfig`, navigation, learning disclosure, and workspace state. One shell renders registry-driven steps and one code panel; legacy recipe modules remain lazy-loaded and are translated into the same result shape.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 6, CSS Modules, Node test runner, Chrome DevTools Protocol responsive tests, existing scikit-learn/Keras/PyTorch/Ultralytics Python generators.

## Global Constraints

- Keep `/tools/ai-script-generator/` as the public route.
- Render exactly one branded builder on that route.
- Use the shared workflow: Goal, Data, Inspect, Split, Prepare, Model, Train, Evaluate, Generate.
- Order tasks as classification, regression, sensor classification, image classification, object detection, instance segmentation, neural-network design.
- Keep task selection in plain language with the standard technical term visible.
- Keep one versioned `ProjectConfig` as canonical project state.
- Preserve legacy generator bodies, lazy loading, request-ID stale-response protection, and retry behavior.
- Do not add an LLM dependency or free-form prompting.
- Use only the portfolio’s flat `--night`, `--panel`, `--panel-raised`, `--ink`, `--muted`, `--line`, `--pixel-cyan`, `--pixel-green`, `--pixel-gold`, and `--pixel-shadow` visual system.
- Do not use CSS linear gradients, radial gradients, glass backgrounds, or blur effects in Model Mission.
- Do not use `overflow: hidden` or `overflow: clip` to conceal layout failures.
- Keep generated code horizontally scrollable inside its own panel.
- Keep both mobile workspaces mounted while switching Configure/Code tabs.
- Do not modify unrelated dirty files.

---

### Task 1: Add the ordered Model Mission catalog

**Files:**

- Create: `lib/tools/ml-generator/model-mission/catalog.js`
- Create: `tests/tools/model-mission-catalog.test.js`

**Interfaces:**

- Produces: `MODEL_MISSION_STEPS`, `MODEL_MISSION_TASKS`, `getModelMissionTask(taskId)`, `getModelMissionTasksByLevel(level)`, and `getLegacyFieldsForStep(recipeId, stepId)`.
- Consumes: legacy recipe IDs from `lib/tools/ml-generator/catalog.js`.

- [ ] **Step 1: Write the failing catalog test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  MODEL_MISSION_STEPS,
  MODEL_MISSION_TASKS,
  getLegacyFieldsForStep,
} from "../../lib/tools/ml-generator/model-mission/catalog.js";

test("tasks are ordered from simplest to most advanced", () => {
  assert.deepEqual(
    MODEL_MISSION_TASKS.map(({ id }) => id),
    [
      "classification",
      "regression",
      "sensor-classification",
      "image-classification",
      "object-detection",
      "instance-segmentation",
      "neural-network",
    ],
  );
  assert.deepEqual(
    MODEL_MISSION_STEPS.map(({ id }) => id),
    [
      "goal",
      "data",
      "inspect",
      "split",
      "prepare",
      "model",
      "train",
      "evaluate",
      "generate",
    ],
  );
});

test("every legacy field belongs to one workflow step", () => {
  const yoloFields = [
    "task", "modelSize", "environment", "datasetYaml", "sourcePath",
    "imageSize", "epochs", "batchSize", "device", "learningRate",
    "confidenceThreshold", "patience", "workers", "seed", "exportFormat",
    "runName", "projectDirectory", "cacheDataset", "useAmp", "exportInt8",
  ];
  const assigned = MODEL_MISSION_STEPS.flatMap(({ id }) =>
    getLegacyFieldsForStep("yolo-detection-training", id)
  );
  assert.deepEqual([...new Set(assigned)].sort(), [...yoloFields].sort());
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test tests/tools/model-mission-catalog.test.js
```

Expected: fail because `model-mission/catalog.js` does not exist.

- [ ] **Step 3: Implement the immutable catalog**

Each task record must contain:

```js
{
  id: "classification",
  order: 1,
  level: "beginner",
  title: "Predict a category",
  technicalTerm: "Classification",
  description: "Predict one label from two or more possible categories.",
  examples: ["fault type", "pass or fail", "species"],
  modality: "Tabular data",
  adapterId: "classical",
  adapterTask: "classification",
  recipeId: null,
}
```

Use these adapter mappings:

```text
classification          -> classical / classification
regression              -> classical / regression
sensor-classification   -> legacy / sensor-timeseries-classification
image-classification    -> legacy / edge-image-classification
object-detection        -> legacy / yolo-detection-training
instance-segmentation   -> legacy / yolo-segmentation-training
neural-network          -> neural / tabular-mlp
```

Create explicit legacy field maps:

```js
const LEGACY_STEP_FIELDS = {
  "yolo-detection-training": {
    data: ["datasetYaml", "sourcePath"],
    inspect: ["cacheDataset"],
    split: [],
    prepare: ["imageSize"],
    model: ["task", "modelSize"],
    train: [
      "environment", "epochs", "batchSize", "device", "learningRate",
      "patience", "workers", "seed", "useAmp",
    ],
    evaluate: ["confidenceThreshold"],
    generate: ["exportFormat", "runName", "projectDirectory", "exportInt8"],
  },
  "yolo-segmentation-training": {
    data: ["datasetYaml", "sourcePath"],
    inspect: ["cacheDataset"],
    split: [],
    prepare: ["imageSize"],
    model: ["task", "modelSize"],
    train: [
      "environment", "epochs", "batchSize", "device", "learningRate",
      "patience", "workers", "seed", "useAmp",
    ],
    evaluate: ["confidenceThreshold"],
    generate: ["exportFormat", "runName", "projectDirectory", "exportInt8"],
  },
  "sensor-timeseries-classification": {
    data: ["datasetPath", "featureColumns", "labelColumn", "sampleRateHz"],
    inspect: [],
    split: ["validationFraction", "testFraction"],
    prepare: ["windowSize", "windowStride"],
    model: ["task", "model", "modelSize"],
    train: [
      "environment", "epochs", "batchSize", "learningRate", "patience",
      "dropout", "device", "seed", "workers",
    ],
    evaluate: [],
    generate: ["exportFormat", "checkpointPath"],
  },
  "edge-image-classification": {
    data: ["datasetDirectory", "sampleImagePath"],
    inspect: [],
    split: ["validationFraction"],
    prepare: ["inputSize"],
    model: ["task", "model"],
    train: [
      "environment", "epochs", "batchSize", "learningRate", "patience",
      "dropout", "seed", "fineTuneLayers",
    ],
    evaluate: [],
    generate: ["exportFormat", "representativeSamples", "artifactDirectory"],
  },
};
```

`goal` never owns fields. Missing legacy steps render an educational explanation
instead of a blank panel.

- [ ] **Step 4: Run the catalog test and verify GREEN**

Run:

```powershell
node --test tests/tools/model-mission-catalog.test.js
```

Expected: all catalog tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- lib/tools/ml-generator/model-mission/catalog.js tests/tools/model-mission-catalog.test.js
git commit -m "feat: define ordered Model Mission tasks"
```

---

### Task 2: Normalize all generators behind one adapter contract

**Files:**

- Create: `lib/tools/ml-generator/model-mission/adapters.js`
- Create: `tests/tools/model-mission-adapters.test.js`
- Read: `lib/tools/ml-generator/workbench/classical-generator.js`
- Read: `lib/tools/ml-generator/workbench/neural-generator.js`
- Read: `lib/tools/ml-generator/engine.js`

**Interfaces:**

- Consumes: `generateClassicalScript(config)`, `generateNeuralScript(config)`, and legacy `MlGeneratorResult`.
- Produces:

```ts
type ModelMissionResult = {
  filename: string;
  code: string;
  dependencies: string[];
  warnings: string[];
  summary: string;
  validationErrors: Record<string, string>;
};
```

- Produces: `generateSynchronousMissionResult(projectConfig)` and `adaptLegacyMissionResult(result)`.

- [ ] **Step 1: Write failing adapter tests**

```js
test("classification and regression return the shared result shape", () => {
  for (const taskId of ["classification", "regression"]) {
    const result = generateSynchronousMissionResult({
      ...createDefaultProjectConfig(),
      taskId,
    });
    assert.match(result.filename, /\.py$/);
    assert.match(result.code, /train_test_split/);
    assert.ok(Array.isArray(result.dependencies));
    assert.deepEqual(result.validationErrors, {});
  }
});

test("neural output uses the same result shape", () => {
  const result = generateSynchronousMissionResult({
    ...createDefaultProjectConfig(),
    taskId: "neural-network",
    model: { framework: "keras", preset: "sensor-lstm" },
  });
  assert.match(result.filename, /\.py$/);
  assert.match(result.code, /keras/);
  assert.deepEqual(result.validationErrors, {});
});

test("legacy dependencies are flattened without losing warnings", () => {
  const result = adaptLegacyMissionResult({
    filename: "train.py",
    code: "print('ready')\n",
    dependencies: [
      { package: "torch", version: "2", purpose: "training" },
    ],
    warnings: ["Check the dataset path."],
    validationErrors: {},
    dataset: { title: "Sensor CSV" },
    metrics: ["F1"],
    deployment: ["TorchScript"],
  });
  assert.deepEqual(result.dependencies, ["torch"]);
  assert.equal(result.summary, "Sensor CSV · F1 · TorchScript");
});
```

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests/tools/model-mission-adapters.test.js
```

Expected: module-not-found failure.

- [ ] **Step 3: Implement task translators**

Classical translator:

```js
const classicalInput = {
  ...project.data,
  ...project.inspection,
  ...project.split,
  ...project.preparation,
  ...project.model,
  ...project.training,
  task: project.taskId,
};
```

Neural translator:

```js
const neuralInput = {
  ...project.model,
  ...project.training,
  framework: project.model.framework ?? "keras",
  preset: project.model.preset ?? "tabular-mlp",
};
```

Catch neural shape errors and return them under:

```js
validationErrors: { architecture: error.message }
```

Do not catch programming errors from the classical adapter.

- [ ] **Step 4: Run and verify GREEN**

```powershell
node --test tests/tools/model-mission-adapters.test.js
```

- [ ] **Step 5: Run existing generator suites**

```powershell
node --test tests/tools/ml-classical-generator-v2.test.js
node --test tests/tools/ml-neural-generator.test.js
npm run test:ml
```

Expected: 5/5 classical, 6/6 neural, and 32/32 legacy tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- lib/tools/ml-generator/model-mission/adapters.js tests/tools/model-mission-adapters.test.js
git commit -m "feat: unify Model Mission generator results"
```

---

### Task 3: Add the canonical Model Mission reducer

**Files:**

- Create: `lib/tools/ml-generator/model-mission/state.js`
- Create: `tests/tools/model-mission-state.test.js`
- Modify: `lib/tools/ml-generator/workbench/project-config.js`

**Interfaces:**

- Consumes: `createDefaultProjectConfig()` and `normalizeProjectConfig(input)`.
- Produces: `createModelMissionState()`, `modelMissionReducer(state, action)`, and `createProjectForTask(taskId, previousProject?)`.

State shape:

```js
{
  project: ProjectConfig,
  stepId: "goal",
  workspaceTab: "configure",
  copyStatus: "idle",
  reloadToken: 0,
}
```

- [ ] **Step 1: Write failing reducer tests**

Cover:

```js
test("task change keeps one project and resets incompatible sections", () => {
  const initial = createModelMissionState();
  const regression = modelMissionReducer(initial, {
    type: "choose-task",
    taskId: "regression",
  });
  assert.equal(regression.project.taskId, "regression");
  assert.equal(regression.stepId, "data");
  assert.equal(regression.workspaceTab, "configure");
  assert.equal(regression.project.model.model, "ridge");
});

test("learning disclosure does not erase advanced values", () => {
  let state = createModelMissionState();
  state = modelMissionReducer(state, {
    type: "patch-section",
    section: "model",
    patch: { maxDepth: 12 },
  });
  state = modelMissionReducer(state, {
    type: "set-learning-level",
    level: "guided",
  });
  assert.equal(state.project.model.maxDepth, 12);
});

test("workspace tabs preserve the exact project object", () => {
  const state = createModelMissionState();
  const next = modelMissionReducer(state, {
    type: "set-workspace-tab",
    tab: "code",
  });
  assert.equal(next.project, state.project);
});
```

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests/tools/model-mission-state.test.js
```

- [ ] **Step 3: Add task defaults**

Use these initial defaults:

```text
classification -> breast-cancer / logistic-regression / 15% validation / 15% test
regression -> diabetes / ridge / 15% validation / 15% test
sensor-classification -> legacy recipe defaults
image-classification -> legacy recipe defaults
object-detection -> legacy recipe defaults
instance-segmentation -> legacy recipe defaults
neural-network -> Keras / tabular-mlp / 20 epochs / batch 32
```

`choose-task` replaces incompatible sections and preserves only:

- `learningLevel`;
- `output` settings shared by both tasks;
- identical data paths when both tasks use the same modality.

Add reducer actions:

```text
choose-task
go-to-step
next-step
previous-step
patch-section
replace-section
set-learning-level
set-workspace-tab
set-copy-status
retry-generator
```

- [ ] **Step 4: Harden ProjectConfig cloning**

Replace recursive or JSON-dependent handling with `structuredClone` at the
normalization boundary. Reject non-cloneable values with:

```text
ProjectConfig contains a value that cannot be cloned.
```

Reject cyclic and `BigInt` values before stable serialization with:

```text
ProjectConfig must contain JSON-compatible values.
```

- [ ] **Step 5: Run reducer and ProjectConfig tests**

```powershell
node --test tests/tools/model-mission-state.test.js
node --test tests/tools/ml-project-config.test.js
node --test tests/tools/ml-project-config-hardening.test.js
```

Expected: all tests pass, including the two previously red hardening cases.

- [ ] **Step 6: Commit**

```powershell
git add -- lib/tools/ml-generator/model-mission/state.js lib/tools/ml-generator/workbench/project-config.js tests/tools/model-mission-state.test.js
git commit -m "feat: manage one Model Mission project"
```

---

### Task 4: Add the unified generation hook

**Files:**

- Create: `lib/hooks/useModelMission.ts`
- Create: `tests/tools/model-mission-hook-contract.test.js`
- Read: `lib/hooks/useMlGeneratorRecipe.ts`

**Interfaces:**

- Consumes: reducer state, ordered catalog, synchronous adapters, `useMlGeneratorRecipe`.
- Produces:

```ts
{
  state,
  dispatch,
  task,
  status,
  result,
  legacyRecipe,
  visibleLegacyFields,
  retry,
}
```

- [ ] **Step 1: Write a source-contract test**

The test reads `useModelMission.ts` and asserts:

- it calls `useMlGeneratorRecipe`;
- it selects a recipe ID only for `adapterId === "legacy"`;
- it uses `generateSynchronousMissionResult`;
- it exposes a single reducer state;
- it does not own a second `useState` project configuration;
- it preserves the hook’s request-safe lazy loading.

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests/tools/model-mission-hook-contract.test.js
```

- [ ] **Step 3: Implement the hook**

Call `useMlGeneratorRecipe` with an empty string for synchronous tasks:

```ts
const legacy = useMlGeneratorRecipe(
  task.adapterId === "legacy" ? task.recipeId : "",
  legacyConfig,
  project.learningLevel === "guided" ? "starter" : "production",
  state.reloadToken,
);
```

When a legacy recipe becomes ready and the project has no recipe configuration,
dispatch one `replace-section` action using `getRecipeDefaultConfig`.

Result status:

```text
synchronous valid result -> ready
legacy idle/loading -> loading
legacy load error -> error
legacy ready -> ready
```

Never allow a result whose task or recipe ID differs from the active task.

- [ ] **Step 4: Run contract and legacy loader tests**

```powershell
node --test tests/tools/model-mission-hook-contract.test.js
node --test tests/tools/ml-generator-loader.test.js
node --test tests/tools/ml-generator-loader-validation.test.js
```

- [ ] **Step 5: Commit**

```powershell
git add -- lib/hooks/useModelMission.ts tests/tools/model-mission-hook-contract.test.js
git commit -m "feat: generate every Model Mission task"
```

---

### Task 5: Build one registry-driven Model Mission interface

**Files:**

- Create: `components/tools/model-mission/ModelMissionShell.tsx`
- Create: `components/tools/model-mission/TaskChooser.tsx`
- Create: `components/tools/model-mission/WorkflowRail.tsx`
- Create: `components/tools/model-mission/MissionField.tsx`
- Create: `components/tools/model-mission/MissionStepPanel.tsx`
- Create: `components/tools/model-mission/MissionCodePanel.tsx`
- Create: `components/tools/model-mission/NeuralLayerEditor.tsx`
- Modify: `app/tools/ai-script-generator/page.tsx`
- Modify: `app/tools/ai-script-generator/layout.tsx`
- Modify: `app/tools/ai-script-generator/template.tsx`
- Create: `tests/tools/model-mission-ui-contract.test.js`

**Interfaces:**

- `ModelMissionShell` consumes only `useModelMission()`.
- `MissionStepPanel` consumes `{ task, stepId, project, legacyRecipe, dispatch }`.
- `MissionCodePanel` consumes `{ status, result, copyStatus, onCopy, onDownload, onRetry }`.
- `NeuralLayerEditor` consumes and replaces `project.model.layers`.

- [ ] **Step 1: Write the failing UI contract test**

Assert the route source:

- imports `ModelMissionShell`;
- contains no `AiLearningWorkbench` or `NeuralNetworkWorkbench`;
- layout and template return `children` only;
- shell contains “Model Mission” and the approved tagline;
- task chooser renders the catalog, not a second hard-coded task list;
- there is one element with `data-model-mission`;
- there is one code panel with `data-mission-code-panel`.

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests/tools/model-mission-ui-contract.test.js
```

- [ ] **Step 3: Build the task chooser and workflow rail**

Task chooser groups catalog records in this order:

```text
Beginner: classification, regression
Intermediate: sensor classification, image classification
Advanced: object detection, instance segmentation, neural-network design
```

Each card uses a real button and includes title, technical term, description,
examples, difficulty, and modality. Selecting a card dispatches `choose-task`.

The workflow rail uses `aria-current="step"` and scrolls the active step into
view without moving the page horizontally.

- [ ] **Step 4: Build registry-driven step content**

For classical tasks, move the existing controls from
`AiLearningWorkbench.tsx` into their matching shared steps without duplicating
the generator state:

```text
Data -> dataset, CSV path, target
Inspect -> head, shape/types, statistics, missing values, target distribution
Split -> strategy, validation ratio, test ratio, stratification
Prepare -> imputers, scaling, encoding, class weights/SMOTE
Model -> compatible model cards and common model parameters
Train -> seed, estimators, learning rate, kernel
Evaluate -> compatible metric explanations
Generate -> resolved project summary
```

For legacy tasks, select visible fields using `getLegacyFieldsForStep` and
render them with the existing `ConfigurationField`.

For neural-network design:

```text
Data -> input shape and class count
Inspect -> shape explanation
Split -> learning explanation and generated loader expectation
Prepare -> selected preset and framework
Model -> ordered layer editor with inferred shapes
Train -> epochs, batch size, learning rate
Evaluate -> task-compatible loss and metrics
Generate -> architecture summary
```

Do not render a second hero, second task chooser, or second code preview inside a
step.

- [ ] **Step 5: Build one code panel**

Required actions:

- Copy Python;
- Download `.py`;
- retry lazy recipe load;
- show filename;
- show warnings;
- show validation errors;
- show dependency install command;
- show internally scrollable code.

Disable copy and download while status is not ready or code is empty.

- [ ] **Step 6: Replace the route composition**

`page.tsx` becomes:

```tsx
import { ModelMissionShell } from "@/components/tools/model-mission/ModelMissionShell";

export default function AIScriptGeneratorPage() {
  return <ModelMissionShell />;
}
```

`layout.tsx` and `template.tsx` become transparent:

```tsx
export default function Wrapper({ children }: { children: React.ReactNode }) {
  return children;
}
```

Do not delete legacy generators or tests.

- [ ] **Step 7: Run UI contract and TypeScript**

```powershell
node --test tests/tools/model-mission-ui-contract.test.js
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```powershell
git add -- app/tools/ai-script-generator components/tools/model-mission tests/tools/model-mission-ui-contract.test.js
git commit -m "feat: unify the Model Mission interface"
```

---

### Task 6: Match the portfolio’s flat visual system

**Files:**

- Create: `components/tools/model-mission/ModelMission.module.css`
- Modify: `components/tools/model-mission/*.tsx`
- Create: `tests/tools/model-mission-style.test.js`

**Interfaces:**

- CSS module exports every class referenced by the Model Mission components.
- No global selectors outside `[data-model-mission]`.

- [ ] **Step 1: Write the failing style test**

The test reads the CSS and asserts:

```js
assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter/);
assert.doesNotMatch(css, /overflow:\s*(hidden|clip)/);
for (const token of [
  "--night", "--panel", "--panel-raised", "--ink", "--muted", "--line",
  "--pixel-cyan", "--pixel-green", "--pixel-gold", "--pixel-shadow",
]) {
  assert.match(css, new RegExp(`var\\(${token}\\)`));
}
```

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests/tools/model-mission-style.test.js
```

- [ ] **Step 3: Implement the flat style**

Desktop:

```css
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
}

.workspace > *,
.taskCard,
.field,
.codePanel {
  min-width: 0;
}
```

Use:

```css
background: var(--panel);
border: 2px solid #465176;
box-shadow: 6px 6px 0 var(--pixel-shadow);
border-radius: 0;
```

Selected cards use a cyan border and an inset left bar, not a gradient.
Warnings use a gold border and flat dark fill. Errors use a red border and flat
dark fill.

At `max-width: 960px`, switch to Configure/Code tabs and one visible workspace.
At `max-width: 640px`, stack all card, field, header-action, and layer grids.
At `max-width: 430px`, stack layer actions and code actions.

The workflow rail uses `overflow-x: auto`. The code `pre` uses
`overflow: auto; white-space: pre`. The page root uses `overflow: visible`.

- [ ] **Step 4: Run style test**

```powershell
node --test tests/tools/model-mission-style.test.js
```

- [ ] **Step 5: Commit**

```powershell
git add -- components/tools/model-mission tests/tools/model-mission-style.test.js
git commit -m "style: match Model Mission to portfolio"
```

---

### Task 7: Expand responsive and interaction regression coverage

**Files:**

- Modify: `tests/tools/ai-generator-responsive.test.js`
- Create: `tests/tools/model-mission-generated-code.test.js`
- Modify: `package.json`

**Interfaces:**

- Browser selectors: `[data-model-mission]`, `[data-mission-task]`,
  `[data-mission-config-panel]`, `[data-mission-code-panel]`,
  `[data-mission-workflow]`, and `[data-mission-mobile-tabs]`.

- [ ] **Step 1: Replace legacy-only responsive assertions**

Keep the owned-server behavior and lazy-load test query parameters.

At every viewport:

```js
assert.equal(layout.documentWidth, layout.viewportWidth);
assert.ok(layout.visibleControls.every((control) =>
  control.left >= control.panelLeft - 1
  && control.right <= control.panelRight + 1
));
assert.ok(layout.overlapPairs.length === 0);
assert.ok(["auto", "scroll"].includes(layout.code.overflowX));
assert.equal(layout.code.whiteSpace, "pre");
```

Build `overlapPairs` only from simultaneously visible sibling cards, controls,
workspace panels, and sticky navigation. Exclude intentional containment and
border contact.

- [ ] **Step 2: Add interaction coverage**

Test:

1. seven task cards render in the approved order;
2. choose Regression;
3. navigate to Model;
4. select Random Forest Regressor;
5. generated code contains `RandomForestRegressor`;
6. switch to Code on mobile and back to Configure;
7. selected task and model remain unchanged;
8. choose YOLO detection, rapidly choose sensor, then return to YOLO;
9. stale loads never replace the active filename;
10. simulated load failure displays a friendly message and retry succeeds;
11. one builder, one code panel, and no legacy/template selectors are visible.

- [ ] **Step 3: Add generated-code matrix**

For every task:

- generate the default result;
- assert `.py` filename;
- assert no `TODO`, `TBD`, or unresolved placeholder token;
- parse synchronous outputs with the existing Python AST helper;
- preserve legacy parity for legacy adapters.

- [ ] **Step 4: Add focused package scripts**

Add without reformatting unrelated package fields:

```json
"test:ml:model-mission": "node --test tests/tools/model-mission-*.test.js"
```

Append the focused suite to `test:ml` only after it is green.

- [ ] **Step 5: Run focused and full verification**

```powershell
npm run test:ml:model-mission
npm run test:ml
npm run test:ml:responsive
npx tsc --noEmit
npm run build
```

Expected:

- every Model Mission unit and contract test passes;
- all existing ML tests pass;
- responsive test passes at 320, 360, 390, 768, 900, 1024, and 1440 widths;
- TypeScript passes;
- production build emits `/tools/ai-script-generator/`.

- [ ] **Step 6: Inspect the live route**

Verify the returned HTML contains:

```text
Model Mission
From problem to Python, one decision at a time.
Predict a category
Predict a number
Classify sensor data
Classify images
Detect objects
Segment objects
Design a neural network
```

Verify it does not contain visible duplicate headings:

```text
AI / ML Learning Workbench
Sequential Neural Network Designer
Classic advanced recipes
```

- [ ] **Step 7: Final worktree review**

```powershell
git status --short
git diff --check
git diff --stat
```

Confirm unrelated user changes are neither staged nor overwritten.

- [ ] **Step 8: Commit**

```powershell
git add -- package.json tests/tools/ai-generator-responsive.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "test: verify unified Model Mission builder"
```
