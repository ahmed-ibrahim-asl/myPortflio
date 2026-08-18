# Tools Hub Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore all 36 completed electronics calculators inside `myPortfolio`, retain the five advanced tools in one Tools hub, and render the global mission rail only on pages that contain mission sections.

**Architecture:** Migrate the already-working calculator feature module from the outer workspace into the actual Next.js repository without copying the outer application's layout or theme. A static calculator catalog drives both the searchable hub and `app/tools/[slug]` static routes. The existing mission observer gains an explicit `hasMissions` result so the globally mounted motion system can suppress its rail on non-mission routes.

**Tech Stack:** Next.js 16.2 static export, React 19.2, TypeScript/JavaScript modules, Node's built-in test runner, Chrome DevTools Protocol responsive checks, GitHub Pages.

## Global Constraints

- Preserve all five deployed advanced tool routes and their existing implementations.
- Restore exactly the 36 completed outer-workspace calculators; do not add new calculators.
- Keep the mission rail and compact readout on the homepage only when mission sections exist.
- Do not copy the outer workspace's layout, header, footer, unrelated pages, or global design system.
- Preserve the user's current `/myPortflio` base-path and `.nojekyll` deployment corrections.
- Use static generation only; add no database, hosted API, account system, analytics, or persistence.
- Use test-driven development: run each new test red before writing the corresponding production change.
- Use `apply_patch` for all repository file creation and edits.

## File Structure

- `data/calculators.js`: authoritative 36-record calculator catalog.
- `lib/tools.js`: catalog lookup API (`getAllTools`, `getTool`).
- `lib/units.js`: engineering-unit formatting and unit tables.
- `lib/resistorColors.js`: resistor-band data and resistance formatting.
- `lib/numberSystems.js`: base conversion, complement, bit-shift, ASCII/hex helpers.
- `components/tools/ToolsIndex.js`: client-side calculator search and category filtering.
- `components/tools/ToolCard.js`: one calculator navigation record.
- `components/tools/CalculatorShell.js`: calculator detail header, body, and attribution.
- `components/tools/CalculatorUI.js`: shared field, result, mnemonic, example, and panel primitives.
- `components/tools/calculators/*.js`: 36 interactive calculator implementations and registry.
- `components/tools/diagrams/*.js`: reusable circuit diagrams used by calculator pages.
- `app/tools/[slug]/page.js`: static calculator route and metadata.
- `app/tools/page.tsx`: unified featured-workbench and electronics-calculator hub.
- `lib/hooks/useMissionObserver.ts`: mission discovery and active/completed state.
- `components/MotionSystem.tsx`: conditional mission-rail rendering.
- `app/game-theme.css`: calculator/hub styling adapted to the active visual system.
- `tests/tools/calculator-restoration.test.js`: catalog, file-registry, utility, and route contracts.
- `tests/tools/mission-rail-visibility.test.js`: source contract for safe initial mission visibility.
- `tests/tools/site-responsive.test.js`: browser-level route overflow and rail-visibility regression coverage.

---

### Task 1: Mission-aware rail visibility

**Files:**
- Create: `tests/tools/mission-rail-visibility.test.js`
- Modify: `lib/hooks/useMissionObserver.ts`
- Modify: `components/MotionSystem.tsx`

**Interfaces:**
- Produces: `MissionState { activeMission: string; completedMissions: Set<string>; hasMissions: boolean }`.
- Consumes: existing `[data-mission]` section markup on `app/page.tsx`.

- [ ] **Step 1: Write the failing mission-visibility contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the global motion system hides mission UI until mission sections exist", async () => {
  const [hook, system] = await Promise.all([
    readFile(new URL("../../lib/hooks/useMissionObserver.ts", import.meta.url), "utf8"),
    readFile(new URL("../../components/MotionSystem.tsx", import.meta.url), "utf8")
  ]);

  assert.match(hook, /hasMissions:\s*boolean/);
  assert.match(hook, /useState<boolean>\(false\)/);
  assert.match(hook, /setHasMissions\(sections\.length\s*>\s*0\)/);
  assert.match(system, /hasMissions\s*\?\s*<MissionRail/);
});
```

- [ ] **Step 2: Run the test and verify red**

Run: `node --test tests/tools/mission-rail-visibility.test.js`

Expected: FAIL because `MissionState` has no `hasMissions` property and `MotionSystem` always returns `MissionRail`.

- [ ] **Step 3: Add mission discovery to the observer**

Implement the following behavior in `useMissionObserver.ts`:

```ts
export interface MissionState {
  activeMission: string;
  completedMissions: Set<string>;
  hasMissions: boolean;
}

const [hasMissions, setHasMissions] = useState<boolean>(false);

useEffect(() => {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-mission]"));
  setHasMissions(sections.length > 0);
  if (sections.length === 0) return;
  // retain the existing observer setup and cleanup
}, []);

return { activeMission, completedMissions, hasMissions };
```

- [ ] **Step 4: Render the rail only for mission pages**

Update `MotionSystem.tsx` to retain global scroll/pointer behavior while using:

```tsx
const { activeMission, completedMissions, hasMissions } = useMissionObserver();

return hasMissions ? (
  <MissionRail activeMission={activeMission} completedMissions={completedMissions} />
) : null;
```

- [ ] **Step 5: Run focused and existing responsive tests**

Run: `node --test tests/tools/mission-rail-visibility.test.js tests/tools/site-responsive.test.js`

Expected: both tests PASS; the focused test proves the safe initial state and the browser sweep remains free of overflow.

- [ ] **Step 6: Commit the isolated rail fix**

```powershell
git add -- tests/tools/mission-rail-visibility.test.js lib/hooks/useMissionObserver.ts components/MotionSystem.tsx
git commit -m "fix: hide mission rail outside mission pages"
```

---

### Task 2: Restore calculator catalog, utilities, components, and diagrams

**Files:**
- Create: `tests/tools/calculator-restoration.test.js`
- Create from the completed outer workspace: `data/calculators.js`
- Create from the completed outer workspace: `lib/tools.js`
- Create from the completed outer workspace: `lib/units.js`
- Create from the completed outer workspace: `lib/resistorColors.js`
- Create from the completed outer workspace: `lib/numberSystems.js`
- Create from the completed outer workspace: `components/tools/CalculatorUI.js`
- Create from the completed outer workspace: `components/tools/calculators/index.js`
- Create from the completed outer workspace: all 36 `components/tools/calculators/*Calculator.js` and converter files registered by `index.js`
- Create from the completed outer workspace: all seven `components/tools/diagrams/*.js` files

**Interfaces:**
- Produces: `calculators: CalculatorRecord[]`, `getAllTools(): CalculatorRecord[]`, `getTool(slug: string): CalculatorRecord | null`, and `CALCULATOR_COMPONENTS` keyed by calculator slug.
- Produces: `formatEngineering`, capacitance/resistance unit tables, resistor-band helpers, and number-system helpers used by the migrated calculators.
- Consumes: the existing `@/*` path alias and React client-component support (`allowJs: true`).

- [ ] **Step 1: Write the failing restoration test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const catalogUrl = new URL("../../data/calculators.js", import.meta.url);
const registryUrl = new URL("../../components/tools/calculators/index.js", import.meta.url);

test("all 36 completed calculators are present and registered", async () => {
  assert.equal(existsSync(catalogUrl), true, "calculator catalog must be restored");
  assert.equal(existsSync(registryUrl), true, "calculator component registry must be restored");

  const { calculators } = await import(catalogUrl.href);
  const registrySource = readFileSync(registryUrl, "utf8");
  const componentFiles = (await readdir(new URL("../../components/tools/calculators/", import.meta.url)))
    .filter((name) => name.endsWith(".js") && name !== "index.js");

  assert.equal(calculators.length, 36);
  assert.equal(new Set(calculators.map(({ slug }) => slug)).size, 36);
  assert.equal(componentFiles.length, 36);
  for (const { slug } of calculators) {
    assert.match(registrySource, new RegExp(`["]${slug}["]\\s*:`), `${slug} must be registered`);
  }
});

test("restored utility modules retain representative behavior", async () => {
  const unitsUrl = new URL("../../lib/units.js", import.meta.url);
  const resistorUrl = new URL("../../lib/resistorColors.js", import.meta.url);
  const numbersUrl = new URL("../../lib/numberSystems.js", import.meta.url);
  assert.equal(existsSync(unitsUrl), true);
  assert.equal(existsSync(resistorUrl), true);
  assert.equal(existsSync(numbersUrl), true);

  const [{ formatEngineering }, { formatOhms }, numbers] = await Promise.all([
    import(unitsUrl.href), import(resistorUrl.href), import(numbersUrl.href)
  ]);
  assert.equal(formatEngineering(0.000001, "F"), "1 µF");
  assert.equal(formatOhms(4700), "4.7 kΩ");
  assert.equal(numbers.toBinaryString(10, 8), "00001010");
  assert.equal(numbers.twosComplement(1, 8), 255);
  assert.equal(numbers.asciiToHex("Hi"), "48 69");
  assert.equal(numbers.hexToAscii("48 69"), "Hi");
});
```

- [ ] **Step 2: Run the restoration test and verify red**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: FAIL with `calculator catalog must be restored`.

- [ ] **Step 3: Migrate the focused feature files with `apply_patch`**

Read each source from `D:\work\portflioWebsite` and add the same implementation under `D:\work\portflioWebsite\myPortfolio`. Preserve every existing `"use client"` directive and `@/lib/*` import. Do not copy `app/layout.js`, `app/globals.css`, or any unrelated outer-workspace file.

The migrated registry must contain these exact 36 keys:

```text
ohms-law-calculator
resistor-color-code-calculator
5-band-resistor-color-code-calculator
series-resistor-calculator
parallel-resistor-calculator
voltage-divider-calculator
rc-time-constant-calculator
555-timer-astable-circuit-calculator
555-timer-monostable-circuit-calculator
capacitive-reactance-calculator
led-series-resistor-calculator
battery-life-calculator
rms-voltage-calculator
high-pass-filter-calculator
low-pass-filter-calculator
op-amp-gain-calculator
capacitor-code-value-converter
capacitance-conversion
temperature-conversion
decimal-binary-octal-hex-converter
binary-bit-shift-calculator
ones-1s-complement-calculator
twos-2s-complement-calculator
ascii-to-hex-converter
hex-to-ascii-converter
log-base-2-calculator
binary-calculator
hex-calculator
acceleration-calculator
force-mass-acceleration-calculator
speed-distance-time-calculator
wavelength-calculator
frequency-to-period-calculator
percentage-change-calculator
square-root-calculator
cube-root-calculator
```

- [ ] **Step 4: Run the restoration and existing domain tests**

Run: `node --test tests/tools/calculator-restoration.test.js tests/tools/battery-math.test.js tests/tools/pid-engine.test.js tests/tools/sensor-generator.test.js`

Expected: all tests PASS with 36 unique catalog entries, files, and registry keys.

- [ ] **Step 5: Commit the focused calculator module**

```powershell
git add -- tests/tools/calculator-restoration.test.js data/calculators.js lib/tools.js lib/units.js lib/resistorColors.js lib/numberSystems.js components/tools/CalculatorUI.js components/tools/calculators components/tools/diagrams
git commit -m "feat: restore electronics calculator module"
```

---

### Task 3: Add static calculator pages and the unified Tools hub

**Files:**
- Modify: `tests/tools/calculator-restoration.test.js`
- Create from the completed outer workspace: `components/tools/ToolsIndex.js`
- Create from the completed outer workspace: `components/tools/ToolCard.js`
- Create from the completed outer workspace, with copy adapted to the unified hub: `components/tools/CalculatorShell.js`
- Create from the completed outer workspace: `app/tools/[slug]/page.js`
- Modify: `app/tools/page.tsx`

**Interfaces:**
- Consumes: `engineeringTools`, `getAllTools`, `getTool`, `CALCULATOR_COMPONENTS`, and `absoluteUrl`.
- Produces: 36 statically generated `/tools/<slug>/` routes and one Tools hub with featured and searchable sections.

- [ ] **Step 1: Extend the restoration test with route and hub contracts**

```js
test("the Tools hub retains advanced tools and exposes the calculator index", () => {
  const hub = readFileSync(new URL("../../app/tools/page.tsx", import.meta.url), "utf8");
  assert.match(hub, /engineeringTools/);
  assert.match(hub, /getAllTools/);
  assert.match(hub, /Featured Engineering Workbenches/);
  assert.match(hub, /Electronics Calculators/);
  assert.match(hub, /<ToolsIndex tools=\{calculators\}/);
});

test("the calculator route statically generates catalog slugs", () => {
  const routeUrl = new URL("../../app/tools/[slug]/page.js", import.meta.url);
  assert.equal(existsSync(routeUrl), true, "dynamic calculator route must exist");
  const route = readFileSync(routeUrl, "utf8");
  assert.match(route, /generateStaticParams/);
  assert.match(route, /dynamicParams\s*=\s*false/);
  assert.match(route, /CALCULATOR_COMPONENTS\[tool\.slug\]/);
  assert.match(route, /if \(!Calculator\) notFound\(\)/);
});
```

- [ ] **Step 2: Run the expanded test and verify red**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: FAIL because the hub has no calculator index and `app/tools/[slug]/page.js` does not exist.

- [ ] **Step 3: Add calculator navigation and static detail routes**

Migrate `ToolsIndex.js`, `ToolCard.js`, and `[slug]/page.js` unchanged except for formatting. Adapt `CalculatorShell.js` back-link copy to the unified destination:

```jsx
<Link className="article-back" href="/tools">
  ← All engineering tools
</Link>
```

- [ ] **Step 4: Compose the unified Tools page**

Update `app/tools/page.tsx` to keep `engineeringTools.map(...)` in the first section and render all restored calculators in the second:

```tsx
import { engineeringTools } from "@/data/tools";
import { getAllTools } from "@/lib/tools";
import { ToolsIndex } from "@/components/tools/ToolsIndex";

export default function ToolsIndexPage() {
  const calculators = getAllTools();
  return (
    <>
      <section className="section shell tool-page tools-featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured Engineering Workbenches</p>
            <h1>Built to be used, not just demoed.</h1>
            <p className="section-intro">Advanced generators, simulators, and guided engineering workbenches.</p>
          </div>
        </div>
        <div className="project-grid">
          {engineeringTools.map((tool, index) => (
            <ToolNavCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </section>
      <section className="section shell tools-calculator-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Electronics Calculators</p>
            <h2>Bench formulas, ready when you need them.</h2>
            <p className="section-intro">Search 36 interactive calculators for circuits, components, number systems, and engineering math.</p>
          </div>
        </div>
        <ToolsIndex tools={calculators} />
      </section>
    </>
  );
}
```

Retain metadata describing both the five advanced tools and the 36 calculators.

- [ ] **Step 5: Run the focused test and production build**

Run: `node --test tests/tools/calculator-restoration.test.js`

Expected: PASS.

Run: `npm run build`

Expected: PASS and `out/tools/<each-calculator-slug>/index.html` exists for all 36 catalog records.

- [ ] **Step 6: Commit the route and hub integration**

```powershell
git add -- tests/tools/calculator-restoration.test.js components/tools/ToolsIndex.js components/tools/ToolCard.js components/tools/CalculatorShell.js app/tools/[slug]/page.js app/tools/page.tsx
git commit -m "feat: unify advanced tools and calculators"
```

---

### Task 4: Adapt calculator styling and add browser regressions

**Files:**
- Modify: `app/game-theme.css`
- Create: `tests/tools/calculator-theme.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: calculator classes emitted by `ToolsIndex`, `ToolCard`, `CalculatorShell`, `CalculatorUI`, diagrams, and all calculator components.
- Produces: responsive, non-overlapping calculator hub/detail layouts using the active pixel-console color and spacing tokens.

- [ ] **Step 1: Write the failing calculator-theme contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("calculator layouts use the active theme and collapse to one column", async () => {
  const css = await readFile(new URL("../../app/game-theme.css", import.meta.url), "utf8");
  assert.match(css, /\.tools-calculator-section/);
  assert.match(css, /\.calculator-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.match(css, /\.calculator-field-input/);
  assert.match(css, /\.calculator-results/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.calculator-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
```

- [ ] **Step 2: Extend the browser test before adding styles**

Add representative calculator routes to `ROUTES`:

```js
"/tools/ohms-law-calculator/",
"/tools/resistor-color-code-calculator/",
"/tools/555-timer-astable-circuit-calculator/",
"/tools/decimal-binary-octal-hex-converter/",
```

Extend the in-page evaluation to report visible mission UI and calculator containment:

```js
const missionRail = document.querySelector(".mission-rail");
const missionReadout = document.querySelector(".mobile-mission-readout");
const visible = (el) => Boolean(el) && getComputedStyle(el).display !== "none";
const hasMissionSections = document.querySelectorAll("[data-mission]").length > 0;
const unexpectedMissionUi = !hasMissionSections && (visible(missionRail) || visible(missionReadout));
const toolBody = document.querySelector(".tool-body");
const toolBodyRect = toolBody?.getBoundingClientRect() ?? null;
const toolBodyOutsideViewport = Boolean(toolBodyRect) &&
  (toolBodyRect.left < -1 || toolBodyRect.right > document.documentElement.clientWidth + 1);
return { overflowPx, worstSelector, worstRight, unexpectedMissionUi, toolBodyOutsideViewport };
```

Record either Boolean as a failure with route and viewport context.

- [ ] **Step 3: Run the theme and browser tests and verify red**

Run: `node --test tests/tools/calculator-theme.test.js`

Expected: FAIL because the current theme has no calculator layout selectors.

Run: `node --test tests/tools/site-responsive.test.js`

Expected: FAIL on at least one restored calculator layout before the calculator-specific theme styles are present, or on unexpected mission UI if Task 1 regressed.

- [ ] **Step 4: Add calculator styles adapted to the current theme**

Append focused selectors to `app/game-theme.css` for:

```css
.tools-featured-section,
.tools-calculator-section,
.tool-header,
.tool-body,
.tool-credit,
.tool-section,
.tool-mnemonic,
.tool-example,
.calculator-panel,
.calculator-grid,
.calculator-field,
.calculator-field-input,
.calculator-results,
.calculator-result,
.swatch-row,
.swatch,
.tool-diagram,
.resistor-preview
```

Use `var(--panel)`, `var(--ink)`, `var(--muted)`, `var(--pixel-cyan)`, `var(--pixel-green)`, `var(--line)`, and `var(--pixel-shadow)`. At `max-width: 760px`, set `.calculator-grid { grid-template-columns: 1fr; }`, reduce panel padding, and allow long worked-example lines to scroll inside their own container. Do not alter existing advanced-tool component styles.

- [ ] **Step 5: Run responsive, focused, and build verification**

Run: `node --test tests/tools/site-responsive.test.js tests/tools/calculator-restoration.test.js tests/tools/calculator-theme.test.js tests/tools/mission-rail-visibility.test.js`

Expected: all tests PASS with no overflow, no non-home mission UI, and contained calculator bodies.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit styling and browser coverage**

```powershell
git add -- app/game-theme.css tests/tools/calculator-theme.test.js tests/tools/site-responsive.test.js
git commit -m "style: integrate calculator hub responsively"
```

---

### Task 5: Full verification, deployment commit, push, and live check

**Files:**
- Preserve and include the user's existing changes: `data/ambient.js`, `data/portfolio.ts`, `lib/content.ts`, `lib/site.ts`, `next.config.mjs`, `public/.nojekyll`, `tests/tools/github-pages-export.test.js`.
- Modify only if verification identifies a directly related failure.

**Interfaces:**
- Consumes: completed Tasks 1–4 and the existing authenticated `origin` remote.
- Produces: verified `main` commits pushed to `https://github.com/ahmed-ibrahim-asl/myPortfolio` and a live GitHub Pages deployment under `/myPortflio`.

- [ ] **Step 1: Review the complete diff and confirm scope**

Run:

```powershell
git status --short
git diff --check
git diff --stat HEAD
```

Expected: only calculator restoration, mission visibility, approved Tools hub work, design/plan documentation, and the pre-existing GitHub Pages corrections are present.

- [ ] **Step 2: Run the complete verification suite**

Run: `npm run validate:content`

Expected: PASS.

Run: `npm test`

Expected: PASS with zero failing Node tests.

Run: `npm run build`

Expected: PASS.

Run: `node --test tests/tools/github-pages-export.test.js`

Expected: PASS, including `out/.nojekyll` and the `/myPortflio` base-path build.

- [ ] **Step 3: Verify generated calculator files directly**

Run this PowerShell check:

```powershell
$slugs = node --input-type=module -e "import('./data/calculators.js').then(({calculators}) => console.log(calculators.map(({slug}) => slug).join([char]10)))"
$missing = $slugs | Where-Object { -not (Test-Path (Join-Path 'out/tools' "$_/index.html")) }
if ($missing) { throw "Missing calculator exports: $($missing -join ', ')" }
```

Expected: no output and exit code 0.

- [ ] **Step 4: Commit the preserved GitHub Pages corrections**

```powershell
git add -- data/ambient.js data/portfolio.ts lib/content.ts lib/site.ts next.config.mjs public/.nojekyll tests/tools/github-pages-export.test.js
git commit -m "fix: align GitHub Pages export path"
```

If those files were already committed by the user before this step, do not create an empty commit.

- [ ] **Step 5: Push the verified main branch**

Run: `git push origin main`

Expected: authenticated push succeeds and `origin/main` advances to local `HEAD`.

- [ ] **Step 6: Poll and verify the public deployment**

Check these URLs until GitHub Pages serves the pushed build:

```text
https://ahmed-ibrahim-asl.github.io/myPortflio/tools/
https://ahmed-ibrahim-asl.github.io/myPortflio/tools/ohms-law-calculator/
https://ahmed-ibrahim-asl.github.io/myPortflio/tools/555-timer-astable-circuit-calculator/
```

Expected: the hub contains both section headings and all 36 calculator cards; representative calculator URLs return HTTP 200; no mission rail/readout appears on Tools routes at 1440px; the homepage still shows mission navigation.

- [ ] **Step 7: Report exact verification and deployment evidence**

Report test counts, build status, pushed commit SHA, live HTTP statuses, and any remaining GitHub Actions propagation delay without making unsupported completion claims.
