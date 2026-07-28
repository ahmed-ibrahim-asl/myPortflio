# Model Mission Sensor and Edge-Image Advanced Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give sensor time-series and edge-image tasks genuinely advanced, leakage-safe training controls with clear educational explanations.

**Architecture:** Extend the existing lazy recipe implementations and register their controls in the shared Model Mission control registry. Preserve recipe IDs, adapter contracts, deterministic generation, and the single nine-step builder.

**Tech Stack:** JavaScript ES modules, deterministic Python templates, PyTorch for sensor workflows, TensorFlow/Keras for edge-image workflows, Node test runner.

## Global Constraints

- Execute this plan after Task 4 and before Task 5 of `2026-07-29-model-mission-learning-engine.md`.
- Preserve the existing recipe IDs and lazy loading.
- Fit normalization only on training data.
- Apply resampling or augmentation only to training data.
- Protect a final test set from tuning.
- Explain group split, time split, normalization, class balance, and augmentation in plain and technical language.
- Guided, Customize, and Advanced remain cumulative disclosure levels.
- Do not introduce another builder or visual style.

---

### Task 1: Add leakage-safe advanced sensor workflows

**Files:**
- Modify: `lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `tests/tools/ml-generator-sensor-parity.test.js`
- Modify: `tests/tools/model-mission-catalog.test.js`

**Interfaces:**
- Adds: `splitStrategy: "random" | "group" | "time"`
- Adds: `groupColumn`, `timeColumn`, `normalization`, `classBalance`
- Adds: `scheduler`, `gradientClip`, `mixedPrecision`, `deterministic`
- Preserves: `sensor-timeseries-classification` recipe result contract

- [ ] **Step 1: Write failing sensor tests**

```js
test("sensor group split prevents entity leakage", () => {
  const result = generateSensorRecipe({
    splitStrategy: "group",
    groupColumn: "machine_id",
    normalization: "standard",
    classBalance: "weighted-sampler",
    scheduler: "reduce-on-plateau",
    gradientClip: 1,
  }, "production");

  assert.match(result.code, /GroupShuffleSplit/);
  assert.match(result.code, /groups=frame\["machine_id"\]/);
  assert.match(result.code, /WeightedRandomSampler/);
  assert.match(result.code, /clip_grad_norm_/);
});

test("sensor time split keeps later windows for evaluation", () => {
  const result = generateSensorRecipe({
    splitStrategy: "time",
    timeColumn: "timestamp",
    normalization: "robust",
  }, "production");

  assert.match(result.code, /sort_values\("timestamp"\)/);
  assert.match(result.code, /fit_normalizer\(train_/);
  assert.doesNotMatch(
    result.code.slice(0, result.code.indexOf("fit_normalizer(train_")),
    /validation_|test_/,
  );
});
```

Add assertions for deterministic seeds, scheduler stepping on validation loss,
mixed precision guarded by CUDA availability, and invalid missing group/time
columns.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-generator-sensor-parity.test.js tests/tools/model-mission-catalog.test.js
```

Expected: FAIL because the fields and split behavior do not exist.

- [ ] **Step 3: Implement sensor fields and registry explanations**

Register Guided random splitting, Customize normalization and class balancing,
and Advanced group/time splitting, scheduler, clipping, mixed precision, and
deterministic execution.

Use this explanation for group splitting:

```js
{
  what: "Keeps every window from one machine, person, or recording in one split.",
  why: "Random window splitting can place nearly identical windows in training and test data.",
  useWhen: "Several rows or windows come from the same physical entity or recording.",
  avoidWhen: "Every sample is independent and no stable group identifier exists.",
  tradeoff: "Scores are usually lower but better represent performance on unseen entities.",
  codeEffect: "Uses GroupShuffleSplit with the selected group column.",
}
```

- [ ] **Step 4: Generate safe split, normalization, and training behavior**

Use stratified random splitting for independent windows, `GroupShuffleSplit`
for entity groups, and chronological slicing after sorting for time splits.
Calculate training-only center/scale statistics and reuse them for validation
and test. Attach `WeightedRandomSampler` only to the training loader.

Add scheduler stepping after validation, optional `clip_grad_norm_`, CUDA-only
automatic mixed precision, and deterministic seed setup.

- [ ] **Step 5: Run sensor, catalog, and generated-code tests**

Run:

```powershell
node --test tests/tools/ml-generator-sensor-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/control-definitions.js tests/tools/ml-generator-sensor-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: add advanced sensor experiment controls"
```

---

### Task 2: Add final-test and advanced augmentation controls to edge images

**Files:**
- Modify: `lib/tools/ml-generator/recipes/deployment/edge-image-classification.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `tests/tools/ml-generator-edge-parity.test.js`
- Modify: `tests/tools/model-mission-catalog.test.js`

**Interfaces:**
- Adds: `testFraction`, `optimizer`, `scheduler`, `classWeights`
- Adds: `augmentationPreset`, `horizontalFlip`, `rotationDegrees`, `zoomFraction`
- Adds: `mixedPrecision`, `workers`
- Preserves: TFLite export and representative-dataset controls

- [ ] **Step 1: Write failing edge-image tests**

```js
test("edge image workflow protects a final test set", () => {
  const result = generateEdgeRecipe({
    validationFraction: 0.15,
    testFraction: 0.15,
    optimizer: "adamw",
    classWeights: true,
  }, "production");

  assert.match(result.code, /test_dataset/);
  assert.match(result.code, /class_weight=/);
  assert.match(result.code, /Final test/);
  assert.ok(
    result.code.indexOf("model.fit(")
    < result.code.indexOf("Final test"),
  );
});

test("edge augmentation is applied only to training images", () => {
  const result = generateEdgeRecipe({
    augmentationPreset: "custom",
    horizontalFlip: true,
    rotationDegrees: 12,
    zoomFraction: 0.1,
  }, "production");

  assert.match(result.code, /RandomFlip/);
  assert.match(result.code, /RandomRotation/);
  assert.match(result.code, /RandomZoom/);
  assert.match(result.code, /training=True/);
});
```

Add assertions for scheduler, mixed precision, workers, invalid split totals,
and TFLite export parity.

- [ ] **Step 2: Run edge and catalog tests and verify failure**

Run:

```powershell
node --test tests/tools/ml-generator-edge-parity.test.js tests/tools/model-mission-catalog.test.js
```

Expected: FAIL because the advanced fields and final-test behavior do not exist.

- [ ] **Step 3: Register edge-image controls with complete explanations**

Guided shows input size, baseline model, epochs, and export. Customize adds
validation/test ratios, augmentation preset, optimizer, learning rate, early
stopping, and fine-tuning. Advanced adds individual transforms, class weights,
scheduler, mixed precision, workers, representative samples, and export
validation.

Explain that augmentation creates varied training examples in memory and must
never modify validation or test images.

- [ ] **Step 4: Implement training-only augmentation and final evaluation**

Construct separate train, validation, and test datasets. Apply augmentation
inside the model or training map with `training=True`. Derive class weights from
training labels only. Compile the selected optimizer, add the selected
scheduler, evaluate the test dataset once after all fitting and fine-tuning, and
retain existing TFLite conversion and representative-dataset behavior.

- [ ] **Step 5: Run edge, catalog, and generated-code tests**

Run:

```powershell
node --test tests/tools/ml-generator-edge-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/tools/ml-generator/recipes/deployment/edge-image-classification.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/control-definitions.js tests/tools/ml-generator-edge-parity.test.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: add advanced edge image experiments"
```
