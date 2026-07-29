# Model Mission Learning Engine Audit

Audit date: 2026-07-29

Evidence: `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`
Revised score: **8.7/10**

## Executive result

The reviewed Model Mission route passes every repository verification command executed by this audit. All eight requested representative configurations generate parseable Python and deterministic eight-file project archives through the current production APIs.

This is not a claim of universal no-code coverage. The tool generates editable training projects for its registered workflows; users still provide task-appropriate data, install the declared environment, interpret metrics, and own deployment validation.

Current runtime evidence records 3 unavailable, 5 not-applicable. Missing local modules recorded by the project outcomes: `joblib`, `keras`, `pandas`, `sklearn`, `tensorflow`, `torch`. Recorded non-passing reasons: Required local Python modules are unavailable. (3); The requested configuration needs user-supplied data or an external/heavyweight workflow. (5) No reviewed training execution passed in this environment. The environment probe found 2 available declared-runtime import(s). Dependency-free structural smoke checks remain distinct from training execution.

## Verification

| Command | Outcome | Normalized evidence |
| --- | --- | --- |
| npm run test:ml | exit 0 (passed) | 127/127 pass |
| node --test tests/tools/ml-classical-generator-v2.test.js tests/tools/ml-neural-generator.test.js tests/tools/ml-project-config.test.js | exit 0 (passed) | 53/53 pass |
| node --test tests/tools/ml-generator-baseline-contract.test.js tests/tools/ml-generator-parity.test.js | exit 0 (passed) | 10/10 pass |
| npx tsc --noEmit | exit 0 (passed) | no command output |
| npm run build | exit 0 (passed) | 16/16 static pages |
| npm run test:ml:responsive | exit 0 (passed) | 2/2 pass |
| git diff --check -- scripts/build_model_mission_audit_artifacts.py tests/tools/model-mission-responsive.test.js tests/tools/test_model_mission_audit_builder.py | exit 0 (passed) | no command output |
| git diff --check -- docs/reports/2026-07-29-model-mission-learning-engine-audit.md docs/reports/2026-07-29-model-mission-learning-engine-evidence.json | exit 0 (passed) | no command output |

Normalized verification warnings: `ml-suite`: Node reparsed ES-module syntax because package.json does not declare a module type. (non-failing tooling warning); `focused-generators`: Node reparsed ES-module syntax because package.json does not declare a module type. (non-failing tooling warning); `yolo-baseline-parity`: Node reparsed ES-module syntax because package.json does not declare a module type. (non-failing tooling warning); `final-artifact-diff-check`: warning: in the working copy of 'docs/reports/2026-07-29-model-mission-learning-engine-audit.md', LF will be replaced by CRLF the next time Git touches it (non-failing tooling warning); `final-artifact-diff-check`: warning: in the working copy of 'docs/reports/2026-07-29-model-mission-learning-engine-evidence.json', LF will be replaced by CRLF the next time Git touches it (non-failing tooling warning).

## Eight representative projects

| Configuration | Python AST | ZIP contract | Expected artifact | Runtime | Generator warnings |
| --- | --- | --- | --- | --- | --- |
| advanced-keras-image | passed | 8/8 exact | artifacts/image.keras | not-applicable | 0 |
| advanced-pytorch-tabular | passed | 8/8 exact | artifacts/tabular.pt | unavailable | 0 |
| advanced-regression-group-power | passed | 8/8 exact | regression_pipeline.joblib | not-applicable | 1 |
| advanced-yolo-segmentation-confidence | passed | 8/8 exact | runs/segmentation/yolo_segmentation/weights/best.pt | not-applicable | 5 |
| customized-pytorch-sequence-lstm | passed | 8/8 exact | artifacts/sequence.pt | not-applicable | 0 |
| customized-yolo-detection-adamw | passed | 8/8 exact | runs/detection/yolo_detection/weights/best.pt | not-applicable | 2 |
| guided-keras-tabular | passed | 8/8 exact | artifacts/neural_network.keras | unavailable | 0 |
| guided-logistic-standard | passed | 8/8 exact | classification_pipeline.joblib | unavailable | 0 |

For every row, `model_mission.json` round-tripped to the resolved production configuration, `requirements.txt` matched the sorted structured dependency ranges, ZIP CRC inspection passed, `src/train.py`, `src/predict.py`, and the project smoke test parsed, and the dependency-free smoke test exited 0.

Runtime meanings:

- `unavailable`: the configuration uses built-in data but one or more declared local Python modules are missing.
- `not-applicable`: execution requires user-supplied data, external weights, or a heavyweight workflow.
- A declared artifact path is not evidence that training created it; creation is recorded by each runtime outcome.

## Live student and expert audit

The scoped local Next.js/Chromium harness passed its structured audit at **320, 360, 390, 768, 900, 1024, 1440 px**. Every width recorded passing layout and neural-editor outcomes. The emitted passing contracts were `advancedExceedsCustomize`, `downloadsAreLocalAndComplete`, `explanationsContained`, `hiddenValuesPreserved`, `mobileTabsPreserveState`, `noComputedGradients`.

The UI presents nine ordered steps: Goal, Data, Inspect, Split, Prepare, Model, Train, Evaluate, and Generate. Each registered control has all six required educational metadata fields. This supports a guided walkthrough, but an automated browser audit cannot establish that a student can explain all nine steps after one project; that claim requires a real comprehension study.

Scaling is only **partially** self-explanatory. The UI exposes none, standard, robust, minmax, maxabs, power, and quantile, provides one complete scaling-control explanation, and supplies model-aware recommendations. It does not provide a distinct lesson or friendly label for every scaler, so a beginner may not understand the difference between Robust, MaxAbs, Power, and Quantile without external context.

Customize adds practical choices and Advanced adds specialist controls for every task:

| Task | Guided | Customize | Advanced |
| --- | ---: | ---: | ---: |
| classification | 10 | 15 | 20 |
| regression | 10 | 15 | 17 |
| sensor-classification | 8 | 15 | 22 |
| image-classification | 6 | 12 | 17 |
| object-detection | 12 | 20 | 28 |
| instance-segmentation | 12 | 20 | 28 |
| neural-network | 10 | 19 | 27 |

## Per-project generated-code contracts

| Project | Contract | Outcome | Generated-code evidence |
| --- | --- | --- | --- |
| advanced-keras-image | activeTrainingLifecycle | passed | `train_data, validation_data, test_data, preprocessing = load_data()`<br>`history = train_model(`<br>`test_metrics = evaluate_model(model, test_data)`<br>`model.save(ARTIFACT_PATH)`<br>`sample_prediction = predict_sample(model, test_data)` |
| advanced-keras-image | finalTestSeparated | passed | `validation_data`<br>`test_data`<br>`test_metrics = evaluate_model(model, test_data)`<br>`print("Final test metrics:", test_metrics)` |
| advanced-pytorch-tabular | activeTrainingLifecycle | passed | `DataLoader(`<br>`history, amp_enabled = train_model(`<br>`checkpoint = torch.load(CHECKPOINT_PATH`<br>`model.load_state_dict(checkpoint["model_state"])`<br>`test_metrics = evaluate(`<br>`torch.save(checkpoint, ARTIFACT_PATH)`<br>`sample_prediction = predict_sample(` |
| advanced-pytorch-tabular | finalTestSeparated | passed | `train_loader, validation_loader, test_loader`<br>`checkpoint = torch.load(CHECKPOINT_PATH`<br>`model, test_loader, criterion`<br>`print("Final test metrics:", test_metrics)` |
| advanced-pytorch-tabular | trainingOnlyPreprocessing | passed | `X_train = preprocessor.fit_transform(X_train)`<br>`X_validation = preprocessor.transform(X_validation)`<br>`X_test = preprocessor.transform(X_test)` |
| advanced-regression-group-power | finalTestSeparated | passed | `X_test`<br>`"Final test"`<br>`pipeline.predict(X_test.iloc[[0]])` |
| advanced-regression-group-power | trainingOnlyPreprocessing | passed | `Split before fitting imputers, encoders, scalers, or samplers`<br>`pipeline.fit(X_train, y_train)` |
| advanced-yolo-segmentation-confidence | optimizerLearningRateTruthful | passed | `if str(CONFIG["optimizer"]) != "auto":`<br>`optimizer=str(CONFIG["optimizer"])`<br>`"optimizer": "auto"`<br>`CONFIG omits learning_rate for automatic optimization` |
| advanced-yolo-segmentation-confidence | predictionConfidenceRouted | passed | `model.predict(`<br>`conf=float(CONFIG["prediction_confidence"])` |
| advanced-yolo-segmentation-confidence | validationConfidenceRouted | passed | `model.val(`<br>`conf=float(CONFIG["validation_confidence"])` |
| customized-pytorch-sequence-lstm | activeTrainingLifecycle | passed | `DataLoader(`<br>`history, amp_enabled = train_model(`<br>`checkpoint = torch.load(CHECKPOINT_PATH`<br>`model.load_state_dict(checkpoint["model_state"])`<br>`test_metrics = evaluate(`<br>`torch.save(checkpoint, ARTIFACT_PATH)`<br>`sample_prediction = predict_sample(` |
| customized-pytorch-sequence-lstm | finalTestSeparated | passed | `train_loader, validation_loader, test_loader`<br>`checkpoint = torch.load(CHECKPOINT_PATH`<br>`model, test_loader, criterion`<br>`print("Final test metrics:", test_metrics)` |
| customized-pytorch-sequence-lstm | trainingOnlyPreprocessing | passed | `scaler.fit_transform(`<br>`scaler.transform(` |
| customized-yolo-detection-adamw | optimizerLearningRateTruthful | passed | `if str(CONFIG["optimizer"]) != "auto":`<br>`optimizer=str(CONFIG["optimizer"])`<br>`"optimizer": "AdamW"`<br>`"learning_rate":`<br>`lr0=float(CONFIG["learning_rate"])` |
| customized-yolo-detection-adamw | predictionConfidenceRouted | passed | `model.predict(`<br>`conf=float(CONFIG["prediction_confidence"])` |
| customized-yolo-detection-adamw | validationConfidenceRouted | passed | `model.val(`<br>`conf=float(CONFIG["validation_confidence"])` |
| guided-keras-tabular | activeTrainingLifecycle | passed | `train_data, validation_data, test_data, preprocessing = load_data()`<br>`history = train_model(`<br>`test_metrics = evaluate_model(model, test_data)`<br>`model.save(ARTIFACT_PATH)`<br>`sample_prediction = predict_sample(model, test_data)` |
| guided-keras-tabular | finalTestSeparated | passed | `validation_data`<br>`test_data`<br>`test_metrics = evaluate_model(model, test_data)`<br>`print("Final test metrics:", test_metrics)` |
| guided-keras-tabular | trainingOnlyPreprocessing | passed | `X_train = preprocessor.fit_transform(X_train)`<br>`X_validation = preprocessor.transform(X_validation)`<br>`X_test = preprocessor.transform(X_test)` |
| guided-logistic-standard | finalTestSeparated | passed | `X_test`<br>`"Final test"`<br>`predict_labels(pipeline, X_test.iloc[[0]])` |
| guided-logistic-standard | trainingOnlyPreprocessing | passed | `Split before fitting imputers, encoders, scalers, or samplers`<br>`pipeline.fit(X_train, y_train)` |

The contract outcomes above come from the current generated Python for each representative project; their source-test provenance is recorded in the JSON evidence.

## Task 4 YOLO baseline and parity

The dedicated baseline/parity command passed 10/10 tests. It ties the seven YOLO fixtures below to baseline `23ef28c` and to the reviewed optimizer, learning-rate, validation-confidence, and prediction-confidence contracts.

| Fixture | SHA-256 |
| --- | --- |
| scenario/detection-jetson | `7ab6721692b3dedb3ff1fe1ab9ad232533568642b421104f4a05a814ea3b39b8` |
| yolo-detection-training/manifest | `ee9f74c1c003caeaa8827c036b09282928678940586be661b49bc4a2ff78e95f` |
| yolo-detection-training/production/contract | `db3e86a83c004b030aa1d9a46ad58f46239a5780cd984eee9bde5853050844b9` |
| yolo-detection-training/starter/contract | `436f7b20489d1e573ce600d6dfdb05696fdaf1194d450d408024bc82fabbfbf0` |
| yolo-segmentation-training/manifest | `3d754f05f63d151c8c369deba3d24394349ead3c82ca5cf77cc03f4197a0755c` |
| yolo-segmentation-training/production/contract | `610526859d58469aa52fe89e8bd15e6ccd8efaf727bfa6c2216b2f5b27bfe8e8` |
| yolo-segmentation-training/starter/contract | `237b8cdffcd89e400fdbac6b447b33070818a3ac66d76473b83aa0fb7bd0994e` |

Every project archive explains environment setup, data shape/source, training/evaluation, prediction, expected artifacts, warnings, and a dependency-free smoke test.

## Score methodology

| Dimension | Score | Maximum | Method |
| --- | ---: | ---: | --- |
| Static generation and project integrity | 2.0 | 2.0 | All eight must pass AST, ZIP, requirements, config, artifact declaration, and structural smoke checks. |
| Local runtime assurance | 0.5 | 1.5 | Dependency-free smoke coverage earns 0.5 when every static project contract passes. Runtime evidence records 0/3 eligible workflows passed after 0 execution(s) (0 failed, 3 unavailable, 5 not-applicable); execution coverage and pass rate are multiplied for up to 1.0. |
| Learning workflow | 1.2 | 1.5 | Nine-step structure and complete metadata are present; no student comprehension study was performed and scaler options lack per-option lessons. |
| Progressive disclosure | 1.5 | 1.5 | Every task must have guided < customize < advanced control counts and preserve state in the live harness. |
| Generated behavior truthfulness | 1.5 | 1.5 | YOLO optimizer/confidence and active Keras/PyTorch training contracts are checked in generation and parity suites. |
| Responsive live-route usability | 1.5 | 1.5 | The scoped live browser harness must pass all required widths and real state-preserving interactions. |
| Scope honesty and handoff | 0.5 | 0.5 | Runtime outcomes, data constraints, and universal-coverage limits are reported from current evidence. |

The score measures the evidence available in this audit, not theoretical framework breadth.

## Verified strengths

- Deterministic, parseable project generation with a fixed eight-file archive contract.
- Training-only learned preprocessing and a separated final test in every reviewed project where both contracts apply.
- Meaningfully different Guided, Customize, and Advanced disclosure counts for all seven tasks.
- Truthful YOLO optimizer and distinct validation/prediction confidence behavior, tied to seven Task 4 hashes.
- Active Keras and PyTorch lifecycle and separated final-test contracts rather than commented training skeletons.
- Flat responsive layout with viewport containment and real state-preserving interactions.

## Remaining gaps and deferred observations

- Student comprehension after one guided project is not established without a user study.
- Scaler options have shared control-level education, not per-option beginner explanations.
- No reviewed training execution passed; remaining outcomes were 3 unavailable, 5 not-applicable.
- Project-bundle task branching is growing and will become harder to maintain as workflows expand.

## Conclusion

Within its registered workflows, Model Mission is a strong learning-oriented project generator with truthful configuration semantics and a reproducible handoff. Its runtime evidence is limited by 3 unavailable workflows; 5 additional workflows were not applicable. The next highest-value improvements are per-scaler explanations, keeping project-bundle branching maintainable as workflows expand, and a small controlled student comprehension study.
