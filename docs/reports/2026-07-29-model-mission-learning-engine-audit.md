# Model Mission Learning Engine Audit

Audit date: 2026-07-29

Evidence: `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`
Revised score: **8.7/10**

## Executive result

The reviewed Model Mission route passes the full JavaScript/TypeScript/build and live responsive verification available in this repository. All eight requested representative configurations generate parseable Python and deterministic eight-file project archives through the current production APIs.

This is not a claim of universal no-code coverage. The tool generates editable training projects for its registered workflows; users still provide task-appropriate data, install the declared environment, interpret metrics, and own deployment validation.

The local audit machine does not have scikit-learn, pandas, joblib, TensorFlow/Keras, PyTorch, torchvision, or Ultralytics. Therefore no training runtime is reported as passed. Dependency-free project smoke tests passed, while AST/static compilation is kept distinct from runtime execution.

## Verification

| Command | Outcome | Normalized evidence |
| --- | --- | --- |
| npm run test:ml | exit 0 (passed) | 120/120 pass |
| node --test tests/tools/ml-classical-generator-v2.test.js tests/tools/ml-neural-generator.test.js tests/tools/ml-project-config.test.js | exit 0 (passed) | 47/47 pass |
| npx tsc --noEmit | exit 0 (passed) | no command output |
| npm run build | exit 0 (passed) | 0/16 static pages |
| npm run test:ml:responsive | exit 0 (passed) | 2/2 pass |
| git diff --check | exit 0 (passed) | no command output |

The Node tests emit a non-failing `MODULE_TYPELESS_PACKAGE_JSON` warning because this package contains ES-module syntax without declaring `"type": "module"`. It is classified as tooling noise, not a product failure.

## Eight representative projects

| Configuration | Python AST | ZIP contract | Expected artifact | Runtime | Generator warnings |
| --- | --- | --- | --- | --- | --- |
| guided-logistic-standard | passed | 8/8 exact | classification_pipeline.joblib | unavailable | 0 |
| advanced-regression-group-power | passed | 8/8 exact | regression_pipeline.joblib | not-applicable | 1 |
| customized-yolo-detection-adamw | passed | 8/8 exact | runs/detection/yolo_detection/weights/best.pt | not-applicable | 2 |
| advanced-yolo-segmentation-confidence | passed | 8/8 exact | runs/segmentation/yolo_segmentation/weights/best.pt | not-applicable | 5 |
| guided-keras-tabular | passed | 8/8 exact | artifacts/neural_network.keras | unavailable | 0 |
| advanced-keras-image | passed | 8/8 exact | artifacts/image.keras | not-applicable | 0 |
| customized-pytorch-sequence-lstm | passed | 8/8 exact | artifacts/sequence.pt | not-applicable | 0 |
| advanced-pytorch-tabular | passed | 8/8 exact | artifacts/tabular.pt | unavailable | 0 |

For every row, `model_mission.json` round-tripped to the resolved production configuration, `requirements.txt` matched the sorted structured dependency ranges, ZIP CRC inspection passed, `src/train.py`, `src/predict.py`, and the project smoke test parsed, and the dependency-free smoke test exited 0.

Runtime meanings:

- `unavailable`: the configuration uses built-in data but one or more declared local Python modules are missing.
- `not-applicable`: execution would require user-supplied data, external weights, or a heavyweight workflow. The audit did not install packages, access the network, or invent data.
- A declared artifact path is not evidence that training created it; runtime creation is reported separately.

## Live student and expert audit

The existing responsive harness started a scoped local Next.js process, connected a real headless Chromium/Edge session, and passed at **320, 360, 390, 768, 900, 1024, and 1440 px**. Its observed assertions cover page containment, control/panel containment, non-intersection, Configure/Code state preservation, hidden advanced-value restoration, explanation containment, Advanced-vs-Customize disclosure, project/Python download interactions, and the absence of computed gradients in Model Mission backgrounds.

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
| neural-network | 10 | 19 | 29 |

The live harness also verifies that a selected advanced neural optimizer and layer initializer survive level changes. YOLO automatic optimization omits a manual learning rate and explains that the framework chooses it; explicit AdamW emits `lr0`; validation and prediction confidence values flow to separate `val` and `predict` calls. Keras projects contain active loading, training, validation, final-test, saving, and inference code. PyTorch projects contain active loaders, training/validation loops, best-checkpoint restoration, final testing, saving, and inference.

Every project archive explains environment setup, data shape/source, training/evaluation, prediction, expected artifacts, warnings, and a dependency-free smoke test.

## Score methodology

| Dimension | Score | Maximum | Method |
| --- | ---: | ---: | --- |
| Static generation and project integrity | 2.0 | 2.0 | All eight must pass AST, ZIP, requirements, config, artifact declaration, and structural smoke checks. |
| Local runtime assurance | 0.5 | 1.5 | Dependency-free smoke coverage earns 0.5; training execution requires locally available declared runtimes. |
| Learning workflow | 1.2 | 1.5 | Nine-step structure and complete metadata are present; no student comprehension study was performed and scaler options lack per-option lessons. |
| Progressive disclosure | 1.5 | 1.5 | Every task must have guided < customize < advanced control counts and preserve state in the live harness. |
| Generated behavior truthfulness | 1.5 | 1.5 | YOLO optimizer/confidence and active Keras/PyTorch training contracts are checked in generation and parity suites. |
| Responsive live-route usability | 1.5 | 1.5 | The scoped live browser harness must pass all required widths and real state-preserving interactions. |
| Scope honesty and handoff | 0.5 | 0.5 | Unavailable runtimes, user-supplied data, and no universal no-code claim are stated explicitly. |

The score measures the evidence available in this audit, not theoretical framework breadth.

## Verified strengths

- Deterministic, parseable project generation with a fixed eight-file archive contract.
- Training-only learned preprocessing and an untouched final-test split in reviewed classical/neural contracts.
- Meaningfully different Guided, Customize, and Advanced disclosure counts for all seven tasks.
- Truthful YOLO automatic-optimizer behavior and distinct validation/prediction confidence controls.
- Active Keras and PyTorch training workflows rather than commented training skeletons.
- Flat responsive layout with viewport containment and real state-preserving interactions.

## Remaining gaps and deferred observations

- Student comprehension after one guided project is not established without a user study.
- Scaler options have shared control-level education, not per-option beginner explanations.
- Local training runtimes were unavailable, so this audit provides no new end-to-end metric or created-artifact evidence.
- Custom CSV time splitting sorts before datetime parsing; non-ISO timestamps can order incorrectly.
- Unknown neural presets currently fall back rather than producing a typed rejection.
- The accessible-explanation source test relies on comment stripping and could miss behavior if comments change shape.
- Install-text test coverage is spacing-sensitive and does not exercise every rendering variation.
- Project-bundle task branching is growing and will become harder to maintain as workflows expand.
- Stored-ZIP tests reject ambiguous names but lack a concrete cross-platform ambiguous-name example matrix.
- No LLM or server-side execution was added. Generated output remains deterministic and local.

## Conclusion

Within its registered workflows, Model Mission is a strong learning-oriented project generator with truthful configuration semantics and a reproducible handoff. Its main evidence gap is runtime breadth on this audit machine, not a failed static or browser contract. The next highest-value improvements are per-scaler explanations, typed unknown-preset rejection, time parsing before chronological sorting, and a small controlled student comprehension study.
