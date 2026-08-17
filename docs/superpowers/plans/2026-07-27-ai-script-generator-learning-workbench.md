# AI Script Generator Learning Workbench Implementation Plan

> **Execution rule:** Follow this plan task by task. Use test-driven development for every behavior change. Preserve all existing recipe outputs and public compatibility contracts until their replacements have parity coverage.

**Goal:** Replace the recipe-first AI Script Generator interface with a responsive, task-first learning workbench, then add leakage-safe tabular classification and regression without breaking the four existing lazy-loaded generators.

**Architecture:** Introduce a versioned `ProjectConfig`, serializable metadata registries, a pure compatibility engine, deterministic resolution, and literal dynamic adapter loading. Existing recipes remain unchanged and are called through a one-way legacy adapter. The UI edits only `ProjectConfig`; task-specific generators never own UI state.

**Primary stack:** Next.js, React, TypeScript/JavaScript, Node test runner, Playwright, scikit-learn generated Python, imbalanced-learn generated Python.

**Design specification:** `docs/superpowers/specs/2026-07-27-ai-script-generator-learning-workbench-design.md`

## Global rules

- Do not rewrite the four existing recipe implementations during Phase 1.
- Do not change `ml-templates.js` synchronous behavior.
- Do not import recipe or generator bodies from lightweight registries.
- Use literal dynamic-import maps for generator adapters.
- Keep the current request-ID stale-load protection.
- Add tests before implementation code.
- Run existing baseline, parity, loader, AST, and responsive suites after each integration task.
- Split data before fitting preprocessing.
- Apply augmentation and resampling to training data only.
- Keep official test data untouched until final evaluation.
- Stage only files changed by the current task because the working tree and package files contain user changes.

## Phase 0: documentation and safety baseline

### Task 1: Finalize the approved specification

**Files:**

- Modify: `docs/superpowers/specs/2026-07-27-ai-script-generator-learning-workbench-design.md`

**Step 1: Add preserved future scope**

Add the following explicitly:

- embeddings and semantic search;
- local LLM inference;
- deterministic parameter-efficient fine-tuning adapters;
- maintained Transformers/PEFT and Unsloth adapters;
- clustering families;
- dimensionality reduction;
- anomaly detection;
- forecasting families;
- recommendation families.

State that these features generate library code and do not add an LLM dependency to the generator.

**Step 2: Verify documentation diff**

Run:

```powershell
git diff --check -- docs/superpowers/specs/2026-07-27-ai-script-generator-learning-workbench-design.md
```

Expected: no whitespace errors.

**Step 3: Commit the approved design**

```powershell
git add -- docs/superpowers/specs/2026-07-27-ai-script-generator-learning-workbench-design.md
git commit -m "docs: design AI learning workbench"
```

### Task 2: Record the pre-migration test baseline

**Files:**

- Read: `package.json`
- Read: `tests/tools/`
- Do not modify product files.

**Step 1: Inspect existing scripts and dirty files**

```powershell
git status --short
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

Expected: identify the existing ML and responsive commands without modifying unrelated changes.

**Step 2: Run the existing ML suite**

```powershell
npm run test:ml
```

Expected: all schema, loader, baseline, parity, and Python AST tests pass.

**Step 3: Run the current responsive suite**

```powershell
npm run test:ml:responsive
```

Expected: loading, stale-switch, retry, and viewport tests pass before migration.

**Step 4: If an existing test fails**

Stop feature work. Record the exact failure as pre-existing and diagnose it before changing implementation code.

## Phase 1: shared workbench foundation

### Task 3: Add versioned ProjectConfig

**Files:**

- Create: `lib/tools/ml-generator/workbench/types.ts`
- Create: `lib/tools/ml-generator/workbench/project-config.js`
- Create: `lib/tools/ml-generator/workbench/project-config-migrations.js`
- Create: `tests/tools/ml-project-config.test.js`

**Step 1: Write failing ProjectConfig tests**

Cover:

- current `schemaVersion`;
- deterministic defaults;
- allowlisted normalization;
- unknown-field removal or rejection according to boundary;
- parse/serialize round trip;
- deep cloning without shared mutable state;
- migration from version 0 to version 1;
- rejection of future schema versions;
- stable serialization order if serialization is used for sharing.

Minimal expected shape:

```js
{
  schemaVersion: 1,
  taskId: "object-detection",
  learningLevel: "guided",
  data: {},
  inspection: {},
  split: {},
  preparation: {},
  model: {},
  training: {},
  evaluation: {},
  output: {}
}
```

**Step 2: Run the test and verify RED**

```powershell
node --test tests/tools/ml-project-config.test.js
```

Expected: failure because workbench ProjectConfig modules do not exist.

**Step 3: Implement the smallest schema**

Implement:

- `CURRENT_PROJECT_CONFIG_VERSION`;
- `createDefaultProjectConfig`;
- `normalizeProjectConfig`;
- `parseProjectConfig`;
- `serializeProjectConfig`;
- `cloneProjectConfig`;
- `migrateProjectConfig`.

Do not add task-specific generator logic.

**Step 4: Run the test and verify GREEN**

```powershell
node --test tests/tools/ml-project-config.test.js
```

Expected: pass.

**Step 5: Commit**

```powershell
git add -- lib/tools/ml-generator/workbench/types.ts lib/tools/ml-generator/workbench/project-config.js lib/tools/ml-generator/workbench/project-config-migrations.js tests/tools/ml-project-config.test.js
git commit -m "feat: add versioned ML project configuration"
```

### Task 4: Add validated lightweight registries

**Files:**

- Create: `lib/tools/ml-generator/workbench/registry-schema.js`
- Create: `lib/tools/ml-generator/workbench/registries/tasks.js`
- Create: `lib/tools/ml-generator/workbench/registries/data-profiles.js`
- Create: `lib/tools/ml-generator/workbench/registries/split-strategies.js`
- Create: `lib/tools/ml-generator/workbench/registries/preparation-options.js`
- Create: `lib/tools/ml-generator/workbench/registries/models.js`
- Create: `lib/tools/ml-generator/workbench/registries/metrics.js`
- Create: `lib/tools/ml-generator/workbench/registries/runtime-profiles.js`
- Create: `lib/tools/ml-generator/workbench/registries/generator-adapters.js`
- Create: `lib/tools/ml-generator/workbench/registries/index.js`
- Create: `tests/tools/ml-workbench-registry.test.js`
- Modify: `lib/tools/ml-generator/taxonomy.js`
- Modify: `lib/tools/ml-generator/catalog.js`

**Step 1: Write failing registry tests**

Validate:

- stable unique IDs;
- valid cross-registry references;
- user-facing name and plain-language description;
- technical term;
- learning group;
- compatibility declarations;
- educational explanation;
- generator adapter support;
- parameter bounds;
- no circular `requires` relationships;
- registries are serializable;
- registries do not load implementation bodies.

Initial task records:

- object detection;
- instance segmentation;
- sequence classification;
- image classification;
- tabular classification;
- tabular regression.

Preserve the four existing recipe IDs separately from standard task IDs.

**Step 2: Run and verify RED**

```powershell
node --test tests/tools/ml-workbench-registry.test.js
```

Expected: missing registry modules.

**Step 3: Implement registry schema and minimal records**

Keep records plain-data only.

Add to `catalog.js`:

- `projectTaskId`;
- `generatorAdapterId`.

Keep existing recipe IDs and display order.

Turn `taxonomy.js` into a compatibility facade over the new task registry. Do not maintain two independent task definitions.

**Step 4: Verify no eager recipe load**

Extend the registry test to inspect loaded modules or the existing loader instrumentation.

Expected: importing registry index does not import any recipe module.

**Step 5: Run registry and existing loader tests**

```powershell
node --test tests/tools/ml-workbench-registry.test.js
npm run test:ml
```

Expected: new test passes and existing lazy-load coverage remains green.

**Step 6: Commit**

Stage only registry-related files.

```powershell
git commit -m "feat: add ML workbench registries"
```

### Task 5: Add compatibility, validation, and resolution

**Files:**

- Create: `lib/tools/ml-generator/workbench/compatibility.js`
- Create: `lib/tools/ml-generator/workbench/validate-project.js`
- Create: `lib/tools/ml-generator/workbench/resolve-project.js`
- Create: `tests/tools/ml-workbench-compatibility.test.js`
- Modify: `lib/tools/ml-generator/schema.js`

**Step 1: Write failing compatibility tests**

Cover:

- allowed choices;
- disabled choices with a stable reason code and user-facing explanation;
- `requires`;
- `conflictsWith`;
- `availableWhen`;
- contextual recommendation;
- contextual warning;
- deterministic ordering;
- no mutation of input registries or project;
- default resolution;
- blocking structural and cross-registry errors.

Example expectation:

```js
{
  id: "smote",
  allowed: false,
  reasonCode: "DATA_PROFILE_UNSUPPORTED",
  explanation: "SMOTE is not applied to raw image data."
}
```

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-workbench-compatibility.test.js
```

**Step 3: Implement pure functions**

Implement:

- `evaluateChoice`;
- `listCompatibleChoices`;
- `validateProjectConfig`;
- `resolveProjectConfig`.

Resolution order:

1. structural parse;
2. registry lookup;
3. default insertion;
4. compatibility normalization;
5. explicit resolved output;
6. final validation.

`schema.js` keeps existing validators and delegates only new workbench validation.

**Step 4: Verify GREEN and regression safety**

```powershell
node --test tests/tools/ml-workbench-compatibility.test.js
npm run test:ml
```

**Step 5: Commit**

```powershell
git commit -m "feat: resolve compatible ML project settings"
```

### Task 6: Adapt existing recipes without changing outputs

**Files:**

- Create: `lib/tools/ml-generator/workbench/load-generator-adapter.js`
- Create: `lib/tools/ml-generator/workbench/adapters/legacy-recipe.js`
- Create: `lib/tools/ml-generator/workbench/adapters/legacy-recipe-mappings.js`
- Create: `tests/tools/ml-legacy-project-adapter.test.js`
- Preserve: `lib/tools/ml-generator/engine.js`
- Preserve: `lib/tools/ml-generator/load-recipe.js`
- Preserve: existing recipe modules
- Preserve: `lib/tools/ml-templates.js`

**Step 1: Write failing parity tests**

For every existing recipe and mode:

- build a `ProjectConfig`;
- resolve it;
- adapt it to the existing flat recipe config;
- generate through the existing engine;
- compare filename;
- compare metadata;
- compare dependency list;
- compare code hash;
- compare public result shape;
- parse Python with the existing AST helper.

Learning-level mapping:

- Guided → existing Starter mode;
- Customize → existing Production mode;
- Advanced → existing Production mode with disclosure only.

Disclosure level must not silently change legacy generated output beyond the explicit mode mapping.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-legacy-project-adapter.test.js
```

**Step 3: Implement literal adapter loading**

`load-generator-adapter.js` uses a literal map:

```js
const loaders = {
  "legacy-recipe": () => import("./adapters/legacy-recipe.js")
};
```

Add request-safe caching. Do not use a fully dynamic path.

**Step 4: Implement stable recipe mappings**

Map:

- standard task ID;
- existing recipe ID;
- data profile;
- workflow steps;
- field locations;
- learning level to existing mode.

Map the current edge-image recipe to the standard image-classification task without renaming the recipe.

**Step 5: Verify parity**

```powershell
node --test tests/tools/ml-legacy-project-adapter.test.js
npm run test:ml
```

Expected: exact legacy parity.

**Step 6: Commit**

```powershell
git commit -m "feat: adapt existing ML recipes to projects"
```

### Task 7: Add the canonical workbench state hook

**Files:**

- Create: `lib/hooks/useMlWorkbench.ts`
- Create: `tests/tools/ai-generator-workbench-flow.test.js`
- Read: `lib/hooks/useMlGeneratorRecipe.ts`

**Step 1: Write failing reducer/hook behavior tests**

Cover:

- `ProjectConfig` is the sole canonical state;
- task change resets only incompatible downstream values;
- completed step values persist when navigating backward;
- disclosure level does not erase advanced values;
- stale adapter responses cannot overwrite a newer task;
- retry reloads the failed adapter;
- draft configuration survives Configure/Preview tab changes;
- generation state is derived from resolved project;
- errors belong to a step and field.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
```

**Step 3: Implement reducer and hook**

Actions should be domain actions rather than recipe actions:

- choose task;
- update section;
- update field;
- choose learning level;
- go to step;
- next;
- back;
- resolve;
- generate;
- retry;
- reset.

Reuse the stale-request pattern from `useMlGeneratorRecipe.ts`.

**Step 4: Verify GREEN**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
```

**Step 5: Commit**

```powershell
git commit -m "feat: manage ML workbench project state"
```

### Task 8: Build the task-first shell

**Files:**

- Create: `components/tools/ml-workbench/TaskChooser.tsx`
- Create: `components/tools/ml-workbench/WorkflowRail.tsx`
- Create: `components/tools/ml-workbench/WorkbenchShell.tsx`
- Create: `components/tools/ml-workbench/WorkbenchStepPanel.tsx`
- Create: `components/tools/ml-workbench/ProjectField.tsx`
- Create: `components/tools/ml-workbench/ProjectSummary.tsx`
- Create: `components/tools/ml-workbench/MobileWorkspaceTabs.tsx`
- Modify: `components/tools/ml-generator/GeneratorCodePanel.tsx`
- Modify: `app/tools/ai-script-generator/page.tsx`

**Step 1: Extend failing UI flow tests**

Test:

- “What do you want to build?” appears first;
- friendly description and standard term appear together;
- existing tasks are discoverable;
- classification and regression cards are visible but may be marked upcoming until Phase 2 is merged;
- workflow rail uses the common nine steps;
- disabled fields explain why;
- recommendation and code effect are accessible;
- keyboard navigation works;
- switching workspace tabs does not unmount or reset configuration;
- generated legacy code remains copyable;
- `.py` download uses the generated filename.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
```

**Step 3: Implement presentational components**

`ProjectField` must support:

- label;
- technical name;
- control;
- recommended badge;
- explanation;
- code effect;
- warning;
- disabled reason;
- error.

Do not put generator-specific state inside components.

**Step 4: Replace page reducer with shell composition**

`page.tsx` should:

- create the workbench hook;
- render loading/error states;
- compose task chooser, rail, step panel, summary, and code panel;
- pass resolved project and generated result;
- contain no recipe-field switch statement.

**Step 5: Verify UI and legacy suites**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
npm run test:ml
```

**Step 6: Commit**

```powershell
git commit -m "feat: add task-first ML workbench shell"
```

### Task 9: Make the shell responsive

**Files:**

- Modify: `app/game-theme.css`
- Modify: `tests/tools/ai-generator-responsive.test.js`

**Step 1: Write failing viewport checks**

Test:

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1440 × 900.

Assertions:

- no page-level horizontal overflow;
- no control escapes its panel;
- long labels wrap;
- code scrolls inside its panel;
- mobile Configure/Preview tabs are visible;
- desktop panels are both visible;
- sticky action does not cover the final field;
- changing tasks during load still rejects stale responses;
- retry still works.

Browser tests must start an owned development server unless `AI_GENERATOR_TEST_URL` is explicitly supplied.

**Step 2: Verify RED**

```powershell
npm run test:ml:responsive
```

Expected: new shell assertions fail before styles.

**Step 3: Implement responsive CSS**

Use:

- `grid-template-columns: minmax(0, ...) minmax(0, ...)`;
- `min-width: 0` on grid children;
- full-width controls;
- internal code overflow;
- single-column mobile composition;
- safe sticky bottom spacing;
- reduced-motion support.

Avoid global width overrides that could affect unrelated portfolio pages.

**Step 4: Verify GREEN**

```powershell
npm run test:ml:responsive
```

**Step 5: Add focused foundation script**

Modify `package.json` minimally:

- add `test:ml:foundation`;
- include it in `test:ml`.

Do not reformat or regenerate unrelated package content.

**Step 6: Full Phase 1 verification**

```powershell
npm run test:ml:foundation
npm run test:ml
npm run test:ml:responsive
npm run lint
npm run build
```

Expected: all pass.

**Step 7: Commit**

```powershell
git commit -m "fix: make ML workbench responsive"
```

## Phase 2: data workflow and classical ML

### Task 10: Add inspection, split, and preparation metadata

**Files:**

- Create: `lib/tools/ml-generator/workbench/registries/inspection-options.js`
- Create: `lib/tools/ml-generator/workbench/registries/imbalance-options.js`
- Modify: `lib/tools/ml-generator/workbench/registries/data-profiles.js`
- Modify: `lib/tools/ml-generator/workbench/registries/split-strategies.js`
- Modify: `lib/tools/ml-generator/workbench/registries/preparation-options.js`
- Modify: `lib/tools/ml-generator/workbench/registries/index.js`
- Create: `tests/tools/ml-data-workflow.test.js`

**Step 1: Write failing registry/compatibility tests**

Cover:

- CSV head, shape, dtypes, missing values, duplicates, target distribution, descriptive statistics, and correlation;
- random, stratified, group, subject, time, predefined, and cross-validation splits;
- 80/20, 70/15/15, and small-data-with-CV presets;
- numeric and categorical imputation;
- scaling;
- one-hot and ordinal encoding;
- rare category handling;
- feature selection;
- target transformation;
- class weights, oversampling, undersampling, SMOTE, and SMOTENC.

Compatibility rules:

- stratification requires a classification target;
- time split disables shuffling;
- SMOTE requires classification and compatible tabular numeric representation;
- SMOTENC requires categorical feature metadata;
- raw image, text, and sequence profiles disable tabular SMOTE;
- target transformation is regression-only.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-data-workflow.test.js
```

**Step 3: Implement metadata and rules**

Keep UI-independent plain records.

**Step 4: Verify GREEN**

```powershell
node --test tests/tools/ml-data-workflow.test.js
node --test tests/tools/ml-workbench-compatibility.test.js
```

**Step 5: Commit**

```powershell
git commit -m "feat: define ML data workflow options"
```

### Task 11: Add reusable Python section generation

**Files:**

- Create: `lib/tools/ml-generator/workbench/generators/python-sections.js`
- Create: `lib/tools/ml-generator/workbench/generators/sklearn/tabular-shared.js`
- Create: `tests/tools/ml-leakage.test.js`

**Step 1: Write failing section and leakage tests**

Generated order must be:

1. imports;
2. configuration constants;
3. load;
4. inspect;
5. split;
6. build preprocessing;
7. build model/pipeline;
8. train;
9. validate/tune;
10. final test;
11. save;
12. inference.

Assert:

- no imputer/scaler/encoder is fitted before split;
- no test data is passed to `fit` or `fit_resample`;
- resampling is inside `imblearn.pipeline.Pipeline`;
- cross-validation receives the pipeline, not pre-resampled arrays;
- final test evaluation occurs after selection/tuning.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-leakage.test.js
```

**Step 3: Implement ordered section builders**

Builders accept resolved configuration and return structured sections before final string assembly.

Avoid free-form concatenation scattered through model adapters.

**Step 4: Verify GREEN**

```powershell
node --test tests/tools/ml-leakage.test.js
```

**Step 5: Commit**

```powershell
git commit -m "feat: generate leakage-safe Python sections"
```

### Task 12: Add classical classification generation

**Files:**

- Create: `lib/tools/ml-generator/workbench/generators/sklearn/classification.js`
- Modify: `lib/tools/ml-generator/workbench/registries/models.js`
- Modify: `lib/tools/ml-generator/workbench/registries/metrics.js`
- Modify: `lib/tools/ml-generator/workbench/registries/generator-adapters.js`
- Modify: `lib/tools/ml-generator/workbench/load-generator-adapter.js`
- Create: `tests/tools/ml-classical-generator.test.js`

**Step 1: Write failing classification tests**

Models:

- DummyClassifier;
- LogisticRegression;
- KNeighborsClassifier;
- compatible Naive Bayes variants;
- LinearSVC/SVC;
- DecisionTreeClassifier;
- RandomForestClassifier;
- GradientBoostingClassifier;
- HistGradientBoostingClassifier.

Metrics:

- accuracy;
- balanced accuracy;
- precision;
- recall;
- F1;
- ROC AUC when probabilities or decision scores are available;
- confusion matrix;
- classification report.

Test model/preprocessing constraints:

- Multinomial NB receives non-negative compatible features;
- categorical NB requires ordinal non-negative categories;
- sparse/dense compatibility is explicit;
- probability metrics are disabled or calibrated when unsupported;
- scaling is recommended for distance and margin models.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-classical-generator.test.js
```

**Step 3: Implement classification adapter**

Generate:

- baseline;
- selected model;
- preprocessing pipeline;
- optional imbalance handling;
- training;
- selected metrics;
- save/load;
- single-row inference example.

**Step 4: Verify GREEN and AST parsing**

```powershell
node --test tests/tools/ml-classical-generator.test.js
npm run test:ml
```

**Step 5: Commit**

```powershell
git commit -m "feat: generate classical classification scripts"
```

### Task 13: Add regression generation

**Files:**

- Create: `lib/tools/ml-generator/workbench/generators/sklearn/regression.js`
- Modify: model and metric registries
- Modify: literal adapter loader
- Extend: `tests/tools/ml-classical-generator.test.js`

**Step 1: Write failing regression tests**

Models:

- DummyRegressor;
- LinearRegression;
- Ridge;
- Lasso;
- ElasticNet;
- KNeighborsRegressor;
- SVR;
- DecisionTreeRegressor;
- RandomForestRegressor;
- GradientBoostingRegressor;
- HistGradientBoostingRegressor.

Metrics:

- MAE;
- RMSE;
- R²;
- median absolute error;
- MAPE only when compatible with target values.

Options:

- regularization;
- L1/L2 ratio;
- polynomial features;
- neighbor count and weighting;
- kernel parameters;
- tree depth and leaf size;
- estimator count;
- learning rate;
- target transformation.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ml-classical-generator.test.js --test-name-pattern regression
```

**Step 3: Implement regression adapter**

Reuse tabular section builders. Do not duplicate split or preprocessing generation.

**Step 4: Verify GREEN**

```powershell
node --test tests/tools/ml-classical-generator.test.js
npm run test:ml
```

**Step 5: Commit**

```powershell
git commit -m "feat: generate configurable regression scripts"
```

### Task 14: Add data, model, and evaluation steps to the UI

**Files:**

- Create: `components/tools/ml-workbench/InspectionStep.tsx`
- Create: `components/tools/ml-workbench/SplitStep.tsx`
- Create: `components/tools/ml-workbench/PreparationStep.tsx`
- Create: `components/tools/ml-workbench/ModelStep.tsx`
- Create: `components/tools/ml-workbench/EvaluationStep.tsx`
- Modify: `components/tools/ml-workbench/WorkbenchStepPanel.tsx`
- Modify: task/data/model registries
- Extend: `tests/tools/ai-generator-workbench-flow.test.js`

**Step 1: Write failing student-flow tests**

Test both classification and regression:

- task is easy to find;
- dataset target is selected;
- inspection options can be included without changing preparation;
- split preset updates ratios;
- custom ratios must sum to 100%;
- incompatible split/SMOTE/model options explain why;
- Guided shows recommendations;
- Customize reveals common parameters;
- Advanced reveals specialist parameters without changing state;
- summary describes the chosen workflow;
- generated code updates when one setting changes.

**Step 2: Verify RED**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
```

**Step 3: Implement registry-driven steps**

No component should contain a complete hard-coded list of algorithms. Components render compatible records and dispatch ProjectConfig updates.

**Step 4: Verify GREEN and responsive behavior**

```powershell
node --test tests/tools/ai-generator-workbench-flow.test.js
npm run test:ml:responsive
```

**Step 5: Commit**

```powershell
git commit -m "feat: guide classical ML configuration"
```

### Task 15: Add pairwise and smoke coverage

**Files:**

- Create: `tests/tools/ml-classical-pairwise.test.js`
- Create: `tests/tools/ml-classical-smoke.test.js`
- Modify: `package.json`

**Step 1: Define pairwise dimensions**

At minimum:

- classification/regression;
- numeric-only/mixed tabular;
- two-way/three-way/CV split;
- no scaling/standard/robust;
- no imbalance/class weights/SMOTE where compatible;
- linear/distance/kernel/tree/ensemble model;
- quick/custom configuration;
- single/multiple metrics.

**Step 2: Generate all pairwise configurations**

For every case:

- resolve successfully;
- generate deterministically;
- contain no placeholders;
- parse with Python AST;
- contain the expected estimator and pipeline ordering.

**Step 3: Add representative execution smoke tests**

Use publicly available official small datasets or built-in library fetchers:

- Iris or Breast Cancer Wisconsin for classification;
- Auto MPG or another verified small public regression dataset;
- one mixed categorical/numeric classification path;
- one SMOTE path.

Do not generate substitute datasets.

If network-dependent data is unsuitable for CI, maintain a separate opt-in smoke command that downloads from the official source and records source/checksum metadata. The default unit suite must remain deterministic.

**Step 4: Add focused script**

Add `test:ml:classical` without reformatting unrelated package content.

**Step 5: Verify**

```powershell
npm run test:ml:classical
npm run test:ml
npm run test:ml:responsive
```

**Step 6: Commit**

```powershell
git commit -m "test: cover classical ML configurations"
```

## Phase 2 completion review

### Task 16: Full verification and student audit

**Files:**

- Modify: `docs/reports/2026-07-27-ai-script-generator-student-audit.md`
- Create or modify implementation notes only if needed.

**Step 1: Run static quality checks**

```powershell
npm run lint
npm run build
```

**Step 2: Run all ML tests**

```powershell
npm run test:ml
npm run test:ml:responsive
npm run test:ml:foundation
npm run test:ml:classical
```

**Step 3: Run representative generated scripts**

Execute the approved smoke matrix in isolated Python environments. Record:

- configuration ID;
- dataset source;
- dependency versions;
- execution result;
- metric output shape;
- saved artifact;
- inference result.

**Step 4: Perform responsive visual review**

Inspect required viewports and confirm:

- no overlap;
- no clipped controls;
- no page horizontal overflow;
- mobile tabs preserve state;
- sticky actions do not cover content;
- code remains readable and copyable.

**Step 5: Repeat the student-perspective audit**

Rate:

- task discovery;
- conceptual explanation;
- configuration coverage;
- data workflow;
- leakage safety;
- code readability;
- responsiveness;
- dataset guidance;
- readiness for a first project.

Do not claim a 10/10 or 90% no-code result unless the tested evidence supports it.

**Step 6: Update the report**

Replace the old statement that dataset research had not occurred. Link the approved design and this plan. List remaining Phase 3–5 gaps.

**Step 7: Final diff review**

```powershell
git status --short
git diff --check
git diff --stat
```

Confirm unrelated user changes were not staged or overwritten.

**Step 8: Commit**

```powershell
git commit -m "docs: report ML workbench learning audit"
```

## Deferred plans

The following require separate implementation plans after Phase 2 is reviewed:

- verified public dataset catalog and recommendation engine;
- framework-neutral sequential neural-network builder;
- Keras and PyTorch architecture adapters;
- text, audio, forecasting, anomaly, and recommendation workflows;
- embeddings, local LLM inference, PEFT, and Unsloth workflows;
- broader public-dataset execution matrix.

