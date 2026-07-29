const ALLOWED_ROOTS = new Set([
  "target",
  "options",
  "output",
  "workflow",
]);
const BLOCKED_SEGMENTS = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

function getSegments(valuePath) {
  if (typeof valuePath !== "string" || valuePath.length === 0) {
    throw new Error("Project value path must be a non-empty string.");
  }
  const segments = valuePath.split(".");
  if (!ALLOWED_ROOTS.has(segments[0])) {
    throw new Error(`Unsupported project path root: ${segments[0]}`);
  }
  if (
    segments.length < 2
    || segments.some((segment) =>
      segment.length === 0 || BLOCKED_SEGMENTS.has(segment))
  ) {
    throw new Error(`Unsafe project value path: ${valuePath}`);
  }
  return segments;
}

export function getSecurityProjectValue(project, valuePath) {
  const segments = getSegments(valuePath);
  return segments.reduce(
    (value, segment) =>
      value && typeof value === "object" ? value[segment] : undefined,
    project,
  );
}

function setBranchValue(branch, segments, value) {
  const [segment, ...rest] = segments;
  const current = branch && typeof branch === "object" ? branch : {};
  const copy = Array.isArray(current) ? [...current] : { ...current };
  copy[segment] = rest.length > 0
    ? setBranchValue(current[segment], rest, value)
    : value;
  return copy;
}

export function patchSecurityProjectValue(project, valuePath, value) {
  if (!project || typeof project !== "object") {
    throw new Error("Security Mission project must be an object.");
  }
  const [root, ...segments] = getSegments(valuePath);
  return {
    ...project,
    [root]: setBranchValue(project[root], segments, value),
  };
}
