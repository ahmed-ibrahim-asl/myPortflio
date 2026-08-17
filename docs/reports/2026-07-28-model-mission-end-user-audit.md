# Model Mission End-User Audit

Date: 2026-07-28  
Route: `/tools/ai-script-generator/`  
Audience: product owner and technical implementers  
Audit type: live UI, generated-code, public-dataset, runtime, responsive, pedagogy, and data-quality audit

## Technical summary

Model Mission is now a useful, distinctive student-facing ML builder. It earns **7.3/10** against the stated goal of letting people build ML systems by choosing concepts and configurations instead of memorizing syntax.

The implementation is materially stronger than the previous 2026-07-27 audit:

- Seven student-facing tasks now exist: classification, regression, sensor classification, image classification, object detection, instance segmentation, and neural-network design.
- The interface follows one nine-step path from Goal through Generate.
- Classical workflows now include data inspection, missing-value handling, encoding, scaling, explicit train/validation/test splitting, and SMOTE or class-weight choices.
- All **8 generated variants compiled and executed their coded scope** against public datasets.
- **6 of 8 variants were genuinely end to end**: load data, train, evaluate, and save or infer.
- The Keras and PyTorch neural variants successfully built and saved their architectures, but did not load data, train, or evaluate.
- The focused repository suite passed **57 of 57 tests**.
- The live UI had **zero page-level horizontal overflow and zero configuration/code-panel overlap** at 360, 390, 768, 1128, and 1440 pixels.

The current tool can remove roughly **62% of the implementation burden** from a typical project inside its supported workflows. This is a product judgment, not a statistical estimate. Classical classification and regression are closer to 75–85%; advanced deep-learning projects are closer to 50–65%; the standalone neural-network builder is closer to 25–35% because it currently produces an untrained architecture.

Reaching “90% no code” is realistic only for bounded, explicitly supported project families. The tool can generate most boilerplate, configuration, preprocessing, training, evaluation, and export code. It cannot responsibly replace problem definition, label quality, dataset rights, leakage judgment, deployment constraints, or interpretation of whether a model is good enough.

## The strongest result is real execution, not just generated syntax

Previous validation proved that recipes generated parseable Python. This audit installed the declared ecosystems in an isolated environment, obtained public datasets, configured the live UI, captured its generated scripts, and ran them.

| Workflow | Tested implementation | Public test data | Result | Primary observed output |
|---|---|---|---|---|
| Classification | scikit-learn random forest, robust scaling, one-hot encoding, SMOTE | UCI Adult, 32,561 rows | End-to-end pass | Test accuracy 0.7898; balanced accuracy 0.8161 |
| Regression | scikit-learn random forest, standard scaling | UCI Auto MPG, 398 rows | End-to-end pass | Test R² 0.9230; MAE 1.5235 |
| Sensor classification | PyTorch LSTM | UCI HAR, 7,352 windows | End-to-end pass | Test accuracy 0.3237; TorchScript export |
| Image classification | TensorFlow MobileNetV3Small | 100-image Flowers subset | End-to-end pass | TFLite export and inference; validation accuracy 0.0 after one epoch |
| Object detection | Ultralytics YOLOv8n | COCO8 | End-to-end pass | Explicit validation mAP50-95 0.292; inference output |
| Instance segmentation | Ultralytics YOLOv8n-seg | COCO8-Seg | End-to-end pass | Explicit mask mAP50-95 0.203; inference output |
| Neural network | Keras tabular MLP | 64-input, 10-class configuration | Architecture-only pass | 6,570-parameter model saved without training |
| Neural network | PyTorch tabular MLP | 64-input, 10-class configuration | Architecture-only pass | State dictionary saved without training |

The low sensor and image metrics are not product failures by themselves. Both deep-learning cases intentionally used one epoch and small smoke data. They prove that the generated pipelines connect and run; they do not estimate real-world model quality.

The important distinction is:

- **Runtime pass:** the script completed its written behavior with exit code zero.
- **End-to-end pass:** the script loaded data, trained, evaluated, and produced a usable artifact or inference result.
- **Architecture-only pass:** the script built and saved a model structure but did not train or evaluate it.

The UI and exported documentation should expose these distinctions. A beginner should never see “saved model” and assume “trained model.”

## Four high-confidence issues currently weaken configuration trust

### 1. The neural builder saves untrained models

The Keras script defines data and `model.fit` as comments, then saves `configured_network.keras`. The PyTorch script comments out the DataLoader loop, then saves `configured_network.pt`.

Why this matters:

- It conflicts with the central promise that the user can configure and obtain the code needed for the project.
- The files look like model artifacts even though no learning occurred.
- A student can misunderstand the difference between architecture construction and model training.

Required change:

- Let the neural builder select or describe a dataset.
- Connect input features or image/text/time-series shape to the architecture.
- Generate preprocessing, split, DataLoader or dataset objects, fit loop, validation, final test, checkpointing, inference, and export.
- Label “Architecture only” as a separate output mode if it remains available.
- Do not save a file under a trained-model presentation unless training actually ran.

### 2. The YOLO learning-rate control is ignored

Both generated YOLO scripts pass `lr0=0.001`. Ultralytics then logs:

> `optimizer=auto` found, ignoring `lr0=0.001` ... and determining the best optimizer and learning rate automatically.

The interface therefore lets the user configure a learning rate that does not affect training.

Why this matters:

- This is a configuration-integrity defect, not only a missing feature.
- The tool’s main advantage over prompting an LLM is deterministic, understandable configuration.
- A control that silently does nothing damages that advantage.

Required change:

- Expose optimizer selection.
- If the user selects automatic optimizer behavior, disable the learning-rate field and explain that the framework will choose it.
- If the user selects a learning rate, generate a concrete compatible optimizer so the value is honored.
- Add a runtime assertion or test that compares the resolved trainer settings with the project configuration.

### 3. YOLO validation reuses the inference confidence threshold

The generated `validate_model` function passes `conf=CONFIG["confidence_threshold"]`, which was configured as 0.25 for inference. Training-time validation used Ultralytics’ metric-oriented default and reported:

- Detection mAP50-95: 0.444 during training validation
- Detection mAP50-95: 0.292 during the explicit generated validation
- Segmentation mask mAP50-95: 0.340 during training validation
- Segmentation mask mAP50-95: 0.203 during the explicit generated validation

The exact values are unstable on tiny COCO8 data, but the cause of the difference is deterministic: the explicit validation filters predictions at an inference threshold.

Required change:

- Separate `inference_confidence` from any validation threshold.
- Default validation to the framework’s metric-safe threshold.
- Explain that inference confidence is an operating decision, while mAP evaluation normally sweeps confidence across the precision-recall curve.
- Add a test that the generated validation call does not inherit the inference threshold.

### 4. “Final evaluation” has different meanings across tasks

The workflows do not share one evidence contract:

- Classification and regression use train, validation, and untouched test partitions.
- Sensor classification uses validation and test fractions, but random window splitting has no group or time-aware option.
- Image classification uses train and validation only.
- YOLO uses the validation set declared in YAML and does not require a final test set.
- Neural-network outputs do not evaluate anything.

Why this matters:

- A student can treat incomparable metrics as equivalent evidence.
- Random sensor-window splitting can leak subject, session, or adjacent-window information.
- Hyperparameter choices can become indirectly tuned to the same data called “final.”

Required change:

- Introduce a shared split contract with task-specific options:
  - train/test;
  - train/validation/test;
  - cross-validation;
  - stratified split;
  - group-aware split;
  - chronological split;
  - purge or gap between time-series partitions;
  - YAML-provided test set for detection/segmentation.
- Label every reported metric with its partition.
- Explain which partition may be used for tuning and which must remain untouched.

## The learning flow is clear, but its three levels are currently two—or sometimes one

The nine-step sequence is a strong foundation:

1. Goal
2. Data
3. Inspect
4. Split
5. Prepare
6. Model
7. Train
8. Evaluate
9. Generate

This order matches how a student should remember an ML workflow. It turns the product from a list of disconnected generators into one recognizable method.

However, the captured control trees show:

- **Customize and Advanced are exactly identical in all seven tasks.**
- Regression Guided, Customize, and Advanced are identical.
- Neural-network Guided, Customize, and Advanced are identical.
- Several advanced task steps explain a concept but expose no decision at that step.

The problem is not that every step needs a control. Goal and Evaluate can correctly be explanatory. The problem is that the product advertises progressive depth without delivering different depth.

Recommended disclosure model:

- **Guided:** recommended values, a small number of decisions, visible explanation of hidden defaults.
- **Customize:** common project choices that materially change the pipeline.
- **Advanced:** optimization, reproducibility, data leakage safeguards, performance, export, deployment, and uncommon model-specific controls.

Until Advanced is real, merge it with Customize. Two honest levels are better than three visually distinct buttons that produce the same configuration.

## Responsive behavior is fixed at the reported width

The live layout was measured in the Classification → Customize → Prepare state, which contains several long selects and explanations.

| Viewport | Page horizontal overflow | Configuration/code overlap | Layout behavior |
|---|---:|---:|---|
| 360 × 800 | 0 px | 0 px² | Configure visible; Code hidden behind workspace tab |
| 390 × 844 | 0 px | 0 px² | Configure visible; Code hidden behind workspace tab |
| 768 × 1024 | 0 px | 0 px² | Configure visible; Code hidden behind workspace tab |
| 1128 × 940 | 0 px | 0 px² | Configuration and code shown side by side |
| 1440 × 900 | 0 px | 0 px² | Configuration and code shown side by side |

At 1128 px—the size similar to the user’s earlier overlapping screenshot—the configuration panel ended before the code panel began. No collision remained.

One usability gap remains on narrow screens: the workflow rail scrolls horizontally and centers the selected step. Neighboring steps are intentionally off-screen, but there is no strong visible cue that the rail can be swiped. Add edge fades, previous/next arrows, or a compact `Step 5 of 9` label.

Touch-target measurement also found several 42-pixel-tall action buttons. This is close to, but below, a conservative 44-pixel target. Increase their minimum height slightly.

The local route returned HTTP 200 across five measurements, with 54–116 ms total response time and a median near 62 ms. This is a warm local-server HTTP check, not a production Web Vitals measurement or proof of hydration time.

## Data quality and learning-dataset assessment

The audit used public data rather than generated data.

| Workflow | Dataset | Intended grain | Quality condition exercised |
|---|---|---|---|
| Classification | UCI Adult | One person per row | 4,262 missing values across categorical fields |
| Regression | UCI Auto MPG | One car per row | Six missing horsepower values |
| Sensor classification | UCI HAR | One 128-sample accelerometer window | Six activity classes and fixed-length windows |
| Image classification | TensorFlow Flowers | One labeled image | Balanced 20-image-per-class smoke subset |
| Object detection | COCO8 | One annotated image | YOLO YAML, labels, 17 validation instances |
| Instance segmentation | COCO8-Seg | One polygon-annotated image | Mask labels and 17 validation instances |
| Neural architecture | Digits-shaped metadata | One feature vector and digit label | Input/output shape only; not connected to training |

Data-quality strengths:

- Classical preprocessing is fit only on training data.
- Classical test data stays separate from model fitting.
- Classification stratifies by target.
- Missing numeric and categorical values are handled.
- Generated scripts validate required target columns or expected data structures.
- Sensor, image, and YOLO workflows produce explicit artifacts and sample inference.

Data-quality risks:

### Ordinary SMOTE after dense one-hot encoding

The tested classification flow applies ordinary SMOTE after dense one-hot encoding. It runs, but synthetic interpolation can create fractional category indicators. Dense one-hot output also expands memory use.

Recommended behavior:

- Prefer class weights as the safest first option for mixed tabular data.
- Offer `SMOTENC` when raw categorical columns are known.
- Explain why ordinary SMOTE is intended for continuous feature spaces.
- Warn when dense encoded dimensionality is large.

### Sensor split and ordering controls

The sensor script assumes rows are already in the correct sequence and forms windows before random partitioning. It lacks:

- timestamp selection and sorting;
- resampling to a target rate;
- missing-sample or gap policy;
- session or subject identifier;
- group-aware split;
- chronological split;
- overlap leakage check;
- window-label policy for mixed-label windows.

These controls are central for fault detection, predictive maintenance, human-activity recognition, and other LSTM or CNN time-series projects.

### Image validation is not a final test

The image workflow uses a validation fraction and reports validation/TFLite accuracy. Add:

- independent test directory or fraction;
- stratified file-count preview;
- corrupted-image scan;
- class imbalance summary;
- configurable augmentation operations and probabilities;
- confusion matrix and per-class examples.

### YOLO dataset validation is structural, not semantic

The YAML parser checks for `train`, `val`, and `names`, and Ultralytics checks annotation files during execution. The tool should additionally generate or offer:

- missing image/label pair checks;
- class-ID range checks;
- invalid or zero-area box checks;
- polygon validity checks;
- class distribution;
- image-size distribution;
- annotation visualization sample;
- optional test split and metric labeling.

## Important medium-priority product gaps

### Dependency ranges are available but omitted

The recipe metadata contains compatibility ranges such as:

- `ultralytics >=8.3,<9`
- `torch >=2.3,<3`
- `tensorflow >=2.16,<3`
- `scikit-learn >=1.4,<2`

The visible install commands contain names only, such as `pip install ultralytics torch numpy PyYAML`.

That makes future installs less reproducible than the recipes themselves. Display compatible ranges and include them in a generated `requirements.txt`.

### Output names can overwrite earlier runs

Classification and regression both save `trained_pipeline.joblib` in the working directory. In this audit, the regression run replaced the earlier classification artifact.

Expose:

- project directory;
- experiment or run name;
- task-specific artifact name;
- overwrite policy;
- timestamp or configuration hash when useful.

### Generated handoff is still one Python file

The user still needs to assemble the environment and project structure. A stronger download should include:

```text
project/
├── README.md
├── requirements.txt
├── model_mission.json
├── train.py
├── predict.py
├── validate_data.py
├── tests/
│   └── test_smoke.py
└── data/
    └── README.md
```

The JSON configuration should remain the canonical source of truth so users can reopen, compare, or regenerate the project.

### Metrics are reported more often than they are taught

The tool explains some metric names, but it should help the student interpret results:

- What range is possible?
- Is larger or smaller better?
- Which class or error matters most?
- When is accuracy misleading?
- What does R² below zero mean?
- Why can mAP change when the confidence threshold changes?
- How do training, validation, and test metrics differ?

Add a deterministic “How to read this result” section; no LLM is required.

## Scorecard and rating

| Dimension | Score | Weight | Evidence |
|---|---:|---:|---|
| Generated-code executability | 8.5 | 16% | 8/8 variants completed their coded scope |
| Configuration depth | 7.4 | 14% | Strong task controls; several missing or ineffective choices |
| Workflow breadth | 7.0 | 12% | Seven tasks across classical, vision, sensor, and neural design |
| Learning design | 7.4 | 12% | Strong linear path; disclosure levels and result interpretation need work |
| Data handling | 7.0 | 12% | Useful classical pipeline; important task-specific safeguards missing |
| Evaluation correctness | 6.2 | 12% | Metrics run, but YOLO and split semantics weaken comparability |
| Reproducibility | 7.0 | 8% | Seeds and artifacts exist; dependency constraints are dropped |
| Responsive usability | 8.5 | 8% | No measured page overflow or panel overlap |
| Project packaging | 5.5 | 6% | Single-script download leaves setup work to the student |

Weighted result: **7.3/10**

Additional product judgments:

- Core idea and market distinctiveness: **9.0/10**
- Current usefulness for a motivated ML student: **7.5/10**
- Current usefulness for a working ML engineer who wants fast scaffolds: **7.0/10**
- Current ability to replace an LLM for supported deterministic setup: **8.0/10**
- Current ability to replace coding across a full ML project: **6.2/10**
- Realistic potential after the recommended work: **9.0/10**

The project is worth publishing openly. Its strongest positioning is not “AI writes code.” It is:

> Build your own understandable ML pipeline through explicit choices, then receive the exact Python project that represents those choices.

That is more educational and reproducible than prompt-only generation.

## Recommended implementation sequence

### Phase 0 — Restore configuration integrity

Do these before adding more algorithms:

1. Make the YOLO learning-rate control effective.
2. Separate validation and inference confidence.
3. Add tests that compare selected configuration with resolved framework settings.
4. Give every saved artifact a task-specific, user-controlled output path.
5. Label trained, untrained, validation-only, and final-test outputs honestly.

Acceptance criteria:

- Every visible control changes generated behavior or becomes visibly disabled with an explanation.
- Runtime logs confirm selected training settings.
- Detection and segmentation validation match standard metric behavior.

### Phase 1 — Finish the neural workflow

1. Choose problem type: tabular, image, sequence, or text.
2. Choose data source and target.
3. Configure preprocessing and split.
4. Build layers with automatic shape checks.
5. Configure loss, optimizer, metrics, batch size, epochs, and callbacks.
6. Generate a complete Keras or PyTorch training path.
7. Evaluate on the correct split.
8. Save trained weights and a sample inference script.

Acceptance criteria:

- Keras and PyTorch reference profiles train on a public dataset.
- Invalid layer combinations are blocked before code generation.
- The exported artifact reproduces a recorded sample prediction.

### Phase 2 — Make project downloads complete

Generate a zip containing:

- Python source;
- configuration JSON or YAML;
- versioned dependencies;
- README;
- expected dataset schema;
- install and run commands;
- artifact description;
- smoke test.

Acceptance criteria:

- A clean isolated environment can unzip, install, and run the smoke profile without manual code edits.
- The generated configuration can be imported back into Model Mission.

### Phase 3 — Standardize data and evaluation

Build a shared decision model for:

- inspection;
- cleaning;
- split;
- leakage protection;
- augmentation;
- imbalance handling;
- baselines;
- metrics;
- error analysis.

Then provide task-specific variants:

- group/time split for sensors;
- corruption and class checks for images;
- annotation inspection for YOLO;
- `SMOTENC` and sparse-safe processing for mixed tabular data.

### Phase 4 — Make Advanced genuinely advanced

Candidate controls:

- cross-validation;
- group and time-series validation;
- hyperparameter search;
- optimizer and scheduler;
- gradient clipping;
- mixed precision;
- checkpoint policy;
- class or focal loss;
- threshold tuning;
- calibration;
- experiment comparison;
- export verification;
- deterministic and performance settings.

Keep these behind Advanced so Guided remains friendly.

### Phase 5 — Add the missing learning families

Recommended order:

1. Clustering: K-means, DBSCAN, hierarchical clustering.
2. Anomaly detection: Isolation Forest, one-class SVM, autoencoder.
3. Dimensionality reduction: PCA, UMAP for exploration.
4. Forecasting: classical baseline, tree features, LSTM/temporal network.
5. Text classification and embeddings.
6. LLM inference, retrieval, and fine-tuning workflows, including Unsloth where licensing and hardware requirements are explicit.

Do not add algorithms as a flat list. Each family should reuse the Goal → Data → Inspect → Split → Prepare → Model → Train → Evaluate → Generate path.

## Public-dataset learning mode

The tool should recommend datasets; it should not ship or synthesize them.

Each dataset record should include:

- public source link;
- license or terms link;
- problem type;
- beginner/intermediate/advanced difficulty;
- approximate download size;
- row, image, or sequence count;
- input and target schema;
- class balance or target range;
- missing-value notes;
- required split type;
- what concepts the student will learn;
- compatible Model Mission preset;
- checksum for optional test automation.

Start with the datasets used in this audit:

- [UCI Adult](https://archive.ics.uci.edu/dataset/2/adult)
- [UCI Auto MPG](https://archive.ics.uci.edu/dataset/9/auto+mpg)
- [UCI Human Activity Recognition Using Smartphones](https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones)
- [TensorFlow transfer-learning flower example](https://www.tensorflow.org/tutorials/images/transfer_learning_with_hub)
- [Ultralytics COCO8](https://docs.ultralytics.com/datasets/detect/coco8/)
- [Ultralytics COCO8-Seg](https://docs.ultralytics.com/datasets/segment/coco8-seg/)

Before publishing a recommendation, verify that the source is stable, the terms permit the intended use, and the task preset reflects the dataset’s real schema.

## What is required for a credible 9/10

Model Mission reaches approximately 9/10 when:

- every visible configuration is behaviorally verified;
- neural projects are trained, evaluated, and exported end to end;
- split semantics are explicit and leakage-safe;
- a user can download and rerun a complete project;
- dependency versions are preserved;
- Guided, Customize, and Advanced provide genuinely different depth;
- students can see how each decision changes the generated code;
- each task has several verified public dataset presets;
- results are interpreted, not only printed;
- representative end-to-end profiles run automatically in continuous testing;
- clustering, anomaly detection, forecasting, and text workflows extend breadth without weakening the shared learning sequence.

The tool should target 90% of repeatable implementation work, not 90% of ML judgment. That boundary is a feature: the product teaches the choices that still require human understanding.

## Scope, methods, and metric definitions

### Scope

- One local route.
- Seven visible tasks.
- Three explanation levels.
- Nine workflow steps.
- Eight generated Python variants because neural design was tested in Keras and PyTorch.
- Representative configurations chosen to exercise missing values, categorical data, SMOTE, three-way splitting, LSTM training, TFLite export, YOLO training, mask evaluation, and layer translation.

### Data handling

Public archives were downloaded into an isolated temporary directory. No dataset was added to the repository. Checksums and preparation metadata were recorded in the compact evidence artifact.

### Runtime

- CPU-oriented smoke profiles.
- One epoch for deep-learning tasks.
- Small deterministic subsets where full datasets were unnecessary.
- Exit code, duration, final log lines, and produced artifacts were captured.

### Responsive checks

The live page was rendered in Chromium at five viewport widths. The audit measured:

- document `scrollWidth - clientWidth`;
- configuration and code panel rectangles;
- panel intersection area;
- clipped interactive elements;
- internal code-scroll width;
- visible workspace mode.

### Scores

The 7.3 score is a weighted technical/product assessment. Dimension scores are bounded judgments supported by observed behavior. The estimated completion percentages are scenario-level planning estimates and should not be interpreted as measured user productivity.

## Limitations, uncertainty, and robustness

- One-epoch smoke metrics do not describe production accuracy.
- COCO8 and COCO8-Seg are intentionally tiny and yield unstable per-class metrics.
- The audit tested representative configurations, not every possible combination.
- Public datasets were used for validation but are not bundled with the website.
- Browser checks used Chromium only.
- HTTP timings were measured against a warm local server, not a production deployment.
- No GPU, mobile device, Raspberry Pi, Jetson, Coral, Android, TensorRT, or ONNX Runtime deployment was physically tested.
- The TFLite run used an API that TensorFlow now marks deprecated in favor of LiteRT; current execution passed, but a future compatibility migration is needed.
- Native Windows TensorFlow did not use the GPU, which is expected for current TensorFlow releases.
- The generated install commands were tested in one isolated environment on the audit date; unpinned future installs can change behavior.

## Further questions

1. Should “Advanced” remain a learning level, or should it become an explicit production/deployment mode?
2. Should the neural builder join the selected Data/Inspect/Split workflow automatically, or should architecture-only remain a separate selectable output?
3. Should the canonical artifact be a single script, a complete project zip, or both?
4. Which three to five dataset recommendations should be verified first for each new problem family?
5. Which result comparisons should the tool save locally: configuration diffs, metrics, artifacts, or all three?
6. What licensing policy should govern public dataset recommendations, model weights, and optional LLM fine-tuning integrations?

## Supporting evidence

- [Compact evidence dataset](./2026-07-28-model-mission-audit-evidence.json)
- [Executed audit notebook](./2026-07-28-model-mission-end-user-audit.ipynb)
- [Previous student audit](./2026-07-27-ai-script-generator-student-audit.md)
- [scikit-learn guidance on data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)

