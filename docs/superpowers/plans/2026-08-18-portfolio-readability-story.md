# Portfolio Readability and Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the global readability and cropping defects, rebuild Contact, and redesign Home and About around a balanced two-image story and a prominent free-tools hook.

**Architecture:** Add small shared presentation components for indexed badges and paired imagery, keep responsive styling in `game-theme.css`, and preserve factual portfolio data. Page metadata will opt out of the root title suffix while retaining author and Open Graph identity.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS, Node test runner, Chrome DevTools Protocol responsive tests.

## Global Constraints

- Preserve the dark engineering-console identity, cyan/green accents, square borders, and reduced-motion support.
- Required body copy never renders below 16px; ordinary desktop reading copy targets 17px.
- Required UI labels and buttons target 14px or larger and interactive targets remain at least 44×44px.
- Remove arrow glyphs from primary CTAs, Contact rows, post cards, and tool cards.
- Use only existing factual images and portfolio claims.
- Preserve the `/myPortflio` static export and canonical URLs.
- Do not append `Ahmed Asl` automatically to every browser title.

---

## File map

- Create `components/IndexedBadge.tsx`: reusable centered `L` plus two-digit badge.
- Create `components/EngineeringImagePair.tsx`: accessible professional-portrait and hardware-bench image pair.
- Create `components/FreeToolsHook.tsx`: factual Home-page tools promotion.
- Modify `components/PostCard.tsx`: use `IndexedBadge`, remove duplicate arrow link.
- Modify `app/contact/page.tsx`: remove arrow glyphs and simplify direct-contact rows.
- Modify `app/page.tsx`: balanced hero, two-image pair, tools CTA and hook, arrow-free CTAs.
- Modify `app/about/page.tsx`: image-led editorial introduction and concise story blocks.
- Modify `app/layout.tsx`: remove global title template.
- Modify `lib/seo.ts`: retain site identity in Open Graph without browser-title suffixing.
- Modify page metadata declarations in `app/about/page.tsx`, `app/contact/page.tsx`, and `app/tools/page.tsx`.
- Modify `app/game-theme.css`: shared readable tokens, badge, form, image-pair, hero, About, and responsive rules.
- Create `tests/tools/portfolio-readability.test.js`: structural and metadata regression contracts.
- Modify `tests/tools/site-responsive.test.js`: Home/About/Contact layout, no-overflow, and no-wrap assertions.

### Task 1: Readable shared tokens and uncropped indexed badges

**Files:**
- Create: `components/IndexedBadge.tsx`
- Modify: `components/PostCard.tsx`
- Modify: `components/tools/ToolCard.js`
- Modify: `app/game-theme.css`
- Test: `tests/tools/portfolio-readability.test.js`

**Interfaces:**
- Produces: `IndexedBadge({ index, prefix? }: { index: number | string; prefix?: string }): JSX.Element`.
- Consumes: `index` values from Post and Tool cards.

- [ ] **Step 1: Write the failing structural tests**

```js
test("indexed cards use one centered badge and no arrow-only link", async () => {
  const [badge, post, tool, css] = await Promise.all([
    read("components/IndexedBadge.tsx"),
    read("components/PostCard.tsx"),
    read("components/tools/ToolCard.js"),
    read("app/game-theme.css"),
  ]);
  assert.match(badge, /indexed-badge-prefix/);
  assert.match(badge, /indexed-badge-number/);
  assert.doesNotMatch(post, /post-arrow/);
  assert.doesNotMatch(tool, /post-arrow/);
  assert.match(css, /\.indexed-badge[^{]*\{[^}]*width:\s*52px[^}]*height:\s*52px/s);
  assert.match(css, /\.indexed-badge[^{]*\{[^}]*place-items:\s*center/s);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

Expected: FAIL because `IndexedBadge.tsx` does not exist and cards still render `post-arrow`.

- [ ] **Step 3: Implement the badge and simplify card destinations**

```tsx
export function IndexedBadge({
  index,
  prefix = "L",
}: {
  index: number | string;
  prefix?: string;
}) {
  const number = typeof index === "number" ? index + 1 : Number(index);
  return (
    <span className="indexed-badge mono" aria-hidden="true">
      <span className="indexed-badge-prefix">{prefix}</span>
      <span className="indexed-badge-number">
        {String(Number.isFinite(number) ? number : index).padStart(2, "0")}
      </span>
    </span>
  );
}
```

Use the badge in both card implementations. Keep the title as the only destination and delete the arrow-only link.

- [ ] **Step 4: Add the readable shared CSS floor**

```css
:root {
  --text-reading: 1.0625rem;
  --text-ui: 0.875rem;
  --text-label: 0.8125rem;
}

.indexed-badge {
  display: grid;
  width: 52px;
  height: 52px;
  color: #071018;
  background: var(--pixel-cyan);
  font-weight: 900;
  line-height: 1;
  place-items: center;
}

.indexed-badge-prefix,
.indexed-badge-number { display: block; text-align: center; }
```

Raise card metadata, filter, button, helper, tool-field, and body-copy sizes to use these tokens. Do not enlarge purely decorative HUD readouts that are not required for comprehension.

- [ ] **Step 5: Run focused tests and commit**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/calculator-restoration.test.js`

Expected: PASS.

```bash
git add components/IndexedBadge.tsx components/PostCard.tsx components/tools/ToolCard.js app/game-theme.css tests/tools/portfolio-readability.test.js
git commit -m "fix: improve shared readability and card badges"
```

### Task 2: Contact form spacing, readable links, and arrow removal

**Files:**
- Modify: `app/contact/page.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/portfolio-readability.test.js`

**Interfaces:**
- Consumes: existing `profile.email`, `profile.whatsapp`, `profile.cv`, and social records.
- Produces: semantic form fields and `.contact-method` links without glyph columns.

- [ ] **Step 1: Add failing Contact source contracts**

```js
test("contact fields have readable inset spacing and arrow-free labels", async () => {
  const [page, css] = await Promise.all([
    read("app/contact/page.tsx"),
    read("app/game-theme.css"),
  ]);
  assert.doesNotMatch(page, /↗|&rarr;|social-link-arrow/);
  assert.match(css, /\.contact-form label[^{]*\{[^}]*gap:\s*(10|12)px/s);
  assert.match(css, /\.contact-form :is\(input, textarea\)[^{]*\{[^}]*padding:\s*14px\s+16px/s);
  assert.match(css, /\.contact-form :is\(input, textarea\)[^{]*\{[^}]*font-size:\s*1rem/s);
});
```

- [ ] **Step 2: Run the Contact test and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

Expected: FAIL because the form fields have no explicit inset padding and arrows remain.

- [ ] **Step 3: Simplify Contact markup**

Replace each multi-span link with a single `.contact-method` label. Preserve target, `rel`, and accessible label attributes. Change the submit button to `Send your project brief` without a child glyph.

- [ ] **Step 4: Implement form and row layout**

```css
.contact-form label { display: grid; gap: 12px; }
.contact-form :is(input, textarea) {
  width: 100%;
  padding: 14px 16px;
  color: var(--ink);
  font-size: 1rem;
  line-height: 1.5;
  box-sizing: border-box;
}
.contact-form input { min-height: 54px; }
.contact-method { display: flex; min-height: 50px; align-items: center; white-space: nowrap; }
```

- [ ] **Step 5: Run tests and commit**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js`

Expected: PASS, including 375px containment.

```bash
git add app/contact/page.tsx app/game-theme.css tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js
git commit -m "fix: rebuild contact form spacing and links"
```

### Task 3: Natural browser titles without repeated name suffixes

**Files:**
- Modify: `app/layout.tsx`
- Modify: `lib/seo.ts`
- Modify: `app/about/page.tsx`
- Modify: `app/contact/page.tsx`
- Modify: `app/tools/page.tsx`
- Modify: `tests/tools/portfolio-readability.test.js`

**Interfaces:**
- Consumes: `createPageMetadata({ title, description, pathname })`.
- Produces: unsuffixed browser `title`, while `openGraph.siteName` and authors remain Ahmed Asl.

- [ ] **Step 1: Write the failing metadata test**

```js
test("page titles are natural while social metadata keeps site identity", async () => {
  const metadata = createPageMetadata({
    title: "Free Electronics, Embedded and AI Tools",
    description: "Useful tools.",
    pathname: "/tools/",
  });
  assert.equal(metadata.title, "Free Electronics, Embedded and AI Tools");
  assert.equal(metadata.openGraph.siteName, "Ahmed Asl");
  assert.doesNotMatch(await read("app/layout.tsx"), /template:\s*`%s \|/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

Expected: FAIL because the root metadata template still appends the name.

- [ ] **Step 3: Remove the root template and update intent titles**

Set root `title` to `siteConfig.title` rather than an object with `template`. Keep `socialTitle` in `createPageMetadata` for Open Graph/Twitter. Use:

- Tools: `Free Electronics, Embedded and AI Tools`
- About: `About — Embedded Systems, IoT and Teaching`
- Contact: `Start an Embedded or IoT Project`

- [ ] **Step 4: Run metadata tests and build**

Run: `node --test tests/tools/portfolio-readability.test.js && npm run build`

Expected: PASS and all pages export.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx lib/seo.ts app/about/page.tsx app/contact/page.tsx app/tools/page.tsx tests/tools/portfolio-readability.test.js
git commit -m "fix: use natural page titles"
```

### Task 4: Shared two-image engineering composition

**Files:**
- Create: `components/EngineeringImagePair.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/portfolio-readability.test.js`

**Interfaces:**
- Produces: `EngineeringImagePair({ portraitSrc, portraitAlt, contextSrc, contextAlt, priority? })`.
- Consumes: `profile.portrait` and `/images/hardware_bench_hero.jpg` through the existing base-path asset helper or a data field added to `profile`.

- [ ] **Step 1: Add a failing component contract**

```js
test("the engineering image pair uses two factual images and reduced-motion-safe classes", async () => {
  const source = await read("components/EngineeringImagePair.tsx");
  assert.match(source, /engineering-image-primary/);
  assert.match(source, /engineering-image-context/);
  assert.match(source, /portraitAlt/);
  assert.match(source, /contextAlt/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

- [ ] **Step 3: Implement the component**

```tsx
export function EngineeringImagePair(props: EngineeringImagePairProps) {
  return (
    <figure className="engineering-image-pair" data-motion="reveal">
      <img className="engineering-image-primary" src={props.portraitSrc} alt={props.portraitAlt} />
      <img className="engineering-image-context" src={props.contextSrc} alt={props.contextAlt} loading="lazy" />
      <figcaption>PORTRAIT / HARDWARE BENCH</figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: Add balanced responsive styling**

Use an overlapping 5:6 portrait and 16:10 bench image within a bounded 560px container. At 560px and below, reduce overlap but keep both images visible. In reduced-motion mode, remove transforms and transitions.

- [ ] **Step 5: Run and commit**

Run: `node --test tests/tools/portfolio-readability.test.js`

```bash
git add components/EngineeringImagePair.tsx app/game-theme.css tests/tools/portfolio-readability.test.js
git commit -m "feat: add engineering image pair"
```

### Task 5: Home hero and free-tools selling hook

**Files:**
- Create: `components/FreeToolsHook.tsx`
- Modify: `app/page.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/portfolio-readability.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: `EngineeringImagePair`, three existing tool routes, and factual descriptions.
- Produces: a hero tools CTA and a three-entry `.free-tools-hook` immediately after the hero.

- [ ] **Step 1: Write failing Home contracts**

```js
test("home hero leads visitors to free engineering tools", async () => {
  const [home, hook] = await Promise.all([
    read("app/page.tsx"),
    read("components/FreeToolsHook.tsx"),
  ]);
  assert.match(home, /EngineeringImagePair/);
  assert.match(home, /Explore free engineering tools/);
  assert.match(home, /FreeToolsHook/);
  assert.match(hook, /Electronics calculators/);
  assert.match(hook, /Sensor code/);
  assert.match(hook, /AI project/);
  assert.doesNotMatch(home, /&rarr;|&darr;|↗/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

- [ ] **Step 3: Implement the tools hook**

Create three concise link cards pointing to `/tools`, `/tools/sensor-code-generator`, and `/tools/ai-script-generator`. Use factual copy such as `36 interactive electronics calculators`, `Generate embedded sensor and communication starters`, and `Build complete ML and vision project scripts`.

- [ ] **Step 4: Recompose the Home hero**

Replace `PixelWorld` as the dominant visual with `EngineeringImagePair`. Keep `PixelWorld` only as a bounded background/accent if it does not reintroduce empty space. Add three arrow-free CTAs: tools, work, contact. Insert `FreeToolsHook` directly after the hero and before credentials.

- [ ] **Step 5: Add desktop/mobile rules and browser assertions**

Assert the image pair and hero CTAs remain within 375px and the tools hook appears before the credentials section. Ensure CTA text does not wrap at 1024/1440 and becomes full-width only at mobile.

- [ ] **Step 6: Run and commit**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js`

```bash
git add components/FreeToolsHook.tsx app/page.tsx app/game-theme.css tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js
git commit -m "feat: make free tools a home page hook"
```

### Task 6: About editorial introduction and centered motion

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/game-theme.css`
- Modify: `tests/tools/portfolio-readability.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: `EngineeringImagePair`, existing factual story paragraphs, CV and section anchors.
- Produces: `.about-editorial-intro`, `.about-story-grid`, and direct section links.

- [ ] **Step 1: Add failing About contracts**

```js
test("about begins with a balanced image-led editorial intro", async () => {
  const about = await read("app/about/page.tsx");
  assert.match(about, /about-editorial-intro/);
  assert.match(about, /EngineeringImagePair/);
  assert.match(about, /about-story-grid/);
  assert.doesNotMatch(about, /Titles tell you where someone works/);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/tools/portfolio-readability.test.js`

- [ ] **Step 3: Implement the About opening**

Use the heading `I build embedded systems by following the problem all the way through.` Keep the ATM origin as a normal paragraph. Add section links labeled `Experience`, `Publications`, and `Open CV` without arrow glyphs.

Follow the intro with three concise story cards using only the existing narrative:

1. Curiosity began with how connected systems exchange information.
2. Projects made firmware, electronics, Linux, security, and interface design one toolkit.
3. Teaching reinforced documentation, testing, and clear explanations.

- [ ] **Step 4: Replace the old intro/statement CSS**

Use a two-column `minmax(300px, .9fr) minmax(0, 1.1fr)` layout with the image pair on the left and readable copy on the right. Collapse at 820px and keep max paragraph width at 68ch. Apply motion to the entire intro rather than isolated remote columns.

- [ ] **Step 5: Run browser tests and commit**

Run: `node --test tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js`

Expected: About remains contained and visually populated at all four widths.

```bash
git add app/about/page.tsx app/game-theme.css tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js
git commit -m "feat: redesign the about story"
```

### Task 7: Milestone verification

**Files:**
- Modify only if verification exposes a scoped defect.

**Interfaces:**
- Produces: green milestone ready for the calculator plan.

- [ ] **Step 1: Run content and focused tests**

Run: `npm run validate:content && node --test tests/tools/portfolio-readability.test.js tests/tools/site-responsive.test.js`

Expected: all pass.

- [ ] **Step 2: Run the full suite**

Run: `npm test`

Expected: zero failures; only documented existing skips.

- [ ] **Step 3: Run production export**

Run: `npm run build`

Expected: static export succeeds and Home, About, Contact, and Tools routes are listed.

- [ ] **Step 4: Inspect rendered pages**

Use the local responsive browser harness at 375, 768, 1024, and 1440px. Confirm badge text is uncropped, Contact text has inset padding, Home shows the tools hook and two images, About has no empty half-screen, and all specified labels remain arrow-free.

- [ ] **Step 5: Commit verification-only fixes if needed**

If verification changes no files, skip this commit. If it reveals a scoped defect, review `git diff`, stage only the exact files named by `git status --short`, and commit:

```powershell
git commit -m "fix: close portfolio readability regressions"
```
