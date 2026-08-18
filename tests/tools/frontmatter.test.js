import assert from "node:assert/strict";
import test from "node:test";

import { parseFrontmatter, stringifyFrontmatter } from "../../lib/frontmatter.js";

test("parseFrontmatter reads safe YAML metadata and keeps markdown content", () => {
  const source = `---
title: "A useful note"
tags:
  - ESP32
  - Sensors
draft: false
publishedAt: "2026-08-18"
---

# Body
`;

  const parsed = parseFrontmatter(source);

  assert.deepEqual(parsed.data, {
    title: "A useful note",
    tags: ["ESP32", "Sensors"],
    draft: false,
    publishedAt: "2026-08-18"
  });
  assert.equal(parsed.content, "\n# Body\n");
});

test("parseFrontmatter treats text without a frontmatter block as content", () => {
  assert.deepEqual(parseFrontmatter("# Plain markdown\n"), {
    data: {},
    content: "# Plain markdown\n"
  });
});

test("parseFrontmatter rejects non-object metadata", () => {
  assert.throws(
    () => parseFrontmatter("---\n- unsafe\n- shape\n---\nBody\n"),
    /frontmatter must be a YAML object/i
  );
});

test("stringifyFrontmatter round-trips supported metadata", () => {
  const metadata = {
    title: "Sensor notes",
    tags: ["ESP32", "I2C"],
    draft: true,
    featured: false
  };
  const source = stringifyFrontmatter("## Bring-up\n", metadata);

  assert.match(source, /^---\n/);
  assert.deepEqual(parseFrontmatter(source), {
    data: metadata,
    content: "## Bring-up\n"
  });
});

