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
  type LoadedMlRecipe,
  type MlGeneratorMode,
  type MlGeneratorResult,
  useMlGeneratorRecipe,
} from "@/lib/hooks/useMlGeneratorRecipe";
import { ML_RECIPE_CATALOG } from "@/lib/tools/ml-generator/catalog";
import {
  getRecipeDefaultConfig,
  getRecipeFieldOptions,
  getRecipeVisibleFields,
  normalizeRecipeConfig,
} from "@/lib/tools/ml-generator/engine";
import { prefetchRecipe } from "@/lib/tools/ml-generator/load-recipe";
import { ML_SOURCES } from "@/lib/tools/ml-generator/sources";

type FieldMetadata = GeneratorField & {
  disabledWhen?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => boolean;
};

type RecipeManifest = {
  id: string;
  title: string;
  shortDescription: string;
  domainId: string;
  taskId: string;
  frameworkId: string;
  sourceRefs: string[];
};

type GeneratorState = {
  mode: MlGeneratorMode;
  templateId: string;
  recipe: LoadedMlRecipe | null;
  config: Record<string, unknown>;
  rawNumericValues: Record<string, string>;
  activeInfoTab: GeneratorInfoTab;
  copyStatus: "idle" | "copied" | "failed";
  correctionMessage: string;
  reloadToken: number;
};

type GeneratorAction =
  | { type: "recipe-loaded"; recipe: LoadedMlRecipe }
  | { type: "set-mode"; mode: MlGeneratorMode }
  | { type: "set-template"; templateId: string }
  | { type: "set-field"; fieldId: string; value: string | boolean }
  | { type: "set-raw-number"; fieldId: string; value: string }
  | { type: "commit-number"; fieldId: string }
  | { type: "set-tab"; tab: GeneratorInfoTab }
  | { type: "set-copy-status"; status: GeneratorState["copyStatus"] }
  | { type: "retry-recipe" }
  | { type: "clear-correction" };

type SourceMetadata = {
  id: string;
  title: string;
  owner: string;
  url: string;
  sourceType: string;
  licenseStatus: string;
  licenseName: string;
  versionOrDate: string;
  verifiedAt: string;
};

const TEMPLATES = ML_RECIPE_CATALOG as unknown as RecipeManifest[];

const EMPTY_RESULT: MlGeneratorResult = {
  templateId: "",
  filename: "",
  code: "",
  dependencies: [],
  dataset: {},
  metrics: [],
  artifacts: [],
  hardware: {},
  deployment: [],
  notes: [],
  warnings: [],
  readiness: {},
  config: {},
  validationErrors: {},
};

function getTemplateMetadata(templateId: string) {
  return TEMPLATES.find((template) => template.id === templateId)
    ?? TEMPLATES[0];
}

function buildRawNumericValues(
  recipe: LoadedMlRecipe | null,
  config: Record<string, unknown>,
) {
  if (!recipe) return {};
  return Object.fromEntries(
    recipe.fields
      .filter((field) => field.inputType === "number")
      .map((field) => [field.id, String(config[field.id] ?? "")]),
  );
}

function withCommittedConfig(
  state: GeneratorState,
  inputConfig: Record<string, unknown>,
  correctionMessage = "",
): GeneratorState {
  if (!state.recipe) return state;
  const config = normalizeRecipeConfig(
    state.recipe,
    inputConfig,
    state.mode,
  ) as Record<string, unknown>;
  return {
    ...state,
    config,
    rawNumericValues: buildRawNumericValues(state.recipe, config),
    copyStatus: "idle",
    correctionMessage,
  };
}

function createInitialState(): GeneratorState {
  return {
    mode: "starter",
    templateId: TEMPLATES[0]?.id ?? "",
    recipe: null,
    config: {},
    rawNumericValues: {},
    activeInfoTab: "dependencies",
    copyStatus: "idle",
    correctionMessage: "",
    reloadToken: 0,
  };
}

function generatorReducer(
  state: GeneratorState,
  action: GeneratorAction,
): GeneratorState {
  if (action.type === "recipe-loaded") {
    if (action.recipe.id !== state.templateId) return state;
    const baseConfig = Object.keys(state.config).length > 0
      ? state.config
      : getRecipeDefaultConfig(
        action.recipe,
        state.mode,
      ) as Record<string, unknown>;
    const config = normalizeRecipeConfig(
      action.recipe,
      baseConfig,
      state.mode,
    ) as Record<string, unknown>;
    return {
      ...state,
      recipe: action.recipe,
      config,
      rawNumericValues: buildRawNumericValues(action.recipe, config),
      correctionMessage: state.correctionMessage || "Recipe ready.",
    };
  }

  if (action.type === "set-mode") {
    if (action.mode === state.mode) return state;
    if (!state.recipe) {
      return {
        ...state,
        mode: action.mode,
        correctionMessage: "The selected mode will apply when the recipe is ready.",
      };
    }
    const defaults = getRecipeDefaultConfig(
      state.recipe,
      action.mode,
    ) as Record<string, unknown>;
    const sharedValues = Object.fromEntries(
      state.recipe.fields
        .filter((field) =>
          field.modes.includes("starter")
          && field.modes.includes("production")
        )
        .map((field) => [field.id, state.config[field.id]]),
    );
    const config = normalizeRecipeConfig(
      state.recipe,
      { ...defaults, ...sharedValues },
      action.mode,
    ) as Record<string, unknown>;
    return {
      ...state,
      mode: action.mode,
      config,
      rawNumericValues: buildRawNumericValues(state.recipe, config),
      copyStatus: "idle",
      correctionMessage: action.mode === "production"
        ? "Production-oriented defaults loaded; shared choices were preserved."
        : "Starter controls restored; shared choices were preserved.",
    };
  }

  if (action.type === "set-template") {
    if (action.templateId === state.templateId) return state;
    return {
      ...state,
      templateId: action.templateId,
      recipe: null,
      config: {},
      rawNumericValues: {},
      activeInfoTab: "dependencies",
      copyStatus: "idle",
      correctionMessage: "Loading template configuration.",
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
    const field = state.recipe?.fields.find(
      (item) => item.id === action.fieldId,
    );
    if (!state.recipe || !field || field.inputType !== "number") return state;

    const rawValue = state.rawNumericValues[action.fieldId] ?? "";
    const previousValue = Number(state.config[action.fieldId]);
    const defaultValue = Number(
      (
        getRecipeDefaultConfig(
          state.recipe,
          state.mode,
        ) as Record<string, unknown>
      )[field.id],
    );
    let numericValue = Number(rawValue);
    let corrected = false;

    if (!rawValue.trim() || !Number.isFinite(numericValue)) {
      numericValue = Number.isFinite(previousValue)
        ? previousValue
        : defaultValue;
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
  if (action.type === "retry-recipe") {
    return {
      ...state,
      recipe: null,
      reloadToken: state.reloadToken + 1,
      correctionMessage: "Retrying recipe load.",
    };
  }
  if (action.type === "clear-correction") {
    return { ...state, correctionMessage: "" };
  }
  return state;
}

export default function AIScriptGeneratorPage() {
  const [state, dispatch] = useReducer(
    generatorReducer,
    undefined,
    createInitialState,
  );
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useMlGeneratorRecipe(
    state.templateId,
    state.config,
    state.mode,
    state.reloadToken,
  );

  useEffect(() => {
    const defaultRecipeId = TEMPLATES[0]?.id;
    if (defaultRecipeId) prefetchRecipe(defaultRecipeId);
  }, []);

  useEffect(() => {
    if (
      loaded.status === "ready"
      && loaded.recipe.id === state.templateId
      && state.recipe !== loaded.recipe
    ) {
      dispatch({ type: "recipe-loaded", recipe: loaded.recipe });
    }
  }, [loaded, state.recipe, state.templateId]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const template = getTemplateMetadata(state.templateId);
  const recipeReady =
    loaded.status === "ready"
    && state.recipe?.id === state.templateId;
  const displayStatus =
    loaded.status === "error"
      ? "error"
      : recipeReady
        ? "ready"
        : loaded.status === "idle"
          ? "idle"
          : "loading";
  const result = loaded.result ?? EMPTY_RESULT;
  const validationErrors = result.validationErrors;

  const visibleFields = useMemo(
    () => state.recipe
      ? getRecipeVisibleFields(
        state.recipe,
        state.config,
        state.mode,
      ) as FieldMetadata[]
      : [],
    [state.config, state.mode, state.recipe],
  );
  const primaryFields = visibleFields.filter((field) =>
    field.modes.includes("starter")
  );
  const advancedFields = visibleFields.filter((field) =>
    !field.modes.includes("starter")
  );
  const runtimeOptions = state.recipe
    ? getRecipeFieldOptions(
      state.recipe,
      "environment",
      state.config,
      state.mode,
    ) as Array<{ value: string; label: string }>
    : [];
  const runtimeLabel = runtimeOptions.find(
    (option) => option.value === state.config.environment,
  )?.label ?? String(state.config.environment ?? "Loading");
  const sources = state.recipe
    ? ML_SOURCES.filter((source: SourceMetadata) =>
      state.recipe?.sourceRefs.includes(source.id)
    ) as unknown as SourceMetadata[]
    : [];

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
        <SectionHeading
          eyebrow="Engineering utility"
          title="AI Script Generator"
        />
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
      options={state.recipe
        ? getRecipeFieldOptions(
          state.recipe,
          field.id,
          state.config,
          state.mode,
        ) as Array<{ value: string; label: string; disabled?: boolean }>
        : []}
      error={validationErrors[field.id]}
      disabled={
        displayStatus !== "ready"
        || (field.disabledWhen?.(state.config, state.mode) ?? false)
      }
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
      onNumericCommit={(fieldId) => dispatch({
        type: "commit-number",
        fieldId,
      })}
    />
  );

  return (
    <section className="section shell tool-page">
      <div className="ml-generator-heading">
        <Link href="/tools" className="text-link">
          <span aria-hidden="true">&larr;</span> Back to Tools
        </Link>
        <SectionHeading
          eyebrow="Engineering utility"
          title="AI Script Generator"
        />
        <p className="section-intro">
          Configure complete Python workflows for YOLO, sensor intelligence,
          and edge AI without memorizing framework function syntax.
        </p>
      </div>

      <div className="ml-generator-page ml-generator-grid">
        <aside
          className="ml-generator-config-panel"
          aria-label="Script configuration"
          aria-busy={displayStatus === "loading"}
        >
          <div className="ml-generator-panel-heading">
            <span className="ml-generator-panel-kicker">
              Configuration vector
            </span>
            <p>{template.shortDescription}</p>
          </div>

          <div
            className="ml-generator-mode"
            role="group"
            aria-label="Generator mode"
          >
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
              onClick={() => dispatch({
                type: "set-mode",
                mode: "production",
              })}
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
                  {item.title}
                </option>
              ))}
            </select>
            <p className="ml-generator-field-help">
              Choose the workflow family; its generator loads only when selected.
            </p>
          </div>

          {state.recipe ? (
            <>
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
            </>
          ) : (
            <div className="ml-generator-config-loading" role="status">
              <span />
              <span />
              <span />
              <p>Loading compatible configuration controls?</p>
            </div>
          )}

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
            status={displayStatus}
            filename={result.filename}
            code={result.code}
            validationErrors={validationErrors}
            warnings={result.warnings}
            errorMessage={loaded.error?.message}
            copyStatus={state.copyStatus}
            onCopy={handleCopy}
            onRetry={() => dispatch({ type: "retry-recipe" })}
          />

          <dl className="ml-generator-readiness" aria-label="Pipeline readiness">
            <div>
              <dt>Data shape</dt>
              <dd>{result.dataset.title ?? "Loading recipe"}</dd>
            </div>
            <div>
              <dt>Primary metric</dt>
              <dd>{result.metrics[0] ?? "Loading"}</dd>
            </div>
            <div>
              <dt>Compute target</dt>
              <dd>{runtimeLabel}</dd>
            </div>
            <div>
              <dt>Deployment</dt>
              <dd>{result.deployment[0] ?? "Python artifact"}</dd>
            </div>
          </dl>

          {recipeReady ? (
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
              sources={sources}
              onTabChange={(tab) => dispatch({ type: "set-tab", tab })}
            />
          ) : (
            <div className="ml-generator-info ml-generator-info-loading">
              Recipe guidance will appear when loading completes.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
