"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { useMlGeneratorRecipe } from "@/lib/hooks/useMlGeneratorRecipe";
import {
  getRecipeDefaultConfig,
  getRecipeVisibleFields,
} from "@/lib/tools/ml-generator/engine";
import {
  getLegacyFieldsForStep,
  getModelMissionTask,
} from "@/lib/tools/ml-generator/model-mission/catalog";
import {
  getLegacySectionForField,
  hasLegacyProjectConfig,
  legacyConfigFromProject,
  legacyDefaultsToSections,
  resolveMissionGeneration,
} from "@/lib/tools/ml-generator/model-mission/legacy-bridge";
import {
  createModelMissionState,
  modelMissionReducer,
} from "@/lib/tools/ml-generator/model-mission/state";

export function useModelMission() {
  const [state, dispatch] = useReducer(
    modelMissionReducer,
    undefined,
    createModelMissionState,
  );
  const task = getModelMissionTask(state.project.taskId);
  const recipeId =
    task?.adapterId === "legacy"
      ? task.recipeId
      : "";
  const mode =
    state.project.learningLevel === "guided"
      ? "starter"
      : "production";
  const legacyConfig = useMemo<Record<string, unknown>>(
    () => legacyConfigFromProject(
      state.project,
      recipeId ?? "",
    ) as Record<string, unknown>,
    [recipeId, state.project],
  );
  const legacy = useMlGeneratorRecipe(
    recipeId ?? "",
    legacyConfig,
    mode,
    state.reloadToken,
  );

  useEffect(() => {
    if (
      !recipeId
      || legacy.status !== "ready"
      || legacy.recipe.id !== recipeId
      || hasLegacyProjectConfig(state.project, recipeId)
    ) {
      return;
    }

    const defaults = getRecipeDefaultConfig(
      legacy.recipe,
      mode,
    );
    if (Object.keys(defaults).length === 0) return;

    dispatch({
      type: "replace-sections",
      sections: legacyDefaultsToSections(
        recipeId,
        defaults,
      ),
    });
  }, [
    legacy,
    mode,
    recipeId,
    state.project,
  ]);

  const visibleLegacyFields = useMemo(() => {
    if (
      !recipeId
      || legacy.status !== "ready"
      || legacy.recipe.id !== recipeId
    ) {
      return [];
    }

    const stepFields = new Set(
      getLegacyFieldsForStep(recipeId, state.stepId),
    );
    return getRecipeVisibleFields(
      legacy.recipe,
      legacyConfig,
      "production",
    ).filter((field: { id: string }) => stepFields.has(field.id));
  }, [
    legacy,
    legacyConfig,
    mode,
    recipeId,
    state.stepId,
  ]);

  const generation = useMemo(
    () => resolveMissionGeneration({
      task,
      project: state.project,
      legacy,
    }),
    [legacy, state.project, task],
  );

  const patchLegacyField = useCallback(
    (fieldId: string, value: unknown) => {
      if (!recipeId) return;
      const section = getLegacySectionForField(
        recipeId,
        fieldId,
      );
      if (!section) return;
      dispatch({
        type: "patch-section",
        section,
        patch: { [fieldId]: value },
      });
    },
    [recipeId],
  );

  const retry = useCallback(() => {
    dispatch({ type: "retry-generator" });
  }, []);

  return {
    state,
    dispatch,
    task,
    status: generation.status,
    result: generation.result,
    error: generation.error,
    legacyRecipe:
      legacy.status === "ready"
        ? legacy.recipe
        : null,
    legacyConfig,
    visibleLegacyFields,
    patchLegacyField,
    retry,
  };
}
