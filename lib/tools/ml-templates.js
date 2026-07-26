import { recipe as YOLO_DETECTION_RECIPE } from "./ml-generator/recipes/applied/yolo-detection-training.js";
import { recipe as YOLO_SEGMENTATION_RECIPE } from "./ml-generator/recipes/applied/yolo-segmentation-training.js";
import { recipe as EDGE_IMAGE_RECIPE } from "./ml-generator/recipes/deployment/edge-image-classification.js";
import {
  buildRecipeResult,
  getRecipeDefaultConfig,
  getRecipeFieldOptions,
  getRecipeOutputMetadata,
  getRecipeVisibleFields,
  normalizeRecipeConfig,
  validateRecipeConfig,
} from "./ml-generator/engine.js";
import { recipe as SENSOR_TIMESERIES_RECIPE } from "./ml-generator/recipes/sensor-ai/sensor-timeseries-classification.js";

export const ML_TEMPLATES = [
  YOLO_DETECTION_RECIPE,
  YOLO_SEGMENTATION_RECIPE,
  SENSOR_TIMESERIES_RECIPE,
  EDGE_IMAGE_RECIPE,
];

export function getTemplateById(templateId) {
  return ML_TEMPLATES.find((template) => template.id === templateId)
    ?? ML_TEMPLATES[0]
    ?? null;
}

export function getDefaultConfig(templateId, mode) {
  return getRecipeDefaultConfig(getTemplateById(templateId), mode);
}

export function getVisibleFields(templateId, config, mode) {
  return getRecipeVisibleFields(
    getTemplateById(templateId),
    config,
    mode,
  );
}

export function getFieldOptions(templateId, fieldId, config, mode) {
  return getRecipeFieldOptions(
    getTemplateById(templateId),
    fieldId,
    config,
    mode,
  );
}

export function normalizeTemplateConfig(templateId, config, mode) {
  return normalizeRecipeConfig(
    getTemplateById(templateId),
    config,
    mode,
  );
}

export function validateTemplateConfig(templateId, config, mode) {
  const requestedTemplate = ML_TEMPLATES.find(
    (template) => template.id === templateId,
  );
  if (!requestedTemplate) {
    return { templateId: "Select a valid script template." };
  }
  return validateRecipeConfig(requestedTemplate, config, mode);
}

export function generateMlScript(templateId, config, mode) {
  const requestedTemplate = ML_TEMPLATES.find(
    (template) => template.id === templateId,
  );
  if (!requestedTemplate) return "";
  return buildRecipeResult(
    requestedTemplate,
    templateId,
    config,
    mode,
  ).code;
}

export function getTemplateOutputMetadata(templateId, config, mode) {
  return getRecipeOutputMetadata(
    getTemplateById(templateId),
    config,
    mode,
  );
}

export function buildMlGeneratorResult(templateId, inputConfig, mode) {
  return buildRecipeResult(
    ML_TEMPLATES.find((template) => template.id === templateId)
      ?? getTemplateById(templateId),
    templateId,
    inputConfig,
    mode,
  );
}