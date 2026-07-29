# Security Mission Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unusable Security Mission route with a site-native guided command builder whose objective-first, tool-first, workflow, configuration, review, copy, import, and export journeys work at all seven required viewport sizes.

**Architecture:** Keep the verified command compiler, quoting, sanitization, and source evidence. Add pure compatibility selectors, typed project-path helpers, generated control coverage, and atomic state transitions beneath one client hook. Rebuild the React surface with a single imported CSS module, semantic controls, a guarded eight-step flow, and a command assembly trace driven by compiler tokens.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Node test runner, Chrome DevTools Protocol

## Global Constraints

- Work on `feature/security-mission-integration` in the current checkout because it serves the live browser route.
- Preserve unrelated modified and untracked files; stage only files named by this plan.
- Read the installed Next.js 16 documentation before editing route or styling code.
- Use CSS Modules. Do not add Tailwind or another UI dependency.
- Use the existing portfolio colors: `#050713`, `#0c1023`, `#121831`, `#30395e`, `#465176`, `#55d5d8`, `#8edb7a`, `#f0c66c`, and `#f49aab`.
- Use square corners, hard shadows, flat fills, and no gradients, blur, or glass effects.
- Keep all generation local. Do not execute commands or send project values to a server.
- Preserve all 109 tools, 159 actions, and verified source records.
- Treat 960 pixels as the workspace breakpoint.
- Test 320×700, 360×800, 390×844, 768×1024, 900×900, 1024×768, and 1440×900.
- Follow red-green-refactor for every behavior change.

---

## File Responsibility Map

### Domain contracts

- `lib/tools/security-mission/selectors.js`: compatible objective, tool, and action derivation plus step guards.
- `lib/tools/security-mission/project-paths.js`: safe reads and immutable writes for `target`, `options`, `output`, and `workflow`.
- `lib/tools/security-mission/registry-validation.js`: cross-registry schemas and argument-source coverage.
- `lib/tools/security-mission/catalog.js`: compose and normalize the public objective, tool, action, and control catalogs.
- `lib/tools/security-mission/control-registry.js`: expose explicit and generated controls by action, step, and learning level.
- `lib/tools/security-mission/state.js`: atomic selection, workflow, import, path, step, and workspace transitions.
- `lib/tools/security-mission/validation.js`: validate the active action against its visible and hidden control sources.
- `lib/tools/security-mission/workflow-registry.js`: initialize workflow state and resolve shared bindings.
- `lib/hooks/useSecurityMission.ts`: combine state, selectors, validation, compiler output, and local file actions.

### Interface

- `components/tools/security-mission/SecurityMissionShell.tsx`: route shell, hero, learning level, rail, responsive workspace, and step actions.
- `components/tools/security-mission/SecurityMission.module.css`: complete scoped visual and responsive system.
- `components/tools/security-mission/SecurityMissionNavigator.tsx`: compact objective, tool, and workflow entry modes.
- `components/tools/security-mission/ObjectiveBrowser.tsx`: grouped accessible objective choices.
- `components/tools/security-mission/ToolBrowser.tsx`: safe search, filters, results, and compatible tool choices.
- `components/tools/security-mission/ActionBrowser.tsx`: compatible action cards and recommendation reason.
- `components/tools/security-mission/WorkflowBrowser.tsx`: curated workflow cards.
- `components/tools/security-mission/SecurityMissionRail.tsx`: guarded eight-step progress.
- `components/tools/security-mission/SecurityMissionStepPanel.tsx`: active step lesson and chooser.
- `components/tools/security-mission/SecurityControlRenderer.tsx`: registry-driven target and option fields.
- `components/tools/security-mission/SecurityField.tsx`: bound labels, help, errors, and source highlighting hooks.
- `components/tools/security-mission/CommandAssemblyTrace.tsx`: compiler token-to-control mapping.
- `components/tools/security-mission/CommandPreviewPanel.tsx`: command output, trace, warnings, copy, and downloads.
- `components/tools/security-mission/SecurityProjectImport.tsx`: local JSON import control and migration result.

### Tests

- `tests/tools/security-mission-completion.test.js`: selectors, catalog normalization, controls, paths, guards, and workflows.
- `tests/tools/security-mission-state.test.js`: reducer invalidation and preservation behavior.
- `tests/tools/security-mission-validation.test.js`: required values, paths, separators, and registry controls.
- `tests/tools/security-mission-responsive.test.js`: live route interactions and seven viewport contracts.
- `tests/tools/security-mission-live-route.test.js`: fail-closed route availability and initial markup.

---

### Task 1: Lock compatibility and catalog contracts

**Files:**
- Create: `lib/tools/security-mission/selectors.js`
- Create: `lib/tools/security-mission/registry-validation.js`
- Modify: `lib/tools/security-mission/catalog.js`
- Create: `tests/tools/security-mission-completion.test.js`

**Interfaces:**
- Produces: `getCompatibleObjectives`, `getCompatibleTools`, `getCompatibleActions`, `getStepGuard`, and `validateSecurityRegistry`.
- Consumes: current objective, tool, action, control, and workflow arrays.

- [ ] **Step 1: Write failing selector and metadata tests**

```js
test("host discovery exposes Nmap and its five actions", () => {
  const project = { ...createDefaultSecurityMissionProject(), toolId: "nmap" };
  assert.ok(getCompatibleTools({ project }).some(({ id }) => id === "nmap"));
  assert.deepEqual(
    getCompatibleActions({ project }).map(({ id }) => id),
    [
      "nmap-host-discovery",
      "nmap-tcp-scan",
      "nmap-udp-scan",
      "nmap-service-enumeration",
      "nmap-nse-scan",
    ],
  );
});

test("every public tool has searchable display metadata", () => {
  for (const tool of SECURITY_TOOLS) {
    assert.equal(typeof tool.description, "string");
    assert.ok(tool.description.length > 0);
    assert.ok(Array.isArray(tool.aliases));
    assert.ok(Array.isArray(tool.categories));
    assert.ok(Array.isArray(tool.platforms));
    assert.ok(Array.isArray(tool.shells));
  }
});
```

- [ ] **Step 2: Run the completion test and confirm it fails**

Run: `node --test tests/tools/security-mission-completion.test.js`

Expected: failure because `selectors.js` does not exist and raw tool records only contain `id` and `name`.

- [ ] **Step 3: Add pure compatibility selectors**

```js
export function getCompatibleActions({
  project,
  actions = SECURITY_ACTIONS,
}) {
  return actions.filter((action) =>
    (!project.toolId || action.toolId === project.toolId)
    && (!project.objectiveId
      || action.objectiveIds.includes(project.objectiveId))
    && Boolean(action.executable?.[project.platform])
  );
}

export function getCompatibleTools({
  project,
  tools = SECURITY_TOOLS,
  actions = SECURITY_ACTIONS,
  objectiveId = project.objectiveId,
}) {
  const compatibleToolIds = new Set(actions
    .filter((action) =>
      (!objectiveId || action.objectiveIds.includes(objectiveId))
      && Boolean(action.executable?.[project.platform]))
    .map(({ toolId }) => toolId));
  return tools.filter(({ id }) => compatibleToolIds.has(id));
}
```

Add the equivalent objective selector and step guard. Keep registry order.

- [ ] **Step 4: Normalize tool metadata at catalog composition**

Compose each tool family with its category. Derive platforms from owned action executable maps, derive shells from those platforms, preserve supplied metadata, and supply safe aliases, descriptions, executable names, install notes, interface, and privilege values.

- [ ] **Step 5: Add cross-registry validation**

`validateSecurityRegistry()` must report duplicate IDs, unknown relationships, empty display metadata, incompatible executable maps, and action argument paths without a control source.

- [ ] **Step 6: Run focused and catalog tests**

Run: `node --test tests/tools/security-mission-completion.test.js tests/tools/security-mission-catalog.test.js tests/tools/security-mission-catalog-completeness.test.js`

Expected: all pass.

- [ ] **Step 7: Commit the domain slice**

```powershell
git add -- lib/tools/security-mission/selectors.js lib/tools/security-mission/registry-validation.js lib/tools/security-mission/catalog.js tests/tools/security-mission-completion.test.js
git commit -m "feat(security-mission): add compatible catalog selectors"
```

### Task 2: Cover every command value path

**Files:**
- Create: `lib/tools/security-mission/project-paths.js`
- Modify: `lib/tools/security-mission/control-registry.js`
- Modify: `lib/tools/security-mission/validation.js`
- Modify: `tests/tools/security-mission-completion.test.js`
- Modify: `tests/tools/security-mission-validation.test.js`

**Interfaces:**
- Produces: `getSecurityProjectValue(project, valuePath)`, `patchSecurityProjectValue(project, valuePath, value)`, `SECURITY_CONTROL_BLUEPRINTS`, and `getAllSecurityControls()`.
- Consumes: action `argumentRules[].valuePath`.

- [ ] **Step 1: Write failing path and control-coverage tests**

```js
test("project paths write only allowed roots without mutation", () => {
  const original = createDefaultSecurityMissionProject();
  const next = patchSecurityProjectValue(
    original,
    "target.network",
    "10.10.10.0/24",
  );
  assert.equal(original.target.network, undefined);
  assert.equal(next.target.network, "10.10.10.0/24");
  assert.throws(() =>
    patchSecurityProjectValue(original, "__proto__.polluted", "yes"));
});

test("all 159 actions have a source for every argument path", () => {
  const controls = getAllSecurityControls();
  const controlPaths = new Set(controls.map(({ valuePath }) => valuePath));
  for (const action of SECURITY_ACTIONS) {
    for (const rule of action.argumentRules ?? []) {
      assert.ok(controlPaths.has(rule.valuePath), `${action.id}:${rule.valuePath}`);
    }
  }
});
```

- [ ] **Step 2: Run the tests and confirm missing path helper and 29 uncovered paths**

Run: `node --test tests/tools/security-mission-completion.test.js tests/tools/security-mission-validation.test.js`

Expected: failure for the missing project-path module and uncovered action paths.

- [ ] **Step 3: Implement safe project path reads and writes**

Allow only `target`, `options`, `output`, and `workflow` roots. Reject empty segments plus `__proto__`, `prototype`, and `constructor`. Clone only the modified branch.

- [ ] **Step 4: Add a blueprint for each of the 34 known paths**

Each blueprint defines `valuePath`, step, section, level, label, technical term, control type, default value, help, explanation, and validation. Derive `actionIds` from action rules. Merge explicit family controls over blueprints by `valuePath`.

- [ ] **Step 5: Validate values through registry controls**

Read values with `getSecurityProjectValue`. Mark required empty values beside their field. Preserve separator, CIDR, host, port, BSSID, URL, and relative-path validation.

- [ ] **Step 6: Run control, compiler, and validation suites**

Run: `node --test tests/tools/security-mission-completion.test.js tests/tools/security-mission-control-registry.test.js tests/tools/security-mission-validation.test.js tests/tools/security-mission-command-snapshots.test.js`

Expected: all pass and all 159 actions have control coverage.

- [ ] **Step 7: Commit the control slice**

```powershell
git add -- lib/tools/security-mission/project-paths.js lib/tools/security-mission/control-registry.js lib/tools/security-mission/validation.js tests/tools/security-mission-completion.test.js tests/tools/security-mission-validation.test.js
git commit -m "feat(security-mission): cover every command input"
```

### Task 3: Make selection and workflow state atomic

**Files:**
- Modify: `lib/tools/security-mission/state.js`
- Modify: `lib/tools/security-mission/workflow-registry.js`
- Modify: `lib/tools/security-mission/project-config.js`
- Modify: `lib/tools/security-mission/project-config-migrations.js`
- Modify: `tests/tools/security-mission-state.test.js`
- Modify: `tests/tools/security-mission-completion.test.js`

**Interfaces:**
- Produces: reducer actions `choose-entry-mode`, `choose-objective`, `choose-tool`, `choose-action`, `choose-workflow`, `patch-project-value`, and guarded step actions.
- Consumes: selectors, project paths, workflow resolver, and normalized imported projects.

- [ ] **Step 1: Write failing atomic-transition tests**

```js
test("choosing Nmap preserves the objective and advances to Action", () => {
  const next = securityMissionReducer(createSecurityMissionState(), {
    type: "choose-tool",
    toolId: "nmap",
  });
  assert.equal(next.project.objectiveId, "host-discovery-port-scanning");
  assert.equal(next.project.toolId, "nmap");
  assert.equal(next.stepId, "action");
});

test("choosing a workflow initializes workflow mode and steps", () => {
  const next = securityMissionReducer(createSecurityMissionState(), {
    type: "choose-workflow",
    workflowId: "host-discovery",
  });
  assert.equal(next.project.mode, "workflow");
  assert.equal(next.project.workflow.activeStepId, "step-1");
  assert.equal(next.project.workflow.steps.length, 2);
  assert.equal(next.stepId, "target");
});
```

- [ ] **Step 2: Run state tests and confirm both transitions fail**

Run: `node --test tests/tools/security-mission-state.test.js tests/tools/security-mission-completion.test.js`

Expected: action step does not advance and workflow mode/steps remain unset.

- [ ] **Step 3: Implement atomic selection transitions**

Use selector compatibility to preserve valid parent choices and clear only dependent action-owned values. Seed defaults from the selected action controls.

- [ ] **Step 4: Implement `patch-project-value`**

Dispatch one registry-owned path and use `patchSecurityProjectValue`. Retain legacy patch actions until existing tests and components migrate.

- [ ] **Step 5: Normalize imports before state replacement**

Call `migrateSecurityMissionProject`, reject unknown IDs, and keep current state when migration fails.

- [ ] **Step 6: Run state, migration, workflow, and export tests**

Run: `node --test tests/tools/security-mission-state.test.js tests/tools/security-mission-project-config.test.js tests/tools/security-mission-completion.test.js tests/tools/security-mission-exports.test.js`

Expected: all pass.

- [ ] **Step 7: Commit the state slice**

```powershell
git add -- lib/tools/security-mission/state.js lib/tools/security-mission/workflow-registry.js lib/tools/security-mission/project-config.js lib/tools/security-mission/project-config-migrations.js tests/tools/security-mission-state.test.js tests/tools/security-mission-completion.test.js
git commit -m "fix(security-mission): make builder transitions atomic"
```

### Task 4: Connect the hook to derived application state

**Files:**
- Modify: `lib/hooks/useSecurityMission.ts`
- Modify: `tests/tools/security-mission-completion.test.js`

**Interfaces:**
- Produces: `compatibleObjectives`, `compatibleTools`, `compatibleActions`, `stepGuard`, `activeControls`, `generatedCommand`, workflow commands, and local actions.
- Consumes: Tasks 1–3 domain interfaces.

- [ ] **Step 1: Add a failing reducer-to-compiler journey**

Drive scope → objective → Nmap → host-discovery action → `target.network` through reducer actions and assert the compiler returns `nmap -sn 10.10.10.0/24`.

- [ ] **Step 2: Run the journey and confirm it fails at target patching**

Run: `node --test tests/tools/security-mission-completion.test.js`

- [ ] **Step 3: Replace direct catalog reads in the hook**

Memoize compatible selectors and active controls. Validate using the same controls. Compile only a compatible selected action. Resolve workflow projects before compiling steps.

- [ ] **Step 4: Harden clipboard, download, and import handlers**

Use `try/finally` for object URLs, normalize imported JSON, expose a visible import result, and never fetch.

- [ ] **Step 5: Run domain and TypeScript checks**

Run: `node --test tests/tools/security-mission-completion.test.js && npx tsc --noEmit`

Expected: pass with no type errors.

- [ ] **Step 6: Commit the hook slice**

```powershell
git add -- lib/hooks/useSecurityMission.ts tests/tools/security-mission-completion.test.js
git commit -m "feat(security-mission): connect guided builder state"
```

### Task 5: Rebuild the accessible guided interface

**Files:**
- Create: `components/tools/security-mission/ActionBrowser.tsx`
- Modify: `components/tools/security-mission/SecurityMissionNavigator.tsx`
- Modify: `components/tools/security-mission/ObjectiveBrowser.tsx`
- Modify: `components/tools/security-mission/ToolBrowser.tsx`
- Modify: `components/tools/security-mission/WorkflowBrowser.tsx`
- Modify: `components/tools/security-mission/SecurityMissionRail.tsx`
- Modify: `components/tools/security-mission/SecurityMissionStepPanel.tsx`
- Modify: `components/tools/security-mission/SecurityControlRenderer.tsx`
- Modify: `components/tools/security-mission/SecurityField.tsx`
- Modify: `components/tools/security-mission/SecurityMissionShell.tsx`
- Modify: `tests/tools/security-mission-responsive.test.js`

**Interfaces:**
- Produces: semantic chooser buttons, bound fields, guarded progress, and responsive configure/command tabs.
- Consumes: hook state and semantic dispatch actions.

- [ ] **Step 1: Replace the responsive placeholder with a failing live journey**

The CDP test must load the route, enter `nmap` in tool search without a console error, choose Nmap, choose “Nmap host discovery,” enter `10.10.10.0/24`, and observe `nmap -sn 10.10.10.0/24`.

- [ ] **Step 2: Run the browser test and confirm the current route fails**

Run: `npm run test:security-mission:responsive`

Expected: failure from the search error or missing action choice.

- [ ] **Step 3: Build semantic discovery components**

Use `<button>` cards with `aria-pressed`, safe optional metadata, a labelled search field, result live region, empty-state recovery, and compatibility counts. Add `ActionBrowser` for the selected tool.

- [ ] **Step 4: Rebuild the step panel**

Render one chooser or form per active step. Bind all labels, help, and errors. Dispatch `patch-project-value` with `control.valuePath`. Show Previous, step position, and guarded Continue in the panel footer.

- [ ] **Step 5: Rebuild shell semantics**

Use one route `<section>`, no nested `<main>`, `aria-pressed` learning levels, `aria-current="step"` rail, and tablist/tab/tabpanel mobile workspace semantics. Remove the independent `useState` workspace tab.

- [ ] **Step 6: Run the browser journey**

Run: `npm run test:security-mission:responsive`

Expected: core Nmap journey and search pass.

- [ ] **Step 7: Commit the interaction slice**

```powershell
git add -- components/tools/security-mission tests/tools/security-mission-responsive.test.js
git commit -m "feat(security-mission): rebuild the guided interaction"
```

### Task 6: Apply the site-native visual system and command trace

**Files:**
- Modify: `components/tools/security-mission/SecurityMission.module.css`
- Create: `components/tools/security-mission/CommandAssemblyTrace.tsx`
- Modify: `components/tools/security-mission/CommandPreviewPanel.tsx`
- Modify: `components/tools/security-mission/WorkflowPreviewPanel.tsx`
- Modify: `components/tools/security-mission/SecurityWarningPanel.tsx`
- Modify: `components/tools/security-mission/SecurityExplanation.tsx`
- Modify: `components/tools/security-mission/SecurityMissionShell.tsx`
- Modify: `tests/tools/security-mission-responsive.test.js`

**Interfaces:**
- Produces: complete scoped presentation and compiler-token trace.
- Consumes: compiler `tokens`, action rules, controls, validation, and portfolio tokens.

- [ ] **Step 1: Add failing computed-style and containment assertions**

For every viewport assert document width equals viewport width, the expected workspace panel count is visible, controls remain within panels, the rail remains inside the route, and no computed background image contains `gradient`.

- [ ] **Step 2: Run the responsive suite and confirm style assertions fail**

Run: `npm run test:security-mission:responsive`

- [ ] **Step 3: Replace the 30-line CSS module**

Port Model Mission proportions, spacing, focus treatment, and breakpoint behavior into Security Mission class names. Keep the command-builder identity through the compact authorization strip and token trace. Import the module once in `SecurityMissionShell.tsx` and pass classes to children.

- [ ] **Step 4: Build the command assembly trace**

Render executable, fixed flags, conditional flags, values, and unresolved values as typed segments. Link each value token to the matching control label through `valuePath`. Keep the final command as compiler output.

- [ ] **Step 5: Finish command and workflow previews**

Add single-line/formatted toggles, source evidence, polite copy status, disabled reasons, local export controls, and contained preformatted output.

- [ ] **Step 6: Run responsive and TypeScript checks**

Run: `npm run test:security-mission:responsive && npx tsc --noEmit`

Expected: all seven viewports, presentation contracts, and types pass.

- [ ] **Step 7: Commit the visual slice**

```powershell
git add -- components/tools/security-mission tests/tools/security-mission-responsive.test.js
git commit -m "feat(security-mission): apply the command workbench design"
```

### Task 7: Complete import, export, and acceptance coverage

**Files:**
- Create: `components/tools/security-mission/SecurityProjectImport.tsx`
- Modify: `lib/tools/security-mission/exports.js`
- Modify: `components/tools/security-mission/SecurityMissionStepPanel.tsx`
- Modify: `components/tools/security-mission/CommandPreviewPanel.tsx`
- Modify: `tests/tools/security-mission-exports.test.js`
- Modify: `tests/tools/security-mission-responsive.test.js`
- Modify: `tests/tools/security-mission-live-route.test.js`
- Modify: `docs/reports/2026-07-29-security-mission-audit.md`
- Modify: `docs/reports/2026-07-29-security-mission-evidence.json`

**Interfaces:**
- Produces: sanitized JSON import/export, Markdown runbook, command list, supported low-risk shell artifact, and live acceptance evidence.
- Consumes: normalized project state and compiled command/workflow results.

- [ ] **Step 1: Write failing export and browser import tests**

Assert sensitive fields remain redacted, workflow runbooks include every step and host role, unsupported high-risk scripts throw, and importing an exported project restores non-sensitive choices in the live UI.

- [ ] **Step 2: Run focused tests and confirm failures**

Run: `node --test tests/tools/security-mission-exports.test.js tests/tools/security-mission-responsive.test.js`

- [ ] **Step 3: Complete export builders**

Build deterministic Markdown and plain-text artifacts from compiled step records. Add shell headers only for supported low-risk workflows. Preserve the current redaction helper.

- [ ] **Step 4: Add local import UI**

Use a labelled file input accepting JSON, read with `File.text()`, dispatch the normalized import, and show changes or a specific failure without replacing valid current state.

- [ ] **Step 5: Make the live-route test fail closed**

Start or reuse a server. If Chrome or Edge exists, route errors fail the test. Do not swallow fetch failures.

- [ ] **Step 6: Run the full completion gate**

```powershell
npm run test:security-mission
npm run test:security-mission:responsive
npx tsc --noEmit
npm run build
```

Expected: every command exits 0.

- [ ] **Step 7: Audit the live route**

Repeat objective-first, tool-first, workflow, search, invalid value, level preservation, copy, export, import, keyboard, and mobile-tab journeys. Record console errors, viewport measurements, and counts in the two report files.

- [ ] **Step 8: Commit completion evidence**

```powershell
git add -- components/tools/security-mission/SecurityProjectImport.tsx lib/tools/security-mission/exports.js components/tools/security-mission/SecurityMissionStepPanel.tsx components/tools/security-mission/CommandPreviewPanel.tsx tests/tools/security-mission-exports.test.js tests/tools/security-mission-responsive.test.js tests/tools/security-mission-live-route.test.js docs/reports/2026-07-29-security-mission-audit.md docs/reports/2026-07-29-security-mission-evidence.json
git commit -m "test(security-mission): verify completed command builder"
```

## Final Review Checklist

- [ ] The live page imports and uses `SecurityMission.module.css`.
- [ ] Tool search never reads absent metadata.
- [ ] Objective-first, tool-first, and workflow entry work.
- [ ] Action selection is visible and keyboard operable.
- [ ] Every action argument path has a control or fixed source.
- [ ] Target controls write to `project.target`.
- [ ] Configure controls write to `project.options` or `project.output`.
- [ ] Workflow selection initializes mode, steps, and active step.
- [ ] Command tokens map back to source fields.
- [ ] Validation blocks generation and names the correction.
- [ ] Copy and local downloads expose visible status.
- [ ] Import normalizes data and preserves the current project on failure.
- [ ] One panel appears below 960 pixels and two appear at or above it.
- [ ] The seven required viewport tests have no page overflow.
- [ ] The route has no nested `main`, clickable `div`, unbound label, or hidden desktop mobile tabs.
- [ ] The browser console stays clean throughout acceptance journeys.
- [ ] Node tests, responsive tests, TypeScript, and production build all pass from fresh runs.
