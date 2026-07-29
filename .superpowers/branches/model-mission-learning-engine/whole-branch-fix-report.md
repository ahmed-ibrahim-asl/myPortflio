# Model Mission Whole-Branch Fix Report

Date: 2026-07-29

Branch: `feature/model-mission-learning-engine`

Starting commit: `be7d162cf17e9b8c6ed84a454feb938bcdea7da3`

## Outcome

The whole-branch review findings are fixed within Model Mission scope. The
learning engine now keeps the UI, normalized generation contract, exported
configuration, training artifacts, and starter-project predictors aligned.
Unrelated portfolio migration and Security Mission worktree changes were left
untouched.

## RED-to-GREEN fixes

1. Neural controls now expose non-empty, preset-compatible options. Regression
   class counts normalize to one, known built-in datasets use their real class
   counts, image scaling is fixed to the emitted contract, and PyTorch-only
   device/worker controls are hidden for Keras.
2. Neural generation rejects a two-way split instead of silently reusing
   training data as validation data.
3. Neural results now export the exact normalized, sectioned configuration used
   to generate code. Unknown presets produce a typed architecture error instead
   of falling back to another network.
4. Shape inference uses floor-based valid pooling dimensions, matching emitted
   Keras and PyTorch layers for odd inputs.
5. Preset, framework, data-source, and task changes reset incompatible dependent
   state while preserving only task-independent output preferences.
6. Classical binary decision thresholds now govern evaluation, sample
   prediction, and bundled project inference.
7. Keras and PyTorch training scripts persist fitted transformers, scalers,
   label encoders, class names, input shapes, and image normalization metadata.
   Bundled predictors load that sidecar contract, transform raw inputs, and
   decode outputs consistently.

Executable fake-runtime seams cover thresholded classical prediction and neural
tabular preprocessing/label decoding without installing unavailable heavyweight
frameworks.

## Bounded polish

- Chronological custom-CSV splitting parses timestamps before sorting.
- Controls render supplied `technicalTerm` metadata instead of raw identifiers.
- Browser coverage now verifies live explanation `aria-expanded` /
  `aria-controls` behavior and single-spaced dependency install commands.
- Stored ZIP tests include Windows reserved device names and trailing dot/space
  path segments.
- Audit report project, static-contract, and Task 4 fixture rows are sorted
  deterministically.
- Runtime methodology states that execution coverage and pass rate are
  multiplied. Synthetic tests pin the full runtime score to `1.5` and the
  corresponding overall score to `9.7`.
- Resolved findings were removed from the generated deferred ledger.

## Verification

- `npm run test:ml` — 126/126 passed.
- Focused generator/adapter/state/bundle/generated-code suite — 97/97 passed.
- `python -m unittest tests.tools.test_model_mission_audit_builder` — 15/15
  passed.
- `npm run test:ml:responsive` — 2/2 passed across 320, 360, 390, 768, 900,
  1024, and 1440 px.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed; 16/16 static pages generated.
- Scoped `git diff --check` — passed. Git emitted only the repository's known
  non-failing LF-to-CRLF checkout warnings.

The deterministic audit builder was run twice. Both runs reported 8/8
verification commands and 8/8 representative structural smoke checks passing,
and both generated artifacts retained identical SHA-256 hashes on the second
run.

## Audit result and environment limits

The regenerated evidence-backed score is `8.7/10`. The lower local-runtime
dimension is truthful: this environment does not provide the heavyweight
training dependencies, so no package installation or network access was used.
Static compilation, executable dependency-free seams, project smoke checks, and
the existing eligible runtime evidence remain explicitly distinguished from a
full framework training run.

Generated artifacts:

- `docs/reports/2026-07-29-model-mission-learning-engine-audit.md`
- `docs/reports/2026-07-29-model-mission-learning-engine-evidence.json`

## Re-review extension: preset scaling synchronization

Extension base: `6113e7ec67932fbb5279602e32f054095655bc4b`

A final re-review found that changing the default tabular preset to
`image-cnn` left `project.preparation.scaling` at `standard`. The image UI
offered only `none`, while adapter and generator normalization silently repaired
the mismatch later.

The focused regression was written first and failed because `standard` was not
present in the rendered image scaling options. Reducer synchronization now
checks the selected preset's domain options immediately: compatible scaling
values remain untouched, while an incompatible value changes to the supported
neural default (`none` for image presets).

The regression follows image, sequence, and tabular presets across data-source
and Keras/PyTorch switches. It proves that:

- every controlled neural select value remains present in its rendered options;
- reducer state, adapter `resolvedConfig`, and generator config agree on
  scaling;
- compatible hidden optimizer and weight-decay choices survive;
- project name and artifact-directory preferences survive;
- incompatible scaling is reset without erasing compatible scaling.

Extension verification:

- Focused neural state/adapter/UI-option suite: 62/62 passed.
- `npm run test:ml`: 127/127 passed.
- Audit builder: 15/15 passed.
- Responsive browser suite: 2/2 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; 16/16 static pages generated.
- The audit builder again reported 8/8 verification commands and 8/8 project
  smoke checks. A second regeneration produced identical evidence and report
  SHA-256 hashes.
