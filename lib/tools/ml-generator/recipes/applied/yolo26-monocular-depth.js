import { getRecipeManifest } from "../../catalog.js";
import { YOLO26_DEPTH_TEMPLATE } from "./modern-vision-shared.js";

export const manifest = getRecipeManifest("yolo26-monocular-depth");

export const recipe = Object.freeze({
  ...manifest,
  ...YOLO26_DEPTH_TEMPLATE,
  artifacts: ["Dense metric depth maps", "Colorized depth PNG files"],
});
