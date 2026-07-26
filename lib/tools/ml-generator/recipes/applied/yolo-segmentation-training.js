import { getRecipeManifest } from "../../catalog.js";
import { YOLO_SEGMENTATION_TEMPLATE } from "./yolo-shared.js";

export const manifest = getRecipeManifest("yolo-segmentation-training");

export const recipe = Object.freeze({
  ...manifest,
  ...YOLO_SEGMENTATION_TEMPLATE,
  artifacts: [
    "best.pt and last.pt checkpoints",
    "box and mask validation metrics",
    "segmentation prediction outputs",
    "optional exported deployment model",
  ],
  getReadiness(config, mode) {
    const validationErrors = YOLO_SEGMENTATION_TEMPLATE.validate(config, mode);
    return {
      configuration:
        Object.keys(validationErrors).length === 0 ? "ready" : "blocked",
      data: config.datasetYaml ? "configured" : "not-required",
      inference: config.sourcePath ? "configured" : "not-required",
      deployment:
        config.task === "train-export" ? "configured" : "not-requested",
    };
  },
});
