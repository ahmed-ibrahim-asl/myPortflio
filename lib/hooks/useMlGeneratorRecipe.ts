"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { buildRecipeResult } from "@/lib/tools/ml-generator/engine";
import { loadRecipe } from "@/lib/tools/ml-generator/load-recipe";

export type MlGeneratorMode = "starter" | "production";

export type MlGeneratorFieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type MlGeneratorField = {
  id: string;
  label: string;
  inputType: "select" | "number" | "text" | "toggle";
  helpText: string;
  modes: MlGeneratorMode[];
  min?: number;
  max?: number;
  step?: number;
  options?: MlGeneratorFieldOption[];
  visibleWhen?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => boolean;
  disabledWhen?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => boolean;
  getOptions?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => MlGeneratorFieldOption[];
};

export type MlGeneratorDependency = {
  package: string;
  version: string;
  purpose: string;
};

export type MlGeneratorDataset = {
  title?: string;
  summary?: string;
  structure?: string;
  examplePaths?: string[];
  labelFormat?: string;
};

export type MlGeneratorHardware = {
  minimum?: string;
  recommended?: string;
  edge?: string;
};

export type LoadedMlRecipe = {
  id: string;
  title: string;
  name: string;
  shortDescription: string;
  category: string;
  sourceRefs: string[];
  fields: MlGeneratorField[];
  defaults: Record<MlGeneratorMode, Record<string, unknown>>;
  normalize: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => Record<string, unknown>;
  validate: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => Record<string, string>;
  generate: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => string;
  filename: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => string;
  dependencies: MlGeneratorDependency[];
  dataset: MlGeneratorDataset;
  metrics: string[];
  artifacts: string[];
  hardware: MlGeneratorHardware;
  deployment: string[];
  notes: string[];
  warnings: string[];
  getWarnings?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => string[];
  getNotes?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => string[];
  getReadiness?: (
    config: Record<string, unknown>,
    mode: MlGeneratorMode,
  ) => Record<string, string>;
};

export type MlGeneratorResult = {
  templateId: string;
  filename: string;
  code: string;
  dependencies: MlGeneratorDependency[];
  dataset: MlGeneratorDataset;
  metrics: string[];
  artifacts: string[];
  hardware: MlGeneratorHardware;
  deployment: string[];
  notes: string[];
  warnings: string[];
  readiness: Record<string, string>;
  config: Record<string, unknown>;
  validationErrors: Record<string, string>;
};

type LoadState =
  | {
      recipeId: string;
      status: "idle" | "loading";
      recipe: null;
      error: null;
    }
  | {
      recipeId: string;
      status: "ready";
      recipe: LoadedMlRecipe;
      error: null;
    }
  | {
      recipeId: string;
      status: "error";
      recipe: null;
      error: Error;
    };

const INITIAL_STATE: LoadState = {
  recipeId: "",
  status: "idle",
  recipe: null,
  error: null,
};
const failedOnceRecipeIds = new Set<string>();

function loadRecipeForClient(recipeId: string) {
  if (
    process.env.NODE_ENV === "production"
    || typeof window === "undefined"
  ) {
    return loadRecipe(recipeId);
  }

  const params = new URLSearchParams(window.location.search);
  const configuredDelay = Number(params.get("recipeLoadDelay") ?? 0);
  const delayMs =
    Number.isFinite(configuredDelay) && configuredDelay > 0
      ? Math.min(configuredDelay, 2_000)
      : 0;
  const failOnceRecipeId = params.get("recipeLoadFailOnce");

  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  }).then(() => {
    if (
      failOnceRecipeId === recipeId
      && !failedOnceRecipeIds.has(recipeId)
    ) {
      failedOnceRecipeIds.add(recipeId);
      throw new Error("Simulated recipe load failure.");
    }
    return loadRecipe(recipeId);
  });
}


export function useMlGeneratorRecipe(
  recipeId: string,
  config: Record<string, unknown>,
  mode: MlGeneratorMode,
  reloadToken = 0,
) {
  const requestIdRef = useRef(0);
  const [loadState, setLoadState] = useState<LoadState>(INITIAL_STATE);

  useEffect(() => {
    if (!recipeId) {
      setLoadState(INITIAL_STATE);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoadState({
      recipeId,
      status: "loading",
      recipe: null,
      error: null,
    });

    loadRecipeForClient(recipeId)
      .then((loadedRecipe: LoadedMlRecipe) => {
        if (requestIdRef.current !== requestId) return;
        setLoadState({
          recipeId,
          status: "ready",
          recipe: loadedRecipe,
          error: null,
        });
      })
      .catch((reason: unknown) => {
        if (requestIdRef.current !== requestId) return;
        setLoadState({
          recipeId,
          status: "error",
          recipe: null,
          error: reason instanceof Error
            ? reason
            : new Error("The selected recipe could not be loaded."),
        });
      });

    return () => {
      if (requestIdRef.current === requestId) {
        requestIdRef.current += 1;
      }
    };
  }, [recipeId, reloadToken]);

  const currentState: LoadState =
    loadState.recipeId === recipeId
      ? loadState
      : {
          recipeId,
          status: recipeId ? "loading" : "idle",
          recipe: null,
          error: null,
        };

  const result = useMemo<MlGeneratorResult | null>(() => {
    if (currentState.status !== "ready") return null;
    return buildRecipeResult(
      currentState.recipe,
      recipeId,
      config,
      mode,
    ) as MlGeneratorResult;
  }, [config, currentState, mode, recipeId]);

  return {
    ...currentState,
    result,
  };
}
