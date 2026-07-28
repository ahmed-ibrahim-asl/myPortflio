# Model Mission Unified Builder Design

**Status:** Approved direction, awaiting written-spec review  
**Date:** 2026-07-28  
**Route:** `/tools/ai-script-generator/`

## Product definition

**Name:** Model Mission  
**Tagline:** From problem to Python, one decision at a time.

Model Mission is one guided AI and machine-learning script builder. It replaces
the current presentation of a classical workflow, a separate neural-network
designer, and a separate legacy recipe generator.

The user chooses what they want to build, moves through one repeatable machine
learning workflow, learns why each choice matters, and receives runnable Python.
The generator is deterministic and configuration-driven; it does not require an
LLM.

## Primary audience and outcome

The primary audience is a student, experimenter, machine-learning engineer, or
embedded-systems engineer who understands a project idea but does not want to
memorize library syntax.

The page succeeds when the user can:

1. identify the correct problem type in plain language;
2. configure data, preparation, model, training, and evaluation choices;
3. understand the technical term and effect of each important choice;
4. generate, copy, and download one coherent Python script;
5. repeat the same conceptual workflow for a more advanced problem later.

## Chosen interaction model

Use one progressive guided builder. Do not use separate domain tabs, separate
tools stacked on one page, or a node-based canvas.

All supported tasks use the same visible workflow:

1. Goal
2. Data
3. Inspect
4. Split
5. Prepare
6. Model
7. Train
8. Evaluate
9. Generate

A step may adapt its fields to the selected task, but its purpose and position
do not change. This consistency is the learning mechanism.

## Task order

Tasks are ordered by conceptual complexity, not by framework or implementation
history.

### Beginner

1. **Predict a category** — Classification
2. **Predict a number** — Regression

### Intermediate

3. **Classify sensor data** — Time-series classification with Conv1D or LSTM
4. **Classify images** — CNN and edge image classification

### Advanced

5. **Detect objects** — YOLO object detection
6. **Segment objects** — YOLO instance segmentation
7. **Design a neural network** — Framework-neutral sequential architecture
   translated to Keras or PyTorch

Difficulty labels explain the learning progression but never lock a task.

Future text, audio, embeddings, LLM, fine-tuning, forecasting, clustering,
anomaly-detection, and recommendation tasks must enter this same ordered task
catalog. Do not create another builder for them.

## Task selection

The first interactive section asks, “What do you want to build?”

Each task card contains:

- a plain-language goal;
- the standard technical term;
- a one-sentence description;
- two or three recognizable examples;
- a difficulty label;
- the primary data shape or modality.

Task cards are grouped under Beginner, Intermediate, and Advanced headings.
The groups remain in one continuous list so the user can see the learning path.

Selecting a task initializes compatible defaults and preserves only prior
values that remain meaningful for the new task.

## Shared configuration model

One versioned `ProjectConfig` is the source of truth for the entire page.
Individual generators and UI sections must not own parallel project state.

The shared sections are:

```text
schemaVersion
task
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

Task-specific values live inside the relevant section. For example, YOLO model
size belongs to `model`, while epochs and image size belong to `training`.

The configuration resolver performs:

1. schema parsing;
2. task lookup;
3. default insertion;
4. compatibility evaluation;
5. normalization;
6. final validation;
7. generator-adapter selection.

All generation remains deterministic for a given resolved configuration.

## Learning levels

The page offers three disclosure levels without creating separate modes or
separate products:

- **Guided:** recommended defaults and essential controls;
- **Customize:** common tuning controls;
- **Advanced:** specialist controls and full explanations.

Changing disclosure level never deletes configured values. Hidden advanced
values remain part of the project and return when Advanced is reopened.

## Unified code output

There is one generated-code panel for every task.

It shows:

- the generated filename;
- framework and dependency summary;
- generation warnings;
- validation errors;
- copy action;
- `.py` download action;
- internally scrollable Python code.

Task adapters generate into the same public result shape:

```text
filename
code
dependencies
warnings
summary
resolvedConfig
```

Existing YOLO, segmentation, sensor, and edge-image recipe implementations are
preserved behind adapters until their unified generators have parity. They are
not rendered through the old page UI.

## Layout

### Desktop

At wide viewports, the configuration panel and generated code are side by side.
Both columns use `minmax(0, ...)`, and every direct grid child has `min-width: 0`.

```text
+---------------------------------------------------------------+
| Model Mission / task chooser / workflow rail                  |
+------------------------------+--------------------------------+
| Current configuration step   | Generated Python               |
|                              |                                |
| Back / Continue              | Copy / Download                |
+------------------------------+--------------------------------+
```

### Tablet and mobile

Below the desktop breakpoint, the page shows Configure and Code tabs. Only the
selected workspace is visible, but both remain mounted so configuration and
scroll state are preserved.

Cards, fields, action groups, task groups, split diagrams, and layer controls
collapse to one column when their contents would otherwise shrink or overlap.

The workflow rail owns horizontal scrolling. The page itself must never scroll
horizontally.

Sticky navigation must remain inside the configuration panel and must not cover
the final control. Code owns its horizontal scroll and never forces page width.

## Visual system

Model Mission uses the portfolio’s existing terminal/pixel visual language.
It does not introduce a new visual identity.

Use the site tokens and established equivalents:

- page: `--night` / `#050713`;
- panels: `--panel` / `#0c1023`;
- raised panels: `--panel-raised` / `#121831`;
- text: `--ink` / `#eef1ff`;
- muted text: `--muted` / `#9ca7ca`;
- borders: `--line` / `#30395e`;
- primary signal: `--pixel-cyan` / `#55d5d8`;
- success: `--pixel-green` / `#8edb7a`;
- explanation or caution: `--pixel-gold` / `#f0c66c`;
- shadow: `--pixel-shadow` / `#02030a`.

Use flat fills, square corners, hard borders, and the portfolio’s existing
pixel shadows. Do not use linear gradients, radial gradients, glass effects, or
blurred decorative backgrounds in Model Mission.

Typography uses the existing portfolio font variables. The task order,
workflow numbers, difficulty labels, and code metadata provide structure rather
than decorative badges.

## Responsive safety rules

The implementation must not hide overflow to make a test pass. Containers may
clip intentional decoration, but page-level content containment is proved by
geometry assertions.

For each required viewport:

- document width equals viewport width;
- every visible control remains inside its panel;
- no cards or panels intersect incorrectly;
- long labels wrap or truncate intentionally;
- task groups do not create minimum-content overflow;
- generated code scrolls inside its code element;
- sticky actions do not cover the last field;
- the workflow rail scrolls independently;
- Configure and Code tabs preserve values and panel state.

Required viewport coverage:

- 320 × 700;
- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 900 × 900;
- 1024 × 768;
- 1440 × 900.

## Validation and errors

The builder prevents invalid scripts at the configuration boundary.

- Incompatible options are disabled with a visible reason.
- Missing required values are attached to the relevant field and step.
- A task change resets only incompatible downstream values.
- Generator load failures use task names, not internal module details.
- Retry operates inside the single code panel.
- Stale generator responses cannot replace a newly selected task.
- Arbitrary neural-network stacks must pass shape and framework compatibility
  validation before code can be copied or downloaded.

## Migration from the current page

The current route contains three visible product surfaces:

1. the classical learning workbench;
2. the neural-network designer;
3. the older advanced recipe generator.

The migration replaces those surfaces with one `ModelMissionShell`.

Migration rules:

- do not render the existing page beneath or inside the new shell;
- preserve legacy generators through adapters and parity tests;
- move neural presets into the task and model catalogs;
- move classical classification and regression into the same catalog;
- keep one task selection, one workflow rail, one mobile tab set, and one code
  panel;
- remove component-local duplicate project configuration;
- preserve the existing public route.

## Component boundaries

- `ModelMissionShell`: page composition and accessible workspace layout;
- `TaskChooser`: ordered task discovery only;
- `WorkflowRail`: navigation and completion state only;
- `StepPanel`: selects the current registry-driven step;
- `ProjectField`: shared label, control, explanation, warning, and error shell;
- `ProjectSummary`: resolved choices and dependency summary;
- `CodePanel`: generation state, code, copy, and download;
- `useModelMission`: canonical reducer, resolution, generation, stale-request
  protection, and retry;
- registries: serializable educational and compatibility metadata;
- generator adapters: pure configuration-to-code implementations.

No task-specific component may become a second builder.

## Testing strategy

### Unit and schema tests

- versioned configuration normalization and migration;
- registry uniqueness and cross-reference validity;
- simple-to-complex task ordering;
- compatibility rules and disabled reasons;
- deterministic resolution and generation;
- task-switch preservation and reset behavior;
- neural shape and framework validation;
- no generator body imported by lightweight registries.

### Generated-code tests

- representative configuration for every task;
- Python AST parsing;
- no unresolved placeholders;
- correct imports and selected parameters;
- leakage-safe split, preparation, and resampling order;
- legacy adapter output parity;
- generated filename and dependency accuracy.

### Browser tests

- the route renders only one branded builder;
- every supported task is discoverable in the correct order;
- task selection updates steps and generated code;
- Configure/Code tabs preserve state;
- copy and download use the active result;
- loading, error, retry, and rapid task switching remain safe;
- all responsive geometry requirements pass at every required viewport;
- computed Model Mission backgrounds contain no CSS gradients.

### Completion gate

The work is complete only when TypeScript, the production build, all ML unit and
AST suites, and the expanded responsive browser suite pass against the live
unified route.

## Explicit non-goals for this change

- adding an LLM dependency;
- implementing future text, audio, LLM, forecasting, clustering, anomaly, or
  recommendation generators;
- replacing deterministic configuration with free-form prompting;
- creating a canvas or drag-and-drop graph editor;
- changing the visual identity of the rest of the portfolio;
- claiming arbitrary generated scripts are execution-verified without a
  representative runtime smoke test.
