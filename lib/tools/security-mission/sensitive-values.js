export const SECRET_PLACEHOLDERS = Object.freeze({
  password: "<PASSWORD>",
  token: "<TOKEN>",
  cookie: "<COOKIE>",
  hash: "<HASH>",
  privateKeyPath: "<PRIVATE_KEY_PATH>",
});

export function sanitizeProjectForExport(project) {
  const sanitized = sanitizeImportedProject(
    JSON.parse(JSON.stringify(project)),
  );
  if (!sanitized.output?.includeLabValues) {
    sanitized.target = {};
  }
  return sanitized;
}

export function sanitizeImportedProject(project) {
  if (!project || typeof project !== "object") return project;

  const isSecretKey = (key) =>
    /password|passwd|token|secret|privatekey|ntlmhash|hash|cookie/i.test(key);

  function walk(node) {
    if (node === null || typeof node !== "object") {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(walk);
    }
    const result = {};
    for (const key of Object.keys(node)) {
      const val = node[key];
      if (isSecretKey(key) && typeof val === "string" && val.trim() !== "") {
        result[key] = "<REDACTED>";
      } else if (typeof val === "object" && val !== null) {
        result[key] = walk(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  return walk(project);
}
