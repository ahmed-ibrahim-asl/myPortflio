"use client";

import React, { useEffect, useMemo, useReducer, useRef } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import {
  ConfigurationField,
  type GeneratorField,
} from "@/components/tools/ml-generator/ConfigurationField";
import { GeneratorCodePanel } from "@/components/tools/ml-generator/GeneratorCodePanel";
import {
  GeneratorInfoTabs,
  type GeneratorInfoTab,
} from "@/components/tools/ml-generator/GeneratorInfoTabs";
import {
  ML_TEMPLATES,
  buildMlGeneratorResult,
  getDefaultConfig,
  getFieldOptions,
  getVisibleFields,
  normalizeTemplateConfig,
} from "@/lib/tools/ml-templates";

type Mode = "starter" | "production";

type FieldMetadata = GeneratorField & {
  disabledWhen?: (config: Record<string, unknown>, mode: Mode) => boolean;
};

type TemplateMetadata = {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  fields: FieldMetadata[];
};

type GeneratorState = {
  mode: Mode;
  templateId: string;
  config: Record<string, unknown>;
  rawNumericValues: Record<string, string>;
  activeInfoTab: GeneratorInfoTab;
  copyStatus: "idle" | "copied" | "failed";
  correctionMessage: string;
};

type GeneratorAction =
  | { type: "set-mode"; mode: Mode }
  | { type: "set-template"; templateId: string }
  | { type: "set-field"; fieldId: string; value: string | boolean }
  | { type: "set-raw-number"; fieldId: string; value: string }
  | { type: "commit-number"; fieldId: string }
  | { type: "set-tab"; tab: GeneratorInfoTab }
  | { type: "set-copy-status"; status: GeneratorState["copyStatus"] }
  | { type: "clear-correction" };

const TEMPLATES = ML_TEMPLATES as unknown as TemplateMetadata[];

function getTemplateMetadata(templateId: string) {
  return TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0];
}

function buildRawNumericValues(
  templateId: string,
  config: Record<string, unknown>,
) {
  const template = getTemplateMetadata(templateId);
  if (!template) return {};
  return Object.fromEntries(
    template.fields
      .filter((field) => field.inputType === "number")
      .map((field) => [field.id, String(config[field.id] ?? "")]),
  );
}

function withCommittedConfig(
  state: GeneratorState,
  inputConfig: Record<string, unknown>,
  correctionMessage = "",
): GeneratorState {
  const config = normalizeTemplateConfig(
    state.templateId,
    inputConfig,
    state.mode,
  ) as Record<string, unknown>;
  return {
    ...state,
    config,
    rawNumericValues: buildRawNumericValues(state.templateId, config),
    copyStatus: "idle",
    correctionMessage,
  };
}

function createInitialState(): GeneratorState {
  const templateId = TEMPLATES[0]?.id ?? "";
  const config = templateId
    ? getDefaultConfig(templateId, "starter") as Record<string, unknown>
    : {};
  return {
    mode: "starter",
    templateId,
    config,
    rawNumericValues: buildRawNumericValues(templateId, config),
    activeInfoTab: "dependencies",
    copyStatus: "idle",
    correctionMessage: "",
  };
}

function generatorReducer(
  state: GeneratorState,
  action: GeneratorAction,
): GeneratorState {
  if (action.type === "set-mode") {
    if (action.mode === state.mode) return state;
    const template = getTemplateMetadata(state.templateId);
    const defaults = getDefaultConfig(
      state.templateId,
      action.mode,
    ) as Record<string, unknown>;
    const sharedValues = Object.fromEntries(
      (template?.fields ?? [])
        .filter((field) => field.modes.includes("starter") && field.modes.includes("production"))
        .map((field) => [field.id, state.config[field.id]]),
    );
    const config = normalizeTemplateConfig(
      state.templateId,
      { ...defaults, ...sharedValues },
      action.mode,
    ) as Record<string, unknown>;
    return {
      ...state,
      mode: action.mode,
      config,
      rawNumericValues: buildRawNumericValues(state.templateId, config),
      copyStatus: "idle",
      correctionMessage: action.mode === "production"
        ? "Production-oriented defaults loaded; shared choices were preserved."
        : "Starter controls restored; shared choices were preserved.",
    };
  }

  if (action.type === "set-template") {
    const config = getDefaultConfig(
      action.templateId,
      state.mode,
    ) as Record<string, unknown>;
    return {
      ...state,
      templateId: action.templateId,
      config,
      rawNumericValues: buildRawNumericValues(action.templateId, config),
      activeInfoTab: "dependencies",
      copyStatus: "idle",
      correctionMessage: "Template defaults loaded.",
    };
  }

  if (action.type === "set-field") {
    return withCommittedConfig(state, {
      ...state.config,
      [action.fieldId]: action.value,
    });
  }

  if (action.type === "set-raw-number") {
    return {
      ...state,
      rawNumericValues: {
        ...state.rawNumericValues,
        [action.fieldId]: action.value,
      },
      correctionMessage: "",
    };
  }

  if (action.type === "commit-number") {
    const template = getTemplateMetadata(state.templateId);
    const field = template?.fields.find((item) => item.id === action.fieldId);
    if (!field || field.inputType !== "number") return state;

    const rawValue = state.rawNumericValues[action.fieldId] ?? "";
    const previousValue = Number(state.config[action.fieldId]);
    const defaultValue = Number(
      (getDefaultConfig(state.templateId, state.mode) as Record<string, unknown>)[field.id],
    );
    let numericValue = Number(rawValue);
    let corrected = false;

    if (!rawValue.trim() || !Number.isFinite(numericValue)) {
      numericValue = Number.isFinite(previousValue) ? previousValue : defaultValue;
      corrected = true;
    }
    if (typeof field.min === "number" && numericValue < field.min) {
      numericValue = field.min;
      corrected = true;
    }
    if (typeof field.max === "number" && numericValue > field.max) {
      numericValue = field.max;
      corrected = true;
    }
    if (field.step === 1 && !Number.isInteger(numericValue)) {
      numericValue = Math.round(numericValue);
      corrected = true;
    }

    return withCommittedConfig(
      state,
      { ...state.config, [field.id]: numericValue },
      corrected ? `${field.label} was restored to ${numericValue}.` : "",
    );
  }

  if (action.type === "set-tab") {
    return { ...state, activeInfoTab: action.tab };
  }
  if (action.type === "set-copy-status") {
    return { ...state, copyStatus: action.status };
  }
  if (action.type === "clear-correction") {
    return { ...state, correctionMessage: "" };
  }
  return state;
}

export default function AIScriptGeneratorPage() {
  const [state, dispatch] = useReducer(generatorReducer, undefined, createInitialState);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo(
    () => buildMlGeneratorResult(state.templateId, state.config, state.mode),
    [state.templateId, state.config, state.mode],
  );
  const validationErrors = result.validationErrors as Record<string, string>;
  const template = getTemplateMetadata(state.templateId);
  const visibleFields = useMemo(
    () => getVisibleFields(
      state.templateId,
      state.config,
      state.mode,
    ) as FieldMetadata[],
    [state.templateId, state.config, state.mode],
  );
  const primaryFields = visibleFields.filter((field) => field.modes.includes("starter"));
  const advancedFields = visibleFields.filter((field) => !field.modes.includes("starter"));
  const runtimeOptions = getFieldOptions(
    state.templateId,
    "environment",
    state.config,
    state.mode,
  ) as Array<{ value: string; label: string }>;
  const runtimeLabel = runtimeOptions.find(
    (option) => option.value === state.config.environment,
  )?.label ?? String(state.config.environment ?? "Not selected");

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const handleCopy = async () => {
    if (!result.code) return;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(result.code);
      dispatch({ type: "set-copy-status", status: "copied" });
    } catch {
      dispatch({ type: "set-copy-status", status: "failed" });
    }
    copyTimer.current = setTimeout(() => {
      dispatch({ type: "set-copy-status", status: "idle" });
    }, 2000);
  };

  if (!template) {
    return (
      <section className="section shell tool-page">
        <SectionHeading eyebrow="Engineering utility" title="AI Script Generator" />
        <p>No script templates are currently available.</p>
      </section>
    );
  }

  const renderField = (field: FieldMetadata) => (
    <ConfigurationField
      key={field.id}
      templateId={state.templateId}
      field={field}
      value={state.config[field.id]}
      rawNumericValue={state.rawNumericValues[field.id]}
      options={getFieldOptions(
        state.templateId,
        field.id,
        state.config,
        state.mode,
      ) as Array<{ value: string; label: string; disabled?: boolean }>}
      error={validationErrors[field.id]}
      disabled={field.disabledWhen?.(state.config, state.mode) ?? false}
      onValueChange={(fieldId, value) => dispatch({
        type: "set-field",
        fieldId,
        value,
      })}
      onRawNumericChange={(fieldId, value) => dispatch({
        type: "set-raw-number",
        fieldId,
        value,
      })}
      onNumericCommit={(fieldId) => dispatch({ type: "commit-number", fieldId })}
    />
  );

  return (
    <section className="section shell tool-page">
      <div className="ml-generator-heading">
        <Link href="/tools" className="text-link">
          <span aria-hidden="true">&larr;</span> Back to Tools
        </Link>
        <SectionHeading eyebrow="Engineering utility" title="AI Script Generator" />
        <p className="section-intro">
          Configure complete Python workflows for YOLO, sensor intelligence, and edge AI without memorizing framework function syntax.
        </p>
      </div>

      <div className="ml-generator-page ml-generator-grid">
        <aside className="ml-generator-config-panel" aria-label="Script configuration">
          <div className="ml-generator-panel-heading">
            <span className="ml-generator-panel-kicker">Configuration vector</span>
            <p>{template.shortDescription}</p>
          </div>

          <div className="ml-generator-mode" role="group" aria-label="Generator mode">
            <button
              type="button"
              className={state.mode === "starter" ? "is-active" : ""}
              aria-pressed={state.mode === "starter"}
              onClick={() => dispatch({ type: "set-mode", mode: "starter" })}
            >
              Starter
            </button>
            <button
              type="button"
              className={state.mode === "production" ? "is-active" : ""}
              aria-pressed={state.mode === "production"}
              onClick={() => dispatch({ type: "set-mode", mode: "production" })}
            >
              Production-oriented
            </button>
          </div>

          <div className="ml-generator-field tool-input">
            <label htmlFor="ml-generator-template">Script template</label>
            <select
              id="ml-generator-template"
              name="templateId"
              value={state.templateId}
              onChange={(event) => dispatch({
                type: "set-template",
                templateId: event.target.value,
              })}
            >
              {TEMPLATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="ml-generator-field-help">Choose the workflow family; compatible fields update immediately.</p>
          </div>

          <div className="ml-generator-field-stack">
            {primaryFields.map(renderField)}
          </div>

          {state.mode === "production" && advancedFields.length > 0 ? (
            <details className="ml-generator-advanced" open>
              <summary>Advanced training and export controls</summary>
              <div className="ml-generator-field-stack">
                {advancedFields.map(renderField)}
              </div>
            </details>
          ) : null}

          <p className="ml-generator-correction" aria-live="polite">
            {state.correctionMessage}
          </p>
        </aside>

        <section
          className="ml-generator-output-panel"
          aria-label="Generated Python output"
          style={{ minWidth: 0 }}
        >
          <GeneratorCodePanel
            filename={result.filename}
            code={result.code}
            validationErrors={validationErrors}
            warnings={result.warnings}
            copyStatus={state.copyStatus}
            onCopy={handleCopy}
          />

          <dl className="ml-generator-readiness" aria-label="Pipeline readiness">
            <div><dt>Data shape</dt><dd>{result.dataset.title ?? "Dataset"}</dd></div>
            <div><dt>Primary metric</dt><dd>{result.metrics[0] ?? "Configured"}</dd></div>
            <div><dt>Compute target</dt><dd>{runtimeLabel}</dd></div>
            <div><dt>Deployment</dt><dd>{result.deployment[0] ?? "Python artifact"}</dd></div>
          </dl>

          <GeneratorInfoTabs
            templateId={state.templateId}
            activeTab={state.activeInfoTab}
            dependencies={result.dependencies}
            dataset={result.dataset}
            hardware={result.hardware}
            metrics={result.metrics}
            deployment={result.deployment}
            notes={result.notes}
            warnings={result.warnings}
            onTabChange={(tab) => dispatch({ type: "set-tab", tab })}
          />
        </section>
      </div>
    </section>
  );
}
