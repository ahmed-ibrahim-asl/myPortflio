# Security Mission Completion Design

**Status:** Approved
**Date:** 2026-07-29
**Route:** `/tools/security-command-builder/`
**Reference tool:** `/tools/ai-script-generator/`
**Base specification:** `docs/superpowers/specs/2026-07-29-security-mission-command-builder-design.md`

## 1. Decision

Rebuild the Security Mission interface and application contracts as a complete
guided command builder. Keep the verified compiler, quoting, sanitization, and
source-ledger modules where their tests prove the behavior. Repair the registry,
state, workflow, validation, and component layers around that core.

The rebuilt page must match Model Mission in ease of use and match the
portfolio's pixel-noir visual system. A user makes one decision per step, sees
compatible choices, receives a conservative recommendation, and watches the
command update in the adjacent preview.

This document overrides the interface and application architecture in the base
specification. The base specification remains the source for the approved tool,
action, workflow, safety, and certification scope.

## 2. Audit evidence

The live route and source audit found the following defects:

- React components use Tailwind utility names, but the project does not load
  Tailwind.
- `SecurityMission.module.css` contains 30 lines and no component imports it.
- The browser renders native buttons, block containers, and one vertical list.
- Selecting a tool clears `actionId`; the Action step has no action control.
- Selecting a workflow sets `workflowId` but leaves command mode active and does
  not initialize workflow steps.
- Tool search reads `tool.description.toLowerCase()`. All 109 current tool
  records omit `description`, so the first search query trips the route error
  boundary.
- The current registry has 159 actions and 9 controls. Ninety-one actions have
  no associated control.
- Action rules use 34 value paths. Controls cover 5 paths.
- The control renderer writes all values into `project.options`, including
  controls whose keys start with `target.`.
- The Configure step has no controls.
- Integrated project validation reads `action.fields`; current action records
  omit that property.
- Both workspace panels remain visible at the seven required viewport sizes.
- Mobile tabs remain visible on desktop because their utility classes have no
  CSS rules.
- The objective browser reaches 5,597 pixels in page height at 320 by 700.
- Twenty-seven objective cards use clickable `div` elements. None has button
  semantics or keyboard focus.
- Explanation-level buttons omit `aria-pressed`.
- Mobile workspace controls omit tab semantics.
- The page nests a `main` element inside the site `main` element.
- Scope labels do not bind to their select elements.

The existing automated suite reports 50 passing tests. The responsive test
checks the length of a viewport array. Style tests inspect an unused CSS file.
UI tests search source text for labels. The live-route test catches connection
failures and can pass without a server. TypeScript and the production build
pass, so the repair must add behavior tests that expose these runtime defects.

## 3. Goal and success criteria

Security Mission helps a student or practitioner create commands for an
authorized lab without memorizing command syntax.

A completed release lets a user:

1. confirm authorization context, platform, and shell;
2. start from an objective, a tool, or a curated workflow;
3. see compatible choices instead of the full unfiltered catalog;
4. select an action through plain-language outcome cards;
5. configure each value consumed by the action;
6. understand why each option exists and what token it adds;
7. resolve errors before generation;
8. copy a formatted or single-line command;
9. export and import a sanitized project;
10. create a Markdown runbook or supported low-risk command artifact;
11. complete the same journey with a keyboard at each required viewport.

The release fails acceptance if any registered public action consumes a user
value without a rendered control, validated binding, or registry-owned fixed
value.

## 4. Product model

### 4.1 Command mode

Command mode builds one action. The outer sequence contains eight steps:

1. **Scope** selects authorization context, platform, and shell.
2. **Objective** selects the security outcome.
3. **Tool** selects a compatible tool.
4. **Action** selects a compatible command recipe.
5. **Target** collects typed target values.
6. **Configure** collects action options and output preferences.
7. **Review** shows resolved values, warnings, placeholders, and token effects.
8. **Generate** exposes copy and export actions.

The configuration panel includes Previous and Continue controls. Continue moves
to the next valid step. A disabled Continue control includes visible text that
names the missing or invalid value.

The rail supports review of completed steps. A click on a future step runs the
same guard as Continue. When a guard fails, the interface stays on the current
step and connects the failure message to the first invalid field.

### 4.2 Workflow mode

Workflow mode uses the same outer sequence. A workflow selection performs one
state transition:

- set `mode` to `workflow`;
- set `workflowId`;
- set the workflow objective;
- initialize resolved workflow steps;
- set `workflow.activeStepId` to the first step;
- preserve valid scope values;
- move to Target when the workflow needs shared bindings;
- move to Configure when all shared bindings have defaults.

Configure, Review, and Generate add an inner workflow-step rail. Each step shows
its host role, purpose, command, bindings, warnings, and evidence hint. A user
can edit a step without replacing the workflow definition.

### 4.3 Entry paths

The Objective step contains a compact Start with control:

- **Objective** shows grouped outcome cards.
- **Tool** shows searchable tools and asks for a compatible objective after a
  tool selection.
- **Workflow** shows curated workflow cards and initializes workflow mode after
  selection.

The application stores a tool selected before an objective. An objective
selection preserves that tool when the pair is compatible. It clears the tool
and explains the change when the pair conflicts.

Objective-first discovery filters tools by the selected objective, scope,
platform, and shell. Tool-first discovery searches the full supported tool
catalog and applies scope, platform, shell, category, and interface filters.
After a tool-first selection, the objective chooser shows only objectives with
a compatible action for that tool.

The discovery surface collapses after a selection. The hero readout shows the
active objective, tool, action, mode, and authorization context. A Change link
returns to the relevant chooser without erasing valid state.

### 4.4 Explanation levels

Security Mission uses three cumulative levels:

- **Guided** shows required fields and conservative defaults.
- **Customize** adds common behavior and output controls.
- **Advanced** adds specialist protocol, performance, debugging, and bounded
  testing controls.

Changing the level preserves configured values. Hidden values remain part of
validation and export. The Review step lists hidden non-default values so a user
can find settings that still affect the command.

## 5. Architecture

### 5.1 Boundaries

The implementation has four layers:

1. **Domain registries** store intrinsic metadata and verified command rules.
2. **Selectors and state** derive compatible records and process transitions.
3. **Compiler and exports** turn validated project state into local artifacts.
4. **React components** render state and dispatch semantic actions.

Components do not import tool-family modules. The catalog composes those
modules and exposes one public interface.

The compiler does not read DOM state. React components do not construct command
flags.

### 5.2 Derived selector contract

Create or complete pure functions with these responsibilities:

```js
getCompatibleObjectives({ project, objectives, tools, actions })
getCompatibleTools({ project, tools, actions, objectiveId })
getCompatibleActions({ project, actions })
getVisibleControls({ project, action, controls, stepId })
getStepGuard({ project, action, stepId, controls })
getSecurityRecommendation({ project, compatibleTools, compatibleActions })
resolveSecurityWorkflowProject({ project, workflow, actions })
validateSecurityProject({ project, action, controls, workflows })
```

`getCompatibleTools` uses `project.objectiveId` when `objectiveId` is omitted.
Tool-first discovery passes `objectiveId: null`, which skips the objective
constraint but keeps scope, platform, and shell constraints. Selectors return
arrays in registry order unless a recommendation supplies a documented rank.
Search applies after the selector result.

Each selector accepts registry arguments in tests so a test can exercise small
fixtures without mutating the production catalog.

### 5.3 State transitions

The reducer owns these transitions:

```text
set-authorization-context
set-learning-level
set-platform
set-shell
choose-entry-mode
choose-objective
choose-tool
choose-action
choose-workflow
patch-project-value
patch-workflow-step
set-output-format
go-to-step
next-step
previous-step
set-workspace-tab
import-project
reset-project
```

`choose-objective` clears incompatible tool, action, target, option, and
workflow values. It preserves scope and output preferences.

`choose-tool` clears the prior action and action-owned values. It preserves the
objective when the pair remains compatible.

`choose-action` seeds control defaults and removes values that the new action
cannot consume.

`set-learning-level` changes disclosure without deleting values.

`import-project` sanitizes, migrates, normalizes, validates, and then replaces
the active project. A failed import keeps the current project.

### 5.4 Project schema decisions

The canonical project stores nullable selection identifiers:

```ts
type SecurityProjectSelection = {
  objectiveId: string | null;
  toolId: string | null;
  actionId: string | null;
  workflowId: string | null;
};
```

The default project starts in command mode with the host-discovery objective,
the certification-lab authorization context, Linux, Bash, and Guided
disclosure. Tool-first entry may set `objectiveId` to `null` until the user
chooses a compatible objective. Workflow selection sets the workflow objective
as part of its atomic state transition.

State stores only identifiers and user choices. Tool, action, objective,
workflow, recommendation, validation, and compiler results remain derived
values.

### 5.5 Project paths

Each control declares one authoritative `valuePath`:

```text
target.network
target.host
target.url
options.ports
options.wordlist
output.format
```

The renderer dispatches `patch-project-value` with the registry-owned path. A
path setter accepts the roots `target`, `options`, `output`, and `workflow`.
Tests reject another root.

Every `argumentRule.valuePath` must satisfy one of these conditions:

- a control declares the same path;
- a workflow binding supplies the path;
- the project schema owns the path and the UI renders it;
- the registry supplies a fixed value.

The catalog-completeness test fails when a path has no source.

### 5.6 Registry contracts

Objective records contain:

```ts
type SecurityObjective = {
  id: string;
  title: string;
  technicalTerm: string;
  description: string;
  domain: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  certification: {
    name: "eCPPT" | null;
    sourceUrl: string | null;
    reviewedAt: string;
  };
};
```

Tool records contain:

```ts
type SecurityTool = {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  categories: string[];
  platforms: Array<"linux" | "windows" | "macos">;
  shells: Array<"bash" | "powershell" | "cmd">;
  interface: "cli" | "gui-companion";
  executableNames: string[];
  installNotes: Array<{ platform: string; text: string }>;
  privilege: "user" | "elevated" | "varies";
  homepage: string | null;
};
```

Action records contain:

```ts
type SecurityAction = {
  id: string;
  toolId: string;
  title: string;
  summary: string;
  objectiveIds: string[];
  risk: "low" | "medium" | "high";
  privilege: "user" | "elevated" | "varies";
  platforms: Array<"linux" | "windows" | "macos">;
  shells: Array<"bash" | "powershell" | "cmd">;
  executable: Record<string, string>;
  fixedTokens: Array<SecurityFixedToken>;
  argumentRules: Array<SecurityArgumentRule>;
  verification: SecurityVerification;
};
```

Control records contain:

```ts
type SecurityControl = {
  id: string;
  actionIds: string[];
  step: "target" | "configure";
  section: string;
  valuePath: string;
  level: "guided" | "customize" | "advanced";
  label: string;
  technicalTerm: string;
  controlType: string;
  defaultValue: unknown;
  required: boolean;
  options: Array<{ label: string; value: string }>;
  shortHelp: string;
  explanation: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen: string;
    tradeoff: string;
    codeEffect: string;
  };
  validation: SecurityValidationRule;
};
```

The registry validator enforces non-empty strings, known identifiers, compatible
platform and shell sets, unique IDs, action-to-tool ownership, objective
coverage, source evidence, control coverage, and workflow binding types.

Relationships such as objective tools and tool actions come from selectors.
The registries do not duplicate those arrays.

## 6. Interface design

### 6.1 Visual tokens

Security Mission reuses the portfolio tokens and Model Mission proportions:

| Role | Value |
|---|---|
| Page background | `#050713` |
| Main panel | `#0c1023` |
| Raised panel | `#121831` |
| Standard border | `#30395e` |
| Strong border | `#465176` |
| Active cyan | `#55d5d8` |
| Valid green | `#8edb7a` |
| Guidance gold | `#f0c66c` |
| Error red | `#f49aab` |
| Main text | `var(--ink)` |
| Muted text | `var(--muted)` |
| Interface type | `var(--font-mono)` |

The design uses square corners, hard shadows, flat fills, and one-pixel or
two-pixel rules. It excludes gradients, glass effects, blur, and page-level
horizontal overflow.

### 6.2 Desktop layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ← BACK TO TOOLS       SECURITY MISSION          ACTIVE MISSION       │
│ Authorized lab command builder                  Host discovery       │
└──────────────────────────────────────────────────────────────────────┘
┌───────────────┬───────────────┬──────────────────────────────────────┐
│ GUIDED        │ CUSTOMIZE     │ ADVANCED                             │
└───────────────┴───────────────┴──────────────────────────────────────┘
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │ 07 │ 08 │
└────┴────┴────┴────┴────┴────┴────┴────┘
┌──────────────────────────────┬───────────────────────────────────────┐
│ CONFIGURE                    │ COMMAND ASSEMBLY TRACE                │
│ Step lesson                  │ executable  flags  values             │
│ Compatible choices           │ warnings and placeholders             │
│ Fields and explanations      │ formatted command                     │
│                              │ copy and export actions               │
│ Previous        Continue     │                                       │
└──────────────────────────────┴───────────────────────────────────────┘
```

The shell uses the width behavior from `ModelMission.module.css`. The workspace
uses `minmax(0, ...)` columns. The preview stays within its column and may remain
sticky below the site header when its content fits the viewport.

### 6.3 Mobile layout

```text
┌────────────────────────────┐
│ SECURITY MISSION           │
│ active mission readout     │
├────────────────────────────┤
│ GUIDED | CUSTOMIZE | ADV.  │
├────────────────────────────┤
│ horizontally scrolling rail│
├──────────────┬─────────────┤
│ CONFIGURE    │ COMMAND     │
├──────────────┴─────────────┤
│ one visible workspace panel│
│                            │
│ Previous        Continue   │
└────────────────────────────┘
```

At widths below 960 pixels, the workspace shows one panel. Tabs preserve the
project object. The rail scrolls on its axis. Cards use one column below 640
pixels. Buttons maintain a 44-pixel target.

### 6.4 Command assembly trace

The command preview is the signature interaction. It renders compiler tokens as
typed segments:

- executable;
- fixed flag;
- conditional flag;
- user value;
- placeholder;
- output path.

Each segment exposes its source control label and short effect. Selecting or
focusing a field highlights its produced tokens. A token click returns focus to
the source field when that field is visible.

The trace uses compiler output. It does not parse the final command string.

The preview also shows:

- platform and shell;
- action summary;
- authorization and privilege state;
- validation errors and warnings;
- single-line and formatted output;
- source evidence link;
- copy status through a polite live region;
- local download and export actions.

### 6.5 Discovery surfaces

Objective cards show outcome, domain, difficulty, compatible tool count, and
workflow count.

Tool search matches name, alias, description, and executable name. Filters
cover category, platform, interface, and certification domain. The result count
uses a polite live region. An empty result names the active filters and offers a
Clear filters control.

Tool cards show description, aliases, interface, compatible platforms,
privilege, install note, and supported action count.

Action cards show outcome, risk, privilege, produced executable, required target
types, and a recommendation reason when present.

Workflow cards show purpose, tools, step count, prerequisites, host roles,
platform, risk, and expected evidence.

## 7. Functional completion scope

### 7.1 Command coverage

All 159 registered actions remain in scope. Each action must pass:

- registry schema validation;
- verified source validation;
- objective and tool compatibility validation;
- platform and shell validation;
- argument-source coverage;
- target and option validation;
- a command snapshot or a family-level parameterized snapshot;
- one UI reachability assertion.

Actions that represent GUI companions may produce a launch note or documented
procedure instead of a shell command. The UI labels that output and does not
pretend it is executable.

### 7.2 Curated workflows

Implement the version-one workflow list from section 12 of the base
specification. The eight groups are:

- reconnaissance;
- credential auditing;
- web application testing;
- exploitation and post-exploitation;
- pivoting;
- exploit development;
- Active Directory;
- wireless and packet testing.

Each named workflow in the base specification needs a registry record, two or
more steps where the procedure requires them, typed bindings, prerequisites,
risk, host roles, and evidence hints.

### 7.3 Recommendations

Recommendations use deterministic rules. They rank compatible choices and
provide a reason. They do not replace an explicit compatible selection.

The interface offers Apply recommendation. The action dispatches the same
semantic transition as a direct selection.

### 7.4 Import and export

Security Mission provides:

- copy single-line command;
- copy formatted command;
- sanitized JSON project download;
- sanitized JSON project import;
- Markdown workflow runbook;
- plain-text command list;
- low-risk shell artifact when all steps support the selected shell.

Import rejects unknown schema versions, invalid identifiers, unsafe paths, and
unrepresentable shell values. The import result lists changes made by migration
or sanitization.

Exports replace target values, credentials, hashes, tokens, and user paths with
named placeholders unless the user selects the existing lab-value option. The
lab-value option never includes fields marked sensitive.

## 8. Validation, errors, and safety

Errors block Continue and Generate. Warnings remain visible and appear in
exports.

Validation covers:

- required values;
- IPv4, IPv6, CIDR, hostname, domain, URL, port, path, BSSID, channel, SID, and
  SPN formats;
- platform and shell compatibility;
- tool, objective, and action compatibility;
- output extension and format pairs;
- typed workflow bindings;
- command separators and control characters;
- rate, count, and lockout bounds;
- relative output paths.

The page renders field errors beside the source field. A summary at the top of
the panel links to each invalid field. Unsupported combinations appear as
disabled choices with a visible reason.

The application:

- generates text in the browser;
- sends no command, target, credential, hash, path, or project state to a
  server;
- does not execute commands;
- does not request browser network access to a target;
- omits destructive actions defined as non-goals in the base specification;
- keeps bounded counts for packet and credential-audit controls.

## 9. Accessibility and responsive requirements

The interface must satisfy these contracts:

- cards use buttons or links;
- the active step uses `aria-current="step"`;
- explanation levels use `aria-pressed`;
- mobile workspace controls use tablist, tab, and tabpanel semantics;
- each label binds to one control;
- field help and errors use `aria-describedby`;
- errors use `role="alert"` where interruption is required;
- result counts and copy state use polite live regions;
- the route contains no nested `main`;
- focus remains stable when compiler output changes;
- focus styles remain visible against each panel;
- disabled actions include adjacent reason text;
- reduced-motion settings remove animated scrolling and token pulses.

Browser tests cover:

- 320 by 700;
- 360 by 800;
- 390 by 844;
- 768 by 1024;
- 900 by 900;
- 1024 by 768;
- 1440 by 900.

Each viewport must have:

- document width equal to viewport width;
- no panel overlap;
- no clipped field, button, label, or command token;
- one visible workspace panel below 960 pixels;
- two visible workspace panels at or above 960 pixels;
- a contained horizontal step rail;
- preserved state after workspace tab changes.

## 10. File responsibilities

### 10.1 Domain and state

- `lib/tools/security-mission/catalog.js` composes public registries and exports
  lookup functions.
- `lib/tools/security-mission/selectors.js` derives compatible records and step
  guards.
- `lib/tools/security-mission/registry-validation.js` enforces record and
  argument-source contracts.
- `lib/tools/security-mission/project-paths.js` reads and patches allowed project
  paths.
- `lib/tools/security-mission/state.js` owns transitions and invalidation.
- `lib/tools/security-mission/control-registry.js` resolves cumulative controls.
- `lib/tools/security-mission/validation.js` validates the active project and
  workflow.
- `lib/tools/security-mission/workflow-registry.js` composes workflow groups and
  resolves bindings.
- `lib/hooks/useSecurityMission.ts` combines state, selectors, validation,
  compiler output, and local artifact handlers.

### 10.2 Interface

- `SecurityMissionShell.tsx` composes the page and dispatches semantic actions.
- `SecurityMission.module.css` owns the complete route style system.
- `SecurityMissionHero.tsx` renders the route link and active-mission readout.
- `SecurityMissionNavigator.tsx` switches entry paths inside the Objective step.
- `SecurityMissionRail.tsx` renders guarded outer progress.
- `SecurityMissionStepPanel.tsx` renders step copy and the active chooser.
- `ObjectiveBrowser.tsx`, `ToolBrowser.tsx`, `ActionBrowser.tsx`, and
  `WorkflowBrowser.tsx` render accessible discovery choices.
- `SecurityControlRenderer.tsx` renders controls from registry metadata.
- `SecurityField.tsx` connects labels, help, errors, and token sources.
- `SecurityExplanation.tsx` teaches one choice.
- `SecurityRecommendation.tsx` renders an advisory action.
- `SecurityWarningPanel.tsx` renders scope, privilege, rate, and compatibility
  notices.
- `CommandAssemblyTrace.tsx` renders typed compiler tokens.
- `CommandPreviewPanel.tsx` renders command output and local actions.
- `WorkflowPreviewPanel.tsx` renders editable workflow steps and runbook output.
- `SecurityProjectImport.tsx` handles local JSON selection and import results.

Components may import the shared CSS module. No component uses Tailwind utility
names.

## 11. Testing strategy

### 11.1 Pure domain tests

Node tests cover:

- registry schemas and relationships;
- 159-action argument-source coverage;
- compatible objective, tool, and action selectors;
- reducer invalidation and preservation rules;
- cumulative disclosure levels;
- typed project path patching;
- integrated validation;
- command snapshots and shell quoting;
- workflow initialization and bindings;
- sanitized imports and exports;
- deterministic recommendations.

### 11.2 Route behavior tests

Replace source-text contracts with browser behavior checks that:

1. select host discovery;
2. select Nmap;
3. select host discovery scan;
4. enter a CIDR target;
5. confirm the trace contains `nmap`, `-sn`, and the quoted target;
6. copy formatted and single-line output;
7. export a sanitized project;
8. import that project and restore non-sensitive choices.

Add journeys for tool-first entry, workflow selection, search, an invalid value,
an advanced value preserved across level changes, and one platform conflict.

The search test enters `nmap` and asserts one contained result set with no
console error or error boundary.

### 11.3 Responsive browser test

Adapt the Model Mission Chrome or Edge CDP harness. The test starts or reuses the
local server, waits for `[data-security-mission][data-ready="true"]`, exercises
state, and checks the seven viewport contracts.

The test must fail when Chrome or Edge is available and the route fails. It may
skip when no supported browser exists. It must not pass through a placeholder
assertion.

### 11.4 Completion commands

The completion gate runs:

```powershell
npm run test:security-mission
npm run test:security-mission:responsive
npx tsc --noEmit
npm run build
```

The browser audit then repeats the objective-first, tool-first, workflow, search,
keyboard, mobile-tab, copy, import, and export journeys against the live route.

## 12. Delivery sequence

Implementation proceeds through reviewable vertical slices:

1. Lock registry schemas, selectors, project paths, and failing tests.
2. Complete the Nmap host-discovery journey from objective to copied command.
3. Rebuild the site-native shell, rail, mobile tabs, and command trace.
4. Complete search, compatibility filters, action selection, and
   recommendations.
5. Complete target and configure controls for all action families.
6. Complete integrated validation, warnings, and step guards.
7. Complete workflow records, bindings, editing, and runbook output.
8. Complete import and export surfaces.
9. Replace placeholder route, responsive, keyboard, and accessibility tests.
10. Run the production gate and publish updated audit evidence.

Each slice includes a failing test, implementation, focused verification, and a
commit.

## 13. Acceptance criteria

The work is complete when:

- the live page matches Model Mission's ease and portfolio identity;
- a new user can generate the Nmap host-discovery command without using the
  outer rail as a manual form navigator;
- objective-first, tool-first, and workflow entry paths work;
- search does not throw;
- all 159 public actions satisfy registry, control, validation, source, and UI
  reachability contracts;
- each workflow named in the base specification has a usable record;
- the command trace maps tokens to controls;
- imports and exports preserve allowed state and remove sensitive values;
- keyboard and screen-reader semantics satisfy section 9;
- all seven viewport checks pass;
- the Node suite, responsive suite, TypeScript, and production build pass;
- the browser console contains no Security Mission error during acceptance
  journeys.

## 14. Non-goals

The repair does not add command execution, remote scanning, credential storage,
server persistence, target analytics, arbitrary shell templates, unbounded
packet generation, denial-of-service recipes, persistence techniques, or data
exfiltration.

The repair does not refactor Model Mission. It uses Model Mission as a visual,
interaction, and test reference.
