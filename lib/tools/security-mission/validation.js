export function validateControlValue(control, value) {
  if (value === undefined || value === null || value === "") return [];
  if (typeof value !== "string" && typeof value !== "number") return ["Invalid type"];
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

export function validateSecurityProject(project, action) {
  const errors = {};
  const warnings = [];

  if (!project) return { errors, warnings };

  if (action && action.fields) {
    for (const ctrl of action.fields) {
      const val = project.options?.[ctrl.configKey];
      const errs = validateControlValue(ctrl, val);
      if (errs.length > 0) {
        errors[ctrl.configKey] = errs[0];
      }
    }
  }

  if (action?.risk === "high") {
    warnings.push("High-risk action: Ensure target is in explicit authorized laboratory scope.");
  }

  return { errors, warnings };
}

