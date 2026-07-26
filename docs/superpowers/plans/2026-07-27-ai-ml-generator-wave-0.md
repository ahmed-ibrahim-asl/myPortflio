# AI/ML Generator Wave 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the scalable catalog, source registry, recipe schema, lazy loader, and asynchronous generation engine, then migrate the existing four generators without changing their generated Python or breaking the responsive route.

**Architecture:** Keep `lib/tools/ml-templates.js` as a synchronous compatibility entry point while extracting each recipe into a focused module. The page imports only a lightweight catalog and uses a statically declared dynamic-import map to load the selected recipe. A client hook owns `idle`, `loading`, `ready`, and `error` states and discards stale loads. Existing recipe IDs, defaults, validation, filenames, metadata, and Python output remain stable.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 6, JavaScript ES modules with JSDoc, Node 25 `node:test`, Python AST parsing, CSS Grid, and Chrome DevTools Protocol.

## Global Constraints

- Preserve the four existing recipe IDs and their order.
- Preserve every existing Starter and Production-oriented default, compatibility correction, validation message, filename, metadata record, and generated Python byte-for-byte except for import order or exactly-one-trailing-newline normalization already covered by tests.
- Keep `lib/tools/ml-templates.js` import-compatible throughout the migration.
- Keep `catalog.js`, `taxonomy.js`, and `sources.js` free of generated Python strings and generator functions.
- Use a statically declared dynamic-import map with literal module paths so Next.js can create one chunk per recipe family.
- Show a stable code-panel loading state; never replace the current output with a blank panel while a recipe is loading.
- Ignore stale asynchronous results after a selection change.
- Generate locally in the browser. Do not add an LLM, API key, upload, account, paywall, notebook, dataset bundle, or remote request.
- Treat CS50 AI as link-only. Do not copy or transcribe course material.
- Track source-code licenses separately from future dataset licenses.
- Keep source descriptions factual and original; do not imply endorsement by any referenced author or project.
- Keep page-level horizontal overflow fixed at its source. Do not hide it with global overflow clipping.
- Follow red-green-refactor for every behavior change. Name the break each test catches before writing it.
- Preserve all unrelated worktree changes and stage only files named by the active task.

## Stable Contracts

### Lightweight recipe manifest

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
  normalizedKeywords,
  sourceRefs,
  pipelineStages,
  sectionIds,
  presetIds,
  generatorModuleId,
}
```

### Loaded recipe definition

```js
{
  ...manifest,
  filename,
  fields,
  defaults,
  normalize,
  validate,
  generate,
  dependencies,
  dataset,
  metrics,
  artifacts,
  hardware,
  deployment,
  notes,
  warnings,
  getWarnings,
  getReadiness,
}
```

### Asynchronous recipe state

```ts
type RecipeLoadState =
  | { status: "idle"; recipe: null; error: null }
  | { status: "loading"; recipe: null; error: null }
  | { status: "ready"; recipe: LoadedRecipe; error: null }
  | { status: "error"; recipe: null; error: Error };
```

### Generator result

```js
{
  templateId,
  filename,
  code,
  dependencies,
  dataset,
  metrics,
  artifacts,
  hardware,
  deployment,
  notes,
  warnings,
  readiness,
  config,
  validationErrors,
}
```

## File Map

- Create `lib/tools/ml-generator/taxonomy.js`: lightweight domains, task families, data profiles, frameworks, sections, presets, and pipeline-stage records.
- Create `lib/tools/ml-generator/sources.js`: canonical source, owner, type, URL, license/status, topics, and verification date.
- Create `lib/tools/ml-generator/schema.js`: manifest and loaded-recipe invariant checks.
- Create `lib/tools/ml-generator/catalog.js`: the four lightweight manifests and discovery helpers.
- Create `lib/tools/ml-generator/engine.js`: recipe-agnostic normalization, validation, metadata, generation, and result building.
- Create `lib/tools/ml-generator/load-recipe.js`: cached static dynamic-import map and prefetch helper.
- Create `lib/tools/ml-generator/python/literals.js`: Python literal conversion.
- Create `lib/tools/ml-generator/python/formatting.js`: trailing-newline and shared string formatting helpers.
- Create `lib/tools/ml-generator/validation.js`: mode, cloning, number, text, select, and field-visibility helpers.
- Create `lib/tools/ml-generator/recipes/applied/yolo-shared.js`: shared detection and segmentation fields, normalization, validation, metadata, and Python generation.
- Create `lib/tools/ml-generator/recipes/applied/yolo-detection-training.js`: detection manifest and recipe definition.
- Create `lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js`: segmentation manifest and recipe definition.
- Create `lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js`: sensor recipe definition.
- Create `lib/tools/ml-generator/recipes/deployment/edge-image-classification.js`: edge recipe definition.
- Modify `lib/tools/ml-templates.js`: reduce to a thin synchronous compatibility entry point.
- Create `lib/hooks/useMlGeneratorRecipe.ts`: load state, stale-result protection, prefetch, and memoized result flow.
- Modify `app/tools/ai-script-generator/page.tsx`: use lightweight catalog and asynchronous recipe state.
- Modify `components/tools/ml-generator/GeneratorCodePanel.tsx`: stable loading and error states.
- Modify `components/tools/ml-generator/GeneratorInfoTabs.tsx`: Resources tab and source/license display.
- Modify `components/tools/ml-generator/ConfigurationField.tsx`: consume the loaded recipe instead of the legacy global registry.
- Modify `app/game-theme.css`: loading skeleton, error state, and 320px overflow protections.
- Create `tests/tools/ml-generator-catalog.test.js`: taxonomy, source, catalog, schema, loader, cache, and engine contracts.
- Modify `tests/tools/ml-generator.test.js`: parity assertions across compatibility and extracted recipes.
- Modify `tests/tools/ai-generator-responsive.test.js`: asynchronous-ready, loading, rapid-switch, and 320px viewport checks.
- Modify `package.json`: add focused generator test scripts only after commands are already proven manually.

---

### Task 1: Lightweight taxonomy, sources, catalog, and schema

**Files:**
- Create: `tests/tools/ml-generator-catalog.test.js`
- Create: `lib/tools/ml-generator/taxonomy.js`
- Create: `lib/tools/ml-generator/sources.js`
- Create: `lib/tools/ml-generator/catalog.js`
- Create: `lib/tools/ml-generator/schema.js`

**Interfaces:**
- Produces `ML_DOMAINS`, `ML_TASKS`, `ML_DATA_PROFILES`, `ML_FRAMEWORKS`, `ML_PIPELINE_STAGES`, `ML_SECTIONS`, `ML_PRESETS`, `ML_SOURCES`, `ML_RECIPE_CATALOG`, `getRecipeManifest`, `searchRecipeCatalog`, `validateRecipeManifest`, and `validateSourceRecord`.
- Does not import `lib/tools/ml-templates.js` or any recipe module.

- [ ] **Step 1: Write a failing catalog contract test**

Name the break: an unresolved source/taxonomy reference or accidental heavy generator import must make catalog discovery invalid.

Use literal expectations:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ML_RECIPE_CATALOG,
  getRecipeManifest,
  searchRecipeCatalog,
} from "../../lib/tools/ml-generator/catalog.js";
import { ML_SOURCES } from "../../lib/tools/ml-generator/sources.js";
import {
  ML_DATA_PROFILES,
  ML_DOMAINS,
  ML_FRAMEWORKS,
  ML_PIPELINE_STAGES,
  ML_TASKS,
} from "../../lib/tools/ml-generator/taxonomy.js";
import {
  validateRecipeManifest,
  validateSourceRecord,
} from "../../lib/tools/ml-generator/schema.js";

test("the lightweight catalog preserves all existing recipe IDs", () => {
  assert.deepEqual(
    ML_RECIPE_CATALOG.map(({ id }) => id),
    [
      "yolo-detection-training",
      "yolo-segmentation-training",
      "sensor-timeseries-classification",
      "edge-image-classification",
    ],
  );
});

test("every manifest resolves its taxonomy and source references", () => {
  const domainIds = new Set(ML_DOMAINS.map(({ id }) => id));
  const taskIds = new Set(ML_TASKS.map(({ id }) => id));
  const dataProfileIds = new Set(ML_DATA_PROFILES.map(({ id }) => id));
  const frameworkIds = new Set(ML_FRAMEWORKS.map(({ id }) => id));
  const stageIds = new Set(ML_PIPELINE_STAGES.map(({ id }) => id));
  const sourceIds = new Set(ML_SOURCES.map(({ id }) => id));

  for (const manifest of ML_RECIPE_CATALOG) {
    assert.deepEqual(validateRecipeManifest(manifest), {});
    assert.equal(domainIds.has(manifest.domainId), true);
    assert.equal(taskIds.has(manifest.taskId), true);
    assert.equal(frameworkIds.has(manifest.frameworkId), true);
    assert.equal(manifest.supportedDataProfileIds.every((id) => dataProfileIds.has(id)), true);
    assert.equal(manifest.pipelineStages.every((id) => stageIds.has(id)), true);
    assert.equal(manifest.sourceRefs.every((id) => sourceIds.has(id)), true);
  }
});

test("every source record exposes auditable license status", () => {
  for (const source of ML_SOURCES) {
    assert.deepEqual(validateSourceRecord(source), {});
    assert.match(source.url, /^https:\/\//);
    assert.match(source.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("catalog search is local, case-insensitive, and returns stable order", () => {
  assert.deepEqual(
    searchRecipeCatalog("YOLO").map(({ id }) => id),
    ["yolo-detection-training", "yolo-segmentation-training"],
  );
  assert.equal(getRecipeManifest("sensor-timeseries-classification")?.frameworkId, "pytorch");
  assert.equal(getRecipeManifest("missing"), null);
});
```

- [ ] **Step 2: Run the new test and verify RED**

```powershell
node --test tests\tools\ml-generator-catalog.test.js
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/tools/ml-generator/catalog.js`.

- [ ] **Step 3: Implement the taxonomy records**

Add the complete 14-domain table from the approved design. For Wave 0, add the referenced task records:

```js
[
  { id: "object-detection", domainId: "computer-vision", label: "Object detection" },
  { id: "instance-segmentation", domainId: "computer-vision", label: "Instance segmentation" },
  { id: "sequence-classification", domainId: "sensor-ai", label: "Sensor sequence classification" },
  { id: "edge-image-classification", domainId: "deployment", label: "Edge image classification" },
]
```

Add data profiles `yolo-detection`, `yolo-segmentation`, `chronological-sensor-csv`, and `class-directory-images`; frameworks `ultralytics`, `pytorch`, and `tensorflow`; the 12 shared pipeline stages from Section 10.2; and stable `core-configuration`, `data`, `model`, `training`, `evaluation`, and `export` section IDs. Freeze exported arrays and records.

- [ ] **Step 4: Implement the source registry**

Create records for these exact IDs:

```js
[
  "ultralytics-docs",
  "pytorch-docs",
  "tensorflow-docs",
  "handson-ml3",
  "pytorch-deep-learning",
  "handson-mlp",
  "hands-on-llm",
  "unsloth-core",
  "cs50-ai",
]
```

Each record includes `id`, `title`, `owner`, `url`, `sourceType`, `licenseStatus`, `licenseName`, `versionOrDate`, `topics`, and `verifiedAt: "2026-07-27"`. Mark `cs50-ai` as `link-only-noncommercial-course`; mark Unsloth Core as Apache-2.0 and explicitly exclude Studio/CLI.

- [ ] **Step 5: Implement schema validation**

`validateRecipeManifest` and `validateSourceRecord` return field-keyed error maps and never throw for user-provided records. Validate kebab-case IDs, required non-empty strings, non-empty reference arrays, HTTPS URLs, ISO dates, and allowed difficulties.

- [ ] **Step 6: Implement the four lightweight manifests**

Keep discovery metadata only. Precompute `normalizedKeywords` as a lowercase string from title, description, domain/task labels, framework, and tags. Do not include `fields`, `defaults`, `generate`, dependencies, or Python text.

Use `generatorModuleId` equal to each stable recipe ID. Use source refs:

- YOLO recipes: `ultralytics-docs`
- Sensor recipe: `pytorch-docs`, `pytorch-deep-learning`
- Edge recipe: `tensorflow-docs`, `handson-ml3`

- [ ] **Step 7: Run the catalog test and existing generator test**

```powershell
node --test tests\tools\ml-generator-catalog.test.js
node --test tests\tools\ml-generator.test.js
```

Expected: both PASS; the original generator output remains untouched.

- [ ] **Step 8: Commit the metadata foundation**

```powershell
git add -- lib/tools/ml-generator/catalog.js lib/tools/ml-generator/schema.js lib/tools/ml-generator/sources.js lib/tools/ml-generator/taxonomy.js tests/tools/ml-generator-catalog.test.js
git commit -m "feat: add ML generator catalog foundation"
```

---

### Task 2: Shared engine, Python helpers, and recipe contract

**Files:**
- Modify: `tests/tools/ml-generator-catalog.test.js`
- Create: `lib/tools/ml-generator/validation.js`
- Create: `lib/tools/ml-generator/python/literals.js`
- Create: `lib/tools/ml-generator/python/formatting.js`
- Create: `lib/tools/ml-generator/engine.js`

**Interfaces:**
- Produces `ensureMode`, `cloneValue`, `normalizeSelectValue`, `validateNumber`, `pythonLiteral`, `ensureTrailingNewline`, `getRecipeDefaultConfig`, `getRecipeVisibleFields`, `getRecipeFieldOptions`, `normalizeRecipeConfig`, `validateRecipeConfig`, and `buildRecipeResult`.
- Consumes a loaded recipe object through dependency injection; it never imports the catalog or loader.

- [ ] **Step 1: Write failing engine tests with an in-memory real recipe**

Name the break: the shared engine must reject invalid configuration, normalize mode, expose contextual metadata, and emit exactly one trailing newline independently of any existing recipe.

Use a complete fixture recipe with one select field and one numeric field. Assert:

- invalid mode selects Starter defaults
- invalid select normalizes to the first supported value
- a blocking error produces `code: ""`
- valid output ends in exactly one newline
- compatible deployment labels come from the selected export options
- warnings, notes, readiness, and artifacts are copied into the result

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test tests\tools\ml-generator-catalog.test.js
```

Expected: FAIL because `engine.js` does not exist.

- [ ] **Step 3: Implement the pure helpers and engine**

Move no recipe code in this task. Keep all functions deterministic and side-effect free. `buildRecipeResult` receives `(recipe, requestedTemplateId, inputConfig, mode)` and returns the stable generator-result contract. An absent recipe returns an empty result with `validationErrors.templateId`.

- [ ] **Step 4: Run both generator suites and commit**

```powershell
node --test tests\tools\ml-generator-catalog.test.js tests\tools\ml-generator.test.js
git add -- lib/tools/ml-generator/engine.js lib/tools/ml-generator/python lib/tools/ml-generator/validation.js tests/tools/ml-generator-catalog.test.js
git commit -m "feat: add shared ML recipe engine"
```

Expected: PASS before commit.

---

### Task 3: Extract the shared YOLO family with parity

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Create: `lib/tools/ml-generator/recipes/applied/yolo-shared.js`
- Create: `lib/tools/ml-generator/recipes/applied/yolo-detection-training.js`
- Create: `lib/tools/ml-generator/recipes/applied/yolo-segmentation-training.js`
- Modify: `lib/tools/ml-templates.js`

**Interfaces:**
- Each recipe module exports `manifest` and `recipe`.
- `ml-templates.js` statically imports both recipe definitions and keeps the current public function names and synchronous behavior.

- [ ] **Step 1: Add failing parity assertions**

Name the break: an extraction that changes a default, normalization result, metadata record, or generated Python must fail.

Before moving code, capture literal SHA-256 hashes for detection and segmentation outputs in both modes using the current defaults. Add tests that import the extracted recipe modules and assert:

- the recipe IDs match the catalog manifests
- `buildRecipeResult` deep-equals `buildMlGeneratorResult`
- four generated-output hashes equal the recorded pre-extraction literals

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL with missing extracted YOLO modules.

- [ ] **Step 3: Extract shared helpers without behavior changes**

Relocate the existing YOLO option tables, field factory, defaults, normalization, validation, warnings, dependencies, `generateYoloScript`, and `pythonLiteral` usage into `yolo-shared.js`. The family file exports factories; it does not register templates.

- [ ] **Step 4: Create both recipe modules**

Each module combines its catalog manifest with its current filename, fields, defaults, normalizer, validator, generator, dataset contract, metrics, hardware, deployment, notes, warnings, and readiness derived from validation/warnings.

- [ ] **Step 5: Convert the compatibility entry point**

Statically import both extracted recipes, leave the sensor and edge definitions in place, and delegate generic public helpers to `engine.js` where parity tests allow. Do not switch the page to async loading yet.

- [ ] **Step 6: Run parity, Python AST, and responsive tests**

```powershell
node --test tests\tools\ml-generator.test.js
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: PASS with unchanged hashes and UI behavior.

- [ ] **Step 7: Commit**

```powershell
git add -- lib/tools/ml-generator lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "refactor: extract YOLO recipe modules"
```

---

### Task 4: Extract sensor time-series classification with parity

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Create: `lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js`
- Modify: `lib/tools/ml-templates.js`

- [ ] **Step 1: Record current Starter and Production output hashes and add failing module parity tests**

Name the break: LSTM/CNN/CNN-LSTM options, chronological split safeguards, warnings, or generated Python cannot drift during extraction.

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the extracted sensor module is missing.

- [ ] **Step 3: Move the sensor constants, fields, defaults, normalization, validation, metadata, warnings, and `generateSensorScript` into the recipe module**

Preserve existing identifier values, validation bounds, dependency ranges, and generated code. Add only `manifest`, `artifacts`, and `getReadiness` fields required by the new contract.

- [ ] **Step 4: Import the extracted recipe from the compatibility entry point and delete the relocated duplicate**

- [ ] **Step 5: Run tests and commit**

```powershell
node --test tests\tools\ml-generator.test.js tests\tools\ml-generator-catalog.test.js
git add -- lib/tools/ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "refactor: extract sensor AI recipe"
```

Expected: PASS with unchanged hashes.

---

### Task 5: Extract edge image classification with parity

**Files:**
- Modify: `tests/tools/ml-generator.test.js`
- Create: `lib/tools/ml-generator/recipes/deployment/edge-image-classification.js`
- Modify: `lib/tools/ml-templates.js`

- [ ] **Step 1: Record current Starter and Production output hashes and add failing module parity tests**

Name the break: backbone selection, Coral INT8 normalization, deployment guidance, or generated TFLite code cannot drift.

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests\tools\ml-generator.test.js
```

Expected: FAIL because the extracted edge module is missing.

- [ ] **Step 3: Move the edge constants, fields, defaults, normalization, validation, metadata, warnings, and `generateEdgeScript` into the recipe module**

Add only the manifest, artifacts, and readiness contract. Preserve the current three backbones and export behavior.

- [ ] **Step 4: Reduce `ml-templates.js` to the thin compatibility registry**

The file now statically imports all four recipes and re-exports:

```js
ML_TEMPLATES
getTemplateById
getDefaultConfig
getVisibleFields
getFieldOptions
normalizeTemplateConfig
validateTemplateConfig
generateMlScript
getTemplateOutputMetadata
buildMlGeneratorResult
```

- [ ] **Step 5: Run tests and commit**

```powershell
node --test tests\tools\ml-generator.test.js tests\tools\ml-generator-catalog.test.js
git add -- lib/tools/ml-generator/recipes/deployment/edge-image-classification.js lib/tools/ml-templates.js tests/tools/ml-generator.test.js
git commit -m "refactor: extract edge deployment recipe"
```

Expected: PASS and `ml-templates.js` contains no full generated Python string.

---

### Task 6: Cached lazy loader

**Files:**
- Modify: `tests/tools/ml-generator-catalog.test.js`
- Create: `lib/tools/ml-generator/load-recipe.js`

**Interfaces:**
- Produces `loadRecipe(recipeId)`, `prefetchRecipe(recipeId)`, and `hasRecipeLoader(recipeId)`.
- Uses literal dynamic-import paths for all four recipe IDs.
- Caches successful module promises by recipe ID and removes rejected promises so retry is possible.

- [ ] **Step 1: Add failing loader behavior tests**

Name the break: an unsupported ID, duplicate load, malformed recipe module, or permanently cached rejection must be observable.

Assert:

- all four catalog IDs have loaders
- `loadRecipe` resolves a recipe whose ID equals the requested ID
- two concurrent loads return the same promise
- unknown IDs reject with `Unknown ML recipe: <id>`
- each loaded recipe validates against the schema

- [ ] **Step 2: Run and verify RED**

```powershell
node --test tests\tools\ml-generator-catalog.test.js
```

Expected: FAIL because `load-recipe.js` is missing.

- [ ] **Step 3: Implement the static loader map**

Use only literal imports:

```js
const RECIPE_LOADERS = {
  "yolo-detection-training": () =>
    import("./recipes/applied/yolo-detection-training.js"),
  "yolo-segmentation-training": () =>
    import("./recipes/applied/yolo-segmentation-training.js"),
  "sensor-timeseries-classification": () =>
    import("./recipes/sensor-ai/sensor-timeseries-classification.js"),
  "edge-image-classification": () =>
    import("./recipes/deployment/edge-image-classification.js"),
};
```

Resolve `module.recipe`; validate its ID before caching the fulfilled recipe.

- [ ] **Step 4: Run tests and commit**

```powershell
node --test tests\tools\ml-generator-catalog.test.js tests\tools\ml-generator.test.js
git add -- lib/tools/ml-generator/load-recipe.js tests/tools/ml-generator-catalog.test.js
git commit -m "feat: lazy load ML recipe modules"
```

---

### Task 7: Asynchronous hook and stable code-panel states

**Files:**
- Create: `lib/hooks/useMlGeneratorRecipe.ts`
- Modify: `components/tools/ml-generator/GeneratorCodePanel.tsx`
- Modify: `tests/tools/ai-generator-responsive.test.js`

**Interfaces:**
- The hook returns `{ status, recipe, result, error }`.
- `GeneratorCodePanel` accepts `status: "idle" | "loading" | "ready" | "error"` and `errorMessage`.

- [ ] **Step 1: Add failing real-browser loading assertions**

Name the break: a delayed recipe load must show a stable panel, and a rapid selection change must never display the previous recipe's filename or code.

Use the test-only `?recipeLoadDelay=150` query parameter only in development/test builds. Assert the panel exposes:

```html
data-load-state="loading"
aria-busy="true"
```

Then switch from detection to sensor before the first delay completes and assert the ready filename is `train_sensor_classifier.py`.

- [ ] **Step 2: Run and verify RED**

```powershell
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: FAIL because the page has no asynchronous load state.

- [ ] **Step 3: Implement the hook**

Use an effect-local `cancelled` flag and monotonically increasing request ID. Set `loading` before each load, build a result only for the current request, map non-`Error` rejections to `Error`, and keep prior selection state out of the new result. Memoize result generation by recipe, mode, and normalized configuration identity.

- [ ] **Step 4: Add stable code-panel states**

The loading state preserves the panel height with a labeled skeleton and `aria-live="polite"`. The error state names the selected recipe and offers a Retry button wired to a hook reload token. Never expose stack traces.

- [ ] **Step 5: Run TypeScript and browser checks**

```powershell
npx tsc --noEmit
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
```

Expected: the hook type-checks; the browser test may remain RED until the page migration in Task 8, but it must fail only because the page still imports the synchronous registry.

Do not commit until Task 8 turns the integration test green.

---

### Task 8: Migrate the page to lightweight discovery and async generation

**Files:**
- Modify: `app/tools/ai-script-generator/page.tsx`
- Modify: `components/tools/ml-generator/ConfigurationField.tsx`
- Modify: `components/tools/ml-generator/GeneratorCodePanel.tsx`
- Modify: `components/tools/ml-generator/GeneratorInfoTabs.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/ai-generator-responsive.test.js`

- [ ] **Step 1: Replace the static heavy import**

The page imports `ML_RECIPE_CATALOG`, `getRecipeManifest`, and the async hook. It must not import `ml-templates.js` or recipe modules.

- [ ] **Step 2: Reconcile reducer state after a recipe becomes ready**

When `templateId` changes, render discovery metadata immediately, set the loaded recipe defaults when ready, and preserve compatible shared values on mode changes. Continue keeping transient numeric text separate from committed numeric values.

- [ ] **Step 3: Render controls from the loaded recipe**

Disable only recipe-dependent controls while loading; domain/task/recipe discovery remains responsive. Field options come from `getRecipeFieldOptions(recipe, ...)`, not the global compatibility registry.

- [ ] **Step 4: Prefetch the default recipe**

After the client shell mounts, call `prefetchRecipe(ML_RECIPE_CATALOG[0].id)`. Do not preload all recipes.

- [ ] **Step 5: Add the Resources tab**

Resolve `recipe.sourceRefs` against `ML_SOURCES`. Show title, owner, canonical link, source type, license/status, version/date, and verification date. Open external links safely with `rel="noreferrer"`. For CS50 records, show `Link-only curriculum reference`.

- [ ] **Step 6: Add responsive async-state CSS**

Keep `.ml-generator-grid > *`, panels, fields, selects, and code containers at `min-width: 0`. Add skeleton/error styles and a 320px breakpoint that stacks filename/actions without truncating field labels or creating page overflow.

- [ ] **Step 7: Run the focused suites and build**

```powershell
node --test tests\tools\ml-generator-catalog.test.js tests\tools\ml-generator.test.js
node --no-warnings --test tests\tools\ai-generator-responsive.test.js
npx tsc --noEmit
npm run build
```

Expected:

- all catalog and parity tests pass
- loading is visible and ends
- rapid switching shows only the final selected recipe
- 320, 390, 768, 900, 1024, and 1440 widths have no page overflow
- build succeeds

- [ ] **Step 8: Commit the asynchronous route migration**

```powershell
git add -- app/tools/ai-script-generator/page.tsx app/game-theme.css components/tools/ml-generator lib/hooks/useMlGeneratorRecipe.ts tests/tools/ai-generator-responsive.test.js
git commit -m "feat: load ML recipes on demand"
```

---

### Task 9: Scripts, performance evidence, and final Wave 0 verification

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` only if npm rewrites script metadata
- Verify: all Wave 0 files

- [ ] **Step 1: Add proven test scripts**

After the raw commands pass, add:

```json
{
  "test:ml": "node --test tests/tools/ml-generator-catalog.test.js tests/tools/ml-generator.test.js",
  "test:ml:responsive": "node --no-warnings --test tests/tools/ai-generator-responsive.test.js"
}
```

- [ ] **Step 2: Run the complete engineering-tool regression**

```powershell
node --test tests\tools\battery-math.test.js tests\tools\ml-generator-catalog.test.js tests\tools\ml-generator.test.js tests\tools\pid-engine.test.js tests\tools\sensor-generator.test.js
npm run test:ml:responsive
npx tsc --noEmit
npm run build
```

- [ ] **Step 3: Inspect every default generated script**

For all four recipes and both modes, verify:

- empty validation map
- non-empty `.py` output
- exactly one trailing newline
- no `!pip`, `%pip`, notebook cells, or placeholder ellipses
- Python AST parse succeeds
- direct async recipe result deep-equals compatibility result

- [ ] **Step 4: Record performance evidence**

Use build output and browser performance entries to confirm:

- the route's initial client module graph does not statically include `ml-templates.js`
- only the selected recipe module is requested on first interaction
- selecting a second recipe requests its chunk once
- returning to a previously loaded recipe uses the cache

Record measurements in the commit body or task handoff; do not add generated profiling artifacts to the repository.

- [ ] **Step 5: Review the diff**

```powershell
git status --short
git diff --check
git diff --stat
```

Confirm no unrelated user files are staged.

- [ ] **Step 6: Commit scripts and verification metadata**

```powershell
git add -- package.json package-lock.json
git commit -m "test: add ML generator verification scripts"
```

Only include `package-lock.json` if it changed solely because of the script edit.

## Wave 0 Exit Criteria

- Existing four recipe IDs, defaults, validation, metadata, filenames, and Python outputs remain stable.
- The compatibility API remains available from `lib/tools/ml-templates.js`.
- Catalog, source, taxonomy, schema, loader, and engine contracts pass.
- Every manifest and source reference resolves.
- Source licenses/status and verification dates are visible in Resources.
- The page imports lightweight discovery data only and lazy-loads selected recipe logic.
- Loading, error, retry, and rapid-switch behavior are tested in a real browser.
- No horizontal overflow exists from 320px through desktop widths.
- Initial bundle evidence shows recipe generator code is not eagerly imported.
- Unit tests, Python AST checks, TypeScript, responsive browser tests, and production build pass.
