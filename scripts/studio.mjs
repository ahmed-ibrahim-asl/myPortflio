import http from "node:http";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import matter from "gray-matter";
import { marked } from "marked";

const root = process.cwd();
const writingDir = path.join(root, "content", "writing");
const templatesDir = path.join(root, "content", "templates");
const publicBlogDir = path.join(root, "public", "blog");
const studioDir = path.join(root, "studio");
const host = "127.0.0.1";
const port = Number(process.env.PORTFOLIO_STUDIO_PORT || 4173);

await fs.mkdir(writingDir, { recursive: true });
await fs.mkdir(publicBlogDir, { recursive: true });

function send(response, status, body, contentType = "application/json; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(
    contentType.startsWith("application/json") ? JSON.stringify(body) : body
  );
}

function safeSlug(value = "") {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!slug || slug.length > 90) throw new Error("Use a valid article slug.");
  return slug;
}

function safeFileName(value = "") {
  const extension = path.extname(value).toLowerCase();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
  if (!allowed.has(extension)) throw new Error("Unsupported image format.");
  const base = path
    .basename(value, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!base) throw new Error("Use a valid image filename.");
  return `${base}${extension === ".jpeg" ? ".jpg" : extension}`;
}

function defaultMeta(data = {}) {
  return {
    title: data.title || "Untitled article",
    summary: data.summary || "",
    category: data.category || "Notes",
    tags: Array.isArray(data.tags) ? data.tags : [],
    publishedAt: data.publishedAt
      ? new Date(data.publishedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    updatedAt: data.updatedAt
      ? new Date(data.updatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    difficulty: data.difficulty || "All levels",
    series: data.series || "",
    part: data.part || "",
    cover: data.cover || "",
    draft: data.draft !== false,
    featured: Boolean(data.featured),
    template: data.template || "note"
  };
}

async function readPost(slug) {
  const filePath = path.join(writingDir, `${safeSlug(slug)}.md`);
  const source = await fs.readFile(filePath, "utf8");
  const parsed = matter(source);
  return {
    slug: safeSlug(slug),
    meta: defaultMeta(parsed.data),
    content: parsed.content.replace(/^\n/, "")
  };
}

async function listPosts() {
  const files = (await fs.readdir(writingDir)).filter((file) => file.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const post = await readPost(slug);
      return {
        slug,
        ...post.meta,
        words: post.content.trim().split(/\s+/).filter(Boolean).length
      };
    })
  );
  return posts.sort(
    (a, b) =>
      Number(a.draft) - Number(b.draft) ||
      new Date(b.updatedAt || b.publishedAt) - new Date(a.updatedAt || a.publishedAt)
  );
}

async function readJson(request, limit = 18_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function writePost({ slug, previousSlug, meta, content }) {
  const nextSlug = safeSlug(slug);
  const normalized = defaultMeta({
    ...meta,
    updatedAt: new Date().toISOString().slice(0, 10)
  });
  const output = matter.stringify(content.trim() + "\n", normalized);
  const destination = path.join(writingDir, `${nextSlug}.md`);

  if (previousSlug && safeSlug(previousSlug) !== nextSlug) {
    const previousPath = path.join(writingDir, `${safeSlug(previousSlug)}.md`);
    if (fsSync.existsSync(previousPath)) await fs.rename(previousPath, destination);
  }

  await fs.writeFile(destination, output, "utf8");
  return readPost(nextSlug);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      shell: false
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => (stdout += data));
    child.stderr.on("data", (data) => (stderr += data));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      else reject(new Error(stderr.trim() || stdout.trim() || `${command} failed`));
    });
  });
}

async function publish(slug) {
  const post = await readPost(slug);
  post.meta.draft = false;
  await writePost(post);

  await run("git", ["add", "--", `content/writing/${post.slug}.md`]);
  const assetDir = path.join(publicBlogDir, post.slug);
  if (fsSync.existsSync(assetDir)) {
    await run("git", ["add", "--", `public/blog/${post.slug}`]);
  }

  let committed = true;
  try {
    await run("git", ["diff", "--cached", "--quiet"]);
    committed = false;
  } catch {
    await run("git", ["commit", "-m", `content: publish ${post.slug}`]);
  }

  await run("git", ["push"]);
  return {
    post: await readPost(post.slug),
    message: committed
      ? "Published and pushed to GitHub."
      : "No content changes to commit; GitHub is already up to date."
  };
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function serveStudioFile(response, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const destination = path.resolve(studioDir, requested);
  if (!destination.startsWith(path.resolve(studioDir))) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }
  const data = await fs.readFile(destination);
  send(
    response,
    200,
    data,
    mime[path.extname(destination)] || "application/octet-stream"
  );
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);

    if (request.method === "GET" && url.pathname === "/api/posts") {
      send(response, 200, { posts: await listPosts() });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/templates") {
      const templates = (await fs.readdir(templatesDir))
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));
      send(response, 200, { templates });
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/posts/")) {
      send(response, 200, await readPost(url.pathname.split("/").pop()));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/new") {
      const { title, template = "note" } = await readJson(request);
      const slug = safeSlug(title);
      const templateName = safeSlug(template);
      const templatePath = path.join(templatesDir, `${templateName}.md`);
      const today = new Date().toISOString().slice(0, 10);
      const source = (await fs.readFile(templatePath, "utf8"))
        .replaceAll("{{title}}", title.trim())
        .replaceAll("{{summary}}", "")
        .replaceAll("{{date}}", today);

      let uniqueSlug = slug;
      let suffix = 2;
      while (fsSync.existsSync(path.join(writingDir, `${uniqueSlug}.md`))) {
        uniqueSlug = `${slug}-${suffix++}`;
      }
      await fs.writeFile(path.join(writingDir, `${uniqueSlug}.md`), source, "utf8");
      send(response, 201, await readPost(uniqueSlug));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/posts") {
      send(response, 200, await writePost(await readJson(request)));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/render") {
      const { content = "" } = await readJson(request);
      send(response, 200, { html: marked.parse(content, { gfm: true }) });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/upload") {
      const { slug, name, data } = await readJson(request);
      const articleSlug = safeSlug(slug);
      const fileName = safeFileName(name);
      const match = /^data:[^;]+;base64,(.+)$/.exec(data || "");
      if (!match) throw new Error("Invalid image payload.");
      const bytes = Buffer.from(match[1], "base64");
      if (bytes.length > 12_000_000) throw new Error("Images must be under 12 MB.");
      const destinationDir = path.join(publicBlogDir, articleSlug);
      await fs.mkdir(destinationDir, { recursive: true });
      await fs.writeFile(path.join(destinationDir, fileName), bytes);
      send(response, 201, {
        path: `/blog/${articleSlug}/${fileName}`
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/publish") {
      const { slug } = await readJson(request);
      send(response, 200, await publish(slug));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/archive") {
      const { slug } = await readJson(request);
      const post = await readPost(slug);
      post.meta.draft = true;
      send(response, 200, await writePost(post));
      return;
    }

    if (request.method === "GET") {
      await serveStudioFile(response, url.pathname);
      return;
    }

    send(response, 404, { error: "Not found." });
  } catch (error) {
    const status = error.code === "ENOENT" ? 404 : 400;
    send(response, status, { error: error.message || "Unexpected error." });
  }
});

server.listen(port, host, () => {
  console.log(`Portfolio Studio is ready at http://${host}:${port}`);
  console.log("Press Ctrl+C to stop.");
});
