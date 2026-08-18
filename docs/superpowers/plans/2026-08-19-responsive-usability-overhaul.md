# Responsive Usability Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Balanced Workspace redesign, static portrait, lower text density, and full-card interaction across desktop, tablet, and phone, then publish it to GitHub Pages.

**Architecture:** Preserve the existing Next.js static-export and generator state logic. Replace the shared animated portrait scene with a static component, standardize semantic destination/choice cards, simplify Model Mission presentation without changing generation behavior, and enforce readability through shared CSS tokens plus focused tool overrides.

**Tech Stack:** Next.js 16.3.1, React 19.2.7, TypeScript 6, CSS Modules, global CSS, Node test runner, Chrome DevTools Protocol responsive tests, GitHub Pages static export.

## Global Constraints

- Reading text is at least 16px; utility labels may be 14px with strong contrast and spacing.
- Inputs use at least 16px text; all actionable targets are at least 44 by 44 CSS pixels.
- Wide desktop is above 1100px; tablet/small laptop is 640–1100px; phone is below 640px; 320px remains supported.
- Destination cards use one semantic link; choice cards use one semantic button; non-action cards stay non-clickable.
- Home and About show only Ahmed's existing portrait with no `PixelWorld`, bench image, connector, scene label, or animation.
- Generator state survives Configure/Code tab changes and viewport changes.
- No page-level horizontal overflow at 1440px, 1024px, 768px, 390px, or 320px.

---

### Task 1: Static portrait and global responsive foundation

**Files:**
- Create: `components/ProfilePortrait.tsx`
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/site-responsive.test.js`
- Create: `tests/tools/responsive-usability-contract.test.js`
- Delete: `components/EngineeringImagePair.tsx`

**Interfaces:**
- Produces: `ProfilePortrait({ context }: { context: "home" | "about" })`.
- Produces: `.profile-portrait`, `.profile-portrait--home`, and `.profile-portrait--about` styling hooks.
- Consumes: `profile.portrait` and `profile.name` from `data/portfolio`.

- [ ] **Step 1: Write the failing portrait contract test**

```js
test("Home and About use one static portrait without the engineering scene", () => {
  const home = read("app/page.tsx");
  const about = read("app/about/page.tsx");
  const portrait = read("components/ProfilePortrait.tsx");
  assert.match(home, /ProfilePortrait context="home"/);
  assert.match(about, /ProfilePortrait context="about"/);
  assert.doesNotMatch(home, /PixelWorld|EngineeringImagePair/);
  assert.doesNotMatch(about, /EngineeringImagePair/);
  assert.match(portrait, /profile\.portrait/);
  assert.doesNotMatch(portrait, /hardware_bench|engineering-image-signal|ENGINEER/);
});
```

- [ ] **Step 2: Run the portrait contract and verify RED**

Run: `node --test tests/tools/responsive-usability-contract.test.js`

Expected: FAIL because `components/ProfilePortrait.tsx` and its imports do not exist.

- [ ] **Step 3: Implement the static portrait**

```tsx
import { profile } from "@/data/portfolio";

export function ProfilePortrait({ context }: { context: "home" | "about" }) {
  return (
    <figure className={`profile-portrait profile-portrait--${context}`}>
      <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
    </figure>
  );
}
```

Replace both `EngineeringImagePair` usages, remove the Home `PixelWorld`, delete the obsolete component, and remove `.engineering-image-*` and `engineering-signal` rules. Add a simple frame with `object-fit: cover`, `object-position: center top`, no generated label, and no animation.

- [ ] **Step 4: Expand responsive browser assertions**

```js
const portraits = document.querySelectorAll(".profile-portrait img").length;
const removedScenes = document.querySelectorAll(
  ".pixel-world, .engineering-image-frame--bench, .engineering-image-signal"
).length;
```

Require `portraits === 1` and `removedScenes === 0` on `/` and `/about/` at 1440px, 768px, and 390px.

- [ ] **Step 5: Add shared readability and target floors**

```css
:root {
  --font-size-body: 1rem;
  --font-size-reading: 1.0625rem;
  --font-size-ui: 0.875rem;
  --target-size: 44px;
}

button,
input,
select,
textarea,
a {
  min-height: var(--target-size);
}

input,
select,
textarea {
  font-size: 1rem;
}
```

Keep inline links exempt from forced block sizing by scoping the target rule to navigation, buttons, controls, and card links rather than article prose links.

- [ ] **Step 6: Verify GREEN and commit**

Run:

```powershell
node --test tests/tools/responsive-usability-contract.test.js
npx tsc --noEmit
git add components/ProfilePortrait.tsx app/page.tsx app/about/page.tsx app/game-theme.css tests/tools/site-responsive.test.js tests/tools/responsive-usability-contract.test.js components/EngineeringImagePair.tsx
git commit -m "feat: restore static portrait and responsive foundations"
```

Expected: contract test passes and TypeScript exits 0.

---

### Task 2: Full-card interaction and concise catalogs

**Files:**
- Modify: `components/tools/ToolCard.js`
- Modify: `components/PostCard.tsx`
- Modify: `components/tools/ToolNavCard.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/responsive-usability-contract.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: calculator `slug`, post `slug`, and tool `href`.
- Produces: `.card-link` and `.card-button` focus/hover/active behavior.
- Produces: one destination anchor per destination card with no nested interactive children.

- [ ] **Step 1: Write failing semantic-card contracts**

```js
test("destination cards expose one full-surface semantic link", () => {
  const calculator = read("components/tools/ToolCard.js");
  const post = read("components/PostCard.tsx");
  const tool = read("components/tools/ToolNavCard.tsx");
  assert.match(calculator, /<Link[^>]+className="calculator-catalog-card card-link"/s);
  assert.match(post, /<Link[^>]+className=.*post-card.*card-link/s);
  assert.match(tool, /<Link[^>]+className="project-card card-link"/s);
});

test("calculator catalog removes repetitive tag rows", () => {
  assert.doesNotMatch(read("components/tools/ToolCard.js"), /tool\.tags/);
});
```

- [ ] **Step 2: Run the card contracts and verify RED**

Run: `node --test tests/tools/responsive-usability-contract.test.js`

Expected: FAIL because calculator, post, and tool cards are still article wrappers with title-only links.

- [ ] **Step 3: Convert destination cards to full links**

```jsx
export function ToolCard({ tool, index }) {
  return (
    <Link className="calculator-catalog-card card-link" href={`/tools/${tool.slug}/`}>
      <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} />
      <div className="calculator-catalog-copy">
        <div className="post-meta"><span>{String(index + 1).padStart(2, "0")} / {tool.category}</span></div>
        <h3>{tool.title}</h3>
        <p>{tool.summary}</p>
      </div>
    </Link>
  );
}
```

Apply the same one-link wrapper pattern to `PostCard` and `ToolNavCard`. Preserve text selection on non-destination `ProjectCard` instances.

- [ ] **Step 4: Add concise card styling and responsive grids**

```css
.card-link { color: inherit; text-decoration: none; cursor: pointer; }
.card-link:focus-visible { outline: 3px solid var(--pixel-green); outline-offset: 4px; }
.calculator-catalog-copy > p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
```

Keep calculator grids at 3 columns above 1080px, 2 columns through tablet, and 1 column below 600px.

- [ ] **Step 5: Verify full-surface behavior in the browser test**

Capture each relevant card's bounding rectangle and anchor rectangle, and require equal left/right/top/bottom edges within one pixel. Require keyboard focusability and a non-empty `href`.

- [ ] **Step 6: Verify GREEN and commit**

Run:

```powershell
node --test tests/tools/responsive-usability-contract.test.js
npx tsc --noEmit
git add components/tools/ToolCard.js components/PostCard.tsx components/tools/ToolNavCard.tsx app/game-theme.css tests/tools/responsive-usability-contract.test.js tests/tools/site-responsive.test.js
git commit -m "feat: make destination cards fully interactive"
```

Expected: contracts pass and TypeScript exits 0.

---

### Task 3: Reduce Model Mission text density

**Files:**
- Modify: `components/tools/model-mission/TaskChooser.tsx`
- Modify: `components/tools/model-mission/MissionStepPanel.tsx`
- Modify: `components/tools/model-mission/ModelMissionShell.tsx`
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `tests/tools/model-mission-responsive.test.js`
- Modify: `tests/tools/responsive-usability-contract.test.js`

**Interfaces:**
- Consumes: `MODEL_MISSION_TASKS`, selected task id, and `onChoose(taskId)`.
- Produces: one compact semantic task button per task and one `.selectedTaskDetail` region for examples.
- Preserves: reducer actions and generated project configuration.

- [ ] **Step 1: Write failing density contracts**

```js
test("Model Mission task cards defer examples to one selected detail region", () => {
  const source = read("components/tools/model-mission/TaskChooser.tsx");
  assert.match(source, /selectedTaskDetail/);
  assert.doesNotMatch(source, /className=\{styles\.taskExamples\}/);
});

test("learning mode labels stay concise", () => {
  const source = read("components/tools/model-mission/ModelMissionShell.tsx");
  assert.match(source, /\["guided", "Guided", "Safe defaults"\]/);
  assert.match(source, /\["customize", "Customize", "More choices"\]/);
  assert.match(source, /\["advanced", "Advanced", "Production controls"\]/);
});
```

- [ ] **Step 2: Run density contracts and verify RED**

Run: `node --test tests/tools/responsive-usability-contract.test.js`

Expected: FAIL because examples are repeated inside every task card and mode descriptions are long.

- [ ] **Step 3: Implement compact task cards and selected detail**

```tsx
const selectedTask = MODEL_MISSION_TASKS.find((task) => task.id === selectedTaskId);

// Each button retains order, title, technical term, and one description only.
{selectedTask ? (
  <aside className={styles.selectedTaskDetail} aria-live="polite">
    <strong>Examples for {selectedTask.title}</strong>
    <div className={styles.exampleList}>
      {selectedTask.examples.map((example) => <span key={example}>{example}</span>)}
    </div>
  </aside>
) : null}
```

Remove modality and repeated example blocks from each task button. Shorten the three mode descriptions exactly as asserted.

- [ ] **Step 4: Tighten the primary hierarchy**

Reduce task card minimum height, keep 16px main copy, and style the selected-detail aside below the task grid. Keep the current question heading and selected state more prominent than supporting text.

- [ ] **Step 5: Extend Model Mission browser assertions**

Require:

```js
assert.equal(taskButtons.every(({ minHeight }) => minHeight >= 44), true);
assert.equal(document.querySelectorAll("[data-mission-task-examples]").length, 0);
assert.equal(document.querySelectorAll("[data-selected-task-detail]").length, 1);
```

- [ ] **Step 6: Verify GREEN and commit**

Run:

```powershell
node --test tests/tools/responsive-usability-contract.test.js tests/tools/model-mission-responsive.test.js
npx tsc --noEmit
git add components/tools/model-mission/TaskChooser.tsx components/tools/model-mission/MissionStepPanel.tsx components/tools/model-mission/ModelMissionShell.tsx components/tools/model-mission/ModelMission.module.css tests/tools/model-mission-responsive.test.js tests/tools/responsive-usability-contract.test.js
git commit -m "feat: simplify Model Mission decisions"
```

Expected: density and responsive tests pass.

---

### Task 4: Implement the Balanced Workspace breakpoints

**Files:**
- Modify: `components/tools/model-mission/ModelMission.module.css`
- Modify: `components/tools/model-mission/MissionCodePanel.tsx`
- Modify: `tests/tools/model-mission-responsive.test.js`

**Interfaces:**
- Consumes: existing `workspaceTab` state and `set-workspace-tab` reducer action.
- Produces: two visible workspace panels above 1100px and one tab-selected panel at or below 1100px.
- Preserves: generated code, warnings, errors, dependencies, copy, and download behavior.

- [ ] **Step 1: Write failing breakpoint assertions**

At 1440px assert Configure and Code are both visible and tabs are hidden. At 1024px, 768px, 390px, and 320px assert tabs are visible, exactly one panel is visible, and switching to Code preserves the chosen task and generated filename.

```js
assert.equal(desktop.tabsVisible, false);
assert.equal(desktop.visibleWorkspacePanels, 2);
assert.equal(tablet.tabsVisible, true);
assert.equal(tablet.visibleWorkspacePanels, 1);
assert.equal(tablet.taskBefore, tablet.taskAfter);
```

- [ ] **Step 2: Run responsive Model Mission test and verify RED**

Run: `node --no-warnings --test tests/tools/model-mission-responsive.test.js`

Expected: FAIL at 1024px because the current tab breakpoint is 960px.

- [ ] **Step 3: Move the tab breakpoint to 1100px and rebalance columns**

```css
.workspace { grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr); }

@media (max-width: 1100px) {
  .mobileTabs { display: grid; }
  .workspace { grid-template-columns: minmax(0, 1fr); }
  .workspace[data-mobile-active="configure"] .codeWorkspace,
  .workspace[data-mobile-active="code"] .configurePanel { display: none; }
}
```

Remove the duplicate 960px ownership of this behavior. Keep smaller breakpoints for padding and one-column control groups.

- [ ] **Step 4: Separate code panel regions visually**

Wrap dependencies, summary, and source in `.codeSection` regions with concise headings. Keep all existing conditional rendering and button handlers unchanged.

```tsx
<section className={styles.codeSection} aria-labelledby="generated-source-title">
  <h3 id="generated-source-title">Generated source</h3>
  <pre className={styles.code}><code>{result?.code}</code></pre>
</section>
```

- [ ] **Step 5: Verify GREEN and commit**

Run:

```powershell
node --no-warnings --test tests/tools/model-mission-responsive.test.js
node --test tests/tools/model-mission-state.test.js tests/tools/model-mission-generated-code.test.js
npx tsc --noEmit
git add components/tools/model-mission/ModelMission.module.css components/tools/model-mission/MissionCodePanel.tsx tests/tools/model-mission-responsive.test.js
git commit -m "feat: add balanced responsive Model Mission workspace"
```

Expected: breakpoint, state, generated-code, and TypeScript checks pass.

---

### Task 5: Remaining tool readability and responsive polish

**Files:**
- Modify: `components/tools/security-mission/SecurityMission.module.css`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/security-mission-responsive.test.js`
- Modify: `tests/tools/site-responsive.test.js`
- Modify: `tests/tools/responsive-usability-contract.test.js`

**Interfaces:**
- Produces: 14px minimum utility copy and 16px reading/control copy inside Security Mission, Embedded Code Workbench, calculators, PID, battery, and shared tool shells.
- Preserves: tool calculation, code generation, filtering, and security-command behavior.

- [ ] **Step 1: Write failing tool-floor browser assertions**

For representative routes, collect visible interactive controls and readable paragraphs:

```js
const controls = [...document.querySelectorAll("button, input, select, textarea")]
  .filter(visible)
  .map((element) => ({
    fontSize: parseFloat(getComputedStyle(element).fontSize),
    height: element.getBoundingClientRect().height,
  }));
const bodyCopy = [...document.querySelectorAll("main p, main label")]
  .filter(visible)
  .map((element) => parseFloat(getComputedStyle(element).fontSize));
```

Require controls at least 14px and 44px high, inputs at least 16px, and reading paragraphs at least 16px.

- [ ] **Step 2: Run representative responsive tests and verify RED**

Run:

```powershell
node --no-warnings --test tests/tools/security-mission-responsive.test.js
node --test tests/tools/responsive-usability-contract.test.js
```

Expected: FAIL because Security Mission contains many 0.54–0.79rem controls and labels.

- [ ] **Step 3: Add focused Security Mission readability overrides**

```css
.root button,
.root input,
.root select,
.root textarea,
.root label,
.root small {
  font-size: 0.875rem;
}

.root input,
.root select,
.root textarea {
  min-height: 44px;
  font-size: 1rem;
}

.root p {
  font-size: 1rem;
  line-height: 1.6;
}
```

Add more specific later selectors for nested button spans where existing selectors would otherwise win. Do not enlarge code tokens that are intentionally horizontally scrollable.

- [ ] **Step 4: Apply shared tool floors and overflow safeguards**

```css
.tool-shell button,
.embedded-workbench button,
.calculator-shell button { min-height: 44px; font-size: 0.875rem; }

.tool-input input,
.tool-input select,
.tool-input textarea,
.embedded-workbench input,
.embedded-workbench select { font-size: 1rem; }
```

Keep code output at 14px minimum with internal horizontal scrolling and `min-width: 0` on all grid children.

- [ ] **Step 5: Verify GREEN and commit**

Run:

```powershell
node --no-warnings --test tests/tools/security-mission-responsive.test.js
node --test tests/tools/responsive-usability-contract.test.js
npx tsc --noEmit
git add components/tools/security-mission/SecurityMission.module.css app/game-theme.css tests/tools/security-mission-responsive.test.js tests/tools/site-responsive.test.js tests/tools/responsive-usability-contract.test.js
git commit -m "feat: improve tool readability across devices"
```

Expected: representative tool floors and TypeScript checks pass.

---

### Task 6: Full verification and GitHub Pages publication

**Files:**
- Verify: all changed source and tests
- Publish: generated `out/` contents to remote `main`

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: remote `source` branch with source commits and remote `main` with the static Pages artifact.

- [ ] **Step 1: Run the full verification suite**

```powershell
npm test
npx tsc --noEmit
npm audit --omit=dev --audit-level=high
$env:GITHUB_ACTIONS='true'; npm run build
```

Expected: zero test failures, TypeScript exit 0, zero high-severity production vulnerabilities, and successful static export.

- [ ] **Step 2: Run responsive browser verification**

Start the local site and run the responsive route suites at 1440px, 1024px, 768px, 390px, and 320px. Inspect Home, About, Tools, Model Mission, Embedded Code Workbench, Security Mission, Contact, and one calculator. Confirm no page-level horizontal overflow and no browser console errors.

- [ ] **Step 3: Review the final diff**

```powershell
git status --short
git diff HEAD~5 --check
git log -8 --oneline
```

Expected: only scoped UX changes and plan/spec documents are present; `.superpowers/` is not staged.

- [ ] **Step 4: Push source and publish the static export**

```powershell
git push origin main:source
```

Create a verified temporary worktree from `origin/main`, replace only that worktree's tracked Pages artifact with the newly generated `out/`, verify file hashes match, commit the artifact, push it to `origin/main`, and remove the temporary worktree.

- [ ] **Step 5: Verify the live deployment**

Request `/`, `/about/`, `/tools/`, `/tools/ai-script-generator/`, `/tools/sensor-code-generator/`, `/tools/security-command-builder/`, `/contact/`, `/sitemap.xml`, and `/llms.txt` from the public GitHub Pages URL. Require HTTP 200 and inspect the updated portrait, full-card catalog, and Balanced Workspace markers before reporting completion.
