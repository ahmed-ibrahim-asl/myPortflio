import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const valueFor = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : "";
};

const title = valueFor("title");
const type = valueFor("type") || "note";

if (!title) {
  console.error('Usage: npm run new:post -- --type=linux --title="Article title"');
  process.exit(1);
}

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const root = process.cwd();
const templatePath = path.join(root, "content", "templates", `${slugify(type)}.md`);
if (!fsSync.existsSync(templatePath)) {
  console.error(`Unknown template "${type}".`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const output = (await fs.readFile(templatePath, "utf8"))
  .replaceAll("{{title}}", title)
  .replaceAll("{{summary}}", "")
  .replaceAll("{{date}}", today);

const directory = path.join(root, "content", "writing");
await fs.mkdir(directory, { recursive: true });
let slug = slugify(title);
let suffix = 2;
while (fsSync.existsSync(path.join(directory, `${slug}.md`))) {
  slug = `${slugify(title)}-${suffix++}`;
}

const destination = path.join(directory, `${slug}.md`);
await fs.writeFile(destination, output, "utf8");
console.log(`Created ${path.relative(root, destination)}`);
