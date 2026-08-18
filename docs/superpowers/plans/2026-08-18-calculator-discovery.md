# Calculator Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 36 electronics calculators the first, easiest-to-discover part of the Tools experience, with readable search and filters, original circuit-themed visuals, a clear scroll cue, and in-tool calculator discovery.

**Architecture:** Keep the existing static calculator routes and formula components. Enrich the calculator catalog with a small visual vocabulary, render original inline SVG thumbnails, promote the searchable calculator browser to the first Tools viewport, and reuse the same catalog in a compact finder within every calculator page.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/TypeScript, inline SVG, CSS, Node test runner, Chrome DevTools Protocol responsive tests.

## Global Constraints

- Preserve all 36 existing calculator slugs, metadata, formulas, and static-export behavior.
- Do not download or reproduce Last Minute Engineers graphics, page layout, or branded assets; use original local SVG diagrams.
- Keep search and filters keyboard accessible and provide a live result count.
- Put calculator discovery before advanced generators on `/tools/`.
- Required UI text renders at 14px or larger; explanatory copy renders at 16px or larger.
- Search, category filters, and card layouts must not create horizontal scrolling from 360px through desktop widths.
- Remove decorative arrow glyphs from calculator cards and navigation controls.

---

## File map

- Modify `data/calculators.js`: add a bounded `visualKey` to each calculator entry and export categories.
- Create `components/tools/CalculatorThumbnail.js`: original accessible SVG diagram renderer.
- Modify `components/tools/ToolsIndex.js`: readable search-first calculator browser, result feedback, thumbnails, and empty state.
- Modify `components/tools/ToolCard.js`: arrow-free advanced-tool card presentation.
- Create `components/tools/CalculatorFinder.js`: local search and category discovery for calculator detail pages.
- Modify `components/tools/CalculatorShell.js`: mount the finder below the active calculator without changing calculator logic.
- Modify `app/tools/page.tsx`: calculators-first information architecture, compact copy, scroll cue, advanced-tools section.
- Modify `app/game-theme.css`: calculator discovery, thumbnail, finder, scroll cue, and responsive styles.
- Modify `tests/tools/calculator-restoration.test.js`: catalog and shared-shell regression contracts.
- Modify `tests/tools/calculator-theme.test.js`: readable visual contract and no-arrow assertions.
- Modify `tests/tools/site-responsive.test.js`: Tools and calculator responsive behavior.

### Task 1: Add a stable visual vocabulary to calculator metadata

**Files:**
- Modify: `data/calculators.js`
- Test: `tests/tools/calculator-restoration.test.js`

**Interfaces:**
- Produces: `calculator.visualKey` as one of `ohms`, `resistor`, `divider`, `led`, `battery`, `capacitor`, `wave`, `filter`, `timer`, `number`, `conversion`, or `physics`.
- Produces: `calculatorCategories: string[]` in catalog order.
- Consumes: existing calculator `slug`, `name`, `shortDescription`, `category`, `formula`, and `component` values unchanged.

- [ ] **Step 1: Write the failing catalog tests**

```js
test("every calculator has a supported original thumbnail key", async () => {
  const { calculators } = await import("../../data/calculators.js");
  const supported = new Set([
    "ohms", "resistor", "divider", "led", "battery", "capacitor",
    "wave", "filter", "timer", "number", "conversion", "physics",
  ]);
  assert.equal(calculators.length, 36);
  assert.ok(calculators.every((item) => supported.has(item.visualKey)));
  assert.equal(new Set(calculators.map((item) => item.slug)).size, 36);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: FAIL because calculator entries do not have `visualKey` and the category export does not exist.

- [ ] **Step 3: Add visual keys without changing routes or formula data**

Assign keys by subject: Ohm's law and op-amp entries use `ohms`; resistor-network entries use `resistor`; voltage-divider and LED entries use their specific keys; battery life uses `battery`; timing/filter/wavelength entries use `wave`, `filter`, or `timer`; converters use `conversion`; binary/hex/complement entries use `number`; remaining engineering math uses `physics`.

Export categories from first occurrence order:

```js
export const calculatorCategories = [
  "Fundamentals",
  "Resistors",
  "Timing & Filters",
  "Conversions",
  "Number Systems",
  "Physics & Math",
];
```

- [ ] **Step 4: Run the catalog test and confirm GREEN**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: PASS with 36 unique, unchanged calculator slugs.

- [ ] **Step 5: Commit the catalog contract**

```powershell
git add data/calculators.js tests/tools/calculator-restoration.test.js
git commit -m "feat: add calculator visual metadata"
```

### Task 2: Create original calculator thumbnails

**Files:**
- Create: `components/tools/CalculatorThumbnail.js`
- Modify: `app/game-theme.css`
- Test: `tests/tools/calculator-theme.test.js`

**Interfaces:**
- Produces: `CalculatorThumbnail({ visualKey, title, compact? })`.
- Consumes: supported `visualKey` values from `data/calculators.js`.
- Accessibility: decorative SVG uses `aria-hidden="true"`; the containing figure exposes the calculator title as its accessible label.

- [ ] **Step 1: Write the failing thumbnail contract**

```js
test("calculator thumbnails are original local SVGs", async () => {
  const source = await read("components/tools/CalculatorThumbnail.js");
  assert.match(source, /<svg/);
  assert.match(source, /visualKey/);
  assert.doesNotMatch(source, /lastminuteengineers|https?:\/\//i);
  assert.match(source, /aria-hidden/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/tools/calculator-theme.test.js`

Expected: FAIL because the thumbnail component does not exist.

- [ ] **Step 3: Implement a reusable SVG circuit language**

Use a shared 240×120 view box, cyan conductors, green active nodes, a faint grid, and per-key symbols. Build small local sub-renderers for a resistor zigzag, capacitor plates, sine wave, timer block, numeric bits, and force vector. Use `currentColor`/CSS variables so active and hover states remain consistent with the site theme.

- [ ] **Step 4: Add responsive thumbnail styling**

Define `.calculator-thumbnail`, `.calculator-thumbnail-svg`, and `.calculator-thumbnail--compact`; keep a stable `aspect-ratio: 2 / 1`, clip inside the card, and preserve strong contrast in forced-colors mode.

- [ ] **Step 5: Run theme tests and confirm GREEN**

Run: `node --test tests/tools/calculator-theme.test.js`

Expected: PASS with no remote-image reference.

- [ ] **Step 6: Commit the original visual system**

```powershell
git add components/tools/CalculatorThumbnail.js app/game-theme.css tests/tools/calculator-theme.test.js
git commit -m "feat: add original calculator diagrams"
```

### Task 3: Rebuild the calculator browser around immediate search

**Files:**
- Modify: `components/tools/ToolsIndex.js`
- Modify: `app/game-theme.css`
- Test: `tests/tools/calculator-theme.test.js`
- Test: `tests/tools/calculator-restoration.test.js`

**Interfaces:**
- Produces: calculator search by name, description, category, and formula.
- Produces: category-filter buttons with `aria-pressed`, a polite result status, and a useful zero-result state.
- Consumes: `calculators`, `calculatorCategories`, and `CalculatorThumbnail`.

- [ ] **Step 1: Add failing browser contracts**

```js
test("tools index exposes accessible search, filters, and result feedback", async () => {
  const source = await read("components/tools/ToolsIndex.js");
  assert.match(source, /type="search"/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /CalculatorThumbnail/);
  assert.doesNotMatch(source, /post-arrow|↗|→/);
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `node --test tests/tools/calculator-theme.test.js tests/tools/calculator-restoration.test.js`

Expected: FAIL because cards lack thumbnails and the browser has no live result message.

- [ ] **Step 3: Implement the search-first browser**

Keep the input and filters in one responsive control deck. Normalize search once with `trim().toLowerCase()`. Filter against a precomputed searchable string. Render the count as `36 calculators` or `N matches for “query”`. Render cards as one semantic list with thumbnail, category, title, one-sentence description, and formula; make the full title link the route target.

- [ ] **Step 4: Implement readable responsive behavior**

Use an auto-fit grid with a 250px minimum, allow the category bar to wrap without clipping, keep the search input at least 54px high, and render all required labels at 14px or larger. Do not center long descriptions.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/calculator-theme.test.js tests/tools/calculator-restoration.test.js`

Expected: PASS with every calculator still linked to `/tools/calculators/<slug>/`.

- [ ] **Step 6: Commit the calculator browser**

```powershell
git add components/tools/ToolsIndex.js app/game-theme.css tests/tools/calculator-theme.test.js tests/tools/calculator-restoration.test.js
git commit -m "feat: make calculator search immediate"
```

### Task 4: Make calculators the Tools-page entry point

**Files:**
- Modify: `app/tools/page.tsx`
- Modify: `components/tools/ToolCard.js`
- Modify: `app/game-theme.css`
- Test: `tests/tools/portfolio-readability.test.js`
- Test: `tests/tools/calculator-theme.test.js`

**Interfaces:**
- Produces: a compact left-aligned Tools introduction, `ToolsIndex` in the first viewport, a visible scroll cue, and an `Advanced engineering generators` section below calculators.
- Consumes: existing advanced-tool data and restored tool routes.

- [ ] **Step 1: Add failing page-order and arrow-removal tests**

Read the Tools page and assert that the `ToolsIndex` source occurrence precedes `ToolCard`, the page includes `SCROLL_FOR_GENERATORS`, and neither the page nor `ToolCard` includes decorative arrow glyphs.

- [ ] **Step 2: Run the tests and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/calculator-theme.test.js`

Expected: FAIL because the current page presents a large centered introduction and advanced tools before calculator discovery.

- [ ] **Step 3: Recompose `/tools/`**

Use a short two-column intro: factual copy on the left and the search deck immediately below. Add a thin animated progress line and text `Scroll for generators` after the calculator section. Render advanced tools beneath a concise heading. Keep the AI Script Generator and Sensor Code Generator prominent, but let the calculators answer the first-use intent.

- [ ] **Step 4: Simplify advanced tool cards**

Remove the separate arrow-only link. Make the tool title the visible route link, retain the category/mission code, and increase description and metadata sizes using the shared readable tokens.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/calculator-theme.test.js`

Expected: PASS with calculators rendered before advanced-tool cards.

- [ ] **Step 6: Commit the Tools hierarchy**

```powershell
git add app/tools/page.tsx components/tools/ToolCard.js app/game-theme.css tests/tools/portfolio-readability.test.js tests/tools/calculator-theme.test.js
git commit -m "feat: lead tools page with calculators"
```

### Task 5: Add calculator discovery inside every calculator route

**Files:**
- Create: `components/tools/CalculatorFinder.js`
- Modify: `components/tools/CalculatorShell.js`
- Modify: `app/game-theme.css`
- Test: `tests/tools/calculator-restoration.test.js`

**Interfaces:**
- Produces: `CalculatorFinder({ activeSlug })` with local search, category selection, and up to six related results.
- Consumes: the shared calculator catalog and active route slug.
- Preserves: each calculator component's props, validation, formula rendering, and route metadata.

- [ ] **Step 1: Add a failing shared-shell test**

```js
test("every calculator shell includes local calculator discovery", async () => {
  const shell = await read("components/tools/CalculatorShell.js");
  const finder = await read("components/tools/CalculatorFinder.js");
  assert.match(shell, /CalculatorFinder/);
  assert.match(shell, /activeSlug/);
  assert.match(finder, /type="search"/);
  assert.match(finder, /calculators/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: FAIL because `CalculatorFinder.js` does not exist.

- [ ] **Step 3: Implement the compact finder**

Default to six calculators from the active calculator's category, excluding the active slug. When the visitor searches or selects another category, show the first six matching results. Include `Browse all 36 calculators` as a plain text link to `/tools/#calculators`. Use buttons for filters and linked titles for routes; do not use arrow glyphs.

- [ ] **Step 4: Mount the finder after the active calculation workspace**

Pass the active slug already available to `CalculatorShell`. Keep the calculator itself first and label the discovery panel `Find another calculator` so it does not interfere with the primary task.

- [ ] **Step 5: Run restoration tests and confirm GREEN**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: PASS with 36 statically generated calculator pages and the new finder in the shared shell.

- [ ] **Step 6: Commit in-tool discovery**

```powershell
git add components/tools/CalculatorFinder.js components/tools/CalculatorShell.js app/game-theme.css tests/tools/calculator-restoration.test.js
git commit -m "feat: add calculator finder to tool pages"
```

### Task 6: Verify calculator discovery across viewports and static export

**Files:**
- Modify: `tests/tools/site-responsive.test.js`
- Modify if required by test evidence: `app/game-theme.css`

- [ ] **Step 1: Add live responsive assertions**

At 360×800, 768×1024, and 1440×900, assert that `/tools/` and one calculator route have no document-level horizontal overflow, search inputs remain fully visible, filter buttons are not clipped, the first calculator card is reachable by keyboard, and the calculator finder appears after the active workspace.

- [ ] **Step 2: Run the responsive test and confirm failures are actionable**

Run: `node --test tests/tools/site-responsive.test.js`

Expected: the new assertions either pass or identify a specific selector with overflow/clipping; no timeout-only failure is accepted as completion evidence.

- [ ] **Step 3: Fix only evidence-backed responsive defects**

Adjust grid minimums, wrapping, gaps, and long-word behavior in `app/game-theme.css`. Do not hide required controls to satisfy overflow checks.

- [ ] **Step 4: Run the complete calculator and responsive set**

```powershell
node --test tests/tools/calculator-restoration.test.js tests/tools/calculator-theme.test.js tests/tools/site-responsive.test.js
npm run build
```

Expected: all tests PASS; the build exports `/tools/` and all 36 calculator routes.

- [ ] **Step 5: Review the generated route manifest**

Run: `rg -n "tools/calculators" out -g "*.html"`

Expected: generated HTML exists for every calculator slug, with no missing-route error.

- [ ] **Step 6: Commit any verification fixes**

If verification changes no files, skip this commit. If it reveals a scoped defect, review `git diff`, stage only the named calculator or responsive files, and commit:

```powershell
git commit -m "fix: harden calculator discovery layouts"
```
