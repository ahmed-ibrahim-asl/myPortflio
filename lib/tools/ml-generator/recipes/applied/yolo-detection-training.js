import { getRecipeManifest } from "../../catalog.js";
import { YOLO_DETECTION_TEMPLATE } from "./yolo-shared.js";

export const manifest = getRecipeManifest("yolo-detection-training");

export const recipe = Object.freeze({
  ...manifest,
  ...YOLO_DETECTION_TEMPLATE,
  artifacts: [
    "best.pt and last.pt checkpoints",
    "validation metrics and plots",
    "prediction outputs",
    "optional exported deployment model",
  ],
  getReadiness(config, mode) {
    const validationErrors = YOLO_DETECTION_TEMPLATE.validate(config, mode);
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
