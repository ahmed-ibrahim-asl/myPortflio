# AI Script Generator: Student Learning and End-User Audit

Date: 2026-07-27
Scope: Current local implementation at `/tools/ai-script-generator/`
Audit type: Read-only functional, usability, pedagogy, and configuration review

## Decision

The tool works as a dependable script configurator. A student can choose one of four workflows, adjust valid settings, read short field descriptions, and receive a complete Python script. The interface prevents several incompatible combinations and gives useful dataset, metric, hardware, deployment, and source notes.

The current product does not yet teach enough to serve as a student's main ML learning environment. It gives the result with little explanation of the reasoning that produced it. A beginner can copy a 260 to 547-line script without understanding the pipeline, the hidden defaults, the metric choice, or the code sections connected to each configuration control.

Current score against the stated goal: **6.0/10**

The product idea remains strong. The current implementation needs a guided learning layer and a complete data workflow before it can meet the larger promise.

## Scorecard

| Area | Score | Audit finding |
|---|---:|---|
| Generator reliability | 8.5/10 | The configuration engine produced deterministic Python with valid syntax across the tested matrix. |
| First-use usability | 7.5/10 | The layout, labels, field help, responsive behavior, and error states work well. |
| Configuration depth | 6.5/10 | Production mode exposes useful training and export settings, but data preparation, split strategy, augmentation, imbalance handling, and evaluation choices remain limited. |
| Learning value | 4.0/10 | The interface defines fields in one sentence but gives little guidance about when, why, or how to choose each value. |
| Data workflow | 3.5/10 | The recipes expect prepared files or directories. The tool does not inspect, clean, visualize, split, or validate real user data. |
| ML breadth | 3.0/10 | Four deep-learning recipes are implemented. Classical ML, regression, clustering, tabular workflows, NLP, and general anomaly detection are absent. |
| Accessibility and responsive behavior | 8.5/10 | Labels, descriptions, keyboard-aware tabs, validation feedback, and small-screen containment are strong. |

### Product-level rating

- Product concept: **9/10**
- Current code configurator: **8/10**
- Current standalone learning tool: **4.8/10**
- Current implementation against the full vision: **6.0/10**

## Evidence

### Automated checks

- 32 focused catalog, engine, loader, parity, validation, and generator tests passed.
- The real-browser regression passed at 320, 390, 768, 900, 1024, and 1440 pixels.
- TypeScript validation passed.
- The Next.js production build passed.
- The live route returned HTTP 200.
- The async browser checks covered loading, rapid template switching, a forced load error, recovery through Retry, and long production values.

### Configuration matrix

The audit exercised exposed select values, toggles, numeric boundaries, and dependent task, runtime, model, and export choices.

| Result | Count |
|---|---:|
| Representative configurations exercised | 671 |
| Valid configurations | 667 |
| Constraint blocks | 4 |
| Distinct generated Python scripts | 405 |
| Python syntax failures | 0 |
| Structural or deterministic-output failures | 0 |

The four blocked cases used invalid sensor window relationships. The validator rejected a stride greater than its window size.

### Student browser journey

The audit completed Starter and Production-oriented journeys for all four recipes:

- YOLO object detection
- YOLO instance segmentation
- Sensor time-series classification
- Edge image classification

Each visible configuration field included help text. Dataset, metrics, notes, and resource tabs rendered for each recipe. A sensor validation/test split totaling 0.8 produced a visible field error and blocked generation.

The initial page did not provide a getting-started sequence, pipeline map, example project, or explanation of the difference between Starter and Production-oriented modes.

### Generated-code learning audit

The default generated scripts contain:

| Recipe | Approximate lines |
|---|---:|
| YOLO detection | 260 |
| YOLO segmentation | 260 |
| Sensor time-series classification | 547 |
| Edge image classification | 384 |

Across the generated scripts:

- Average script length: about 353 lines
- Explanatory comment lines: 0
- Function docstrings: 0
- Class docstrings: 0

The code uses useful function names and a readable `CONFIG` dictionary, but a student receives no explanation inside the exported artifact.

### End-to-end execution limit

The audit verified generation, normalization, validation, deterministic output, Python syntax, browser behavior, type safety, and production compilation.

It did not train the generated models against real datasets. The local Python environment lacks pandas, scikit-learn, PyTorch, TensorFlow, and Ultralytics. The repository also lacks the small licensed datasets and smoke profiles required for repeatable execution tests.

The tool should not claim full runtime verification until a dataset-backed test phase runs each workflow.

## Strengths to preserve

### 1. Deterministic configuration

The tool does not need an LLM to produce scripts. Users can reproduce a result from explicit choices, inspect each choice, and avoid prompt ambiguity.

### 2. Useful separation between Starter and Production-oriented modes

Starter mode keeps the visible control count manageable:

| Recipe | Starter fields | Production fields |
|---|---:|---:|
| YOLO detection | 6 | Up to 20 |
| YOLO segmentation | 6 | Up to 20 |
| Sensor time series | 9 | 22 |
| Edge image classification | 6 | 17 |

The separation supports progressive disclosure. The UI now needs to explain which defaults remain hidden in Starter mode.

### 3. Strong input constraints

The engine filters runtime-dependent options, normalizes incompatible exports, validates ranges, blocks invalid sensor splits, and prevents stale async results from replacing the current recipe.

### 4. Useful operational metadata

The tabs list dependencies, dataset structure, hardware guidance, metrics, deployment artifacts, notes, warnings, and source references. These details give the student a better starting point than a bare code block.

### 5. Responsive and accessible controls

Controls stay inside the configuration panel at the tested widths. Generated code owns its horizontal scrolling. Inputs expose labels, help text, invalid state, and error messages. The tab interface supports keyboard movement.

## Critical gaps

### P0. Add a guided learning mode

The current page starts with a template selector. A student still needs to know that object detection, segmentation, and time-series classification are different problem types.

Add an optional guided flow:

1. What type of data do you have?
2. What do you want to predict?
3. What form do your labels take?
4. How should the model be evaluated?
5. Where will you run training and inference?

The answers should select a recipe through deterministic rules. The tool should explain the selection before showing configuration fields.

Each configurable concept needs five pieces of guidance:

- Plain-language definition
- When to use it
- Effect of increasing, decreasing, enabling, or disabling it
- Common failure or trade-off
- Recommended starting value and its reason

Current help such as "Adam optimizer learning rate" defines the field name but does not help a beginner choose a value.

### P0. Connect configuration choices to generated code

The product promise includes learning without memorizing syntax. The student still needs to see how concepts map to code.

Add:

- Code-section headings and explanatory comments
- Function and class docstrings
- A "Show where this setting appears in code" action
- Highlighted code lines after a control changes
- A before/after configuration diff
- A short explanation of the behavior change

Starter output can use a teaching-oriented script with comments. Production output can stay compact.

### P0. Build the data preparation stage

The implemented recipes assume that the user prepared a valid YAML file, chronological CSV, or class-directory image dataset. That assumption removes the hardest part of many ML projects from the tool.

Add deterministic modules for:

- File loading and schema inspection
- Head, shape, column types, summary statistics, and missing-value counts
- Duplicate detection
- Label and class-distribution inspection
- Invalid image and annotation checks
- Missing-value strategies
- Categorical encoding
- Numeric scaling
- Outlier handling
- Feature and target selection
- A generated cleaning report

The tool should let the user generate a data-inspection script without selecting a model.

### P0. Make splitting explicit

Current split behavior varies by recipe:

- YOLO expects `train`, `val`, and optional `test` paths inside an external YAML file.
- Sensor time series exposes validation and test fractions in Production-oriented mode and derives the training fraction.
- Edge image classification exposes a validation fraction but no independent test split.

Add a shared split section:

- Train/test
- Train/validation/test
- Cross-validation when the recipe supports it
- Train, validation, and test percentages with a visible total
- Computed sample counts when data metadata is available
- Random seed
- Stratification
- Group-aware splitting
- Time-ordered splitting

The UI should explain why a validation set guides tuning and why a test set should remain untouched until final evaluation.

### P0. Add augmentation and imbalance handling

Edge image classification applies horizontal flip and rotation inside generated code, but the user cannot see or configure those operations. YOLO can apply framework augmentation defaults without exposing them. The sensor workflow lacks augmentation controls.

Expose augmentation by data type:

- Images: flip, crop, rotation, scale, translation, color jitter, blur, noise, and probability
- Time series: jitter, magnitude scaling, time shift, masking, window slicing, and time warping
- Tabular data: bounded noise when the feature meaning allows it

Add imbalance controls:

- Class weights
- Random oversampling
- Random undersampling
- Balanced batch sampling
- Focal loss for supported deep-learning classifiers
- SMOTE for compatible tabular feature-vector classification

The generator must restrict resampling and augmentation to the training partition. It must fit preprocessing on training data and reuse the fitted transformation for validation and test data.

SMOTE should remain unavailable for raw images, raw token sequences, and unflattened time-series windows. The UI should explain the restriction instead of presenting SMOTE as a universal option.

### P0. Provide a runnable project package

Copying one Python file does not cover enough of the setup burden for a beginner.

Add downloads for:

- Generated `.py` file
- `requirements.txt` or `pyproject.toml`
- Saved configuration in JSON or YAML
- Dataset folder example
- README with install and run commands
- Output/artifact description

The UI should show the exact command to create an environment, install dependencies, and run the script.

## High-priority gaps

### P1. Use neutral ML terminology

The page describes itself as an "Engineering utility" with a "Configuration vector" and introduces "sensor intelligence" and "edge AI." These phrases fit the portfolio style but create distance for a student or general ML engineer.

Use these primary labels:

- ML workflow instead of configuration vector
- Training environment instead of runtime target when the choice controls training
- Deployment target for export or inference deployment
- Image classification instead of edge image classification as the task name

Keep Raspberry Pi, Jetson, Coral, Android, ONNX, TFLite, and TensorRT as optional deployment choices. Do not frame the entire workflow around embedded systems.

### P1. Explain metrics

The Metrics tab lists names such as mAP50-95, Macro F1, and top-k accuracy. A beginner needs:

- Definition
- Value range and direction
- When the metric can mislead
- Why the recipe selected it
- A small interpretation example

The tool should recommend metrics based on class balance and task type while preserving user control.

### P1. Distinguish configured from verified

Several readiness functions mark data as configured because a placeholder path contains text. The user has not supplied or verified that file.

Use states such as:

- Path supplied
- Structure expected
- Verified by local inspection
- Ready for generation
- Ready for execution

The current "Pipeline readiness" cards show dataset and deployment metadata. They do not prove that the script can run.

### P1. Add baseline and evaluation choices

Students should compare a model with a simple baseline. Add:

- Majority-class or mean baseline
- Classical baseline for compatible data
- Confusion matrix
- Precision-recall and ROC curves
- Calibration
- Per-class metrics
- Error examples
- Overfitting checks

### P1. Add classical machine learning

The current catalog concentrates on deep learning and deployment. Add configurable scikit-learn pipelines for:

- Classification
- Regression
- Clustering
- Anomaly detection

Start with linear/logistic models, trees, random forests, gradient boosting, SVM, k-nearest neighbors, k-means, DBSCAN, isolation forest, and PCA. Each recipe should connect preprocessing, validation, metric selection, and interpretation.

### P1. Add experiment and tuning controls

Add:

- Manual parameter sweep
- Grid search
- Random search
- Early stopping where supported
- Cross-validation
- Experiment names
- Result comparison table
- Saved seeds and configuration

The tool should teach the difference between model parameters and hyperparameters.

## Secondary gaps

### P2. Add first-run examples

Provide one small example per recipe with:

- Problem statement
- Dataset description
- Recommended configuration
- Expected output
- Typical mistakes

The user should be able to load the example into the configurator.

### P2. Make resources concept-specific

The Resources tab links to authoritative material but does not connect a resource to a field or code section. Link learning material from the relevant concept card and state what the student should learn from it.

### P2. Save, import, and compare configurations

Add:

- Download configuration
- Import configuration
- Named presets
- Shareable URL or local export
- Side-by-side comparison

### P2. Clarify hidden defaults

Starter mode displays six to nine fields while generated scripts include many additional defaults. Show a collapsed "Defaults used for you" section so the student can inspect those choices without opening Production-oriented mode.

## Recommended student workflow

The tool should guide a student through this sequence:

1. Define the problem and identify the target.
2. Load or describe the data.
3. Inspect and clean the data.
4. Choose a split strategy.
5. Choose preprocessing, augmentation, and imbalance handling.
6. Select a baseline and model.
7. Configure training.
8. Choose evaluation metrics.
9. Generate an explained script and project files.
10. Run a smoke test and interpret the result.
11. Tune one concept at a time and compare runs.
12. Export when the project needs deployment.

This sequence supports ML students and embedded engineers without assuming either audience.

## Recommended implementation order

### Phase 1: Learning shell

- Guided problem and data questions
- Concept cards
- Starter/Production explanation
- Config-to-code highlighting
- Explained generated scripts

### Phase 2: Data workflow

- Inspection and cleaning recipe family
- Shared split configuration
- Data leakage protections
- Augmentation and imbalance controls

### Phase 3: Broader ML

- Classical classification and regression
- Clustering and anomaly detection
- Baselines, evaluation, and tuning

### Phase 4: Runnable validation

- Licensed dataset registry
- Small smoke subsets
- Generated project packages
- Dependency installation checks
- One-epoch continuous tests and inference smoke tests

## Dataset-backed test phase

The dataset phase requires explicit confirmation, as requested.

It should:

1. Select one license-compatible reference dataset per recipe family.
2. Create a small deterministic smoke subset.
3. Record source, license, checksum, schema, and expected split.
4. Generate scripts from representative configurations.
5. Install each recipe's dependency set in an isolated environment.
6. Run lightweight training, validation, inference, and export checks.
7. Record runtime, produced artifacts, warnings, and failures.

The test matrix should cover behavior classes rather than the full Cartesian product. Full combination testing would repeat equivalent code paths and consume excessive compute.

No dataset search, download, or model training occurred during this audit.

## Acceptance criteria for an 8/10 student tool

- A beginner can choose a workflow without knowing model names.
- Each control explains definition, use case, trade-off, and recommendation.
- The tool handles data inspection, cleaning, and explicit splitting.
- Augmentation and imbalance controls prevent leakage.
- Generated scripts include comments, docstrings, and code-to-control mapping.
- The user can download a runnable project package.
- At least one classical classification and regression workflow exists.
- Dataset-backed smoke tests execute the generated code.
- The UI uses neutral ML language and treats embedded deployment as an option.

## Final assessment

The current implementation proves the generator architecture and handles configuration with care. It saves syntax work and produces substantial scripts. Students can use it as a scaffold after they understand the underlying workflow.

The next release should teach the decision process. Data preparation, explicit splitting, configurable augmentation, imbalance handling, code explanations, and runnable project packages will move the tool from a script generator toward the learning environment described in the product goal.
