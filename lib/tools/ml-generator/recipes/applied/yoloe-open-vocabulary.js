import { getRecipeManifest } from "../../catalog.js";
import { YOLOE_OPEN_VOCABULARY_TEMPLATE } from "./modern-vision-shared.js";

export const manifest = getRecipeManifest("yoloe-open-vocabulary");

export const recipe = Object.freeze({
  ...manifest,
  ...YOLOE_OPEN_VOCABULARY_TEMPLATE,
  artifacts: ["Annotated prompted detections", "Detection and mask results"],
});
