import { getSecurityControls } from "./control-registry.js";
import { getSecurityProjectValue } from "./project-paths.js";

export function validateControlValue(control, value) {
  if (value === undefined || value === null || value === "") return [];
  if (control.controlType === "toggle" && typeof value === "boolean") return [];
  if (control.controlType === "multi-select" && Array.isArray(value)) {
    return value.flatMap((entry) =>
      validateControlValue({ ...control, controlType: "text" }, entry));
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return ["Invalid type"];
  }
  const str = String(value);

  if (/[\x00-\x1F\x7F]/.test(str)) {
    return ["Value contains invalid control characters."];
  }

  if (/[;&|]/.test(str)) {
    return ["Value contains invalid command separators."];
  }

  switch (control.controlType) {
    case "host":
      if (!/^([a-zA-Z0-9.-]+)$/.test(str)) {
        return ["Invalid host format."];
      }
      break;
    case "port":
      const port = Number(str);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return ["Port must be between 1 and 65535."];
      }
      break;
    case "cidr":
      if (!/^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/.test(str)) {
        return ["Invalid CIDR format."];
      }
      const parts = str.split('/');
      const mask = parseInt(parts[1], 10);
      if (mask < 0 || mask > 32) return ["Invalid CIDR mask."];
      if (parts[0].split(".").some((octet) => Number(octet) > 255)) {
        return ["Invalid CIDR address."];
      }
      break;
    case "domain":
      if (
        str.length > 253
        || !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(str)
      ) {
        return ["Invalid domain format."];
      }
      break;
    case "url":
      try {
        const url = new URL(str);
        if (!["http:", "https:"].includes(url.protocol)) {
          return ["URL must use HTTP or HTTPS."];
        }
      } catch {
        return ["Invalid URL format."];
      }
      break;
    case "bssid":
      if (!/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/.test(str)) {
        return ["Invalid BSSID format."];
      }
      break;
    case "output-path":
      if (str.includes("..") || /^[a-zA-Z]:\\/.test(str) || str.startsWith("/")) {
        return ["Output path must be relative and cannot traverse directories."];
      }
      break;
    default:
      break;
  }
  return [];
}

export function validateSecurityProject(project, action, controls) {
  const errors = {};
  const warnings = [];

  if (!project) return { errors, warnings };

  if (action) {
    const activeControls = controls ?? [
      ...getSecurityControls({
        actionId: action.id,
        stepId: "target",
        learningLevel: "advanced",
        project,
      }),
      ...getSecurityControls({
        actionId: action.id,
        stepId: "configure",
        learningLevel: "advanced",
        project,
      }),
    ];
    for (const control of activeControls) {
      const valuePath = control.valuePath ?? control.configKey;
      const value = getSecurityProjectValue(project, valuePath);
      if (
        control.required
        && (value === undefined || value === null || value === "")
      ) {
        errors[valuePath] = `${control.label} is required.`;
        continue;
      }
      const errs = validateControlValue(control, value);
      if (errs.length > 0) {
        errors[valuePath] = errs[0];
      }
    }
  }

  if (action?.risk === "high") {
    warnings.push("High-risk action: Ensure target is in explicit authorized laboratory scope.");
  }

  return { errors, warnings };
}
