import fs from "node:fs/promises";
import path from "node:path";

const filepath = path.join(process.cwd(), ".ease", "run.json");
const run = JSON.parse(await fs.readFile(filepath, "utf8"));
const names = [
  "Preflight",
  "Crawl",
  "Normalize and validate the brand",
  "Create the design system",
  "Plan media and prompt variables",
  "Compile prompts",
  "Create the image manifest",
  "Route models and quote cost",
  "Authorize external spend",
  "Generate or acquire assets",
  "Optimize, QA, and select",
  "Package generated artifacts",
  "Implement the Next.js site",
  "Build and verify",
  "Serve, deploy, verify, and report"
];

run.stages = names.map((name, index) => ({
  id: String(index + 1).padStart(2, "0"),
  name,
  status: index < 11 ? "complete" : "pending"
}));
run.updated_at = new Date().toISOString();

await fs.writeFile(filepath, `${JSON.stringify(run, null, 2)}\n`, "utf8");
console.log("Repaired .ease/run.json stage contract.");
