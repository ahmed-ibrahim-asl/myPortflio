# AI/ML Project Configurator Expansion Design

Date: 2026-07-27  
Status: Proposed design for user and external-reviewer approval  
Supersedes: The four-template scope in `2026-07-26-ai-script-generator-design.md`  
Product route: `/tools/ai-script-generator/`

## 1. Executive summary

The current AI Script Generator will evolve into a deterministic **AI/ML Project Configurator**. A user will choose a task or a data type, select compatible options, learn what each option changes, and receive one runnable Python `.py` script. The tool will not use an LLM, prompt interpretation, an API key, a remote inference service, or server-side code generation.

The product promise is:

> Help users complete a substantial, useful first implementation of an AI or machine-learning project while they focus on the problem, data, configuration, and tuning instead of remembering framework syntax.

The tool should often provide roughly 60–70 percent of a typical first project implementation: data loading, inspection, cleaning, preprocessing, splitting, model construction, training, evaluation, checkpointing, prediction, and compatible export. This percentage is a product direction, not a guarantee. Real data quality, domain decisions, integration, security, monitoring, and deployment validation remain the user's responsibility.

The information architecture is **task-first by default**, with two alternatives:

1. Start with a task.
2. Start with existing data.
3. Inspect and prepare data without selecting a model.

The existing four generators remain supported:

- YOLO object detection
- YOLO instance segmentation
- Sensor time-series classification
- Edge image classification

The catalog expands through two reviewed knowledge tracks:

- Aurélien Géron's official `handson-ml3` companion repository for Scikit-Learn, TensorFlow, and Keras workflows.
- Daniel Bourke's official `pytorch-deep-learning` repository and online curriculum for PyTorch workflows.

These sources guide coverage and configuration. The website will not reproduce book prose, mirror whole notebooks, or ship large third-party datasets.

## 2. Current implementation context

This design is written against the implementation that exists on 2026-07-27.

### 2.1 Technology

- Next.js 16.2.10 App Router
- React 19.2.7
- TypeScript 6.0
- JavaScript generator core imported by both the client page and Node tests
- Repository-native CSS in `app/game-theme.css`
- `node:test` and `node:assert` for generator tests
- Local Python AST parsing for generated-code syntax checks
- Dependency-free Chrome DevTools Protocol responsive test

No component framework, state library, schema library, syntax highlighter, code editor, or test browser dependency is currently required.

### 2.2 Existing file boundaries

- `lib/tools/ml-templates.js`
  - Owns all four template definitions, fields, defaults, normalization, validation, dependencies, guidance, warnings, and Python generation.
  - Exposes `ML_TEMPLATES` and synchronous lookup/generation helpers.
- `app/tools/ai-script-generator/page.tsx`
  - Owns reducer state, template/mode selection, numeric draft values, validation display, copy state, and layout composition.
- `components/tools/ml-generator/ConfigurationField.tsx`
  - Renders `select`, `number`, `text`, and `toggle` fields.
- `components/tools/ml-generator/GeneratorCodePanel.tsx`
  - Renders validation/warnings, filename, copy action, and the non-wrapping code preview.
- `components/tools/ml-generator/GeneratorInfoTabs.tsx`
  - Renders Dependencies, Dataset, Hardware, Metrics, Deployment, and Notes tabs.
- `tests/tools/ml-generator.test.js`
  - Covers registry behavior, dependent normalization, validation, metadata, output filenames, and Python syntax.
- `tests/tools/ai-generator-responsive.test.js`
  - Uses a real headless browser at widths 390, 768, 900, 1024, and 1440.

### 2.3 Existing behavior to preserve

- Generated artifacts are standard `.py` files.
- The page generates no notebook magic.
- Invalid dependent selections normalize to supported values.
- Blocking validation errors produce no partial Python.
- Warnings do not block generation.
- Raw numeric input remains editable during transient states.
- The code panel owns horizontal scrolling.
- The page creates no horizontal document overflow at tested viewports.
- Keyboard focus, labels, descriptions, and live copy/correction states remain accessible.
- Existing recipe IDs remain stable so bookmarks, tests, and future saved configurations can continue to resolve.

### 2.4 Current limitations

- The catalog is a flat four-option `<select>`.
- The single `ml-templates.js` module will become difficult to maintain with dozens of recipes.
- All Python generator text is imported into the client bundle up front.
- Configuration fields cannot yet be grouped by pipeline stage in metadata.
- Field help is one short paragraph and cannot express recommendation, trade-offs, or source references.
- The field model lacks multi-choice operation lists and structured column/path inputs.
- Data inspection and cleaning are embedded unevenly in individual scripts instead of being shared first-class capabilities.
- The UI cannot browse by task or by data type.
- Source/license attribution is not represented in the catalog.

## 3. Approved product decisions

The following decisions are already approved through the design conversation:

1. Use the **Chapter Navigator + Recipe Library** approach instead of one giant template per chapter or a universal arbitrary pipeline graph.
2. Cover all 19 chapters of the third-edition Hands-On Machine Learning curriculum through recipes, shared capabilities, contextual guidance, or source references.
3. Add all ten completed sections (00–09) of the PyTorch Deep Learning curriculum as a second knowledge track.
4. Keep generation deterministic and selector-based. Do not add an LLM.
5. Keep task-first as the default entry path.
6. Add an "I already have data" entry path.
7. Add a standalone "Inspect and Prepare Data" mode.
8. Make data handling the first stage in model-building recipes.
9. Make advanced configuration available through progressive disclosure.
10. Explain what settings do, when to change them, and their speed/accuracy/memory trade-offs.
11. Continue generating one runnable Python `.py` file.
12. Preserve and expand the responsive behavior instead of replacing the current visual language.

## 4. Goals

### 4.1 Primary goals

- Let a beginner find a viable workflow without knowing a framework API.
- Let an experienced user reach detailed model and runtime settings quickly.
- Generate readable code that can be inspected, changed, and learned from.
- Treat dataset understanding, cleaning, and leakage prevention as mandatory engineering work.
- Cover classical ML, deep learning, computer vision, text, time series, generative models, reinforcement learning, and deployment-oriented workflows.
- Keep the page useful without network access after the website assets load.
- Keep the initial page responsive even when the recipe catalog becomes large.
- Make source coverage and licensing auditable.

### 4.2 Learning goals

Learning is embedded in configuration rather than presented as a copied course:

- Every field has a concise explanation.
- Important fields explain the recommended default.
- Advanced options explain when they are useful.
- Trade-offs identify effects on speed, memory, accuracy, overfitting, or reproducibility.
- Incompatible options explain why they are unavailable.
- Each recipe links to relevant official source material.
- Generated Python uses named functions and a visible configuration block so users can connect UI choices to code.

### 4.3 Quality goals

- Defaults generate syntactically valid Python.
- Representative scripts run against tiny local fixtures without network access.
- Data transforms fit only on training data when leakage is possible.
- Splitting strategies match the data semantics.
- Generated scripts validate inputs before expensive training starts.
- Dependency and runtime guidance is explicit.
- Long option labels, paths, filenames, warnings, and code never break the layout.

## 5. Non-goals

- Copying or summarizing every paragraph of either learning resource.
- Reproducing complete notebooks or exercise solutions in the UI.
- Automatically understanding a natural-language project description.
- Executing model training inside the browser.
- Uploading a user's private dataset to a remote service.
- Mirroring third-party datasets into the website repository.
- Guaranteeing that generated code is production-certified.
- Automatically solving domain-specific labeling, ethics, consent, fairness, or compliance decisions.
- Replacing framework documentation, source courses, or the user's engineering judgment.
- Generating a multi-file repository in the first expansion. The downloadable artifact remains one `.py` file.
- Allowing arbitrary incompatible pipeline blocks to be connected.

## 6. Source and attribution policy

### 6.1 Hands-On Machine Learning

- Curriculum source: `https://github.com/ageron/handson-ml3`
- Repository license: Apache License 2.0
- Publisher page: O'Reilly's third-edition listing
- Use:
  - Chapter coverage map
  - Workflow concepts
  - Model and preprocessing topics
  - Links to official notebooks
- Do not use:
  - Copied book prose
  - Copied diagrams or book trade dress
  - Large notebook dumps
  - Claims that this tool is an official book product

### 6.2 PyTorch Deep Learning

- Curriculum source: `https://github.com/mrdbourke/pytorch-deep-learning`
- Online source: `https://www.learnpytorch.io/`
- Repository license: MIT
- Use:
  - Section coverage map
  - PyTorch workflow structure
  - Custom dataset and DataLoader patterns
  - Modular training, transfer learning, tracking, ViT, and deployment topics
- Do not use:
  - Whole notebook copies
  - Course branding that implies endorsement
  - Binary dataset copies without verifying the dataset's own license

### 6.3 Additional sources

External reviewers may propose official documentation, original papers, and permissively licensed repositories. Every accepted source record must include:

- Stable source ID
- Title and owner/author
- Direct canonical URL
- Source type
- License or usage status
- Framework/library version or publication date when relevant
- Topics supported
- Date last verified

Third-party tutorials may inspire research but must not be the only authority for version-sensitive code. Framework behavior must be checked against current official documentation during implementation.

### 6.4 Generated attribution

The UI's Resources tab lists the relevant sources. Generated scripts may include concise comments such as:

```python
# Workflow references:
# - https://github.com/ageron/handson-ml3
# - https://www.learnpytorch.io/04_pytorch_custom_datasets/
```

The script must not claim that its original generated code was written by those authors.

## 7. Information architecture

The product remains one route and one live workspace. It does not become a collection of separate chapter pages.

### 7.1 Entry paths

The first control is a segmented selector:

- **Choose a task** (default)
- **Start from data**
- **Prepare data only**

The selection changes the order of discovery controls, not the final recipe format.

### 7.2 Task-first path

1. Domain
2. Task
3. Data type
4. Framework
5. Recipe
6. Configuration
7. Review and code

Example:

`Computer Vision → Image Classification → Image folders → PyTorch → Transfer Learning`

### 7.3 Data-first path

1. Data type
2. Dataset format
3. Compatible tasks
4. Framework
5. Recipe
6. Configuration
7. Review and code

Example:

`Tabular → CSV → Multiclass Classification → Scikit-Learn → Model Comparison`

### 7.4 Prepare-data-only path

1. Data type
2. Dataset format
3. Inspection preset
4. Cleaning and transformation operations
5. Output options
6. Review and code

This path generates a runnable inspection/preparation script without model training.

### 7.5 Discovery controls

The current flat Script Template selector becomes a compatible series of deterministic selectors:

- Entry path
- Domain or data type
- Task
- Framework
- Recipe

Each selector only shows compatible next choices. Changing an upstream choice resets or normalizes unsupported downstream values. No empty invalid selection should survive when a supported default exists.

An optional keyword filter can search catalog metadata such as "classification", "PCA", "YOLO", or "forecasting". It performs a local text match and is not a prompt.

## 8. Domain and task taxonomy

Stable IDs are required because recipes, tests, saved configurations, and external proposals will reference them.

| Domain ID | Domain | Initial task families |
| --- | --- | --- |
| `data-preparation` | Data Preparation | inspect, clean, transform, split, export-clean-data |
| `tabular-ml` | Tabular ML | regression, binary classification, multiclass classification, multilabel classification |
| `classical-ml` | Classical ML | linear models, SVM, trees, ensembles, dimensionality reduction |
| `unsupervised-ml` | Unsupervised ML | clustering, anomaly detection, density estimation, semi-supervised learning |
| `computer-vision` | Computer Vision | image classification, object detection, segmentation, transfer learning, vision transformers |
| `time-series` | Time Series | forecasting, sequence classification, anomaly detection, window preparation |
| `nlp` | Text and NLP | text classification, sequence modeling, translation, attention, transformers |
| `audio` | Audio ML | classification, feature extraction, preparation |
| `generative-ai` | Generative Models | autoencoders, variational autoencoders, GANs, diffusion |
| `reinforcement-learning` | Reinforcement Learning | policy learning, value learning, environment evaluation |
| `deployment` | Export and Deployment | model export, inference app, experiment tracking, distributed/runtime preparation |
| `sensor-ai` | Sensor AI / Robotics | sensor classification, sensor anomaly detection, edge inference |

The taxonomy is a product index, not a claim that every framework supports every task.

## 9. Curriculum coverage model

"All knowledge" means every curriculum unit is represented by at least one of:

- A runnable recipe
- A shared data/model/training capability used across recipes
- A configuration explanation
- A metric or evaluation option
- A resource link and coverage record

It does not mean reproducing all educational text.

### 9.1 Hands-On Machine Learning coverage

| Chapter | Coverage in the configurator |
| --- | --- |
| 1. Machine Learning Landscape | Problem-framing guidance, task taxonomy, baseline and validation choices |
| 2. End-to-End ML Project | End-to-end tabular regression and reusable data pipeline |
| 3. Classification | Binary, multiclass, multilabel, metrics, thresholds, confusion analysis |
| 4. Training Models | Linear, polynomial, logistic, softmax, regularization, learning curves |
| 5. Support Vector Machines | SVM classification and regression recipes |
| 6. Decision Trees | Tree classification/regression and complexity controls |
| 7. Ensembles and Random Forests | Voting, bagging, random forest, extra trees, boosting, stacking |
| 8. Dimensionality Reduction | PCA variants, random projection, and LLE |
| 9. Unsupervised Learning | K-means, DBSCAN, Gaussian mixtures, anomaly detection, semi-supervised options |
| 10. Neural Networks with Keras | Keras MLP classification/regression and callbacks |
| 11. Training Deep Neural Networks | Initialization, activations, normalization, optimizers, scheduling, regularization, transfer learning |
| 12. Custom Models and Training with TensorFlow | Custom layer/model and custom training-loop recipe |
| 13. Loading and Preprocessing Data | `tf.data`, preprocessing layers, structured data loading |
| 14. Deep Computer Vision with CNNs | CNN and transfer-learning image recipes, architecture choices |
| 15. Sequences with RNNs and CNNs | Forecasting and sequence-classification recipes |
| 16. NLP with RNNs and Attention | Text preparation, sequence model, translation, attention, transformer recipes |
| 17. Autoencoders, GANs, Diffusion | Autoencoder/VAE, GAN, and diffusion recipes |
| 18. Reinforcement Learning | Policy-gradient and value-based starter recipes with Gymnasium-compatible configuration |
| 19. Training and Deploying at Scale | Distribution strategy, tracking, serving/export, inference client, deployment guidance |

### 9.2 PyTorch Deep Learning coverage

| Section | Coverage in the configurator |
| --- | --- |
| 00. Fundamentals | Device selection, seeds, tensor shape/dtype explanations, reproducibility |
| 01. Workflow | Shared PyTorch train/evaluate/predict structure and regression starter |
| 02. Classification | Binary and multiclass neural classification recipes |
| 03. Computer Vision | Baseline image-classification recipe |
| 04. Custom Datasets | ImageFolder/custom Dataset choices, transforms, augmentation, DataLoader settings |
| 05. Going Modular | Generated script organization into clear functions/classes inside one `.py` file |
| 06. Transfer Learning | Torchvision pretrained-backbone recipe and fine-tuning controls |
| 07. Experiment Tracking | TensorBoard-compatible run naming, logging, and comparison settings |
| 08. Paper Replicating | Vision Transformer recipe with patch/encoder configuration and paper reference |
| 09. Model Deployment | Inference script/app configuration, preprocessing parity, model size/latency reporting |

### 9.3 Existing applied recipes

Existing YOLO, sensor, and edge recipes stay visible under Applied AI and their normal domains. Their implementations migrate to the new engine without changing their stable IDs.

## 10. Recipe model

The catalog separates lightweight discovery metadata from heavy Python generation code.

A recipe manifest contains:

```js
{
  id,
  title,
  shortDescription,
  domainId,
  taskId,
  supportedDataProfileIds,
  frameworkId,
  difficulty,
  tags,
  sourceRefs,
  pipelineStages,
  sectionIds,
  presetIds,
  generatorModuleId,
}
```

A loaded recipe definition adds:

```js
{
  fields,
  defaults,
  normalize,
  validate,
  generate,
  dependencies,
  metrics,
  artifacts,
  hardware,
  deployment,
  notes,
  getWarnings,
  getReadiness,
}
```

### 10.1 Stable recipe rules

- IDs use lowercase kebab-case.
- Existing IDs do not change.
- Each recipe supports at least one valid default configuration.
- Every field ID is unique inside its recipe.
- Each recipe declares compatible data profiles and framework.
- Each recipe declares source references.
- Every generated filename ends in `.py`.
- Each generated script ends with exactly one newline.
- Blocking errors return empty code.

### 10.2 Shared pipeline stages

Recipes compose controlled stages rather than arbitrary graph nodes:

1. Configuration and seed setup
2. Input validation
3. Data loading
4. Data inspection
5. Cleaning
6. Preprocessing/augmentation
7. Splitting/sampling
8. Loader/batch construction
9. Model construction
10. Training or fitting
11. Evaluation
12. Prediction example
13. Persistence/export
14. Artifact summary

A recipe can omit irrelevant stages but cannot reorder stages in a way that introduces leakage or framework incompatibility.

## 11. Configuration model

### 11.1 Configuration sections

Fields are grouped by stable section IDs:

- `essential`
- `data-source`
- `data-inspection`
- `data-cleaning`
- `preprocessing`
- `data-splitting`
- `model`
- `training`
- `hyperparameter-tuning`
- `evaluation`
- `runtime-performance`
- `tracking-checkpoints`
- `prediction`
- `export-deployment`

The UI renders only sections relevant to the selected recipe.

### 11.2 Starter and Production-oriented modes

The existing mode selector remains:

- **Starter**
  - Shows the smallest useful set of controls.
  - Still generates a complete, readable script.
  - Uses recommended defaults for hidden advanced values.
- **Production-oriented**
  - Shows all relevant controls in organized accordions.
  - Adds reproducibility, tuning, performance, artifact, and export choices.
  - Does not claim production certification.

Shared values survive mode changes. Hidden values are normalized to safe defaults and cannot create invisible invalid state.

### 11.3 Presets

Presets accelerate configuration without hiding the underlying settings:

- Recommended / Balanced
- Fast prototype
- Best quality
- Low memory
- CPU-friendly
- Edge deployment, where compatible
- Full data audit
- Clean and prepare

Applying a preset changes visible field values and announces what changed. Users can modify any preset afterward. The current configuration becomes Custom when it no longer exactly matches a preset.

### 11.4 Field schema

The field model expands to:

```js
{
  id,
  sectionId,
  label,
  inputType,
  modes,
  defaultValue,
  required,
  help: {
    summary,
    recommendedReason,
    whenToChange,
    tradeoffs,
    learnMoreSourceRefs,
  },
  options,
  getOptions,
  visibleWhen,
  disabledWhen,
  min,
  max,
  step,
  placeholder,
  validate,
}
```

Supported input types become:

- `select`
- `number`
- `text`
- `toggle`
- `multi-select`
- `checklist`
- `string-list`
- `path`

Specialized visual controls may wrap these types, but their stored values remain plain serializable data.

### 11.5 Option descriptions

Native select menus cannot display rich descriptions consistently. The selected option therefore has an adjacent explanation panel containing:

- What this choice changes
- Recommended use
- Trade-offs
- Hardware implications
- Compatibility notes

Disabled options either remain visible with a reason or are filtered when showing them would add noise. The behavior is declared by field metadata.

## 12. Data Toolbox

Data handling is both:

1. Embedded at the beginning of every training recipe.
2. Available as a standalone Inspect and Prepare Data generator.

The UI does not need to upload or inspect the user's real file in the first expansion. Instead, the user's selections generate Python that performs the inspection and preparation locally when run. This keeps data private and avoids browser memory limits.

### 12.1 Data workflow

Every compatible recipe follows:

`Load → Validate → Inspect → Clean → Transform → Split → Build loaders → Model`

### 12.2 Operation behavior

Data operations are represented by stable IDs and reusable code fragments. Example tabular operations:

- `tabular.preview.head`
- `tabular.preview.tail`
- `tabular.profile.shape`
- `tabular.profile.schema`
- `tabular.profile.statistics`
- `tabular.quality.missing`
- `tabular.quality.duplicates`
- `tabular.quality.unique-values`
- `tabular.quality.target-distribution`
- `tabular.visualize.distributions`
- `tabular.visualize.correlation`
- `tabular.clean.drop-duplicates`
- `tabular.clean.impute-numeric`
- `tabular.clean.impute-categorical`
- `tabular.clean.outliers`
- `tabular.transform.encode-categorical`
- `tabular.transform.scale-numeric`
- `tabular.split`

Operation IDs allow recipes and external reviewers to reuse proposals without duplicating implementation.

### 12.3 Tabular data profile

Supported input formats:

- CSV
- TSV
- Excel
- Parquet
- JSON records

Configuration includes:

- Path and optional encoding/delimiter
- Target column
- Feature/include columns
- Ignore columns
- Identifier/group/time columns
- Header and row preview counts
- Dtype overrides
- Missing-value strategy by numeric/categorical type
- Duplicate strategy
- Outlier method and action
- Rare-category threshold
- Numeric scaling
- Categorical encoding
- Feature selection
- Random/stratified/group/time split
- Validation/test fractions
- Random seed

Generated inspection can print and optionally save:

- Head/tail
- Shape and column list
- Dtypes and memory use
- Descriptive statistics
- Missing-value counts and percentages
- Duplicate count
- Target/class distribution
- Numeric distributions
- Correlation matrix
- Data-readiness JSON report

### 12.4 Image data profile

Supported formats:

- Class folders
- Image path plus label table
- Built-in framework dataset
- Downloadable sample dataset with verified source

Configuration includes:

- Root/train/validation/test paths
- Allowed extensions
- Color mode
- Target size
- Aspect-ratio behavior
- Normalization policy
- Corrupt-image action
- Duplicate detection level
- Class imbalance strategy
- Augmentation operations and strengths
- Split strategy
- Batch/worker/cache/prefetch settings

Inspection includes:

- Directory tree
- Image and class counts
- Per-class distribution
- Random sample grid
- Width/height/channel statistics
- Corrupt/unreadable file report
- Duplicate filename or optional content-hash report

### 12.5 Detection and segmentation profile

Supported formats:

- YOLO detection
- YOLO polygon segmentation
- COCO JSON in recipes that explicitly support conversion

Inspection and validation include:

- Missing image/label pairs
- Invalid class IDs
- Invalid normalized coordinates
- Empty annotations
- Box/polygon counts
- Class balance
- Box size/aspect statistics
- Sample visualization with overlays
- Train/validation/test path validation

### 12.6 Text data profile

Supported formats:

- CSV/JSON with text and label columns
- Plain-text folders
- Built-in/downloadable sample datasets with verified sources

Configuration includes:

- Text and label columns
- Null/empty handling
- Duplicate handling
- Optional HTML, URL, whitespace, and casing normalization
- Tokenization strategy
- Vocabulary/sequence length
- Truncation and padding
- Class balance
- Random/stratified split

Inspection includes samples, lengths, label distribution, nulls, duplicates, and vocabulary statistics.

### 12.7 Time-series and sensor profile

Configuration includes:

- Timestamp column
- Target and feature columns
- Entity/group column
- Expected frequency
- Sorting and duplicate-timestamp policy
- Missing interval detection
- Resampling and interpolation
- Outlier policy
- Window length and stride
- Forecast horizon
- Chronological/group split
- Normalization fitted on training data only

Inspection includes time range, frequency, gaps, missing values, plots, and per-entity counts.

### 12.8 Audio profile

Configuration includes:

- File/label structure
- Sample rate
- Mono/stereo handling
- Duration policy
- Trim/pad behavior
- Normalization
- Waveform or spectrogram features
- FFT/window/hop parameters
- Augmentation
- Batch/worker settings

Inspection includes file counts, class distribution, duration/sample-rate statistics, corrupt files, sample waveform, and sample spectrogram.

### 12.9 Video profile

Configuration includes:

- File/label structure
- FPS sampling
- Frame count or clip duration
- Resize/crop
- Frame/clip stride
- Audio inclusion where supported
- Corrupt-file handling

Inspection includes duration, FPS, resolution, codec metadata when available, class distribution, and sampled frames.

### 12.10 Leakage prevention

The generator must:

- Split before fitting learned preprocessing.
- Fit imputers, encoders, scalers, tokenizers, and learned transforms on training data only.
- Use chronological splits for time-dependent recipes by default.
- Use grouped splits when entity/group IDs are configured.
- Warn when identifiers or target-derived columns appear among features.
- Avoid using validation/test data for augmentation statistics or quantization calibration unless the recipe explicitly requires a separate representative set.

### 12.11 Data artifacts

Generated scripts may create:

- `data_report.json`
- Data quality plots
- Cleaned data file when enabled
- Fitted Scikit-Learn preprocessing pipeline
- Label/class mapping
- Normalization statistics
- Dataset manifest

These are runtime outputs of the Python script, not files bundled by the website.

## 13. Generated Python contract

### 13.1 Output format

- One `.py` file
- No notebook cells or shell magic
- A visible serializable `CONFIG` block near the top
- Functions with task-appropriate names
- `main()` and `if __name__ == "__main__":`
- Exactly one trailing newline

### 13.2 Typical generated structure

```python
CONFIG = {...}

def validate_configuration(): ...
def load_data(): ...
def inspect_data(): ...
def clean_data(): ...
def prepare_data(): ...
def split_data(): ...
def build_loaders(): ...
def build_model(): ...
def train_or_fit(): ...
def evaluate(): ...
def predict_example(): ...
def export_artifacts(): ...
def main(): ...
```

Functions are omitted when irrelevant. The generated code should remain understandable rather than forcing every task through meaningless placeholders.

### 13.3 Script behaviors

Where compatible, generated scripts support:

- Useful path/schema errors
- Reproducible seeds
- Automatic CPU/GPU/MPS device resolution
- Configuration summary
- Data-readiness summary before training
- Early stopping and checkpointing
- Metrics appropriate to task and class balance
- One inference example
- Artifact paths and sizes
- Optional `--inspect-only` execution
- Optional `--check-config` execution

The exact CLI flags may vary only when a framework makes a common flag impossible. Shared flags should be standardized.

### 13.4 Dependencies and commands

The UI displays:

- Required packages and supported version ranges
- Suggested installation command
- Run command
- Expected dataset contract
- Expected artifacts

The downloaded artifact remains the `.py` script. Installation commands are comments or UI guidance, never notebook magic.

## 14. Generation architecture and loading performance

Adding dozens of large Python template strings to the current client import would make initial loading slower. The expanded architecture separates the lightweight catalog from lazily loaded recipe modules.

### 14.1 Proposed module layout

```text
lib/tools/ml-generator/
  catalog.js
  sources.js
  taxonomy.js
  engine.js
  load-recipe.js
  schema.js
  validation.js
  python/
    literals.js
    formatting.js
    shared-fragments.js
  data/
    catalog.js
    tabular.js
    images.js
    detection.js
    text.js
    time-series.js
    audio.js
    video.js
  recipes/
    applied/
    classical/
    computer-vision/
    data-preparation/
    deep-learning/
    generative/
    nlp/
    reinforcement-learning/
    time-series/
    deployment/
```

`lib/tools/ml-templates.js` remains as a compatibility entry point during migration and re-exports the stable public API.

### 14.2 Lazy recipe loading

`catalog.js` contains no full generated Python templates. `load-recipe.js` uses a statically declared map of dynamic imports:

```js
const RECIPE_LOADERS = {
  "yolo-detection-training": () =>
    import("./recipes/applied/yolo-detection-training.js"),
  // ...
};
```

The page can render discovery controls from lightweight metadata immediately. It loads generation logic only for the selected recipe.

The UI must show a stable code-panel loading state rather than blank content. The default recipe may be prefetched after the initial shell renders.

### 14.3 Shared fragments

Data operations, validation helpers, seed/device helpers, metrics, and artifact summaries are reusable generators. Recipe modules compose only supported fragments. This prevents fifty recipes from containing fifty slightly different implementations of missing-value handling or DataLoader setup.

### 14.4 Asynchronous result flow

The current synchronous `useMemo(buildMlGeneratorResult(...))` changes to a hook that:

1. Loads the selected recipe module.
2. Normalizes the current configuration.
3. Validates it.
4. Generates a result.
5. Ignores stale results if the selection changes during loading.
6. Exposes `idle`, `loading`, `ready`, and `error` states.

Catalog selection itself remains synchronous and responsive.

### 14.5 Compatibility strategy

- Preserve current helper behavior for existing code/tests while migration is incomplete.
- Add asynchronous helpers rather than breaking every caller at once.
- Migrate the four existing recipes first.
- Remove the monolithic internal definitions only after parity tests pass.

## 15. UI design

### 15.1 Desktop workspace

The existing control-room layout remains recognizable:

- Left: discovery and configuration panel
- Right: generated Python and guidance

The left panel order is:

1. Entry path
2. Domain/task/data/framework/recipe selectors
3. Mode and preset
4. Configuration sections
5. Validation summary

The right panel order is:

1. Filename, Copy, and Download actions
2. Loading/error/warning state
3. Code preview
4. Pipeline readiness
5. Guidance tabs

### 15.2 Configuration sections

Sections render as accessible disclosure panels. Each summary shows:

- Section name
- Configured/required count
- Error count
- Warning count

Essential configuration opens by default. Data Source and relevant data inspection sections also open for a newly selected recipe. Advanced sections remain collapsed until needed.

"Expand all" and "Collapse all" are available in Production-oriented mode.

### 15.3 Data Toolbox UI

Data operations use:

- Preset selector
- Recommended operation checklist
- Per-operation explanation
- Operation-specific fields shown only when selected

Example:

- Enable **Show first rows**
- Choose `5`, `10`, `20`, or a custom row count
- Explanation: previews column values without changing the dataset
- Generated impact: adds `df.head(row_count)` to `inspect_data()`

### 15.4 Learning UI

Each field keeps its short help text. A **Why?** disclosure shows:

- Recommended reason
- When to change
- Trade-offs
- Resource links

The interface should not display long textbook passages. Explanations are original and action-oriented.

### 15.5 Code review state

Before copy/download, a compact review summary shows:

- Task and framework
- Data source/format
- Enabled data operations
- Model
- Training profile
- Runtime
- Export
- Blocking issues and warnings

Users are not forced through a separate confirmation screen. The live code remains visible and updates when valid.

### 15.6 Guidance tabs

The existing tabs expand to:

- Setup
- Data contract
- Data operations
- Metrics
- Hardware
- Artifacts
- Deployment
- Resources
- Notes

The tab list continues to scroll internally on small screens and supports arrow-key navigation.

## 16. Responsive and accessible behavior

### 16.1 Breakpoints

Preserve the existing tested behavior:

- Above 960px: two-column configuration/output workspace
- At or below 960px: one-column workspace
- At or below 720px: compact section and readiness layout
- At or below 520px: stacked actions and full-width buttons

Add a 320px minimum-width regression case because the catalog and operation names are longer than the current four-template UI.

### 16.2 Mobile navigation

On narrow screens, a workspace switcher offers:

- Configure
- Code and guidance

Both panels remain in the document and accessible. The active workspace is a presentation choice, not a destructive state change. Validation errors can move focus back to the relevant field when the user requests code.

### 16.3 Containment rules

- All grid and flex children use `min-width: 0`.
- Controls use `width: 100%`, `min-width: 0`, and `max-width: 100%`.
- Long filenames use ellipsis.
- Code retains `white-space: pre` and owns horizontal scrolling.
- Tab lists own their horizontal scrolling.
- Rich help text wraps.
- No `100vw` is used inside padded containers.
- Primary controls are not absolutely positioned.
- Page-level overflow is fixed at the source rather than hidden.

### 16.4 Accessibility

- All controls have visible labels.
- Help and errors are connected through `aria-describedby`.
- Invalid controls use `aria-invalid`.
- Disclosure panels use native `details/summary` or equivalent correct ARIA.
- Touch targets remain at least 44 pixels.
- Keyboard focus remains visible.
- Copy, download, preset, normalization, and loading messages use polite live regions.
- Error summaries link/focus the exact field.
- Color is never the only error/warning indicator.
- Reduced-motion preferences are respected.

## 17. Validation and conflict handling

### 17.1 Validation levels

- **Blocking error**
  - Required path missing
  - Invalid numeric range
  - Incompatible split fractions
  - Unsupported recipe/framework combination
  - Target included as an input feature
  - No selected data operations in data-only mode
  - No compatible model/export/device choice
  - Invalid annotation format
- **Warning**
  - Large model on CPU/edge device
  - Very small dataset
  - Severe class imbalance without mitigation
  - Potentially expensive data audit
  - High worker count on Windows
  - Placeholder paths
  - Data-cleaning choice that may remove many rows
- **Information**
  - Preset changed values
  - Hidden value normalized
  - Default chosen for compatibility

### 17.2 Conflict resolution

Normalization order:

1. Recipe/mode defaults
2. Selected preset
3. User configuration
4. Recipe invariants
5. Compatible option resolution
6. Safe coercion
7. Hidden-field reset
8. Validation

The UI explains automatic corrections. It never silently leaves an unsupported disabled option selected.

### 17.3 Data-specific validation

Generated scripts validate runtime data because the browser has not inspected the file:

- Required columns
- Target/features overlap
- Label cardinality
- Empty data
- Missing values after selected cleaning
- Image/annotation pairs
- Class folder presence
- Timestamp ordering
- Window/horizon feasibility
- Audio/image readability
- Train/validation/test non-emptiness

## 18. Privacy, security, and reliability

- Generation runs locally in the browser.
- No API key or user dataset is sent to a model service.
- The first expansion does not upload data.
- Remote sample-dataset downloads occur only when the generated script runs and the user selected that source.
- Download helpers use explicit trusted URLs, timeouts, status checks, safe target paths, and archive extraction guards.
- Generated code avoids executing configuration strings.
- Paths are represented as data, not interpolated into shell commands.
- Dependencies are displayed before execution.
- Dataset licenses are tracked separately from repository code licenses.
- Scripts preserve original data by default and write cleaned outputs to new paths.
- Potentially destructive overwrite options default off and require explicit configuration.

## 19. Testing strategy

### 19.1 Catalog tests

- Unique domain, task, data-profile, source, recipe, section, field, preset, and operation IDs
- Every referenced ID resolves
- Every recipe has a valid manifest
- Every recipe has at least one source reference
- Every curriculum unit has a coverage record
- Existing recipe IDs still resolve

### 19.2 Configuration tests

- Starter and Production-oriented defaults validate
- Presets normalize to valid configurations
- Dependent options remain compatible
- Hidden fields cannot create errors
- Mode changes preserve shared values
- Data operations show only supported fields
- Split strategies match data types
- Leakage-prevention invariants hold

### 19.3 Generation tests

- Every default script is non-empty and ends with exactly one newline
- Every filename ends in `.py`
- No notebook magic, TODO markers, or placeholder ellipses
- Python AST parsing succeeds for every default and preset
- Selected values appear in generated configuration
- Required functions/stages appear for each recipe family
- Disabled operations do not appear in generated code
- Source URLs and attribution metadata are valid

### 19.4 Runtime smoke tests

Use tiny local fixtures and fast settings:

- Tabular CSV with missing/categorical values
- Image-folder fixture with two tiny classes
- YOLO annotation fixture
- Text CSV fixture
- Time-series CSV fixture
- Small generated audio fixture where dependencies are available

Smoke tests prioritize:

- `--check-config`
- `--inspect-only`
- One-epoch or fit-only execution for representative recipe families
- Expected report/artifact creation

Heavy optional frameworks can be separated into environment-aware tests. A missing optional framework must skip with a clear reason rather than produce a false pass.

### 19.5 UI behavior tests

- Task-first default
- Data-first compatibility filtering
- Prepare-data-only path
- Recipe loading and stale-result cancellation
- Preset application
- Operation selection and dependent fields
- Loading, empty, error, and ready code states
- Copy and download
- Field-level and summary error focus
- Keyboard tab/disclosure navigation

### 19.6 Responsive tests

Required widths:

- 320
- 390
- 768
- 900
- 1024
- 1440

For each:

- No document-level horizontal overflow
- All visible controls remain inside their panel
- Code owns horizontal scrolling
- Long task/recipe/operation labels wrap or truncate safely
- Mobile workspace switcher remains usable
- Tab list owns overflow
- Disclosure summaries remain readable

### 19.7 Build and regression tests

- Existing battery, PID, sensor, and generator tests continue to run
- Production build succeeds
- Pre-existing unrelated failures are reported separately
- The local route renders real content instead of an indefinite loading state

## 20. Performance strategy

- Initial client bundle includes taxonomy, catalog summaries, and UI only.
- Heavy recipe generators load on demand.
- Source learning material is linked, not embedded.
- No notebooks or datasets are imported into the website bundle.
- Default recipe is prefetched after the shell becomes interactive.
- Generated output is memoized by recipe/mode/config identity.
- Stale asynchronous results are discarded.
- Large code preview rendering is isolated from unrelated selector changes.
- Catalog filters use precomputed normalized keywords.
- Performance verification records route build output and browser load behavior before and after expansion.

## 21. Rollout strategy

The full vision is delivered in reviewable waves so the route remains functional throughout.

### Wave 0: Scalable engine and parity migration

- Add taxonomy, sources, catalog, schema, async loader, and shared engine.
- Migrate the existing four recipes without output regressions.
- Add section metadata and richer help.
- Keep the existing route working during migration.

### Wave 1: Data Toolbox foundation

- Add shared data-operation registry.
- Add tabular, image, detection, text, time-series, and audio data profiles.
- Add standalone Inspect and Prepare Data recipes.
- Add data report and leakage-prevention foundations.

### Wave 2: Classical ML and end-to-end tabular recipes

- Regression and classification
- Linear/logistic/polynomial models
- SVM
- Trees and ensembles
- Dimensionality reduction
- Clustering and anomaly detection
- Model comparison and tuning

### Wave 3: PyTorch and computer vision

- PyTorch regression/classification workflow
- Image classification
- Custom datasets
- Transfer learning
- Experiment tracking
- Vision Transformer
- Deployment/inference
- Existing YOLO and edge recipes integrated with shared data tools

### Wave 4: TensorFlow/Keras deep learning

- MLP classification/regression
- Deep-training controls
- Custom training loops
- `tf.data`
- CNN/transfer learning
- Sequence/time-series recipes

### Wave 5: NLP, generative, reinforcement learning, and scale

- Text preparation/classification
- Sequence-to-sequence and attention
- Transformer workflow
- Autoencoder/VAE
- GAN
- Diffusion
- Reinforcement learning
- Deployment and distributed-training guidance

### Wave 6: Coverage audit and product polish

- Verify every curriculum unit has coverage
- Resolve source/version gaps
- Expand runtime smoke fixtures
- Accessibility and responsive audit
- Performance audit
- Documentation and external-review closure

Each wave must leave all previously completed tests passing.

## 22. Acceptance criteria

### Product

- Task-first is the default entry path.
- Data-first and Prepare-data-only paths work.
- No LLM, API key, or prompt processing is required.
- The user can reach a recipe through deterministic compatible choices.
- Starter mode is approachable.
- Production-oriented mode exposes detailed configuration.
- Every meaningful setting has explanation and trade-off guidance.

### Data

- Every training recipe begins with a data contract.
- Compatible inspection, cleaning, preprocessing, and split controls are available.
- The user can generate a standalone data preparation script.
- Tabular users can enable head/tail/schema/statistics/missing/duplicate/target/correlation operations.
- Image, detection, text, time-series, audio, and video profiles expose domain-appropriate operations.
- Learned preprocessing fits on training data only.
- Generated scripts produce a data-readiness report where supported.

### Code

- Output is one runnable `.py` file.
- Defaults and presets parse as Python.
- Blocking errors generate no partial code.
- Scripts include validation, data stages, evaluation, prediction, and persistence where relevant.
- Existing four recipe IDs remain functional.

### Coverage

- All 19 Hands-On ML chapters have explicit coverage records.
- PyTorch curriculum sections 00–09 have explicit coverage records.
- Sources and licenses are visible and auditable.
- No copyrighted book prose or whole notebooks are bundled.

### UI and quality

- The initial shell does not wait for all recipe modules.
- The selected recipe module loads with a visible stable state.
- The page has no horizontal overflow at 320–1440px required widths.
- Controls remain keyboard accessible with visible focus.
- Existing engineering tools keep working.
- Unit, syntax, smoke, responsive, and production-build checks pass, except separately documented unrelated pre-existing failures.

## 23. External reviewer packet

This section is intended to let the user share the design with other LLMs or human reviewers without losing project context.

### 23.1 Reviewer objective

Review the proposed deterministic AI/ML Project Configurator. Identify missing tasks, configuration options, data operations, framework compatibility issues, licensing risks, UI complexity, testing gaps, or current official resources that would improve the tool.

Do not redesign it as an LLM prompt product. Do not propose copying books or complete notebooks.

### 23.2 Facts reviewers should preserve

- Existing Next.js/React route and control-room UI
- One generated `.py` file
- No LLM or API required
- Task-first default
- Data-first and standalone data-preparation alternatives
- Data handling before modeling
- Starter and Production-oriented modes
- Existing four recipes and IDs
- Lazy-loaded recipe generation to protect load time
- Responsive and accessible behavior

### 23.3 Requested review areas

1. Curriculum and task coverage
2. Data inspection/cleaning operations by data type
3. Model/framework configuration options
4. Recommended safe defaults and trade-offs
5. Official resources and licenses
6. Generated-script structure and runtime risks
7. UI information overload and progressive disclosure
8. Testing fixtures and acceptance criteria
9. Performance and bundle-size risks
10. Missing edge, robotics, or deployment needs

### 23.4 Required format for a proposed recipe

```text
Recipe title:
Domain/task:
Framework:
User problem solved:
Supported data types/formats:
Essential fields:
Advanced fields:
Expert/production fields:
Data inspection operations:
Cleaning/preprocessing operations:
Recommended defaults and why:
Metrics:
Artifacts/exports:
Generated Python stages:
Validation and warnings:
Official sources:
License/status:
Framework versions/date verified:
Tests and tiny fixture:
Risks or unresolved questions:
```

### 23.5 Required format for a proposed data operation

```text
Operation ID:
Data profile:
User-facing label:
What it does:
When to use it:
Configuration fields:
Generated-code outline:
Output/report:
Leakage or data-loss risks:
Official sources:
Tests:
```

### 23.6 Evidence rules for reviewers

- Prefer official framework documentation, official repositories, original papers, and dataset owner pages.
- Provide direct links, license/status, and verification date.
- Distinguish facts from recommendations.
- Do not paste long copyrighted passages.
- Do not paste entire notebook implementations.
- Small original pseudocode or short code examples are acceptable when they clarify a proposal.
- Flag uncertain or version-sensitive claims explicitly.

## 24. Design review checklist

Reviewers should answer:

1. Does the task-first/data-first/data-only flow match how users approach ML work?
2. Does the Data Toolbox cover the operations needed before modeling?
3. Are any curriculum areas incorrectly mapped or missing?
4. Are any recipe families too broad to remain understandable?
5. Are configuration levels and presets sufficient without hiding important controls?
6. Will lazy-loaded recipe modules keep the initial page fast?
7. Does one `.py` file remain practical for the proposed recipes?
8. Are source, license, and dataset rules strong enough?
9. Are responsive and accessibility requirements testable?
10. What should change before an implementation plan is written?

## 25. Decision required

Approve this design as written, or return requested changes using the review checklist or reviewer formats above.

After approval, the next artifact will be a detailed implementation plan containing:

- Exact file changes
- Migration sequence
- Test-first steps
- Recipe/data-profile delivery waves
- Commands and expected results
- Review checkpoints
- Source-verification work
- Commit boundaries
- Parallelizable research packages for external reviewers
