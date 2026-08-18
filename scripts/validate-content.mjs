import fs from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "../lib/frontmatter.js";

const directory = path.join(process.cwd(), "content", "writing");
const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".md"));
const required = ["title", "summary", "category", "tags", "publishedAt", "draft"];
const slugs = new Set();
const failures = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const source = await fs.readFile(path.join(directory, file), "utf8");
  const { data, content } = parseFrontmatter(source);

  if (slugs.has(slug)) failures.push(`${file}: duplicate slug`);
  slugs.add(slug);

  for (const field of required) {
    if (data[field] === undefined || data[field] === "") {
      failures.push(`${file}: missing ${field}`);
    }
  }
  if (!Array.isArray(data.tags)) failures.push(`${file}: tags must be a YAML list`);
  if (typeof data.draft !== "boolean") failures.push(`${file}: draft must be true/false`);
  if (!content.trim()) failures.push(`${file}: article body is empty`);
  if (content.includes("{{")) failures.push(`${file}: unresolved template placeholder`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} article${files.length === 1 ? "" : "s"}.`);
