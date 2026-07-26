# AI Script Generator Design

Date: 2026-07-26  
Status: Approved direction, pending written-spec review  
Source: User-provided implementation brief and the selected control-room layout

## Product boundary

The generator serves students, computer-vision and robotics engineers, and embedded developers. It produces runnable training and inference scripts with practical dataset, hardware, evaluation, and deployment guidance.

The interface calls its advanced mode **Production-oriented**. Generated scripts can include reproducibility, validation, checkpointing, structured artifacts, defensive errors, and compatible exports. The tool does not claim to produce production-certified infrastructure, monitoring, CI/CD, governance, or hardware-specific optimization.

The first release contains exactly four templates:

| ID | Name | Category |
| --- | --- | --- |
| `yolo-detection-training` | YOLO Custom Object Detection | Computer Vision |
| `yolo-segmentation-training` | YOLO Instance Segmentation | Computer Vision |
| `sensor-timeseries-classification` | Sensor Time-Series Classification | Sensor AI / Robotics |
| `edge-image-classification` | Edge Image Classification | Edge Deployment |

NLP, generative AI, speech, forecasting, reinforcement learning, and pose estimation remain out of scope for this release.

## Modes

Starter mode exposes the smallest set of controls needed to generate a readable script. Each script trains or loads a model, validates it where the workflow requires validation, runs one inference example, saves its artifact, explains the dataset shape, and raises useful path errors.

Production-oriented mode adds deterministic seeds, explicit device controls, learning-rate and early-stopping settings, checkpoints, structured output directories, compatible exports, mixed precision or quantization where supported, configuration logging, and defensive runtime validation.

Changing modes preserves fields shared by both modes. The reducer removes production-only fields from the effective Starter configuration. Returning to Production restores production defaults instead of stale hidden values.

## File boundaries

### `lib/tools/ml-templates.js`

This module owns the template registry, field metadata, defaults, option resolution, normalization, validation, filename generation, dependencies, dataset guidance, metrics, hardware guidance, warnings, deployment metadata, and Python generation. It contains no React code.

It exports:

```js
export const ML_TEMPLATES = [];

export function getTemplateById(templateId) {}
export function getDefaultConfig(templateId, mode) {}
export function getVisibleFields(templateId, config, mode) {}
export function getFieldOptions(templateId, fieldId, config, mode) {}
export function normalizeTemplateConfig(templateId, config, mode) {}
export function validateTemplateConfig(templateId, config, mode) {}
export function generateMlScript(templateId, config, mode) {}
export function getTemplateOutputMetadata(templateId, config, mode) {}
export function buildMlGeneratorResult(templateId, inputConfig, mode) {}
```

`buildMlGeneratorResult` returns:

```js
{
  templateId,
  filename,
  code,
  dependencies,
  dataset,
  metrics,
  hardware,
  deployment,
  notes,
  warnings,
  config,
  validationErrors,
}
```

Any blocking error produces an empty `code` value. The UI never displays partly interpolated Python.

### `app/tools/ai-script-generator/page.tsx`

The page owns reducer state, mode and template controls, registry-driven field rendering, raw numeric input state, inline validation, generated output, information tabs, copy status, and accessibility announcements. It contains no model compatibility tables or Python templates.

### `tests/tools/ml-generator.test.js`

The test suite uses the repository's `node:test` and `node:assert` stack. It covers registry integrity, unique template and field IDs, valid defaults, option normalization, numeric and cross-field validation, model filenames, generated values, metadata completeness, and exactly one trailing newline.

### `app/game-theme.css`

The stylesheet owns the generator grid, panels, fields, tabs, code scrolling, warning and error states, focus treatment, copy states, and breakpoints. The layout fixes the source of overflow rather than hiding document overflow.

## Registry and field model

Each template defines its identity, fields, mode defaults, normalizer, validator, generator, dependencies, dataset metadata, metrics, hardware guidance, deployment choices, notes, and warnings.

Each field defines:

- `id`, `label`, `inputType`, and `modes`
- a default value and help text
- static or computed options
- optional visibility and disabled predicates
- numeric bounds or a field validator

Field input types are `select`, `number`, `text`, and `toggle`.

Shared field factories prevent duplicate YOLO definitions. Detection and segmentation use one YOLO builder with task-specific weight maps, output paths, dataset guidance, metrics, and warnings.

## Normalization and generation flow

Every template, mode, or field change follows one sequence:

1. Start from the selected mode defaults.
2. Merge the current user configuration.
3. Force template invariants.
4. Coerce safe boolean and numeric values.
5. resolve model, environment, device, and export options.
6. Replace invalid selections with the first compatible default.
7. Reset hidden unsupported fields.
8. Validate the normalized configuration.
9. Generate code only when validation succeeds.

The normalizer never leaves a disabled option selected.

Unknown template IDs do not crash the page. The UI may use the first registry entry to render a safe fallback, but the result retains a blocking `templateId` validation error and generates no code until the state contains a valid ID. An empty registry shows “No script templates are currently available” and disables copying.

## Template definitions

### YOLO Custom Object Detection

The template intentionally pins the Ultralytics 8.x API and YOLOv8 weight family for repeatability:

| Size | Weights |
| --- | --- |
| Nano | `yolov8n.pt` |
| Small | `yolov8s.pt` |
| Medium | `yolov8m.pt` |
| Large | `yolov8l.pt` |
| Extra-large | `yolov8x.pt` |

Workflows are `train`, `validate`, `inference`, and `train-export`. Starter defaults to `train`; Production defaults to `train-export`.

Environments are local, Colab, NVIDIA GPU, Jetson, and Raspberry Pi. Device and export choices depend on the environment. Raspberry Pi remains an inference/export target, not a recommended training environment.

Starter fields:

- workflow, model size, environment
- dataset YAML and inference source paths
- image size

Production-only fields:

- epochs, batch size, device, learning rate
- confidence, patience, workers, and seed
- export format, run name, and project directory
- dataset cache, AMP, and INT8 toggles

AMP appears only for a CUDA-capable selection. INT8 appears only for compatible TensorRT, OpenVINO, or TFLite exports. Training fields disappear for validation and inference. Export controls appear only for `train-export`.

The generated script validates paths and dataset YAML, resolves devices at runtime, seeds Python, NumPy, and PyTorch, trains, validates, runs optional inference, exports when requested, prints a configuration summary, and exits with useful status codes.

### YOLO Instance Segmentation

The segmentation template reuses the YOLO fields and builder. Its weights use the `yolov8{size}-seg.pt` pattern. Dataset guidance specifies normalized polygon labels. Its output reports box and mask metrics and warns about polygon quality, annotation cost, export verification, and edge memory limits.

### Sensor Time-Series Classification

This PyTorch template reads ordered CSV sensor rows, rejects missing data, creates overlapping windows, fits normalization statistics on the training split, and trains a 1D CNN, LSTM, or CNN-LSTM.

Tasks are activity classification, state classification, and binary anomaly classification. Model sizes map to hidden widths of 32, 64, 128, and 256. The template omits an extra-large option.

Starter fields cover task, model, size, environment, dataset and column names, window size, and stride. Production adds optimization settings, split fractions, early stopping, dropout, device, seed, workers, export, checkpoint path, and sample rate.

Validation enforces:

- validation plus test fractions remain below `0.8`
- stride does not exceed window size
- at least one feature exists
- the label column is not a feature
- binary anomaly data contains exactly two labels at runtime
- ONNX receives a fixed positive window size

The script reports accuracy, macro F1, per-class precision and recall, a confusion matrix, inference latency, and serialized size. It exports TorchScript or ONNX.

### Edge Image Classification

This TensorFlow/Keras template trains a transfer-learning classifier from class directories and exports TFLite.

Models are MobileNetV3Small, MobileNetV3Large, and EfficientNetV2B0. Environments are local, Colab, Raspberry Pi, Coral, and Android.

Starter mode covers model, environment, dataset directory, input size, and an export format. Production adds optimization settings, validation fraction, early stopping, dropout, seed, fine-tuning depth, representative sample count, artifact directory, and sample image path.

Coral forces INT8 TFLite, requires representative data, hides incompatible formats, and explains that Edge TPU compilation remains an external step. The script reports validation accuracy and loss, top-k accuracy when applicable, TFLite size and latency, and quantization accuracy change.

## UI design

The selected **Control room** direction uses a configuration rail beside a wide output panel on desktop. The mode selector and template chooser lead the configuration hierarchy. Registry-driven fields follow in logical groups. Production-only settings sit in an expandable advanced section.

The output header shows the generated filename and copy action. A non-wrapping `<pre>` owns code scrolling. Below it, native button tabs expose Dependencies, Dataset, Hardware, Metrics, Deployment, and Notes. The tab row scrolls internally on narrow screens.

The four-item Pipeline Readiness Strip summarizes data shape, primary metric, compute target, and deployment output.

Numeric fields keep a raw string while the user types. The reducer commits a finite number without generating code from transient values such as an empty string, `-`, or `0.`. On blur, it restores a default, clamps a bound, or restores the last valid value and announces the correction.

Every field has a visible label, unique ID, help text, `aria-describedby`, inline errors, and `aria-invalid`. Controls meet a 44-pixel minimum target. Copy success and failure use a polite live region.

## Responsive behavior

The page uses a bounded fluid container. Its desktop grid is:

```css
grid-template-columns: minmax(18rem, 23rem) minmax(0, 1fr);
```

Every grid child sets `min-width: 0`. Form controls use `width: 100%`, `min-width: 0`, and `max-width: 100%`. The layout switches to one column at `960px`. At `520px`, actions stack and the copy button fills the panel width.

The `<pre>` owns horizontal code scrolling. The tab row owns tab overflow. Long filenames use ellipsis. The design uses no `100vw` inside padded containers and no absolute positioning for primary controls.

## Validation, warnings, and fallback states

Blocking errors include missing required paths, invalid numeric ranges, invalid split fractions, empty feature lists, bad checkpoint paths, invalid model or template IDs, and a dependency resolver that finds no compatible options.

Warnings allow generation. Examples include a large model on edge hardware, a high image-size and batch-size combination, CPU training with a large model, insufficient representative samples, or placeholder production paths.

Invalid configurations show field errors and the message “Resolve the highlighted configuration fields to generate the script.” Copy failure tells the user to select the code manually.

## Testing and verification

The implementation follows test-driven development.

Unit tests cover:

- unique template and field IDs
- valid Starter and Production defaults
- normalization of device, export, Coral, and hidden fields
- numeric and cross-field validation
- correct detection and segmentation weight names
- configuration values appearing in generated code
- complete metadata
- exactly one trailing newline

The existing dependency-free Chrome DevTools Protocol test expands to these viewports:

| Width | Height |
| --- | --- |
| 390 | 844 |
| 768 | 1024 |
| 900 | 900 |
| 1024 | 768 |
| 1440 | 900 |

Each viewport asserts:

- no page-level horizontal overflow
- every control remains within the configuration panel
- the code container owns horizontal scrolling

Final verification runs all engineering-tool tests, the responsive browser test, the production build, and one generated script from every template and mode. Generated Python receives a syntax parse check where the local Python runtime can parse the selected syntax.

## Implementation order

1. Add registry-integrity and default-validation tests.
2. Build registry helpers, normalization, escaping, and newline utilities.
3. Build and register the shared YOLO templates.
4. Build the sensor classifier and edge image classifier.
5. Complete validation and metadata tests.
6. Refactor the page to reducer-driven, registry-rendered controls.
7. Add output metadata tabs, readiness strip, copy state, and accessibility behavior.
8. Add generator-specific responsive CSS.
9. Expand viewport coverage.
10. Run the full verification suite and inspect representative generated scripts.

## Acceptance criteria

- The catalog contains exactly four complete templates.
- Both modes produce runnable code with no TODO markers or ellipses.
- Unsupported selections do not survive normalization.
- Blocking errors produce no partial code.
- Warnings do not block generation.
- The UI contains no model-specific compatibility logic.
- The registry contains no React code.
- The page has no horizontal overflow at the five required viewports.
- Controls stay inside their panels, and code scrolls inside its `<pre>`.
- Keyboard focus remains visible.
- Existing engineering tools keep working.
- All tests and the production build pass.
