# AI Script Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed AI boilerplate selector with a responsive, data-driven generator that produces configurable Python scripts for two YOLO workflows, sensor time-series classification, and edge image classification.

**Architecture:** `lib/tools/ml-templates.js` becomes the registry and generation boundary. The React page owns reducer state and renders field metadata through focused presentational components. Unit tests verify registry behavior and generated Python; the existing dependency-free Chrome DevTools Protocol test verifies the real layout at five viewports.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 6, JavaScript with JSDoc, Node 25 `node:test`, Python AST parsing, CSS Grid, Chrome DevTools Protocol.

## Global Constraints

- Generate standard `.py` files only. Runtime targets filter device and export choices but never produce notebooks or notebook magic.
- Keep exactly four templates: YOLO detection, YOLO segmentation, sensor time-series classification, and edge image classification.
- Pin the YOLO generators to Ultralytics `>=8.3,<9` and YOLOv8 weight names.
- Label the advanced mode **Production-oriented** and avoid claims of production certification.
- Put model rules, field metadata, normalization, validation, dependencies, guidance, and Python generation in `lib/tools/ml-templates.js`.
- Put reducer state, field rendering, copy behavior, tabs, and accessibility announcements in the page and its presentational components.
- Normalize invalid dependent selections to a compatible value before validation.
- Return no code when blocking validation errors exist.
- Keep Python indentation intact; code scrolls inside `<pre>`.
- Fix overflow at its source. Do not hide page-level overflow.
- Use the existing visual language and CSS variables.
- Preserve visible keyboard focus, 44-pixel targets, labels, descriptions, and live status messages.
- Follow red-green-refactor for every task and commit only the files named by that task.

## File Map

- Modify `lib/tools/ml-templates.js`: registry, field factories, defaults, normalization, validation, metadata, four Python builders, and public API.
- Modify `tests/tools/ml-generator.test.js`: registry and generated-code tests using `node:test`.
- Modify `app/tools/ai-script-generator/page.tsx`: reducer, derived result, mode/template controls, field dispatch, copy status, and page composition.
- Create `components/tools/ml-generator/ConfigurationField.tsx`: accessible select, number, text, and toggle renderer.
- Create `components/tools/ml-generator/GeneratorCodePanel.tsx`: filename, copy action, validation placeholder, and non-wrapping code viewport.
- Create `components/tools/ml-generator/GeneratorInfoTabs.tsx`: accessible metadata buttons and conditional panels.
- Modify `app/game-theme.css`: generator layout, panels, modes, fields, tabs, code viewport, states, and breakpoints.
- Modify `tests/tools/ai-generator-responsive.test.js`: five viewport checks, exact long-value state, panel containment, code scrolling, and runtime-target checks.
- Modify `data/tools.js`: align the tool-card description with configurable Python generation.

---

### Task 1: Registry kernel and YOLO detection template

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Modify: `lib/tools/ml-templates.js`

**Interfaces:**
- Consumes: Existing `node:test` conventions in `tests/tools/*.test.js`.
- Produces: `ML_TEMPLATES`, `getTemplateById`, `getDefaultConfig`, `getVisibleFields`, `getFieldOptions`, `normalizeTemplateConfig`, `validateTemplateConfig`, `generateMlScript`, `getTemplateOutputMetadata`, and `buildMlGeneratorResult`.

- [ ] **Step 1: Replace the old generator tests with failing registry and detection tests**

Use `node:test` and literal expected values:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ML_TEMPLATES,
  buildMlGeneratorResult,
  generateMlScript,
  getDefaultConfig,
  getFieldOptions,
  getVisibleFields,
  normalizeTemplateConfig,
  validateTemplateConfig,
} from "../../lib/tools/ml-templates.js";

test("registry starts with the YOLO detection template", () => {
  assert.ok(
    ML_TEMPLATES.some((template) => template.id === "yolo-detection-training"),
  );
});

test("detection defaults normalize and validate in both modes", () => {
  for (const mode of ["starter", "production"]) {
    const defaults = getDefaultConfig("yolo-detection-training", mode);
    const normalized = normalizeTemplateConfig(
      "yolo-detection-training",
      defaults,
      mode,
    );
    assert.deepEqual(validateTemplateConfig(
      "yolo-detection-training",
      normalized,
      mode,
    ), {});
  }
});

test("detection model size changes generated weights", () => {
  const config = {
    ...getDefaultConfig("yolo-detection-training", "production"),
    modelSize: "large",
  };
  const code = generateMlScript(
    "yolo-detection-training",
    config,
    "production",
  );
  assert.match(code, /"model_weights": "yolov8l\.pt"/);
  assert.doesNotMatch(code, /-seg\.pt/);
});

test("Jetson normalizes an incompatible export format", () => {
  const normalized = normalizeTemplateConfig(
    "yolo-detection-training",
    {
      ...getDefaultConfig("yolo-detection-training", "production"),
      environment: "jetson",
      exportFormat: "openvino",
    },
    "production",
  );
  assert.ok(["onnx", "engine"].includes(normalized.exportFormat));
});

test("every result is a Python script without notebook magic", () => {
  const result = buildMlGeneratorResult(
    "yolo-detection-training",
    getDefaultConfig("yolo-detection-training", "production"),
    "production",
  );
  assert.match(result.filename, /\.py$/);
  assert.doesNotMatch(result.filename, /\.ipynb$/);
  assert.doesNotMatch(result.code, /^!/m);
  assert.equal(result.code.endsWith("\n"), true);
  assert.equal(result.code.endsWith("\n\n"), false);
});
```

- [ ] **Step 2: Run the detection tests and verify the old API fails**

Run:

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the registry exports do not exist.

- [ ] **Step 3: Implement generic registry helpers**

In `lib/tools/ml-templates.js`, add:

```js
const MODES = new Set(["starter", "production"]);

function ensureMode(mode) {
  return MODES.has(mode) ? mode : "starter";
}

function ensureTrailingNewline(code) {
  return `${String(code).replace(/\s+$/u, "")}\n`;
}

function normalizeSelectValue(value, options, fallback) {
  const values = new Set(options.map((option) => option.value));
  if (values.has(value)) return value;
  if (values.has(fallback)) return fallback;
  return options[0]?.value ?? "";
}

function clone(value) {
  return structuredClone(value);
}
```

Implement the public functions with a strict requested-ID check in `buildMlGeneratorResult`. `getTemplateById` may return the first template for safe UI rendering, but an unknown requested ID adds `validationErrors.templateId` and returns `code: ""`.

Keep the existing `ML_CONFIGURATIONS` and `generateMLCode` exports unchanged as a temporary compatibility layer so the current page keeps building through Tasks 1?4. Task 5 removes them after the page migrates to the registry API.

- [ ] **Step 4: Implement shared YOLO fields and detection normalization**

Define literal option tables for workflow, size, runtime target, image size, devices, and exports. Use `environment` as the internal field ID and `Runtime target` as its label.

Create `createYoloFields({ defaultRunName, defaultProjectDirectory })`. Production visibility predicates must enforce:

```js
const isTraining = ({ task }) => ["train", "train-export"].includes(task);
const hasDataset = ({ task }) => ["train", "validate", "train-export"].includes(task);
const hasInference = ({ task }) => ["train", "inference", "train-export"].includes(task);
const hasExport = ({ task }) => task === "train-export";
```

Normalize in this order: mode defaults, user config, workflow, model size, runtime target, device, export format, booleans, numeric coercion, hidden-field reset.

- [ ] **Step 5: Implement the shared YOLO Python builder**

Create:

```js
function generateYoloScript({
  config,
  mode,
  modelFilename,
  outputName,
}) {}
```

Generate the complete script defined by the design spec. Include:

- `from __future__ import annotations`
- JSON configuration logging
- Python, NumPy, and PyTorch seeds
- runtime device resolution
- dataset YAML and source path validation
- model loading with chained errors
- task-aware train, validate, inference, and export branches
- checkpoint lookup
- exit codes for keyboard interruption and fatal errors

Use standard Python imports only. Do not emit `!pip`, `%pip`, notebook cells, pseudocode, incomplete markers, or ellipses.

- [ ] **Step 6: Register the detection template**

Use the pinned weight map:

```js
const YOLO_DETECTION_WEIGHTS = {
  nano: "yolov8n.pt",
  small: "yolov8s.pt",
  medium: "yolov8m.pt",
  large: "yolov8l.pt",
  "extra-large": "yolov8x.pt",
};
```

Add the dependency, dataset, metric, hardware, deployment, note, and warning metadata from the design spec. Contextual warnings must cover large edge models, high image-size/batch combinations, CPU training, and placeholder production paths.

- [ ] **Step 7: Run the detection tests and verify green**

Run:

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: all detection and registry tests PASS.

- [ ] **Step 8: Commit the registry kernel and detection template**

```powershell
git add -- lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "feat: add configurable YOLO detection generator"
```

---

### Task 2: YOLO segmentation template

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Modify: `lib/tools/ml-templates.js`

**Interfaces:**
- Consumes: `createYoloFields`, YOLO normalization, and `generateYoloScript` from Task 1.
- Produces: `yolo-segmentation-training` with segmentation weights and metadata.

- [ ] **Step 1: Add failing segmentation tests**

```js
test("segmentation uses segmentation weights", () => {
  const config = {
    ...getDefaultConfig("yolo-segmentation-training", "production"),
    modelSize: "small",
  };
  const code = generateMlScript(
    "yolo-segmentation-training",
    config,
    "production",
  );
  assert.match(code, /"model_weights": "yolov8s-seg\.pt"/);
});

test("YOLO templates reuse unique field definitions", () => {
  for (const templateId of [
    "yolo-detection-training",
    "yolo-segmentation-training",
  ]) {
    const template = ML_TEMPLATES.find((item) => item.id === templateId);
    const ids = template.fields.map((field) => field.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});
```

- [ ] **Step 2: Run the tests and verify segmentation is absent**

Run:

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the segmentation template is not registered.

- [ ] **Step 3: Register segmentation through the shared builder**

Use:

```js
const YOLO_SEGMENTATION_WEIGHTS = {
  nano: "yolov8n-seg.pt",
  small: "yolov8s-seg.pt",
  medium: "yolov8m-seg.pt",
  large: "yolov8l-seg.pt",
  "extra-large": "yolov8x-seg.pt",
};
```

Pass `./runs/segmentation` and `yolo_segmentation` to the shared fields and builder. Replace detection dataset guidance with polygon rows and include both box and mask metrics.

- [ ] **Step 4: Run the tests and verify green**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit segmentation**

```powershell
git add -- lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "feat: add YOLO segmentation generator"
```

---

### Task 3: Sensor time-series classifier

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Modify: `lib/tools/ml-templates.js`

**Interfaces:**
- Consumes: Registry helpers and result builder from Task 1.
- Produces: `sensor-timeseries-classification` and its complete PyTorch script.

- [ ] **Step 1: Add failing defaults, validation, and code tests**

```js
test("sensor defaults generate a complete CNN script", () => {
  const result = buildMlGeneratorResult(
    "sensor-timeseries-classification",
    getDefaultConfig("sensor-timeseries-classification", "starter"),
    "starter",
  );
  assert.deepEqual(result.validationErrors, {});
  assert.match(result.code, /class CNN1D\(nn\.Module\):/);
  assert.match(result.code, /macro_f1/);
  assert.match(result.code, /torch\.onnx\.export|torch\.jit\.script/);
});

test("sensor split fractions cannot consume the dataset", () => {
  const errors = validateTemplateConfig(
    "sensor-timeseries-classification",
    {
      ...getDefaultConfig("sensor-timeseries-classification", "production"),
      validationFraction: 0.4,
      testFraction: 0.4,
    },
    "production",
  );
  assert.match(errors.validationFraction, /total less than 0\.8/i);
});

test("sensor label column cannot also be a feature", () => {
  const errors = validateTemplateConfig(
    "sensor-timeseries-classification",
    {
      ...getDefaultConfig("sensor-timeseries-classification", "starter"),
      featureColumns: "ax,label",
      labelColumn: "label",
    },
    "starter",
  );
  assert.match(errors.featureColumns, /label column/i);
});
```

- [ ] **Step 2: Run the tests and verify red**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the sensor template is absent.

- [ ] **Step 3: Define the sensor fields and validator**

Add task, architecture, size, runtime target, dataset/column, window, split, optimization, device, export, checkpoint, and sample-rate fields with the exact bounds from the design spec.

Dependencies:

```js
[
  { package: "torch", version: ">=2.3,<3", purpose: "Training and export" },
  { package: "numpy", version: ">=1.26,<3", purpose: "Windowing and normalization" },
  { package: "pandas", version: ">=2.2,<3", purpose: "CSV loading" },
  { package: "scikit-learn", version: ">=1.4,<2", purpose: "Metrics and labels" },
  { package: "onnx", version: ">=1.16,<2", purpose: "ONNX export" },
]
```

- [ ] **Step 4: Implement the sensor Python builder**

The generated Python must:

- read a chronologically ordered CSV and reject missing columns or values
- build overlapping windows using the last row label
- split windows chronologically
- fit mean and standard deviation on training windows only
- encode labels from training data and reject unseen evaluation labels
- instantiate CNN1D, LSTM, or CNN-LSTM with width 32, 64, 128, or 256
- train with early stopping and save the best checkpoint
- calculate accuracy, macro F1, per-class precision/recall, confusion matrix, latency, and file size
- export fixed-window TorchScript or ONNX
- run one window inference

- [ ] **Step 5: Run tests and commit**

```powershell
node --test tests\tools\ml-generator.test.js
git add -- lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "feat: add sensor classification generator"
```

Expected: PASS before commit.

---

### Task 4: Edge image classifier

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Modify: `lib/tools/ml-templates.js`

**Interfaces:**
- Consumes: Registry helpers and result builder.
- Produces: `edge-image-classification` with TensorFlow/Keras and TFLite generation.

- [ ] **Step 1: Add failing edge-template tests**

```js
import { spawnSync } from "node:child_process";

test("registry contains exactly the four approved templates", () => {
  assert.deepEqual(
    ML_TEMPLATES.map((template) => template.id),
    [
      "yolo-detection-training",
      "yolo-segmentation-training",
      "sensor-timeseries-classification",
      "edge-image-classification",
    ],
  );
});

test("Coral forces INT8 TFLite export", () => {
  const normalized = normalizeTemplateConfig(
    "edge-image-classification",
    {
      ...getDefaultConfig("edge-image-classification", "production"),
      environment: "coral",
      exportFormat: "tflite-fp16",
    },
    "production",
  );
  assert.equal(normalized.exportFormat, "tflite-int8");
});

test("edge classifier changes the generated backbone", () => {
  const code = generateMlScript(
    "edge-image-classification",
    {
      ...getDefaultConfig("edge-image-classification", "production"),
      model: "efficientnet-v2-b0",
    },
    "production",
  );
  assert.match(code, /EfficientNetV2B0/);
});

test("all registered default scripts parse as Python", () => {
  for (const template of ML_TEMPLATES) {
    for (const mode of ["starter", "production"]) {
      const code = generateMlScript(
        template.id,
        getDefaultConfig(template.id, mode),
        mode,
      );
      assert.ok(code.length > 0, `${template.id}/${mode} generated no code`);
      const parsed = spawnSync(
        "python",
        ["-c", "import ast,sys; ast.parse(sys.stdin.read())"],
        { input: code, encoding: "utf8" },
      );
      assert.equal(
        parsed.status,
        0,
        `${template.id}/${mode}: ${parsed.stderr}`,
      );
    }
  }
});
```

- [ ] **Step 2: Run tests and verify red**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the edge template is absent.

- [ ] **Step 3: Define edge fields, normalization, and validation**

Register MobileNetV3Small, MobileNetV3Large, and EfficientNetV2B0. Filter TFLite formats by runtime target. Coral must force `tflite-int8`, require 10–1000 representative samples, and add the external Edge TPU compilation warning.

Dependencies:

```js
[
  { package: "tensorflow", version: ">=2.16,<3", purpose: "Training and TFLite export" },
  { package: "numpy", version: ">=1.26,<3", purpose: "Representative data and inference" },
  { package: "Pillow", version: ">=10,<12", purpose: "Sample image loading" },
]
```

- [ ] **Step 4: Implement the edge Python builder**

Generate code that loads class directories, creates deterministic training and validation datasets, builds the selected transfer-learning backbone, freezes then optionally fine-tunes the configured number of layers, checkpoints the best model, evaluates it, exports FP32/FP16/INT8 TFLite, writes labels, and runs one TFLite inference.

For INT8, build a representative dataset from the configured sample count and set integer input/output types when the target is Coral.

- [ ] **Step 5: Add metadata completeness tests**

```js
test("every template has complete metadata and valid defaults", () => {
  for (const template of ML_TEMPLATES) {
    assert.ok(template.dependencies.length > 0);
    assert.ok(template.dataset.summary);
    assert.ok(template.dataset.structure);
    assert.ok(template.metrics.length > 0);
    assert.ok(template.hardware.minimum);
    assert.ok(template.hardware.recommended);
    assert.ok(template.deployment.length > 0);
    for (const mode of ["starter", "production"]) {
      const config = getDefaultConfig(template.id, mode);
      assert.deepEqual(validateTemplateConfig(template.id, config, mode), {});
    }
  }
});
```

- [ ] **Step 6: Run tests and commit**

```powershell
node --test tests\tools\ml-generator.test.js
git add -- lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "feat: add edge image classification generator"
```

Expected: PASS before commit.

---

### Task 5: Reducer-driven interactive page

**Files:**
- Create: `components/tools/ml-generator/ConfigurationField.tsx`
- Create: `components/tools/ml-generator/GeneratorCodePanel.tsx`
- Create: `components/tools/ml-generator/GeneratorInfoTabs.tsx`
- Modify: `app/tools/ai-script-generator/page.tsx`
- Modify: `data/tools.js`

**Interfaces:**
- Consumes: The public registry API and `buildMlGeneratorResult`.
- Produces: Registry-rendered controls, mode switching, raw number handling, code preview, copy state, metadata tabs, and accessible statuses.

- [ ] **Step 1: Expand the browser test with failing semantic selectors**

Before changing the page, update `tests/tools/ai-generator-responsive.test.js` to assert that the rendered route contains:

```js
const semantics = await client.send("Runtime.evaluate", {
  returnByValue: true,
  expression: `({
    page: Boolean(document.querySelector(".ml-generator-page")),
    config: Boolean(document.querySelector(".ml-generator-config-panel")),
    output: Boolean(document.querySelector(".ml-generator-output-panel")),
    runtimeLabel: [...document.querySelectorAll("label")]
      .some((label) => label.textContent.includes("Runtime target"))
  })`,
});
```

Assert all four values are true.

- [ ] **Step 2: Run the browser test and verify red**

```powershell
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: FAIL because the new generator classes and runtime label do not exist.

- [ ] **Step 3: Create `ConfigurationField.tsx`**

Define a structural `ConfigurationFieldProps` type with field metadata, value, raw numeric value, error, and callbacks. Render:

- `<select>` from `getFieldOptions`
- `<input type="number">` using raw text
- `<input type="text">`
- checkbox toggle with visible state text

Build IDs as `ml-generator-${templateId}-${field.id}`. Connect help and error IDs through `aria-describedby`. Apply `aria-invalid` only when an error exists.

- [ ] **Step 4: Create `GeneratorCodePanel.tsx`**

Render `.ml-generator-actions`, ellipsized filename, copy button, polite status text, validation placeholder, warnings, and:

```tsx
<div className="ml-generator-code-shell">
  <pre className="ml-generator-code" tabIndex={0}>
    <code>{code}</code>
  </pre>
</div>
```

Disable copying when code is empty.

- [ ] **Step 5: Create `GeneratorInfoTabs.tsx`**

Use native buttons with `role="tab"`, `aria-selected`, `aria-controls`, and arrow-key navigation. Tabs are Dependencies, Dataset, Hardware, Metrics, Deployment, and Notes. Merge contextual warnings into Notes without converting them to blocking errors.

- [ ] **Step 6: Refactor the page around `useReducer`**

State:

```ts
type GeneratorState = {
  mode: "starter" | "production";
  templateId: string;
  config: Record<string, unknown>;
  rawNumericValues: Record<string, string>;
  activeInfoTab: "dependencies" | "dataset" | "hardware" | "metrics" | "deployment" | "notes";
  copyStatus: "idle" | "copied" | "failed";
  correctionMessage: string;
};
```

Actions must implement mode/template/field changes, raw numeric updates, numeric commit, tab selection, copy status, and correction announcements.

On every committed change:

1. Normalize through the registry.
2. Rebuild raw numeric strings from corrected values when blur clamps a value.
3. Derive `buildMlGeneratorResult` with `useMemo`.

Render `environment` with its registry label **Runtime target**. Do not render a script-format selector.

Keep the legacy `tool-grid`, `tool-controls`, and `tool-results` class aliases on the new structural elements during this task so the existing responsive regression stays green. Task 6 removes those aliases after the new generator selectors receive complete viewport coverage.

- [ ] **Step 7: Implement copy and mode behavior**

Copy through `navigator.clipboard.writeText`, set `copied` for two seconds, and expose failure text. Switching modes preserves shared values, removes hidden values from the effective config, and restores Production defaults when returning.

- [ ] **Step 8: Update the tool-card copy**

Use:

```js
description:
  "Configure and generate runnable Python scripts for YOLO, sensor intelligence, and edge AI workflows.",
```

- [ ] **Step 9: Run unit, browser, and build checks**

```powershell
node --test tests\tools\ml-generator.test.js
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
npm run build
```

Expected: unit tests, semantic browser checks, existing layout assertions, and the build all PASS.

After the page passes with the registry API, remove the temporary `ML_CONFIGURATIONS` and `generateMLCode` exports from `lib/tools/ml-templates.js`, rerun the same commands, and keep them green.

- [ ] **Step 10: Commit the interactive page**

```powershell
git add -- app/tools/ai-script-generator/page.tsx components/tools/ml-generator data/tools.js tests/tools/ai-generator-responsive.test.js
git commit -m "feat: build interactive AI script generator"
```

---

### Task 6: Responsive control-room styling and viewport coverage

**Files:**
- Modify: `app/game-theme.css`
- Modify: `tests/tools/ai-generator-responsive.test.js`

**Interfaces:**
- Consumes: Generator classes from Task 5.
- Produces: Responsive two-column/one-column layouts and five-viewport acceptance coverage.

- [ ] **Step 1: Expand the real-browser test to all required viewports**

Loop through:

```js
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 900, height: 900 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
```

For each viewport:

- choose YOLO detection, Production-oriented mode, extra-large size, Raspberry Pi runtime, and the longest compatible values
- assert `scrollWidth === clientWidth`
- assert each input, select, and button stays within `.ml-generator-config-panel`
- assert `.ml-generator-code` has computed `overflow-x` of `auto` or `scroll`
- assert code `scrollWidth >= clientWidth`

- [ ] **Step 2: Run the browser test and verify layout failures**

```powershell
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: FAIL at one or more viewports before generator-specific CSS exists.

- [ ] **Step 3: Implement generator CSS**

Add the exact structural protections from the design:

```css
.ml-generator-grid {
  display: grid;
  grid-template-columns: minmax(18rem, 23rem) minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  min-width: 0;
}

.ml-generator-grid > *,
.ml-generator-config-panel,
.ml-generator-output-panel,
.ml-generator-field {
  min-width: 0;
}

.ml-generator-field :is(input, select, textarea) {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.ml-generator-code {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: auto;
  white-space: pre;
}
```

Style the mode selector, grouped fields, readiness strip, validation states, warnings, tabs, actions, and focus rings from existing variables. Stack the grid at `960px` and actions at `520px`.

- [ ] **Step 4: Run the browser test and verify green**

```powershell
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: all five viewport cases PASS.

- [ ] **Step 5: Commit responsive behavior**

```powershell
git add -- app/game-theme.css tests/tools/ai-generator-responsive.test.js
git commit -m "fix: make AI generator responsive"
```

---

### Task 7: Final verification and representative output inspection

**Files:**
- Verify: `lib/tools/ml-templates.js`
- Verify: `tests/tools/ml-generator.test.js`
- Verify: `tests/tools/ai-generator-responsive.test.js`
- Verify: `app/tools/ai-script-generator/page.tsx`
- Verify: `app/game-theme.css`

**Interfaces:**
- Consumes: All four final templates and both modes.
- Produces: Fresh unit, syntax, viewport, build, and representative-output evidence.

- [ ] **Step 1: Run every engineering-tool test**

```powershell
node --test tests\tools\battery-math.test.js tests\tools\ml-generator.test.js tests\tools\pid-engine.test.js tests\tools\sensor-generator.test.js
```

Expected: zero failures, including the Python AST test added before the edge template.

- [ ] **Step 2: Run the viewport suite**

```powershell
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: all five viewports PASS.

- [ ] **Step 3: Run the production build**

```powershell
npm run build
```

Expected: exit code `0`. Record any pre-existing duplicate-route warning separately; do not describe warnings as errors.

- [ ] **Step 4: Inspect representative generated results**

Use a Node command that imports `buildMlGeneratorResult` and prints one Starter and one Production filename, validation state, and first configuration line for every template. Confirm:

- eight `.py` filenames
- eight empty validation maps
- no notebook magic
- YOLO detection and segmentation weights match their task
- runtime targets affect compatibility, not file format

- [ ] **Step 5: Record the final file diff and server URL**

```powershell
git status --short
git diff --stat
```

Confirm the persistent preview answers at the URL. This verification task creates no new commit unless a failing check needs a tested correction.
