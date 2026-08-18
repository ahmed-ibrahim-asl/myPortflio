# Responsive Usability Overhaul Design

## Objective

Make the portfolio easy to understand and operate on desktop, tablet, and phone. Reduce the amount of text shown at one time, make actionable cards work across their full surface, preserve the site's engineering identity, and remove visual effects that distract from Ahmed's work.

This specification incorporates the approved static-portrait restoration and the selected **Balanced Workspace** direction from the responsive visual comparison.

## Design directions considered

1. **Focus workspace:** one editable step with free navigation between all steps. Clear, but the persistent nine-step rail still adds visual information.
2. **Balanced workspace — selected:** configuration and live output share the screen only on wide desktops. Tablets and phones use explicit Configure and Code tabs.
3. **Conversational wizard:** one question at a time with minimal context. Easiest for first-time users, but slower for experienced users who revise multiple settings.

## Site-wide interaction rules

- A card that represents a destination or a selectable option is activated by clicking or tapping anywhere inside it.
- Link cards use one semantic link destination. Choice cards use a semantic button. Decorative cards with no action do not pretend to be clickable.
- All actionable cards provide hover, pressed, selected, and visible keyboard-focus states.
- Minimum target size is 44 by 44 CSS pixels. Inputs use at least 16px text to avoid mobile zoom and improve readability.
- Reading text is at least 16px. Utility labels may be 14px when contrast and spacing remain strong. Existing tool text below this floor is enlarged.
- Cards present a title and one short supporting sentence by default. Tags, examples, explanations, and advanced detail appear after selection or through an explicit disclosure.
- Animation is not required to understand or use any page. Reduced-motion preferences remain respected.

## Responsive system

### Wide desktop

- At widths above 1100px, complex generators use the Balanced Workspace: configuration on the left and live output/code on the right.
- The configuration panel remains the primary visual column. The output panel is narrower and its actions are grouped compactly.
- Catalogs use three columns where the content comfortably fits.

### Tablet and small laptop

- From 640px through 1100px, complex generators show one panel at a time through clear Configure and Code tabs.
- Tabs preserve the current project state; switching panels never resets selections.
- Catalogs use two columns. Navigation and filters wrap without creating horizontal scrolling.

### Phone

- Below 640px, content uses one column and full-width controls.
- Configure and Code tabs remain immediately reachable, with 44px minimum targets.
- Catalogs use one card per row. Card summaries and metadata are shortened further where necessary.
- Tests cover 390px and the supported 320px minimum width.

## Information density and progressive disclosure

### Model Mission

- Keep Guided, Customize, and Advanced modes, but shorten their visible descriptions.
- Task cards show the task title, technical term, and one short explanation. Long example lists move into the selected-task detail area.
- The current question, its choices, and the next action form the primary hierarchy.
- Wide desktops retain synchronized code beside configuration. Tablet and phone users view code through the Code tab.
- Install instructions, generated summary, and source code are visually separated instead of appearing as one continuous wall.
- Full-card task selection remains semantic and keyboard accessible.

### Calculator catalog

- Each calculator card is one full-surface link.
- Cards show the diagram, category, title, and one concise purpose statement.
- Repetitive tag rows are removed from the catalog view; detailed tags remain available on calculator pages or through filtering.
- The search and category filters remain prominent above the 3/2/1-column catalog.

### Other cards and pages

- Writing cards, tool navigation cards, and other destination cards use the same full-card link pattern.
- Project cards remain non-clickable unless they have a real destination; they keep normal text-selection behavior.
- Home and About show only Ahmed's existing portrait in a simple responsive frame. Remove `PixelWorld`, the hardware-bench image, animated signal, scene labels, and related decorative effects.
- Home, About, Work, Writing, Tools, Contact, and specialized tool pages receive a responsive typography and spacing pass using the shared floors above.
- Mobile navigation remains keyboard accessible, uses large targets, and does not cover or trap page content.

## Component boundaries

- Replace the two-image `EngineeringImagePair` with a single-purpose static portrait component shared by Home and About.
- Introduce or standardize shared full-card link styling rather than duplicating absolute-link behavior in every catalog.
- Keep Model Mission state and generation logic unchanged; reshape presentation within its existing shell, task chooser, and code panel boundaries.
- Apply common readability tokens globally, then add tool-specific overrides only where generated code or dense technical controls require them.

## State and error handling

- Changing viewport or switching Configure/Code tabs preserves all generator state.
- Full-card activation fires once and does not conflict with text selection or nested controls.
- Generated output remains scrollable within its panel without causing page-level horizontal overflow.
- Loading, empty, and error states use the same readable type and remain visible in both workspace tabs.

## Implementation waves

1. **Responsive foundation and identity:** typography floors, target sizes, static portrait, animation removal, navigation and overflow safeguards.
2. **Card interaction system:** full-card links/buttons for calculators, tools, writing, and selectable generator cards; concise catalog copy.
3. **Balanced Model Mission:** reduced visible copy, compact task cards, wide split workspace, tablet/phone tabs, separated output regions.
4. **Remaining tool polish:** apply readability and responsive rules to Security Mission, Embedded Code Workbench, calculators, PID, and battery tools.

All waves are part of this approved overhaul and will be verified together before publishing.

## Verification and acceptance

- Write regression tests before each behavior change and confirm they fail against the current implementation.
- Confirm whole-card activation using pointer and keyboard interaction tests.
- Confirm no horizontal overflow at 1440px, 1024px, 768px, 390px, and 320px.
- Confirm Model Mission uses two panels only above 1100px and Configure/Code tabs at tablet and phone widths.
- Confirm task selections and generated output survive tab and viewport changes.
- Confirm one portrait and no scene, bench, connector, label, or animation on Home and About.
- Confirm font and target-size floors on navigation, cards, forms, and specialized tools.
- Run TypeScript checks, the full automated test suite, dependency audit, and production static export.
- Visually inspect representative pages and interactions at desktop, tablet, and phone sizes before publishing to GitHub Pages.
