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

const recipePromiseCache = new Map();

export function hasRecipeLoader(recipeId) {
  return Object.hasOwn(RECIPE_LOADERS, recipeId);
}

export function loadRecipe(recipeId) {
  const loader = RECIPE_LOADERS[recipeId];
  if (!loader) {
    return Promise.reject(new Error(`Unknown ML recipe: ${recipeId}`));
  }

  const cachedPromise = recipePromiseCache.get(recipeId);
  if (cachedPromise) return cachedPromise;

  let recipePromise;
  recipePromise = loader()
    .then((module) => {
      const recipe = module.recipe;
      if (!recipe || recipe.id !== recipeId) {
        throw new Error(`Invalid ML recipe module: ${recipeId}`);
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

export function prefetchRecipe(recipeId) {
  void loadRecipe(recipeId).catch(() => {});
}
