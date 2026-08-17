# AI Script Generator Learning Workbench Design

**Date:** 2026-07-27  
**Status:** Approved product direction; implementation pending specification review  
**Product:** Portfolio AI Script Generator  
**Primary output:** Runnable Python scripts  

## 1. Purpose

The AI Script Generator should let a learner or practitioner build a machine-learning workflow by choosing concepts and configurations instead of recalling library syntax. The tool does not use an LLM to invent code. It uses a deterministic configuration model, compatibility rules, and original code templates.

The intended outcome is not “one click and learn nothing.” The user should understand:

- what problem they are solving;
- what their data looks like;
- why a split strategy is safe or unsafe;
- what each preprocessing operation changes;
- why a model fits the problem;
- how training settings affect results;
- which metrics answer the real question;
- how every selected option appears in the generated script.

The product should make 60–70% of a normal learning or prototype workflow configurable while keeping the final Python code readable and editable. Reaching 90% no-code coverage is a later product ambition, not a first-release promise.

## 2. Product principles

### 2.1 Task first

The first meaningful choice is the machine-learning task:

- classification;
- regression;
- clustering;
- anomaly detection;
- time-series forecasting;
- object detection;
- segmentation;
- sequence classification;
- image classification;
- text classification;
- question answering;
- audio classification;
- recommendation.

The interface must use standard machine-learning terminology. Domain examples such as embedded monitoring, predictive maintenance, and edge inference can appear as use cases, but they must not define the taxonomy.

### 2.2 One memorable workflow

Every task follows the same sequence:

> Task → Data → Understand → Split → Prepare → Model → Train → Evaluate → Generate

The sequence is visible throughout the builder. A learner should be able to remember the workflow independently of a particular library.

### 2.3 Progressive disclosure

Every section has three levels:

- **Guided:** recommended values and short explanations;
- **Customize:** common parameters and tradeoffs;
- **Advanced:** specialist options, constraints, and expert warnings.

These are disclosure levels inside one product, not three disconnected tools.

### 2.4 Configuration before framework

Neural-network architecture is represented in framework-neutral concepts. The user chooses PyTorch or Keras only when generating code.

Classical machine-learning workflows generate scikit-learn and imbalanced-learn code because those libraries provide the relevant estimator and pipeline abstractions.

### 2.5 Python script output

The generated artifact is always a `.py` script. The current “target environment” choice should be replaced with runtime settings:

- CPU;
- CUDA GPU;
- automatic device selection;
- low-memory profile.

Notebook output is out of scope for the first implementation.

### 2.6 No copied notebooks

Books, repositories, courses, and official documentation are research inputs. The generator templates must be original implementations based on public APIs and established concepts. Source resources can be linked as optional further reading. Full notebooks, chapters, and datasets are not copied into the application.

## 3. Recommended product architecture

The application should use a shared, data-driven registry instead of one custom form per recipe.

### 3.1 Core registries

The system contains the following serializable registries:

- `TaskDefinition`
- `DataProfileDefinition`
- `DatasetCard`
- `SplitStrategyDefinition`
- `PreparationOptionDefinition`
- `ModelDefinition`
- `LayerDefinition`
- `MetricDefinition`
- `RuntimeProfileDefinition`
- `GeneratorAdapter`

Each definition has a stable ID, display metadata, compatibility rules, defaults, validation constraints, educational content, and generator mapping.

### 3.2 Project configuration

The complete user selection is stored as a versioned `ProjectConfig`.

Conceptual structure:

```ts
type ProjectConfig = {
  schemaVersion: number;
  taskId: string;
  learningLevel: "guided" | "customize" | "advanced";
  data: DataConfig;
  inspection: InspectionConfig;
  split: SplitConfig;
  preparation: PreparationConfig;
  model: ClassicalModelConfig | NeuralModelConfig;
  training: TrainingConfig;
  evaluation: EvaluationConfig;
  output: OutputConfig;
};
```

The UI edits this object. Validation reads this object. Code generation consumes this object. Saved presets and shareable configurations also use this object.

### 3.3 Compatibility engine

Every configurable item can declare:

- `compatibleTaskIds`;
- `compatibleDataProfileIds`;
- `requires`;
- `conflictsWith`;
- `availableWhen`;
- `recommendedWhen`;
- `warningWhen`;
- `generatorSupport`.

The engine returns:

- allowed choices;
- disabled choices with a reason;
- contextual recommendations;
- warnings;
- blocking validation errors.

The UI must not silently hide an important incompatibility. A disabled option should explain why it is unavailable.

### 3.4 Deterministic code pipeline

Code generation follows:

1. Validate `ProjectConfig`.
2. Normalize defaults into an explicit resolved configuration.
3. Select task and framework adapters.
4. Build ordered code sections.
5. Add dependency and runtime declarations.
6. Format the generated Python.
7. Run static validation.
8. Present code, requirements, assumptions, and run instructions.

The same resolved configuration should always generate the same script.

## 4. User experience

### 4.1 Entry screen

The entry screen asks “What do you want to build?” and groups tasks by learning concept:

- Predict a category
- Predict a number
- Find groups
- Find unusual examples
- Predict future values
- Understand images
- Understand sequences and sensors
- Understand text
- Understand audio
- Recommend items

The standard term appears alongside the friendly description, for example:

> Predict a number  
> Regression

Each task card includes:

- a one-sentence definition;
- example use cases;
- expected target type;
- common data formats;
- estimated difficulty;
- “Start with an example dataset.”

### 4.2 Builder layout

Desktop uses a two-panel layout:

- left: the current configuration step;
- right: live explanation, resolved configuration, or generated-code preview.

The top progress rail shows the common workflow. Completed steps remain editable.

Each configuration control displays:

- plain-language label;
- technical name;
- recommended value;
- “Why this matters” explanation;
- effect on generated code;
- tradeoff or common mistake when relevant.

### 4.3 Mobile and narrow screens

Below the desktop breakpoint:

- configuration and preview become separate tabs;
- sections become a single-column accordion;
- controls use `width: 100%` and `min-width: 0`;
- code blocks scroll internally;
- the page itself must not scroll horizontally;
- “Next” or “Generate” becomes a sticky bottom action;
- advanced settings remain collapsed by default.

The prior overlapping form failure is a release blocker. Responsive acceptance viewports are:

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1440 × 900.

### 4.4 Learning feedback

Every step updates a compact “What your project now does” summary.

Example:

> Your project predicts a continuous value from tabular data. Numeric columns are standardized. Missing numeric values use the training-set median. The data is split into training, validation, and test sets. A Ridge model is tuned using the validation set.

The summary uses concepts rather than library syntax. The generated-code preview highlights the lines affected by the latest choice.

## 5. Data workflow

### 5.1 Supported data profiles

Initial profiles:

- tabular CSV;
- image folders;
- YOLO detection labels;
- YOLO segmentation labels;
- fixed-length numeric sequences;
- windowed sensor time series.

Later profiles:

- free text;
- question-answer pairs;
- audio folders;
- forecasting tables;
- user-item interactions.

### 5.2 Data understanding

The user can include generated code for:

- head/sample preview;
- row and column counts;
- image or signal shape;
- data types;
- target distribution;
- descriptive statistics;
- missing values;
- duplicates;
- cardinality of categorical columns;
- numeric correlation;
- class balance;
- representative images, waveforms, or sequence plots.

Inspection options are selected independently from data preparation. Viewing missing values does not automatically impute them.

### 5.3 Split strategies

Supported strategies:

- random;
- stratified;
- group-aware;
- subject-aware;
- time-ordered;
- predefined dataset split;
- cross-validation.

Presets:

- **Quick experiment:** 80% train, 20% test;
- **Safe tuning:** 70% train, 15% validation, 15% test;
- **Small dataset:** 80% development, 20% final test, with cross-validation inside development data.

Rules:

- official test data is not reused as validation data;
- time-series data is not randomly shuffled by default;
- repeated samples from one subject, machine, recording, or source file stay in one split;
- target stratification is offered only when supported;
- the final test set remains untouched until final evaluation.

### 5.4 Preparation

Tabular options:

- numeric imputation;
- categorical imputation;
- standard, robust, and min-max scaling;
- one-hot and ordinal encoding;
- rare-category handling;
- variance filtering;
- univariate feature selection;
- polynomial features;
- target transformation;
- outlier handling.

Image options:

- resize;
- normalization;
- horizontal or vertical flip;
- crop;
- rotation;
- color jitter;
- task-safe geometric augmentation.

Sequence and sensor options:

- window length;
- stride;
- channel selection;
- per-channel normalization;
- detrending;
- optional filtering;
- missing-window handling;
- label aggregation.

All learned preprocessing is fitted only on training data and reused for validation, test, and inference.

### 5.5 Imbalance handling

Initial options:

- no balancing;
- class weights;
- random oversampling;
- random undersampling;
- SMOTE;
- SMOTENC for mixed numeric and categorical data.

Rules:

- resampling applies only to classification;
- resampling occurs after splitting;
- cross-validation resampling occurs inside each training fold;
- validation and test distributions remain natural;
- raw images, raw text, and raw sequences do not receive tabular SMOTE;
- the interface recommends class weights or domain-specific augmentation when SMOTE is inappropriate.

## 6. Classical machine-learning scope

### 6.1 Classification

Initial families:

- Logistic Regression
- K-Nearest Neighbors
- Gaussian, Multinomial, and Categorical Naive Bayes where compatible
- Linear and kernel SVM
- Decision Tree
- Random Forest
- Gradient Boosting
- Histogram Gradient Boosting

Configurations include:

- regularization;
- class weights;
- neighbor count and distance;
- kernel and kernel parameters;
- tree depth and leaf size;
- number of estimators;
- learning rate;
- early stopping where supported;
- probability calibration;
- random seed.

### 6.2 Regression

Initial families:

- Linear Regression
- Ridge
- Lasso
- Elastic Net
- K-Nearest Neighbors Regressor
- Support Vector Regression
- Decision Tree Regressor
- Random Forest Regressor
- Gradient Boosting Regressor
- Histogram Gradient Boosting Regressor
- neural-network regression

Configurations include:

- regularization strength;
- L1/L2 balance;
- polynomial degree;
- neighbor count and weighting;
- kernel and kernel parameters;
- tree depth and leaf size;
- number of estimators;
- learning rate;
- loss;
- target transformation;
- random seed.

### 6.3 Baselines and comparison

Guided mode always offers a baseline:

- majority or stratified dummy classifier;
- mean or median dummy regressor;
- naive previous-value forecast;
- simple linear model when appropriate.

A later comparison mode can run multiple compatible models through the same leakage-safe preprocessing and evaluation pipeline.

## 7. Neural-network builder

### 7.1 Version-one boundary

The first neural builder supports sequential architectures. Branches, residual graphs, multi-input models, custom layer code, and arbitrary computation graphs are deferred.

### 7.2 Framework-neutral layer schema

Initial layer types:

- Input
- Dense
- Conv1D
- Conv2D
- MaxPool1D
- MaxPool2D
- AveragePool1D
- AveragePool2D
- GlobalAveragePool1D
- GlobalAveragePool2D
- Flatten
- LSTM
- GRU
- BatchNormalization
- LayerNormalization
- Dropout
- Activation
- OutputHead

Each layer defines:

- accepted input ranks;
- output-shape calculation;
- configurable parameters;
- safe parameter ranges;
- compatible neighbors;
- concept explanation;
- common uses;
- tradeoffs;
- Keras adapter;
- PyTorch adapter.

### 7.3 Shape inference

The builder calculates and displays the shape after every layer. Invalid transitions block generation.

Examples:

- Dense expects a feature vector.
- Conv1D expects sequence length and channels/features.
- Conv2D expects height, width, and channels.
- LSTM and GRU expect a sequence.
- Flatten converts spatial or sequential dimensions into a feature vector.
- Global pooling removes spatial or temporal dimensions without the parameter growth of flattening.

Framework-specific channel ordering is handled by the generator adapter.

### 7.4 Presets

Initial presets:

- tabular regression MLP;
- tabular binary classification MLP;
- tabular multiclass classification MLP;
- image classification CNN;
- sensor Conv1D classifier;
- sensor LSTM classifier;
- sensor GRU classifier.

Presets are editable starting points, not locked templates.

### 7.5 Output heads

The task determines the safe default:

- regression: one linear output;
- binary classification: one logit;
- multiclass classification: one logit per class;
- multilabel classification: one logit per label.

The adapter chooses the matching loss and prediction conversion. It must avoid applying an activation twice when a framework loss expects logits.

## 8. Dataset Learning Mode

### 8.1 Purpose

Learning Mode recommends public datasets that teach the selected task or concept. It does not generate datasets, mirror large archives, or silently download files.

The learner can filter by:

- task;
- data type;
- beginner, intermediate, or advanced;
- quick, normal, or heavy compute;
- clean or intentionally messy data;
- balanced or imbalanced targets;
- desired learning concept;
- license suitability;
- download size.

### 8.2 Recommendation tiers

Every supported task should eventually offer:

- **Quick Start:** tiny or built-in data for checking the pipeline;
- **Learn a Concept:** manageable real data with a focused lesson;
- **Challenge:** larger, noisier, imbalanced, temporal, or multi-source data.

Recommendations are deterministic. They use metadata and compatibility scoring, not an LLM.

### 8.3 Dataset metadata

Conceptual structure:

```ts
type DatasetCard = {
  id: string;
  title: string;
  sourceUrl: string;
  downloadPageUrl: string;
  taskIds: string[];
  dataProfileId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  computeTier: "quick" | "normal" | "heavy";
  approximateSize: string;
  sampleCount?: number;
  featureCount?: number;
  targetDescription: string;
  existingSplits: DatasetSplitMetadata[];
  recommendedSplitStrategyId: string;
  licenseStatus: "clear" | "conditional" | "unverified";
  licenseName?: string;
  licenseUrl?: string;
  commercialUse: "allowed" | "restricted" | "unknown";
  attribution: string;
  learningGoals: string[];
  caveats: string[];
  compatibleRecipeIds: string[];
  verifiedAt: string;
};
```

Cards with unknown or conditional terms are clearly labeled. “Publicly available” must not be presented as equivalent to “commercially reusable.”

### 8.4 Phased catalog

#### Phase A: current recipes and foundational ML

- COCO8 for detection smoke tests
- COCO8-Seg for segmentation smoke tests
- UCI HAR for sequence classification
- MNIST and CIFAR-10 for image classification
- Iris, Breast Cancer Wisconsin, and Adult Census for classification
- Auto MPG, Wine Quality, and Bike Sharing for regression

#### Phase B: deeper computer vision and sensor learning

- PASCAL VOC
- Oxford-IIIT Pet
- Hydraulic Systems condition monitoring
- AI4I predictive maintenance
- MetroPT-3
- Gas Sensor Array Drift
- Kitsune network attacks

#### Phase C: additional modalities

- SMS Spam and the Stanford IMDB review dataset
- SQuAD 2.0
- Speech Commands
- ESC-10 and ESC-50
- Monash Forecasting Archive
- MovieLens

### 8.5 Seed source facts

The catalog should be built from primary source pages:

- UCI datasets expose task, size, features, missing-value information, citation, and CC BY 4.0 licensing.
- UCI HAR contains subject-grouped accelerometer and gyroscope windows and is appropriate for teaching subject-aware splits.
- COCO8 and COCO8-Seg are tiny Ultralytics pipeline-check datasets.
- Oxford-IIIT Pet provides classification, bounding-box, and segmentation annotations under CC BY-SA 4.0.
- SQuAD 2.0 is distributed under CC BY-SA 4.0.
- ESC-50 is noncommercial; the ESC-10 subset is CC BY.
- MovieLens Latest Small has noncommercial restrictions.
- Monash Forecasting Archive describes its datasets as research-use resources and includes datasets with different frequencies and missing-value variants.

No dataset is included until its source, terms, caveats, and access path have been verified.

## 9. Generator output

Generated projects contain:

- descriptive header;
- dependency list;
- reproducibility seed;
- device selection;
- configuration constants;
- data loading;
- data inspection selected by the user;
- split logic;
- leakage-safe preprocessing;
- model construction;
- training;
- validation;
- final test evaluation;
- plots selected by the user;
- save/load logic;
- inference example;
- short run instructions.

The result panel also shows:

- selected assumptions;
- expected input format;
- generated filenames;
- install command;
- source dataset link when used;
- license and attribution reminder;
- warnings that did not block generation.

## 10. Responsive and accessibility requirements

### 10.1 Layout

- Use CSS Grid or Flexbox with `minmax(0, 1fr)` for shrinkable panels.
- Form controls never use widths wider than their container.
- Long labels wrap.
- Code panels use internal overflow.
- Desktop split ratios remain usable at 1024 pixels.
- Mobile avoids fixed-position elements that cover fields.

### 10.2 Accessibility

- Every input has a programmatic label.
- Explanations and errors are associated with their controls.
- All steps work with a keyboard.
- Focus moves predictably after navigation and validation.
- Color is not the only warning or selection signal.
- Code and UI text meet WCAG AA contrast.
- Reduced-motion preferences are respected.

## 11. Validation and testing

### 11.1 Registry tests

- Unique stable IDs
- Valid references between registries
- Complete generator support declarations
- Required educational content
- Valid parameter ranges
- Dataset source and license status present
- No circular requirement rules

### 11.2 Configuration tests

- Valid default configuration for every released task
- Invalid combinations produce clear errors
- Disabled options explain their constraint
- Project configuration round-trips through serialization
- Schema migrations preserve older saved configurations

### 11.3 Generator tests

- Python parses with `ast.parse`
- Deterministic output snapshots
- Required imports match selected features
- No unused optional dependency is added
- Output head, loss, and metric combinations are correct
- Keras and PyTorch shape adapters agree with the neutral schema
- Generated scripts include no unresolved placeholders

### 11.4 Leakage tests

- Split happens before learned preprocessing
- Imputation and scaling fit only on training data
- SMOTE and other resampling affect only training folds
- Image and audio augmentation run only during training
- Official test sets are not used for tuning
- Group and time boundaries are preserved

### 11.5 Execution tests

Testing should use publicly available datasets and official small subsets. It should not create replacement datasets.

Use three levels:

- static validation for every supported configuration;
- pairwise configuration coverage to control combinatorial growth;
- end-to-end smoke execution for representative task/framework/dataset paths.

Full Cartesian execution is not practical. The compatibility matrix and pairwise suite must ensure that every option is exercised with each important interacting option.

### 11.6 UI tests

- Task discovery from a student perspective
- Complete guided flow without opening advanced settings
- Configuration persistence between steps
- Live explanation updates
- Keyboard navigation
- Mobile viewport screenshots
- No overlap or page-level horizontal overflow
- Code copy and download
- Dataset source, license, and caveat visibility

## 12. Implementation phases

### Phase 1: foundation

- Introduce versioned registry schemas.
- Introduce `ProjectConfig`.
- Build compatibility and validation services.
- Replace the current fixed form with the common task-first shell.
- Preserve existing recipes through adapters.
- Fix responsive layout and add viewport tests.

### Phase 2: data and classical ML

- Add data inspection.
- Add split strategies and ratios.
- Add tabular preprocessing.
- Add leakage-safe imbalance handling.
- Add classical classification.
- Add regression and metrics.
- Add baseline models.

### Phase 3: dataset Learning Mode

- Add catalog schema and verified Phase A metadata.
- Add task-filtered recommendations.
- Add Quick Start, Learn a Concept, and Challenge tiers.
- Add source, license, attribution, and caveat display.
- Connect datasets to compatible generated configurations.

### Phase 4: sequential neural builder

- Add neutral layer registry.
- Add shape inference and compatibility rules.
- Add presets.
- Add Keras and PyTorch adapters.
- Add layer explanations and code-change highlighting.

### Phase 5: broader modalities

- Text
- Audio
- Forecasting
- Anomaly detection
- Recommendation
- Expanded sensor and computer-vision recipes

## 13. Success criteria

The first major release succeeds when:

- a new learner can find classification and regression without knowing a framework;
- the same linear workflow is visible for every released task;
- every configuration explains its purpose and code effect;
- generated code is deterministic, readable, and runnable;
- every released task has a valid default configuration;
- split, preprocessing, augmentation, and SMOTE cannot leak test data;
- dataset recommendations link only to verified public sources;
- licenses and restrictions are visible before download;
- sequential neural architectures reject invalid shape transitions;
- PyTorch and Keras output represent the same selected concepts;
- no configured control overlaps at required viewport sizes;
- representative generated scripts pass static and end-to-end smoke tests.

## 14. Risks and controls

### Configuration explosion

**Risk:** The number of combinations becomes impossible to test.  
**Control:** Shared schemas, explicit compatibility metadata, pairwise testing, and phased model support.

### False promise of “all algorithms”

**Risk:** A long list creates shallow or broken support.  
**Control:** Release curated model families with complete explanation, validation, and execution coverage.

### Educational overload

**Risk:** Advanced controls recreate the complexity of code.  
**Control:** Progressive disclosure, recommended presets, task-first language, and visible concept summaries.

### Data leakage

**Risk:** Generated code reports unrealistically high scores.  
**Control:** Split-first pipelines, training-only transforms, compatibility rules, and dedicated leakage tests.

### Dataset licensing

**Risk:** A public download is mistaken for unrestricted use.  
**Control:** Required license status, commercial-use metadata, source links, attribution, and exclusion of unverified defaults.

### Framework drift

**Risk:** Generated code breaks as library APIs change.  
**Control:** Versioned adapters, official API references, pinned smoke-test environments, and regular verification.

## 15. Primary references

- Scikit-learn supervised learning: https://scikit-learn.org/stable/supervised_learning.html
- Scikit-learn estimator map: https://scikit-learn.org/stable/machine_learning_map.html
- Scikit-learn common pitfalls: https://scikit-learn.org/stable/common_pitfalls.html
- imbalanced-learn SMOTE: https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTE.html
- imbalanced-learn common pitfalls: https://imbalanced-learn.org/dev/common_pitfalls.html
- Keras Layers API: https://keras.io/api/layers/
- PyTorch model-building tutorial: https://docs.pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
- UCI Machine Learning Repository: https://archive.ics.uci.edu/
- Ultralytics datasets: https://docs.ultralytics.com/datasets/
- Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- PASCAL VOC 2007: https://www.robots.ox.ac.uk/~vgg/projects/pascal/VOC/voc2007/index.html
- SQuAD 2.0: https://rajpurkar.github.io/SQuAD-explorer/
- TensorFlow Speech Commands: https://www.tensorflow.org/datasets/catalog/speech_commands
- ESC-50: https://github.com/karolpiczak/esc-50
- Monash Forecasting Repository: https://forecastingdata.org/
- MovieLens: https://grouplens.org/datasets/movielens/

