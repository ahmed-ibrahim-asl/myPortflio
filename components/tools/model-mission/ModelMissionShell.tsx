"use client";

import Link from "next/link";

import { useModelMission } from "@/lib/hooks/useModelMission";
import {
  MODEL_MISSION_STEPS,
} from "@/lib/tools/ml-generator/model-mission/catalog";

import { MissionCodePanel } from "./MissionCodePanel";
import { MissionStepPanel } from "./MissionStepPanel";
import { WorkflowRail } from "./WorkflowRail";
import styles from "./ModelMission.module.css";

export function ModelMissionShell() {
  const {
    state,
    dispatch,
    task,
    status,
    result,
    error,
    legacyRecipe,
    legacyConfig,
    visibleLegacyFields,
    patchLegacyField,
    retry,
  } = useModelMission();

  if (!task) return null;

  const currentStepIndex = MODEL_MISSION_STEPS.findIndex(
    ({ id }) => id === state.stepId,
  );
  const canGoBack = currentStepIndex > 0;
  const canGoNext =
    currentStepIndex < MODEL_MISSION_STEPS.length - 1;

  const handleCopy = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      dispatch({
        type: "set-copy-status",
        status: "copied",
      });
    } catch {
      dispatch({
        type: "set-copy-status",
        status: "failed",
      });
    }
    window.setTimeout(() => {
      dispatch({
        type: "set-copy-status",
        status: "idle",
      });
    }, 1800);
  };

  const handleDownload = () => {
    if (!result?.code || !result.filename) return;
    const blob = new Blob(
      [result.code],
      { type: "text/x-python;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      className={styles.root}
      data-model-mission
      style={{
        "--panel": "#0c1023",
        "--panel-raised": "#121831",
        "--pixel-cyan": "#55d5d8",
        "--pixel-green": "#8edb7a",
        "--pixel-gold": "#f0c66c",
        "--pixel-shadow": "#02030a",
      } as React.CSSProperties}
    >
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <Link href="/tools/" className={styles.backLink}>
              ← Back to tools
            </Link>
            <span className={styles.kicker}>AI / ML guided builder</span>
            <h1>Model Mission</h1>
            <p>
              From problem to Python, one decision at a time.
            </p>
          </div>
          <div className={styles.heroReadout}>
            <span>Active mission</span>
            <strong>{task.title}</strong>
            <small>{task.technicalTerm}</small>
          </div>
        </header>

        <div
          className={styles.levelSwitch}
          role="group"
          aria-label="Explanation level"
        >
          {[
            ["guided", "Guided", "Show the concepts and safe defaults"],
            ["customize", "Customize", "Show more configuration choices"],
            ["advanced", "Advanced", "Expose production-oriented controls"],
          ].map(([value, label, help]) => (
            <button
              type="button"
              key={value}
              aria-pressed={state.project.learningLevel === value}
              data-active={
                state.project.learningLevel === value
                  ? "true"
                  : "false"
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

        <WorkflowRail
          activeStepId={state.stepId}
          onChoose={(stepId) => dispatch({
            type: "go-to-step",
            stepId,
          })}
        />

        <div
          className={styles.mobileTabs}
          data-mission-mobile-tabs
          role="tablist"
          aria-label="Mobile workspace"
        >
          <button
            type="button"
            role="tab"
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
            aria-selected={state.workspaceTab === "code"}
            onClick={() => dispatch({
              type: "set-workspace-tab",
              tab: "code",
            })}
          >
            Code
          </button>
        </div>

        <div
          className={styles.workspace}
          data-mobile-active={state.workspaceTab}
        >
          <div
            className={styles.configurePanel}
            data-mission-config-panel
            data-workspace-panel="configure"
          >
            <MissionStepPanel
              task={task}
              stepId={state.stepId}
              project={state.project}
              legacyRecipe={legacyRecipe}
              legacyConfig={legacyConfig}
              visibleLegacyFields={visibleLegacyFields}
              dispatch={dispatch}
              patchLegacyField={patchLegacyField}
            />
            <footer className={styles.stepActions}>
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => dispatch({
                  type: "previous-step",
                })}
              >
                Previous
              </button>
              <span>
                Step {currentStepIndex + 1} of{" "}
                {MODEL_MISSION_STEPS.length}
              </span>
              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => dispatch({
                    type: "next-step",
                  })}
                >
                  Continue to{" "}
                  {MODEL_MISSION_STEPS[
                    currentStepIndex + 1
                  ].shortLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({
                    type: "set-workspace-tab",
                    tab: "code",
                  })}
                >
                  View Python
                </button>
              )}
            </footer>
          </div>

          <div
            className={styles.codeWorkspace}
            data-workspace-panel="code"
          >
            <MissionCodePanel
              status={status as 'loading' | 'ready' | 'error'}
              result={result}
              error={error}
              copyStatus={state.copyStatus}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onRetry={retry}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
