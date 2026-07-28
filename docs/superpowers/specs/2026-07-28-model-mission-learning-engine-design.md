# Model Mission Learning Engine Upgrade

**Status:** Approved direction, awaiting written-spec review  
**Date:** 2026-07-28  
**Route:** `/tools/ai-script-generator/`  
**Product:** Model Mission — From problem to Python, one decision at a time.

## 1. Purpose

This upgrade turns Model Mission from a collection of working generators into
one scalable learning engine for students, experimenters, machine-learning
engineers, researchers, and embedded-systems engineers.

The interface remains deterministic and configuration-driven. It does not use
an LLM to invent code. The user makes explicit machine-learning decisions, sees
why those decisions matter, and receives reproducible Python that reflects the
selected configuration.

The upgrade must solve the four most important audit findings:

1. the custom neural-network generator currently creates an architecture but
   leaves real data loading and training commented out;
2. some YOLO controls are misleading because `optimizer=auto` can ignore the
   configured learning rate, while one confidence value is reused for two
   different purposes;
3. Customize and Advanced currently expose nearly identical experiences;
4. the output is only a Python file and does not provide a documented,
   reproducible starter project.

It must also improve feature-scaling education and make the product architecture
scalable enough to add future machine-learning tasks without building another
separate interface.

## 2. Product principles

### 2.1 One workflow

Every task continues to use the same visible sequence:

1. Goal
2. Data
3. Inspect
4. Split
5. Prepare
6. Model
7. Train
8. Evaluate
9. Generate

The questions and controls adapt to the task, but the sequence does not. The
consistent workflow is a teaching device: after several projects, the user
should remember the machine-learning process even if they do not memorize
library syntax.

### 2.2 Progressive disclosure

Guided, Customize, and Advanced are disclosure levels inside one builder. They
are not separate tools and do not create separate project states.

- **Guided** presents the minimum decisions needed to generate a sound baseline.
- **Customize** presents common choices that materially change model behavior.
- **Advanced** presents specialist research and production controls.

Changing level never deletes configured values. A value hidden by a lower level
remains in the project, is validated, and reappears when its level is reopened.

### 2.3 Powerful does not mean unexplained

Advanced controls must be technically meaningful, not a long list of library
arguments. Every important option provides:

1. a plain-language name;
2. the standard technical term;
3. what it changes;
4. when it is useful;
5. when it should be avoided;
6. the trade-off it introduces;
7. the default or recommended value and why;
8. the effect on generated Python.

The short explanation stays visible. A `Learn this choice` disclosure contains
the longer explanation, example, trade-off, and generated-code effect.

### 2.4 Contextual configuration

Only relevant controls appear. A random forest must not display a neural
optimizer. A regression task must not display class balancing. A YOLO task may
display image augmentation, while a tabular task may display categorical
encoding.

Incompatible choices are disabled with a visible reason rather than silently
removed. Recommendations are advisory and never prevent an expert from making a
valid alternative choice.

### 2.5 Preserve the visual identity

The upgrade uses the current terminal/pixel portfolio style:

- flat dark panel fills;
- cyan, green, and gold signals from the site tokens;
- square corners and hard borders;
- no gradients, glass effects, or blurred decorative backgrounds;
- no page-level horizontal overflow.

The visual change is information architecture, explanation quality, and
responsive behavior—not a rebrand.

## 3. Chosen architecture

Use a registry-driven configuration and explanation system. Do not continue
adding task and level conditionals directly to `MissionStepPanel`.

### 3.1 Canonical project state

The existing versioned `ProjectConfig` remains the single source of truth:

```text
schemaVersion
taskId
learningLevel
data
inspection
split
preparation
model
training
evaluation
output
```

New fields are added through a schema migration. Task changes reset only
incompatible downstream values. Level changes do not reset values.

### 3.2 Control registry

Each configurable choice becomes serializable metadata similar to:

```ts
type MissionControl = {
  id: string;
  section: ProjectSection;
  step: WorkflowStep;
  level: "guided" | "customize" | "advanced";
  label: string;
  technicalTerm?: string;
  controlType: "select" | "number" | "text" | "toggle" | "range";
  defaultValue: unknown;
  options?: MissionOption[];
  shortHelp: string;
  explanation: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect: string;
  };
  recommendation?: RecommendationRule;
  visibleWhen?: CompatibilityRule;
  enabledWhen?: CompatibilityRule;
  validation?: ValidationRule[];
};
```

Task registries compose shared controls with task-specific controls. Shared
controls include random seed, split ratios, inspection, missing-value handling,
and output configuration. Task registries add model, modality, training, and
evaluation choices.

The UI renders registry records and does not need to understand library syntax.
Generator adapters translate resolved project state to runnable code.

### 3.3 Resolution pipeline

Every project update passes through:

1. schema migration;
2. task lookup;
3. task defaults;
4. compatibility evaluation;
5. model-aware recommendations;
6. normalization;
7. field and cross-field validation;
8. adapter generation;
9. project-bundle generation.

Generation stays deterministic for a resolved project.

## 4. Learning-level behavior

### 4.1 Guided

Guided shows:

- task and dataset;
- target or label information;
- safe split plan;
- essential preparation;
- recommended baseline model;
- essential training budget;
- primary evaluation metrics;
- generated code and project download.

Defaults are visibly marked `Recommended`. Each step contains a one-paragraph
concept lesson and no specialist controls.

### 4.2 Customize

Customize includes Guided plus common practical controls:

- split ratios and stratification;
- missing-value strategy;
- standard, robust, or min-max scaling;
- category encoding;
- class weights, SMOTE, or supported augmentation;
- common model hyperparameters;
- epochs, batch size, learning rate, and early stopping;
- metric selection;
- model and artifact filenames.

Customize is suitable for a normal portfolio, coursework, or prototype project.

### 4.3 Advanced

Advanced includes the lower levels plus task-relevant specialist controls:

- random, stratified, group, and time-aware splitting;
- cross-validation and hyperparameter search;
- feature selection and dimensionality reduction;
- probability calibration and decision thresholds;
- optimizer, learning-rate scheduler, weight decay, and warmup;
- early stopping, checkpoints, gradient clipping, and initialization;
- mixed precision, device, workers, caching, reproducibility, and deterministic
  execution;
- task-specific advanced augmentation;
- export, deployment, and artifact validation controls.

Advanced controls are grouped by concept. They are not shown as one unstructured
wall of inputs.

## 5. Explanation design

### 5.1 Field presentation

Each field displays:

- label;
- technical term where useful;
- recommended badge when applicable;
- one-sentence help;
- the input control;
- validation or compatibility message;
- `Learn this choice` disclosure.

The disclosure is keyboard accessible and uses normal document flow. It must not
create a hover-only teaching experience.

### 5.2 Recommendation language

Recommendations state the reason:

```text
Recommended: Robust scaling
Your selected dataset may contain outliers, and your selected linear model is
sensitive to feature scale.
```

Recommendations update when relevant choices change. They do not mutate an
explicit user selection without confirmation.

### 5.3 Concepts before syntax

Descriptions use machine-learning terminology but introduce it plainly:

```text
Weight decay (L2 regularization)
Adds a penalty for large weights. It can reduce overfitting, but too much can
prevent the model from learning useful patterns.
```

Generated-code details live in the expanded explanation, keeping the default UI
readable for students.

## 6. Feature-scaling learning system

Feature scaling becomes a model-aware concept instead of a single generic
dropdown.

### 6.1 Supported choices

| Choice | Guided explanation | Typical recommendation |
|---|---|---|
| None | Keep numeric values in their original units | Tree models |
| Standard | Center values and scale by standard deviation | Linear, distance, kernel, and many neural models |
| Robust | Center by median and scale by interquartile range | Numeric data with strong outliers |
| Min-max | Move values into a fixed range | Bounded inputs and some neural workflows |
| Max-absolute | Scale by largest absolute value without centering | Sparse numeric matrices |
| Power transform | Reduce skew and make variance more stable | Strongly skewed positive or signed features |
| Quantile transform | Map a distribution toward uniform or normal | Advanced nonlinear distribution correction |

Guided initially exposes None, Standard, Robust, and Min-max. Max-absolute,
Power, and Quantile appear in Advanced.

### 6.2 Model-aware guidance

Rules include:

- tree-based models usually recommend no scaling;
- linear, SVM, kernel, KNN, and neural models recommend scaling;
- outlier-heavy numeric data recommends Robust;
- sparse data prevents incompatible centering choices;
- pixel data recommends rescaling or model-specific normalization;
- sequence and sensor data explain whether scaling is global, per feature, or
  per channel.

### 6.3 Leakage safety

Generated code always fits scaling and other learned transforms on training
data only. Validation and test data are transformed using the fitted training
pipeline.

The UI displays this rule explicitly:

> The scaler learns only from training data. Learning from validation or test
> data would leak information and make evaluation look better than reality.

SMOTE and similar resampling also remain inside the training pipeline after
compatible preprocessing.

## 7. Complete neural-network generation

The `Design a neural network` task becomes a complete trainable workflow rather
than an architecture export.

### 7.1 Data contracts

The selected preset determines the compatible data contract:

- tabular classification or regression: built-in learning dataset or CSV;
- image classification: class-directory image folders;
- sequence classification or regression: tabular/array sequence input with
  configurable time and feature axes.

The Data and Inspect steps show paths, target configuration, expected shapes,
sample inspection, and validation checks appropriate to the contract.

### 7.2 Generated Keras project

Keras generation includes:

- deterministic seed setup;
- data loading;
- leakage-safe splitting and preprocessing;
- `tf.data` or array dataset preparation;
- model construction;
- compatible loss and metrics;
- configured optimizer;
- callbacks for early stopping and checkpoints;
- actual `model.fit`;
- validation and one final test evaluation;
- best-model restoration;
- model saving;
- one inference example.

### 7.3 Generated PyTorch project

PyTorch generation includes:

- deterministic seed and device setup;
- dataset loading and transforms;
- train, validation, and test `Dataset`/`DataLoader` objects;
- model construction;
- compatible loss and metrics;
- configured optimizer and optional scheduler;
- complete training and validation loops;
- checkpointing and early stopping;
- one final test evaluation;
- model and configuration saving;
- one inference example.

### 7.4 Neural advanced controls

Task-compatible controls include:

- optimizer: Adam, AdamW, SGD, RMSprop where supported;
- learning-rate scheduler;
- weight decay and momentum;
- initialization;
- dropout and normalization layers;
- early-stopping patience and minimum improvement;
- gradient clipping;
- mixed precision;
- device and data-loader workers;
- checkpoint path and save-best policy;
- deterministic execution;
- layer-specific settings in the existing layer editor.

The shape validator remains a hard generation boundary.

## 8. Truthful YOLO configuration

### 8.1 Optimizer and learning rate

Guided defaults to `optimizer=auto` and does not pretend that a manual learning
rate controls training. It displays:

```text
Automatic optimizer
Ultralytics chooses the optimizer and may choose its own learning rate.
Select an explicit optimizer if you need manual learning-rate control.
```

Customize and Advanced allow explicit SGD, Adam, AdamW, RMSprop, and supported
Ultralytics choices. Learning rate is enabled only when the selected optimizer
honors it.

### 8.2 Confidence values

Use two separate concepts:

- validation confidence: threshold used while calculating validation metrics;
- prediction confidence: threshold used when keeping inference detections.

Guided keeps validation behavior at the framework-recommended metric default and
shows prediction confidence. Advanced may override both with warnings that
validation thresholds affect metric comparability.

### 8.3 YOLO advanced controls

Advanced controls include:

- model family and size;
- pretrained weights and frozen layers;
- optimizer, momentum, weight decay, and warmup;
- patience;
- image size and batch behavior;
- augmentation probabilities and intensities;
- AMP, device, workers, and caching;
- seed and deterministic execution;
- prediction NMS/IoU settings;
- export format, dynamic axes, half precision, and validation where supported.

Object detection and instance segmentation share safe controls while retaining
task-specific output and validation behavior.

## 9. Full project download

The code panel provides two clear actions:

- `Download Python` for the current single-file workflow;
- `Download project (.zip)` for a documented starter project.

The project archive is generated locally in the browser. Project configuration
and generated code are not uploaded to a server.

### 9.1 Base archive

```text
model-mission-project/
├── README.md
├── requirements.txt
├── model_mission.json
├── .gitignore
├── data/
│   └── README.md
├── src/
│   ├── train.py
│   └── predict.py
└── tests/
    └── test_generated_project.py
```

Adapters may add task-specific files, but every archive supplies the base
contract.

### 9.2 README requirements

The generated README explains:

- the selected problem and model;
- what each major configuration decision means;
- environment creation and installation;
- expected data layout;
- train, evaluate, and predict commands;
- expected generated artifacts;
- limitations and warnings;
- suggested next experiments;
- links to the selected public dataset and its license/source when applicable.

### 9.3 Requirements

`requirements.txt` uses the generator's supported version ranges, not package
names without versions. The code panel displays the same dependency summary so
the quick-download and project-download paths cannot disagree.

### 9.4 Bundle implementation

Create a pure `buildProjectBundle(result, resolvedConfig)` function that returns
a map of archive paths to text or binary content. A small browser-safe ZIP
implementation packages this map on demand. ZIP creation is lazy so the route
does not pay the archive cost until the user requests it.

## 10. Output and artifact naming

Artifact filenames are task-specific to avoid collisions:

- `classification_pipeline.joblib`;
- `regression_pipeline.joblib`;
- `neural_network.keras` or `neural_network.pt`;
- YOLO and other applied-task names derived from task and run name.

Output configuration validates safe relative paths and refuses absolute or
parent-traversal paths in generated project bundles.

## 11. Responsive and accessible behavior

The existing responsive contract remains mandatory:

- page width equals viewport width;
- desktop uses configuration and code columns with `minmax(0, ...)`;
- mobile/tablet uses Configure and Code tabs;
- workflow navigation scrolls independently;
- long field labels and technical terms wrap;
- expanded explanations remain inside their field card;
- advanced groups collapse to one column before overlap;
- sticky actions never cover the last field;
- code scrolls internally;
- no gradients are introduced.

Required viewport checks:

- 320 × 700;
- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 900 × 900;
- 1024 × 768;
- 1440 × 900.

All controls, disclosures, tabs, disabled reasons, errors, and download actions
must be keyboard accessible and have meaningful accessible names.

## 12. Testing strategy

### 12.1 Registry and state

- unique control IDs within sections;
- valid task, step, level, and adapter references;
- Guided ⊂ Customize ⊂ Advanced visibility;
- level changes preserve values;
- task changes reset only incompatible values;
- recommendation and compatibility rules are deterministic;
- schema migration preserves existing saved projects.

### 12.2 Feature scaling

- every scaler generates the correct import and pipeline step;
- scaler fitting occurs after splitting and only through the training pipeline;
- sparse incompatibilities are disabled with reasons;
- tree, linear, distance, kernel, and neural recommendations are correct;
- SMOTE remains training-only and uses a compatible pipeline order.

### 12.3 Neural generation

- representative Keras and PyTorch projects for tabular, image, and sequence
  contracts;
- generated Python parses with `ast`;
- no training loop or `model.fit` remains commented;
- data loaders, train, validation, test, saving, and inference are present;
- loss, output activation, shape, and metrics are compatible;
- representative lightweight runtime smoke tests complete successfully.

### 12.4 YOLO generation

- automatic optimizer omits misleading manual learning-rate behavior;
- explicit optimizers include selected learning rate;
- validation and prediction confidence values are separate;
- Advanced selections appear in generated arguments;
- representative detection and segmentation configurations parse and pass
  adapter tests.

### 12.5 Project archive

- contains every required base file;
- requirements include supported ranges;
- configuration JSON matches resolved project;
- README commands and filenames match generated files;
- unsafe paths are rejected;
- ZIP downloads locally and can be opened by a standard archive reader.

### 12.6 Browser and responsive tests

- each learning level visibly changes available controls;
- explanations open, close, and remain keyboard accessible;
- recommendations update after model and data changes;
- hidden values survive level switching;
- both download actions use the current generated result;
- mobile tabs preserve state;
- all geometry and no-gradient assertions pass at required viewports.

### 12.7 Completion gate

The implementation is complete only when:

- TypeScript passes;
- the Next production build passes;
- all ML and Model Mission unit tests pass;
- representative generated Python passes AST checks;
- representative runtime smoke tests pass;
- generated project ZIP tests pass;
- responsive browser tests pass;
- a final end-user audit confirms that Guided is understandable and Advanced is
  materially more capable than Customize.

## 13. Implementation order

1. Add failing tests for level visibility, explanation metadata, and state
   preservation.
2. Introduce the control/explanation registry and migrate current controls.
3. Implement the feature-scaling catalog, recommendations, and leakage-safe
   generators.
4. Correct YOLO optimizer and confidence semantics.
5. Complete Keras and PyTorch data/training/evaluation generation.
6. Add advanced task-specific controls and generator mappings.
7. Add project bundle construction and lazy ZIP download.
8. Update responsive and accessibility behavior.
9. Run generated-code, runtime, build, and multi-viewport verification.
10. Repeat the end-user audit and report the revised score and remaining gaps.

## 14. Explicit non-goals

- adding an LLM dependency;
- executing arbitrary user training jobs on the portfolio server;
- creating a visual node graph or a second builder;
- exposing every argument from every framework without educational value;
- promising that every possible dataset shape works without a declared data
  contract;
- changing the rest of the portfolio's visual identity;
- copying copyrighted book or course material into the product.

## 15. Expected outcome

After this upgrade, a student can understand the workflow and generate a safe
baseline, while an experienced user can configure meaningful research and
production behavior without leaving the same builder.

The target is a 9/10 learning and project-starting experience—not a claim that
all machine-learning engineering can become no-code. Model Mission should remove
syntax memorization and repetitive setup while keeping data quality, experiment
design, validation, interpretation, and engineering judgment visible.
