import { validateLoadedRecipe } from "./schema.js";

const RECIPE_LOADERS = Object.freeze({
  "yolo-detection-training": () =>
    import("./recipes/applied/yolo-detection-training.js"),
  "yolo-segmentation-training": () =>
    import("./recipes/applied/yolo-segmentation-training.js"),
  "sensor-timeseries-classification": () =>
    import("./recipes/sensor-ai/sensor-timeseries-classification.js"),
  "edge-image-classification": () =>
    import("./recipes/deployment/edge-image-classification.js"),
});

export function createRecipeLoader(recipeLoaders) {
  const recipePromiseCache = new Map();

  function hasRecipeLoader(recipeId) {
    return Object.hasOwn(recipeLoaders, recipeId);
  }

  function loadRecipe(recipeId) {
    const loader = recipeLoaders[recipeId];
    if (!loader) {
      return Promise.reject(new Error(`Unknown ML recipe: ${recipeId}`));
    }

    const cachedPromise = recipePromiseCache.get(recipeId);
    if (cachedPromise) return cachedPromise;

    let recipePromise;
    recipePromise = loader()
      .then((module) => {
        const recipe = module.recipe;
        const validationErrors = validateLoadedRecipe(recipe);
        if (
          !recipe
          || recipe.id !== recipeId
          || Object.keys(validationErrors).length > 0
        ) {
          const invalidFields = Object.keys(validationErrors);
          const errorSuffix = invalidFields.length > 0
            ? ` (${invalidFields.join(", ")})`
            : "";
          throw new Error(
            `Invalid ML recipe module: ${recipeId}${errorSuffix}`,
          );
        }
        return recipe;
      })
      .catch((error) => {
        if (recipePromiseCache.get(recipeId) === recipePromise) {
          recipePromiseCache.delete(recipeId);
        }
        throw error;
      });

    recipePromiseCache.set(recipeId, recipePromise);
    return recipePromise;
  }

  function prefetchRecipe(recipeId) {
    void loadRecipe(recipeId).catch(() => {});
  }

  return Object.freeze({
    hasRecipeLoader,
    loadRecipe,
    prefetchRecipe,
  });
}

const defaultRecipeLoader = createRecipeLoader(RECIPE_LOADERS);

export const hasRecipeLoader = defaultRecipeLoader.hasRecipeLoader;
export const loadRecipe = defaultRecipeLoader.loadRecipe;
export const prefetchRecipe = defaultRecipeLoader.prefetchRecipe;
