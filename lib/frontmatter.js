import { dump, JSON_SCHEMA, load } from "js-yaml";

const FRONTMATTER_OPEN = /^\uFEFF?---[\t ]*\r?\n/;
const FRONTMATTER_CLOSE = /^---[\t ]*$/m;
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateMetadata(data) {
  if (!isPlainObject(data)) {
    throw new Error("Frontmatter must be a YAML object.");
  }

  for (const key of Object.keys(data)) {
    if (BLOCKED_KEYS.has(key)) {
      throw new Error(`Frontmatter key is not allowed: ${key}`);
    }
  }

  return data;
}

export function parseFrontmatter(source) {
  const opening = source.match(FRONTMATTER_OPEN);
  if (!opening) return { data: {}, content: source };

  const yamlStart = opening[0].length;
  const remainder = source.slice(yamlStart);
  const closing = remainder.match(FRONTMATTER_CLOSE);
  if (!closing || closing.index === undefined) {
    throw new Error("Frontmatter block is missing its closing delimiter.");
  }

  const yamlSource = remainder.slice(0, closing.index);
  const contentStart = closing.index + closing[0].length;
  const parsed = load(yamlSource, {
    schema: JSON_SCHEMA,
    json: true
  });

  return {
    data: validateMetadata(parsed ?? {}),
    content: remainder.slice(contentStart).replace(/^\r?\n/, "")
  };
}

export function stringifyFrontmatter(content, metadata) {
  const data = validateMetadata(metadata);
  const yaml = dump(data, {
    schema: JSON_SCHEMA,
    noRefs: true,
    lineWidth: -1,
    sortKeys: false
  });

  return `---\n${yaml}---\n${content}`;
}

