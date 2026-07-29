import { normalizeSecurityMissionProject } from "./project-config.js";

function isPlainObject(val) {
  if (typeof val !== "object" || val === null) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}

function preventPollution(obj) {
  if (!obj || typeof obj !== "object") return;
  if ("__proto__" in obj) delete obj.__proto__;
  if ("constructor" in obj) delete obj.constructor;
  if ("prototype" in obj) delete obj.prototype;
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      preventPollution(obj[key]);
    }
  }
}

export function migrateSecurityMissionProject(input) {
  if (!isPlainObject(input)) throw new Error("Input must be a plain object");
  try {
    const stringified = JSON.stringify(input);
    const parsed = JSON.parse(stringified);
    preventPollution(parsed);
    return normalizeSecurityMissionProject(parsed);
  } catch (e) {
    throw new Error("Input must be JSON serializable without cycles or symbols");
  }
}
