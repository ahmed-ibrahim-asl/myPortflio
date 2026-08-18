# Sensor and AI Generator Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Sensor Code Generator into a correctly grouped embedded-code workbench with examples, and expand Model Mission with current YOLO26 detection, open-vocabulary, depth, semantic-segmentation, and U-Net workflows while preserving compatible YOLO11/YOLOv8 generation.

**Architecture:** Normalize embedded templates into a typed catalog with `sensor`, `communication`, and `interface` families, then drive the UI and examples from that catalog. Extend the existing Model Mission adapter/recipe architecture instead of creating a second AI interface: add model-family and preset controls, new recipe modules for depth and semantic segmentation, and U-Net as a semantic-segmentation architecture. Keep generated projects deterministic, validated, and downloadable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript/JavaScript, Ultralytics Python APIs, PyTorch, Albumentations, CSS, Node test runner, Python syntax validation, static export.

## Global Constraints

- Label sensors, communication protocols, and board interfaces truthfully; ESP-NOW, UART, MQTT, HTTP, BLE, I2C scanning, USB CDC, and camera interfaces are not presented as sensors.
- Every embedded option must produce compilable starter code, wiring/configuration notes, dependencies, and at least one example preset.
- AI generation defaults to YOLO26 but retains explicit YOLO11 and YOLOv8 choices for compatibility.
- Cite the official Ultralytics model/task terminology in UI source notes; do not claim performance that the generated project does not measure.
- Provide multiple object-detection and segmentation examples without inventing datasets or results.
- New AI recipes must participate in Model Mission controls, validation, generated preview, project bundle, stored-state migration, and download tests.
- Required generator labels and notes render at 14px or larger; explanatory copy renders at 16px or larger.
- Preserve static export, client-only generation, and the existing `/tools/ai-script-generator/` and `/tools/sensor-code-generator/` routes.

---

## File map

- Create `lib/tools/embedded-generator/catalog.js`: normalized embedded targets, families, environments, protocols, presets, and parameter schemas.
- Create `lib/tools/embedded-generator/templates.js`: template renderers for sensors, communication, and interfaces.
- Modify `lib/tools/sensor-templates.js`: backward-compatible facade for the new embedded generator.
- Create `components/tools/EmbeddedExamplePicker.tsx`: category-aware example presets.
- Modify `app/tools/sensor-code-generator/page.tsx`: grouped workbench UI with family tabs and no inline typography.
- Modify `app/game-theme.css`: readable embedded and AI generator controls.
- Modify `tests/tools/sensor-generator.test.js`: catalog, generation, grouping, and example coverage.
- Modify `lib/tools/ml-generator/catalog.js`: register new recipes.
- Modify `lib/tools/ml-generator/taxonomy.js`: add depth, open-vocabulary, and semantic-segmentation task vocabulary.
- Modify `lib/tools/ml-generator/load-recipe.js`: load new recipe modules.
- Modify `lib/tools/ml-generator/recipes/applied/yolo-shared.js`: model-family/version-aware weight and command generation.
- Modify `lib/tools/ml-generator/recipes/applied/yolo-detection-training.js`: YOLO26 default and detection presets.
- Modify `lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js`: YOLO26 instance-segmentation default and presets.
- Create `lib/tools/ml-generator/recipes/applied/yolo-open-vocabulary.js`: YOLOE-26 detection/segmentation project.
- Create `lib/tools/ml-generator/recipes/applied/yolo-depth.js`: YOLO26 monocular-depth inference/evaluation project.
- Create `lib/tools/ml-generator/recipes/applied/semantic-segmentation.js`: U-Net and YOLO26 semantic-segmentation training project.
- Modify `lib/tools/ml-generator/model-mission/catalog.js`: expose new tasks and step fields.
- Modify `lib/tools/ml-generator/model-mission/control-definitions.js`: add model family, architecture, and example controls.
- Modify `lib/tools/ml-generator/model-mission/control-registry.js`: validate and serialize new controls.
- Modify `lib/tools/ml-generator/model-mission/adapters.js`: map Model Mission state to each recipe.
- Modify `lib/tools/ml-generator/model-mission/recommendations.js`: task-specific, factual guidance.
- Modify `lib/tools/ml-generator/model-mission/project-bundle.js`: bundle new recipe files and dependencies.
- Modify `lib/tools/ml-generator/model-mission/state.js`: defaults and migration for new task/config values.
- Modify `components/tools/model-mission/TaskChooser.tsx`: readable example lists and task badges.
- Modify `components/tools/model-mission/ModelMission.module.css`: larger controls, notes, examples, and responsive layout.
- Modify focused `tests/tools/model-mission-*.test.js` and `tests/tools/ml-generator-*.test.js`: recipe, control, state, bundle, generated-code, and responsive coverage.

### Task 1: Normalize the embedded generator catalog by capability family

**Files:**
- Create: `lib/tools/embedded-generator/catalog.js`
- Create: `lib/tools/embedded-generator/templates.js`
- Modify: `lib/tools/sensor-templates.js`
- Test: `tests/tools/sensor-generator.test.js`

**Interfaces:**
- Produces: `EMBEDDED_FAMILIES`, `EMBEDDED_TARGETS`, `EMBEDDED_EXAMPLES`, `EMBEDDED_PARAM_SCHEMAS`.
- Produces: `generateEmbeddedCode({ family, target, environment, protocol }, params)` returning `{ ok, code, filename, notes, dependencies, wiring }` or `{ ok: false, error }`.
- Preserves: `SENSOR_CONFIGURATIONS`, `SENSOR_PARAM_SCHEMAS`, and `generateSensorCode` as compatibility aliases until all consumers migrate.

- [ ] **Step 1: Add failing family and compatibility tests**

```js
test("embedded targets distinguish sensors, communications, and interfaces", async () => {
  const catalog = await import("../../lib/tools/embedded-generator/catalog.js");
  assert.deepEqual(catalog.EMBEDDED_FAMILIES.map(({ id }) => id), [
    "sensor", "communication", "interface",
  ]);
  assert.equal(catalog.EMBEDDED_TARGETS.find(({ id }) => id === "bme280").family, "sensor");
  assert.equal(catalog.EMBEDDED_TARGETS.find(({ id }) => id === "espnow-sender").family, "communication");
  assert.equal(catalog.EMBEDDED_TARGETS.find(({ id }) => id === "esp32s3-usb-cdc").family, "interface");
});
```

- [ ] **Step 2: Run the sensor tests and confirm RED**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: FAIL because the embedded catalog modules do not exist.

- [ ] **Step 3: Extract the existing templates without changing output**

Move existing configuration records, parameter schemas, and render functions behind the new catalog API. Give every record an explicit `family`, `targetLabel`, `summary`, `exampleIds`, and `wiring` array. Keep legacy exports in `sensor-templates.js` so current tests and imports continue to work during migration.

- [ ] **Step 4: Validate catalog integrity**

Reject duplicate IDs, missing family references, example IDs that reference absent targets, and templates without a supported environment/protocol tuple. Freeze exported data to prevent client mutation.

- [ ] **Step 5: Run sensor tests and confirm GREEN**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: PASS with legacy output snapshots unchanged and all existing targets assigned to correct families.

- [ ] **Step 6: Commit the normalized catalog**

```powershell
git add lib/tools/embedded-generator/catalog.js lib/tools/embedded-generator/templates.js lib/tools/sensor-templates.js tests/tools/sensor-generator.test.js
git commit -m "refactor: separate embedded generator families"
```

### Task 2: Expand sensor templates and examples

**Files:**
- Modify: `lib/tools/embedded-generator/catalog.js`
- Modify: `lib/tools/embedded-generator/templates.js`
- Test: `tests/tools/sensor-generator.test.js`

**Interfaces:**
- Adds sensor targets: `bmp280`, `ds18b20`, `bh1750`, `vl53l0x`, `ads1115`, `hx711`, and `soil-moisture`.
- Adds named examples such as `weather-station`, `tank-distance`, `load-cell-scale`, `light-monitor`, and `plant-moisture`.

- [ ] **Step 1: Add failing target-generation tests**

For each new target, choose its default example, call `generateEmbeddedCode`, assert `ok === true`, assert non-empty code and filename, and assert notes plus wiring are present. Validate parameter interpolation for addresses, pins, calibration factor, and dry/wet ADC limits.

- [ ] **Step 2: Run the tests and confirm RED**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: FAIL because the seven targets and five examples are absent.

- [ ] **Step 3: Implement bounded Arduino/PlatformIO starters**

Use established libraries and explicit dependency metadata: Adafruit BMP280, DallasTemperature/OneWire, BH1750, Adafruit VL53L0X, Adafruit ADS1X15, and HX711. The soil-moisture template uses an ADC pin with documented calibration parameters and no external library. Include serial output and safe initialization failure handling in every starter.

- [ ] **Step 4: Add example defaults and wiring notes**

Examples set sensible board pins and protocol choices but remain editable. Wiring notes name voltage, ground, and signal pins; analog sensor notes warn about ADC voltage limits without asserting a board-specific tolerance that is not encoded.

- [ ] **Step 5: Run sensor tests and confirm GREEN**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: PASS for the old templates and all seven new sensors.

- [ ] **Step 6: Commit sensor expansion**

```powershell
git add lib/tools/embedded-generator/catalog.js lib/tools/embedded-generator/templates.js tests/tools/sensor-generator.test.js
git commit -m "feat: add embedded sensor starters and examples"
```

### Task 3: Expand communication and interface starters

**Files:**
- Modify: `lib/tools/embedded-generator/catalog.js`
- Modify: `lib/tools/embedded-generator/templates.js`
- Test: `tests/tools/sensor-generator.test.js`

**Interfaces:**
- Adds communications: `http-client`, `http-server`, `mqtt-publisher`, `mqtt-subscriber`, `ble-server`, `ble-client`, and `i2c-scanner`.
- Adds interface examples: `spi-transfer` alongside existing UART, USB CDC, and camera options.
- Secret handling: generated Wi-Fi and broker credentials remain explicit placeholders and are never read from browser storage.

- [ ] **Step 1: Add failing communication tests**

Assert each new target belongs to `communication` or `interface`, generates a starter for its default environment, includes placeholder credentials where relevant, and never includes a real hostname, API key, SSID, password, or MAC address from the repository.

- [ ] **Step 2: Run the tests and confirm RED**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: FAIL because the new communication targets do not exist.

- [ ] **Step 3: Implement protocol-specific starters**

Generate ESP32 Arduino starters for HTTP client/server, PubSubClient MQTT publish/subscribe, NimBLE server/client, Wire-based I2C scan, and SPI transfer. Include connection timeout/backoff or non-blocking loop guidance where relevant. Do not present I2C scanning or SPI transfer as sensor drivers.

- [ ] **Step 4: Run sensor tests and confirm GREEN**

Run: `node --test tests/tools/sensor-generator.test.js`

Expected: PASS with family membership and secret-placeholder assertions.

- [ ] **Step 5: Commit communication expansion**

```powershell
git add lib/tools/embedded-generator/catalog.js lib/tools/embedded-generator/templates.js tests/tools/sensor-generator.test.js
git commit -m "feat: add embedded communication starters"
```

### Task 4: Rebuild the Sensor Code Generator UI around families and examples

**Files:**
- Create: `components/tools/EmbeddedExamplePicker.tsx`
- Modify: `app/tools/sensor-code-generator/page.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/sensor-generator.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Produces: family tabs with `aria-pressed`, a target selector scoped to the active family, example cards, environment/protocol selectors, parameter controls, wiring, dependencies, and code preview.
- Consumes: only the normalized embedded catalog/generator API; no hard-coded option lists in the page.

- [ ] **Step 1: Add failing UI structure and font-floor tests**

Assert the page imports `EMBEDDED_FAMILIES`, `EMBEDDED_TARGETS`, `EMBEDDED_EXAMPLES`, and `generateEmbeddedCode`; imports `EmbeddedExamplePicker`; contains no `<optgroup label="ESP32 Communication">`; and uses no inline `fontSize` declarations. Assert CSS gives generator labels at least 14px and notes at least 16px.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/sensor-generator.test.js tests/tools/site-responsive.test.js`

Expected: FAIL because the page hard-codes mixed sensor options and sub-14px inline typography.

- [ ] **Step 3: Implement the family-first selection flow**

Default to `sensor` and BME280. Changing family chooses that family's first target and a valid environment/protocol. Changing target applies its default example only when current parameters are incompatible. Use semantic buttons for families and examples; expose the active choice in text, not color alone.

- [ ] **Step 4: Render examples, wiring, notes, and dependencies readably**

Show three to six relevant example cards before detailed controls. After generation, render code first, then wiring, dependencies, and notes in separate titled regions. Move every inline style to named CSS classes and use shared input padding/min-height rules.

- [ ] **Step 5: Verify responsive behavior**

At 360px, family tabs wrap, target/example cards remain readable, and code preview scrolls internally without causing document overflow. At desktop, controls and output form balanced columns with independent minimum widths.

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/sensor-generator.test.js tests/tools/site-responsive.test.js`

Expected: PASS with family labels, examples, and readable controls.

- [ ] **Step 7: Commit the embedded workbench UI**

```powershell
git add components/tools/EmbeddedExamplePicker.tsx app/tools/sensor-code-generator/page.tsx app/game-theme.css tests/tools/sensor-generator.test.js tests/tools/site-responsive.test.js
git commit -m "feat: rebuild embedded code workbench"
```

### Task 5: Make YOLO generation model-family aware

**Files:**
- Modify: `lib/tools/ml-generator/recipes/applied/yolo-shared.js`
- Modify: `lib/tools/ml-generator/recipes/applied/yolo-detection-training.js`
- Modify: `lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Modify: `lib/tools/ml-generator/model-mission/control-registry.js`
- Modify: `lib/tools/ml-generator/model-mission/state.js`
- Test: `tests/tools/model-mission-control-registry.test.js`
- Test: `tests/tools/model-mission-generated-code.test.js`
- Test: `tests/tools/model-mission-state.test.js`

**Interfaces:**
- Adds `modelFamily: "yolo26" | "yolo11" | "yolov8"`, default `yolo26`.
- Resolves weights from family, size, and task suffix: detection uses no suffix; instance segmentation uses `-seg`.
- Migrates stored configurations without `modelFamily` to `yolov8` when legacy weights/config prove the old behavior, while new sessions default to `yolo26`.

- [ ] **Step 1: Add failing family, weight, and migration tests**

Assert new default generated code contains `yolo26n.pt`; instance segmentation contains `yolo26n-seg.pt`; explicit YOLO11 contains `yolo11n.pt`; explicit YOLOv8 contains `yolov8n.pt`; and a pre-expansion saved state loads without changing its generated YOLOv8 weight.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/model-mission-control-registry.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-state.test.js`

Expected: FAIL because YOLO weights are fixed to YOLOv8 and no family control exists.

- [ ] **Step 3: Implement centralized weight resolution**

Add `resolveYoloWeights({ modelFamily, modelSize, task })` to `yolo-shared.js`; validate size/family combinations; have both existing recipes use it for train, validation, prediction, and export scripts. Add a select control with beginner-friendly descriptions for current default and compatibility families.

- [ ] **Step 4: Add backward-compatible state migration**

Bump the project-config/state schema only if required by existing versioning conventions. Never silently turn an existing YOLOv8 project into YOLO26; record the inferred family in normalized state.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-control-registry.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-state.test.js`

Expected: PASS for YOLO26 default, YOLO11/YOLOv8 choices, and legacy migration.

- [ ] **Step 6: Commit family-aware YOLO generation**

```powershell
git add lib/tools/ml-generator/recipes/applied/yolo-shared.js lib/tools/ml-generator/recipes/applied/yolo-detection-training.js lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js lib/tools/ml-generator/model-mission/control-definitions.js lib/tools/ml-generator/model-mission/control-registry.js lib/tools/ml-generator/model-mission/state.js tests/tools/model-mission-control-registry.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-state.test.js
git commit -m "feat: default model mission to YOLO26"
```

### Task 6: Add multiple detection examples and YOLOE-26 open-vocabulary generation

**Files:**
- Modify: `lib/tools/ml-generator/recipes/applied/yolo-detection-training.js`
- Create: `lib/tools/ml-generator/recipes/applied/yolo-open-vocabulary.js`
- Modify: `lib/tools/ml-generator/catalog.js`
- Modify: `lib/tools/ml-generator/load-recipe.js`
- Modify: `lib/tools/ml-generator/taxonomy.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`
- Test: `tests/tools/model-mission-catalog.test.js`
- Test: `tests/tools/model-mission-adapters.test.js`
- Test: `tests/tools/model-mission-generated-code.test.js`

**Interfaces:**
- Adds detection example presets: `workshop-ppe`, `pcb-components`, `traffic-monitor`, and `warehouse-counting`.
- Adds task `open-vocabulary-detection` backed by recipe `yolo-open-vocabulary` with YOLOE-26 and editable text prompts/classes.

- [ ] **Step 1: Add failing catalog, preset, and generated-code tests**

Assert object detection exposes at least four named examples, the task catalog includes open-vocabulary detection, the adapter resolves its recipe, and generated Python initializes an official YOLOE-26 weight and editable class prompts.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-adapters.test.js tests/tools/model-mission-generated-code.test.js`

Expected: FAIL because detection has no preset control and YOLOE-26 is absent.

- [ ] **Step 3: Add factual presets without fake outputs**

Each preset supplies sample class names, annotation guidance, dataset path examples, and a short evaluation checklist. Presets never include claimed accuracy. Custom remains a first-class option and applying a preset updates only preset-owned fields.

- [ ] **Step 4: Implement YOLOE-26 open-vocabulary generation**

Generate a complete project with requirements, prompt/class configuration, inference, optional fine-tuning where supported by the selected workflow, evaluation notes, and README source links to official Ultralytics documentation. Validate empty prompts and unsafe output paths.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-adapters.test.js tests/tools/model-mission-generated-code.test.js`

Expected: PASS with four detection examples and a loadable YOLOE-26 recipe.

- [ ] **Step 6: Commit detection expansion**

```powershell
git add lib/tools/ml-generator/recipes/applied/yolo-detection-training.js lib/tools/ml-generator/recipes/applied/yolo-open-vocabulary.js lib/tools/ml-generator/catalog.js lib/tools/ml-generator/load-recipe.js lib/tools/ml-generator/taxonomy.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/adapters.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-adapters.test.js tests/tools/model-mission-generated-code.test.js
git commit -m "feat: add detection presets and YOLOE-26"
```

### Task 7: Add YOLO26 monocular depth generation

**Files:**
- Create: `lib/tools/ml-generator/recipes/applied/yolo-depth.js`
- Modify: `lib/tools/ml-generator/catalog.js`
- Modify: `lib/tools/ml-generator/load-recipe.js`
- Modify: `lib/tools/ml-generator/taxonomy.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Test: `tests/tools/model-mission-catalog.test.js`
- Test: `tests/tools/model-mission-generated-code.test.js`
- Test: `tests/tools/model-mission-project-bundle.test.js`

**Interfaces:**
- Adds task `monocular-depth` backed by recipe `yolo-depth`.
- Inputs: source image/video/camera example path, YOLO26 depth size, device, output directory, visualization colormap, and optional metric-evaluation inputs.
- Output: runnable depth inference project for ordinary monocular images/cameras; UI explains relative versus metric depth accurately.

- [ ] **Step 1: Add failing depth task and bundle tests**

Assert the catalog describes monocular depth, examples include obstacle awareness and scene understanding, generated code loads a YOLO26 depth model through the supported Ultralytics API, and the project bundle contains README, inference script, requirements, and config.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js`

Expected: FAIL because the depth task and recipe are absent.

- [ ] **Step 3: Implement the official-task-shaped depth recipe**

Follow current Ultralytics depth task semantics. Generate single-image, folder/video, and webcam inference examples with editable source values. Clearly label output as predicted depth and explain that metric units require a metric-capable model/calibration/evaluation path. Include source attribution in the generated README.

- [ ] **Step 4: Wire the task into Model Mission**

Add beginner-facing fields to Goal, Data, Model, Evaluate, and Generate steps. Reuse common environment/device/export controls only where the depth API supports them.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js`

Expected: PASS with a deterministic, downloadable depth project.

- [ ] **Step 6: Commit depth generation**

```powershell
git add lib/tools/ml-generator/recipes/applied/yolo-depth.js lib/tools/ml-generator/catalog.js lib/tools/ml-generator/load-recipe.js lib/tools/ml-generator/taxonomy.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/adapters.js lib/tools/ml-generator/model-mission/control-definitions.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js
git commit -m "feat: add YOLO26 monocular depth projects"
```

### Task 8: Add semantic segmentation with U-Net and YOLO26 presets

**Files:**
- Create: `lib/tools/ml-generator/recipes/applied/semantic-segmentation.js`
- Modify: `lib/tools/ml-generator/catalog.js`
- Modify: `lib/tools/ml-generator/load-recipe.js`
- Modify: `lib/tools/ml-generator/taxonomy.js`
- Modify: `lib/tools/ml-generator/model-mission/catalog.js`
- Modify: `lib/tools/ml-generator/model-mission/adapters.js`
- Modify: `lib/tools/ml-generator/model-mission/control-definitions.js`
- Test: `tests/tools/model-mission-catalog.test.js`
- Test: `tests/tools/model-mission-generated-code.test.js`
- Test: `tests/tools/model-mission-project-bundle.test.js`

**Interfaces:**
- Adds task `semantic-segmentation` backed by recipe `semantic-segmentation`.
- Adds architecture choices `unet` and `yolo26-semantic` only when supported by the current dependency/API contract.
- Adds example presets: `road-scene`, `surface-defects`, `medical-regions`, and `crop-health`.

- [ ] **Step 1: Add failing semantic-segmentation tests**

Assert four presets exist, U-Net generation includes dataset, augmentations, model, train, evaluate, and predict modules, and the bundle declares PyTorch plus segmentation dependencies. Assert semantic segmentation is distinct from instance segmentation in the task chooser.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js`

Expected: FAIL because there is no semantic-segmentation task or U-Net recipe.

- [ ] **Step 3: Generate a complete U-Net project**

Produce image/mask dataset loading, deterministic split, Albumentations transforms, configurable U-Net encoder/decoder, cross-entropy or binary loss based on class count, Dice/IoU metrics, checkpointing, prediction visualization, configuration file, and README. Validate class count, mask format, image size, paths, epochs, and batch size.

- [ ] **Step 4: Add the YOLO26 semantic option only against verified API behavior**

If the installed/current Ultralytics API exposes a distinct semantic-segmentation model/task, generate it using official model names and calls. If it does not, keep `unet` as the semantic architecture and retain YOLO26 under instance segmentation; tests and UI must never label instance masks as semantic segmentation.

- [ ] **Step 5: Wire presets and controls through Model Mission**

Expose dataset layout, class names, mask mode, architecture, encoder, input size, augmentations, optimizer, learning rate, epochs, batch size, loss, and thresholds at the appropriate workflow steps. Presets fill examples but remain editable.

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js`

Expected: PASS with four example presets and a syntactically valid U-Net project bundle.

- [ ] **Step 7: Commit semantic segmentation**

```powershell
git add lib/tools/ml-generator/recipes/applied/semantic-segmentation.js lib/tools/ml-generator/catalog.js lib/tools/ml-generator/load-recipe.js lib/tools/ml-generator/taxonomy.js lib/tools/ml-generator/model-mission/catalog.js lib/tools/ml-generator/model-mission/adapters.js lib/tools/ml-generator/model-mission/control-definitions.js tests/tools/model-mission-catalog.test.js tests/tools/model-mission-generated-code.test.js tests/tools/model-mission-project-bundle.test.js
git commit -m "feat: add U-Net semantic segmentation projects"
```

### Task 9: Complete AI state, recommendations, and downloadable bundle coverage

**Files:**
- Modify: `lib/tools/ml-generator/model-mission/recommendations.js`
- Modify: `lib/tools/ml-generator/model-mission/project-bundle.js`
- Modify: `lib/tools/ml-generator/model-mission/state.js`
- Modify: `lib/tools/ml-generator/model-mission/stored-zip.js`
- Modify: `tests/tools/model-mission-recommendations.test.js`
- Modify: `tests/tools/model-mission-project-bundle.test.js`
- Modify: `tests/tools/model-mission-stored-zip.test.js`
- Modify: `tests/tools/model-mission-legacy-state.test.js`

**Interfaces:**
- Produces task-specific guidance for detection, open-vocabulary, depth, instance segmentation, and semantic segmentation.
- Preserves stored ZIP and project-config loading for existing users.

- [ ] **Step 1: Add failing cross-cutting tests**

For each new task, assert recommendations name relevant annotation/evaluation concerns, project bundles contain every generated file, ZIP round-trips preserve task/config, and legacy state still normalizes without data loss.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/tools/model-mission-recommendations.test.js tests/tools/model-mission-project-bundle.test.js tests/tools/model-mission-stored-zip.test.js tests/tools/model-mission-legacy-state.test.js`

Expected: FAIL where new tasks are not handled exhaustively.

- [ ] **Step 3: Implement exhaustive task handling**

Recommendations must distinguish boxes, instance polygons, semantic masks, prompts, and depth ground truth. Bundles must derive dependencies and files from the selected recipe instead of task-name conditionals where possible. State/ZIP code must reject unknown tasks with an actionable error and migrate known legacy tasks.

- [ ] **Step 4: Validate generated Python syntax**

Write each generated `.py` file from representative presets to a temporary directory and run the repository's Python syntax validation convention. This validates syntax only; do not claim training success without datasets and installed ML packages.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-recommendations.test.js tests/tools/model-mission-project-bundle.test.js tests/tools/model-mission-stored-zip.test.js tests/tools/model-mission-legacy-state.test.js`

Expected: PASS for new tasks and legacy state.

- [ ] **Step 6: Commit bundle and state completion**

```powershell
git add lib/tools/ml-generator/model-mission/recommendations.js lib/tools/ml-generator/model-mission/project-bundle.js lib/tools/ml-generator/model-mission/state.js lib/tools/ml-generator/model-mission/stored-zip.js tests/tools/model-mission-recommendations.test.js tests/tools/model-mission-project-bundle.test.js tests/tools/model-mission-stored-zip.test.js tests/tools/model-mission-legacy-state.test.js
git commit -m "feat: complete expanded model mission bundles"
```

### Task 10: Improve Model Mission example clarity and font sizes

**Files:**
- Modify: `components/tools/model-mission/TaskChooser.tsx`
- Modify: `components/tools/model-mission/MissionField.tsx`
- Modify: `components/tools/model-mission/MissionExplanation.tsx`
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `tests/tools/model-mission-style.test.js`
- Modify: `tests/tools/model-mission-responsive.test.js`

**Interfaces:**
- Produces: visible example chips/lists on task cards, readable help and field copy, and mobile-safe task/step layouts.
- Consumes: examples already present in task catalog; does not duplicate example strings in components.

- [ ] **Step 1: Add failing typography and example tests**

Assert task chooser maps `task.examples`; labels and buttons are at least 14px; descriptions/explanations are at least 16px; no required content uses 0.6–0.75rem; and task cards contain no decorative arrow glyphs.

- [ ] **Step 2: Run style and responsive tests and confirm RED**

Run: `node --test tests/tools/model-mission-style.test.js tests/tools/model-mission-responsive.test.js`

Expected: FAIL on existing small metadata/help styles and missing visible examples.

- [ ] **Step 3: Render examples and raise the font floor**

Render two or three example chips on each task card and the full list after selection. Increase task terms, labels, hints, validation messages, workflow rail labels, code panel labels, and buttons using shared readable variables. Keep compact metadata secondary without dropping below 14px.

- [ ] **Step 4: Fix narrow-screen behavior**

At 360px, stack task cards and fields, allow example chips to wrap, keep controls at least 44px high, and confine code preview overflow to the code panel. Preserve reduced-motion behavior.

- [ ] **Step 5: Run style and responsive tests and confirm GREEN**

Run: `node --test tests/tools/model-mission-style.test.js tests/tools/model-mission-responsive.test.js`

Expected: PASS with examples visible and no document-level overflow.

- [ ] **Step 6: Commit AI workbench readability**

```powershell
git add components/tools/model-mission/TaskChooser.tsx components/tools/model-mission/MissionField.tsx components/tools/model-mission/MissionExplanation.tsx components/tools/model-mission/ModelMission.module.css tests/tools/model-mission-style.test.js tests/tools/model-mission-responsive.test.js
git commit -m "fix: improve model mission examples and readability"
```

### Task 11: Run full generator regression and static-export verification

**Files:**
- Modify only when a failing test proves a scoped defect.

- [ ] **Step 1: Run all sensor and Model Mission tests**

```powershell
node --test tests/tools/sensor-generator.test.js tests/tools/ml-generator-*.test.js tests/tools/model-mission-*.test.js
```

Expected: all tests PASS, including legacy adapters, stored ZIP, generated code, catalog, controls, state, recommendations, bundles, style, responsive, and live-route coverage.

- [ ] **Step 2: Run the complete repository test suite**

Run: `npm test`

Expected: all required tests PASS; environment-declared skips remain documented and no new skip is introduced for this work.

- [ ] **Step 3: Build the static site**

Run: `$env:GITHUB_ACTIONS='true'; npm run build; Remove-Item Env:GITHUB_ACTIONS`

Expected: build succeeds and exports both generator routes plus all existing portfolio/tool routes.

- [ ] **Step 4: Inspect generated generator pages**

Run: `rg -n "Sensor Code Generator|Model Mission|YOLO26|semantic segmentation" out/tools -g "*.html"`

Expected: static HTML contains generator headings and discoverable copy; client-generated code remains interactive after hydration.

- [ ] **Step 5: Review dependency and security boundaries**

Confirm no real credentials, machine paths, generated ZIP data, or browser storage values were committed. Confirm new generated-project dependencies are pinned or constrained consistently with existing recipes and source URLs are official documentation.

- [ ] **Step 6: Commit evidence-backed verification fixes only**

If verification changes no files, skip this commit. If it exposes a scoped defect, review every diff, stage only the affected generator/test files, and commit:

```powershell
git commit -m "fix: harden expanded generator workflows"
```

### Task 12: Publish source and GitHub Pages, then verify live behavior

**Files:**
- Generated deployment artifact: `out/` (not committed to `source`).

- [ ] **Step 1: Confirm a clean source worktree and inspect commit range**

```powershell
git status --short
git log --oneline origin/source..HEAD
```

Expected: no uncommitted source changes; the range contains only reviewed redesign commits.

- [ ] **Step 2: Push the editable source branch**

Run: `git push origin main:source`

Expected: remote `source` fast-forwards to the reviewed local source commit.

- [ ] **Step 3: Publish `out/` to the GitHub Pages branch without force**

Create or reuse a dedicated deployment worktree based on `origin/main`, verify its resolved path is inside the repository's worktree directory, replace only its tracked Pages contents with the reviewed `out/` artifact, commit, and push the deployment worktree branch to `origin/main`. Do not overwrite the local source branch or force-push.

- [ ] **Step 4: Verify the Pages deployment status**

Check the public GitHub Pages deployment/API status until the new `main` commit is reported as deployed. Use bounded waits and report any external build failure with its exact status.

- [ ] **Step 5: Verify live routes at desktop and mobile widths**

Open and inspect:

- `/myPortflio/`
- `/myPortflio/about/`
- `/myPortflio/contact/`
- `/myPortflio/tools/`
- `/myPortflio/tools/sensor-code-generator/`
- `/myPortflio/tools/ai-script-generator/`
- one representative calculator route

Expected: natural page titles, no cropped badges, no decorative arrows, no document overflow, readable forms, calculators-first discovery, grouped embedded options, examples in both generators, and successful client hydration.

- [ ] **Step 6: Record final evidence**

Report the source commit, Pages commit, test totals, build route count, deployment status, and live URLs. Separate what was syntax/structure tested from what would require real hardware, a real dataset, or ML training to validate.
