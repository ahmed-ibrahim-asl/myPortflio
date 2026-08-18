import { getRecipeManifest } from "../../catalog.js";
import { UNET_SEMANTIC_SEGMENTATION_TEMPLATE } from "./modern-vision-shared.js";

export const manifest = getRecipeManifest("unet-semantic-segmentation");

export const recipe = Object.freeze({
  ...manifest,
  ...UNET_SEMANTIC_SEGMENTATION_TEMPLATE,
  artifacts: ["Best PyTorch U-Net checkpoint", "Example indexed-mask prediction"],
});
