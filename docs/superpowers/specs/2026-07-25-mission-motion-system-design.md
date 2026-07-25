# Mission Motion System Design

Date: 2026-07-25

## Objective

Enhance the existing pixel-game portfolio with an expressive motion system that makes the page feel like one connected engineering mission.

The motion should help visitors understand page progress, project relationships, Ahmed's working method, and the path toward contact. It should not obscure content, slow navigation, or compete with the work.

## Current Motion Audit

The site already includes:

- a pixel-world boot animation;
- circuit tracing and bot spawn;
- generic viewport reveals;
- staggered card entrances;
- a reading progress bar;
- portrait pointer parallax;
- stepped button and card feedback;
- reduced-motion support.

The main weakness is repetition. Most sections receive the same reveal treatment, while the strongest world-building motion stays inside the hero.

## Approved Direction

Use mission progression as the primary motion language with restrained signal-flow accents.

The site remains a readable portfolio. It should feel like moving through a level, not playing a game that blocks access to information.

## Motion Principles

1. Motion explains state or relationship.
2. Every major section has a distinct but related entrance.
3. Essential content remains visible without JavaScript.
4. Motion plays once unless interaction provides a reason to repeat it.
5. The system respects keyboard focus, mobile constraints, and reduced-motion preferences.
6. No scroll hijacking, forced snapping, sound, or endless decorative loops.
7. No em dash character may appear in visible site copy.

## Mission Registry

The homepage should define these missions:

| Mission | Purpose | Motion behavior |
| --- | --- | --- |
| `origin` | Hero and positioning | System boot and interface lock-in |
| `credentials` | Teaching, study, publication, competition | Record scan and status confirmation |
| `projects` | Selected work | Equipment selection and evidence activation |
| `method` | Question, Learn, Build, Test | Sequential path activation |
| `toolkit` | Tools collected through projects | Node activation and one signal pulse |
| `story` | ATM origin story | Question highlights and line-mask reveal |
| `writing` | Field notes and tutorials | Field-record loading sequence |
| `contact` | Project brief conversion | Transmission-console feedback |

Each homepage section receives a stable `data-mission` value. The registry supplies the visitor-facing label and motion type.

## Component Architecture

### MotionSystem

The existing `MotionSystem` remains the single client-side coordinator.

Responsibilities:

- prepare motion nodes after route changes;
- observe major mission sections;
- determine the active mission;
- expose the active mission through a root data attribute;
- update the global scroll-progress variable;
- coordinate one-time reveal states;
- preserve pointer parallax where appropriate;
- disable optional effects for reduced motion and small screens;
- clean up observers, event listeners, animation frames, and timers.

The system should avoid separate scroll listeners for every section.

### MissionRail

Render a compact, non-interactive mission rail from `MotionSystem`.

Desktop behavior:

- fixed near the right side of the viewport;
- shows mission number, short label, and completion state;
- highlights the active mission;
- remains visually secondary to page content.

Mobile behavior:

- becomes a small status readout near the existing progress bar;
- shows only the active mission;
- does not cover navigation or content.

The rail is decorative navigation feedback, not a replacement for site navigation. It should be hidden from assistive technology unless it provides real links.

### SignalPath

Use small inline SVG or CSS paths only inside the Method and Toolkit sections.

Responsibilities:

- draw a path when the section becomes active;
- illuminate nodes in content order;
- run once;
- use `stroke-dashoffset` or a transform-based pulse;
- become static under reduced motion.

Do not draw one large path across the entire document.

## Section Choreography

### Hero

Sequence:

1. Pixel world boots.
2. Circuit path traces.
3. Bot appears.
4. Hero interface panels lock into place.
5. Headline, supporting copy, and CTAs resolve in order.

Total sequence should finish within approximately 900 milliseconds. The visitor should be able to read and interact before the final decorative step completes.

### Credentials

Treat each fact as a scanned record:

- top border sweeps once;
- status marker activates;
- primary fact appears before supporting text;
- records stagger in reading order.

Do not imitate a flashing terminal or delay content for dramatic effect.

### Projects

Project cards behave like selectable equipment:

- entrance establishes the card frame before its content;
- hover and keyboard focus activate the border and status marker;
- problem, build, result, and tools remain readable without hover;
- images do not zoom or receive image filters;
- selection feedback uses a small stepped translation and shadow change.

### Working Method

Question, Learn, Build, and Test form a connected route:

- the path draws once;
- steps activate sequentially;
- the active node receives a short pulse;
- text appears immediately after its node;
- the complete path remains visible after activation.

### Toolkit

Tool groups behave like system nodes:

- groups activate in reading order;
- one small data pulse travels between groups;
- individual tools receive a restrained stagger;
- no continuous network animation remains after completion.

### Origin Story

The ATM story should use text-led motion:

- the opening question reveals first;
- highlighted system questions appear in sequence;
- paragraphs use short line masks or vertical reveals;
- no typewriter effect;
- no character-by-character animation.

### Writing

Articles load as field records:

- metadata appears first;
- title and summary follow;
- status or category indicator confirms the record;
- hover and focus use the same selection language as project cards.

### Contact

The CTA behaves like a transmission console:

- the section frame activates when it enters the viewport;
- the primary button uses clear press feedback;
- a short sending state may run only when form submission begins;
- normal form submission and navigation must not be delayed;
- no fake success confirmation may appear before the external form service responds.

## Timing Tokens

Suggested tokens:

- `--motion-instant`: 140ms
- `--motion-fast`: 180ms
- `--motion-standard`: 280ms
- `--motion-section`: 420ms
- `--motion-scene`: 520ms
- `--motion-stagger`: 45ms

Pixel interface motion uses stepped timing. Reading and path motion use a smooth ease-out curve.

Maximum entrance translation should remain near 16 pixels. Large panels should not fly across the viewport.

## State Flow

1. Server-rendered HTML starts fully visible.
2. Client motion setup adds the motion-ready class.
3. Motion nodes receive their initial state before the next paint.
4. Intersection observers reveal nodes and identify the active mission.
5. The active mission updates the root data attribute and MissionRail.
6. Completed missions retain a completed state.
7. Route changes clean up old nodes and initialize the new route.

If setup fails, content stays visible and usable.

## Responsive Behavior

At small widths:

- disable portrait pointer parallax;
- reduce stagger delays;
- simplify signal paths;
- replace the desktop mission rail with a compact status readout;
- avoid horizontal motion;
- keep touch targets at least 44 pixels;
- ensure fixed status elements do not cover content.

The motion system must respond correctly at 375, 560, 820, 1024, and 1440 pixel viewport widths.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- reveal all content immediately;
- disable parallax;
- disable path drawing and signal travel;
- disable stepped scene sequences;
- retain static active and completed mission styling;
- keep functional hover, focus, and press feedback without movement.

## Performance

- Prefer transforms, opacity, and SVG stroke properties.
- Use one animation-frame-throttled global progress update.
- Reuse observers rather than creating one observer per item.
- Avoid repeated layout measurements during scrolling.
- Do not add GSAP, Motion, or another animation dependency unless native browser APIs prove insufficient during implementation.
- Avoid WebGL, canvas loops, large particle systems, and continuously animated backgrounds.
- Preserve the static-export architecture.

## Accessibility

- Motion must not change reading order.
- Hover states must have keyboard-focus equivalents.
- Essential project information must not depend on animation.
- The MissionRail must not create duplicate or misleading navigation.
- Focus indicators remain visible.
- Status changes should be decorative unless there is useful information to announce.
- No automatic audio is permitted.

## Error Handling

- Without JavaScript, all content remains visible.
- Without IntersectionObserver, all missions and reveal nodes become visible.
- If a selector is absent on a route, initialization skips it without error.
- Observers and listeners must be removed during route changes.
- Form animation must never prevent or delay submission.

## Verification

Implementation should verify:

1. Content remains visible with JavaScript disabled or motion setup unavailable.
2. Every homepage mission activates in the intended order.
3. MissionRail active and completed states match scroll position.
4. Hover and keyboard focus produce equivalent project-card feedback.
5. Reduced-motion mode removes scene and path movement.
6. Mobile layouts contain no horizontal overflow or covered content.
7. The page does not use scroll hijacking or forced snapping.
8. Motion setup produces no console errors after route changes.
9. Content validation passes.
10. Normal and GitHub Pages production builds pass.
11. Metadata, structured data, contact actions, and internal links remain valid.
12. No em dash character exists in visible site copy.
13. Representative local routes return HTTP 200.

## Out of Scope

- a new visual identity;
- changes to the approved portfolio narrative;
- WebGL or 3D scenes;
- sound effects;
- a custom cursor;
- scroll smoothing or scroll hijacking;
- a new animation dependency by default;
- new project claims or content;
- GitHub push or deployment.
