"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  useSecurityMission,
} from "@/lib/hooks/useSecurityMission";
import {
  SECURITY_MISSION_STEPS,
} from "@/lib/tools/security-mission/catalog.js";
import {
  SECURITY_WORKFLOWS,
} from "@/lib/tools/security-mission/workflow-registry.js";

import { CommandPreviewPanel } from "./CommandPreviewPanel";
import { SecurityMissionRail } from "./SecurityMissionRail";
import { SecurityMissionStepPanel } from "./SecurityMissionStepPanel";
import { WorkflowPreviewPanel } from "./WorkflowPreviewPanel";
import styles from "./SecurityMission.module.css";

export function SecurityMissionShell() {
  const [hydrated, setHydrated] = useState(false);
  const {
    state,
    dispatch,
    objective,
    tool,
    action,
    workflow,
    compatibleObjectives,
    compatibleTools,
    compatibleActions,
    controls,
    allActionControls,
    validation,
    stepValidation,
    stepGuard,
    generatedCommand,
    generationError,
    compiledWorkflowSteps,
    recommendations,
    copyStatus,
    copyCommand,
    downloadProject,
    downloadRunbook,
    importProject,
  } = useSecurityMission();
  useEffect(() => {
    setHydrated(true);
  }, []);
  const currentIndex = SECURITY_MISSION_STEPS.findIndex(
    ({ id }) => id === state.stepId,
  );
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < SECURITY_MISSION_STEPS.length - 1;
  const nextStep = canGoNext
    ? SECURITY_MISSION_STEPS[currentIndex + 1]
    : null;

  const goToStep = (stepId: string) => {
    const targetIndex = SECURITY_MISSION_STEPS.findIndex(
      ({ id }) => id === stepId,
    );
    if (targetIndex <= currentIndex) {
      dispatch({ type: "go-to-step", stepId });
      return;
    }
    if (targetIndex === currentIndex + 1) {
      dispatch({
        type: "go-to-step",
        stepId,
        allowed: stepGuard.allowed,
        reason: stepGuard.reason,
      });
      return;
    }
    dispatch({
      type: "go-to-step",
      stepId,
      allowed: false,
      reason: "Continue through each mission decision in order.",
    });
  };

  const continueStep = () => {
    if (!nextStep) {
      dispatch({ type: "set-workspace-tab", tab: "command" });
      return;
    }
    dispatch({
      type: "next-step",
      allowed: stepGuard.allowed,
      reason: stepGuard.reason,
    });
  };

  const chooseTokenSource = (valuePath: string) => {
    dispatch({ type: "set-focused-value-path", valuePath });
    dispatch({ type: "set-workspace-tab", tab: "configure" });
    window.requestAnimationFrame(() => {
      const field = document.querySelector(
        `[data-control-path="${CSS.escape(valuePath)}"]`,
      );
      const control = field?.querySelector<HTMLElement>(
        "input, select, button",
      );
      control?.focus();
    });
  };

  const activeMission =
    workflow?.title
    ?? action?.title
    ?? tool?.name
    ?? objective?.title
    ?? "Choose a mission";

  return (
    <section
      className={styles.root}
      data-security-mission
      data-ready={hydrated ? "true" : "false"}
      data-learning-level={state.project.learningLevel}
      style={{
        "--security-panel": "#0c1023",
        "--security-panel-raised": "#121831",
        "--security-cyan": "#55d5d8",
        "--security-green": "#8edb7a",
        "--security-gold": "#f0c66c",
        "--security-red": "#f49aab",
      } as React.CSSProperties}
    >
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <Link href="/tools/" className={styles.backLink}>
              ← Back to tools
            </Link>
            <span className={styles.kicker}>Authorized command workbench</span>
            <h1>Security Mission</h1>
            <p>From objective to command, one choice at a time.</p>
          </div>
          <div className={styles.heroReadout}>
            <span>Active mission</span>
            <strong>{activeMission}</strong>
            <small>
              {state.project.mode} / {state.project.platform} / {state.project.shell}
            </small>
          </div>
        </header>

        <div className={styles.scopeBar} aria-label="Mission safety status">
          <span><i data-status="safe" /> Local generation only</span>
          <span><i data-status="scope" /> {state.project.authorizationContext.replaceAll("-", " ")}</span>
          <span><i data-status="count" /> 109 tools / 159 actions</span>
        </div>

        <div
          className={styles.levelSwitch}
          role="group"
          aria-label="Explanation level"
        >
          {[
            ["guided", "Guided", "Required choices and safe defaults"],
            ["customize", "Customize", "Common tuning and output choices"],
            ["advanced", "Advanced", "Specialist controls and protocols"],
          ].map(([value, label, help]) => (
            <button
              type="button"
              key={value}
              aria-pressed={state.project.learningLevel === value}
              data-active={
                state.project.learningLevel === value ? "true" : "false"
              }
              onClick={() => dispatch({
                type: "set-learning-level",
                level: value,
              })}
            >
              <strong>{label}</strong>
              <span>{help}</span>
            </button>
          ))}
        </div>

        <SecurityMissionRail
          currentStepId={state.stepId}
          onGoToStep={goToStep}
        />

        <div
          className={styles.mobileTabs}
          role="tablist"
          aria-label="Mobile Security Mission workspace"
        >
          <button
            type="button"
            role="tab"
            id="security-configure-tab"
            aria-controls="security-configure-panel"
            aria-selected={state.workspaceTab === "configure"}
            onClick={() => dispatch({
              type: "set-workspace-tab",
              tab: "configure",
            })}
          >
            Configure
          </button>
          <button
            type="button"
            role="tab"
            id="security-command-tab"
            aria-controls="security-command-panel"
            aria-selected={state.workspaceTab === "command"}
            onClick={() => dispatch({
              type: "set-workspace-tab",
              tab: "command",
            })}
          >
            Command
          </button>
        </div>

        <div
          className={styles.workspace}
          data-mobile-active={state.workspaceTab}
        >
          <section
            id="security-configure-panel"
            className={styles.configurePanel}
            data-security-workspace-panel="configure"
            role="tabpanel"
            aria-labelledby="security-configure-tab"
          >
            <SecurityMissionStepPanel
              stepId={state.stepId}
              project={state.project}
              dispatch={dispatch}
              controls={controls}
              validation={stepValidation}
              objective={objective}
              tool={tool}
              action={action}
              workflow={workflow}
              compatibleObjectives={compatibleObjectives}
              compatibleTools={compatibleTools}
              compatibleActions={compatibleActions}
              workflows={SECURITY_WORKFLOWS}
              entryMode={state.navigatorTab}
              recommendation={recommendations}
              importProject={importProject}
              importError={state.importError}
              importMessage={state.importMessage}
            />

            {state.guardMessage && (
              <p className={styles.guardMessage} role="alert">
                {state.guardMessage}
              </p>
            )}
            <footer className={styles.stepActions}>
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => dispatch({ type: "previous-step" })}
              >
                Previous
              </button>
              <span>
                Step {currentIndex + 1} of {SECURITY_MISSION_STEPS.length}
              </span>
              <button
                type="button"
                className={styles.primaryAction}
                data-step-continue
                onClick={continueStep}
              >
                {nextStep ? `Continue to ${nextStep.title}` : "View command"}
              </button>
            </footer>
            {!stepGuard.allowed && (
              <p className={styles.disabledReason}>
                Before continuing: {stepGuard.reason}
              </p>
            )}
          </section>

          <section
            id="security-command-panel"
            className={styles.previewPanel}
            data-security-workspace-panel="command"
            role="tabpanel"
            aria-labelledby="security-command-tab"
          >
            {state.project.mode === "workflow" && workflow ? (
              <WorkflowPreviewPanel
                workflow={workflow}
                compiledSteps={compiledWorkflowSteps}
                copyStatus={copyStatus}
                onCopyCommand={copyCommand}
                onDownloadRunbook={downloadRunbook}
                onExportProject={downloadProject}
              />
            ) : (
              <CommandPreviewPanel
                generatedCommand={generatedCommand}
                generationError={generationError}
                authorizationContext={state.project.authorizationContext}
                privilege={(action as any)?.privilege}
                copyStatus={copyStatus}
                validation={validation}
                controls={allActionControls}
                focusedValuePath={state.focusedValuePath}
                onChooseSource={chooseTokenSource}
                onCopyCommand={copyCommand}
                onDownloadRunbook={downloadRunbook}
                onExportProject={downloadProject}
              />
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
