# Tools Hub Restoration Design

## Objective

Restore the 36 completed electronics calculators that currently live outside the
actual `myPortfolio` Git repository, retain the five deployed advanced engineering
tools, and prevent the global mission navigation rail from covering non-homepage
content. The completed work will be committed and pushed through the existing
authenticated `myPortfolio` remote.

## Current State and Root Cause

The deployed application is the nested `myPortfolio` repository. A separate outer
workspace contains a complete electronics-calculator implementation: 36 calculator
components, a calculator catalog, dynamic calculator routes, supporting diagrams,
shared math and unit utilities, and the associated interface styles. Because those
files are outside `myPortfolio`, GitHub Pages never receives them.

The deployed Tools page currently contains five real advanced tools, and all five
routes return successful responses. Those tools must remain available.

The `MotionSystem` client component is mounted by the global layout and always
renders `MissionRail`. Only the homepage supplies `data-mission` sections, but the
rail still appears on all wide-screen routes using its initial mission state. Its
fixed desktop position overlaps the right column of the Tools grid.

## User Experience

The `/tools/` route will become a unified hub with two clearly separated areas:

1. **Featured Engineering Workbenches** preserves the five advanced tools: AI
   Script Generator, Security Mission, Interactive PID Simulator, Sensor Code
   Generator, and ESP32 Battery Life & Power Estimator.
2. **Electronics Calculators** presents all 36 restored calculators with keyword
   search and category filtering. Calculator categories remain Fundamentals,
   Resistors, Timing & Filters, Conversions, Number Systems, and Physics & Math.

Each calculator will have its existing descriptive card and a statically exported
route at `/tools/<calculator-slug>/`. Its detail page will retain the calculator,
formula explanation, mnemonic, worked example, source attribution, and any circuit
diagram supplied by the completed outer-workspace implementation.

The mission rail and compact mission readout will appear only when the current page
actually contains mission sections. They will remain available on the homepage and
will be absent from the Tools hub, calculator pages, advanced tool pages, writing,
work, about, and contact routes.

## Architecture

### Calculator feature module

Only the relevant completed calculator feature files will be migrated into
`myPortfolio`:

- the calculator catalog and lookup helpers;
- the 36 calculator components and their registry;
- shared calculator shell, index, card, and UI primitives;
- circuit diagram components;
- reusable units, resistor-color, and number-system utilities;
- calculator-specific styles required by the current components.

The outer workspace's global layout, headers, footers, content pages, and unrelated
application files will not be copied. Migrated styles will be adapted to the current
portfolio tokens and layout instead of replacing the active design system.

The existing dynamic calculator route will be introduced under `app/tools/[slug]`.
It will use `generateStaticParams` and `dynamicParams = false` so every calculator
is generated during the static GitHub Pages build and unknown slugs return the
not-found page.

### Unified Tools hub

The existing advanced-tool registry remains the source for the featured section.
The calculator catalog becomes the source for the searchable electronics section.
The filtering interface runs client-side over the static catalog; it does not add a
database, API, or runtime service.

### Mission navigation visibility

Mission visibility will be derived from the actual presence of `data-mission`
sections. The observer will expose whether mission sections exist, and
`MotionSystem` will render `MissionRail` only when that value is true. The initial
state will be false to prevent a rail flash during hydration on non-mission routes.
Existing scroll progress and bounded pointer motion remain global.

## Data Flow

At build time, the calculator catalog supplies every static route parameter and
page metadata. At runtime, the Tools hub passes the same catalog into the search
and category interface. Selecting a calculator follows its static route, which
resolves the catalog record and matching registered component. Missing catalog or
component records fail closed through the not-found route.

On each page mount, the mission observer queries for mission sections. Pages with
none report `hasMissions: false` and render no rail. The homepage reports true and
continues updating active and completed mission state while the visitor scrolls.

## Error Handling and Boundaries

- Unknown calculator slugs render the existing not-found experience.
- Every catalog entry must have exactly one component registration; tests prevent
  cards that lead to missing tools.
- Calculator inputs retain their existing validation and non-finite-value guards.
- Search with no matches displays the existing empty-state guidance.
- No existing advanced tool route or implementation will be removed or renamed.
- Existing uncommitted GitHub Pages path and `.nojekyll` corrections will be
  preserved and incorporated without overwriting unrelated user changes.

## Verification

Implementation will follow test-driven development. Regression coverage will prove:

- all 36 calculator catalog entries have registered components and static slugs;
- the unified Tools page contains both the five advanced tools and calculator hub;
- calculator formula/unit utilities retain their expected behavior;
- the mission rail appears on the homepage but not on `/tools/` or tool detail
  routes;
- the Tools hub and representative calculator pages have no overlap or horizontal
  overflow at mobile, tablet, small-desktop, and wide-desktop widths;
- content validation and the full automated test suite pass;
- a production build succeeds locally;
- a GitHub Actions-mode static export succeeds with the `/myPortflio` base path and
  preserves `out/.nojekyll`.

After fresh verification, the implementation will be committed to `main` and pushed
to the repository's existing authenticated remote. The live GitHub Pages deployment
will then be checked for the Tools hub, representative calculator routes, and the
absence of the mission rail on non-home pages.

## Out of Scope

- Replacing or redesigning the five advanced tools.
- Adding new calculators beyond the completed 36-item implementation.
- Changing the homepage's mission labels or scroll behavior.
- Introducing hosted APIs, user accounts, analytics, or persistence.
- Copying unrelated outer-workspace files into the Git repository.
