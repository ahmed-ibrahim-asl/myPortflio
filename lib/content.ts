import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { marked } from "marked";
import { Post } from "@/types/content";

const writingDirectory = path.join(process.cwd(), "content", "writing");

export interface HeadingItem {
  depth: number;
  text: string;
  id: string;
}

export interface RenderedPost {
  html: string;
  headings: HeadingItem[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Defensive HTML sanitizer pass for rendered Markdown HTML to prevent XSS.
 * Removes script tags, inline event attributes (e.g. onload, onerror), and javascript: URIs.
 */
function sanitizeHtmlOutput(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]+/gi, 'href="#"');
}

function normalizePost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(writingDirectory, fileName), "utf8");
  const { data, content } = parseFrontmatter(source);
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: String(data.title || slug),
    summary: String(data.summary || ""),
    category: String(data.category || "Notes"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: String(data.publishedAt || ""),
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    series: data.series ? String(data.series) : undefined,
    part: data.part ? String(data.part) : undefined,
    difficulty: data.difficulty ? String(data.difficulty) : undefined,
    draft: Boolean(data.draft),
    content,
    html: "",
    readingTime: Math.max(1, Math.ceil(words / 220))
  };
}

export function getAllPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Post[] {
  if (!fs.existsSync(writingDirectory)) return [];

  return fs
    .readdirSync(writingDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(normalizePost)
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPost(slug: string): Post | null {
  const file = `${slug}.md`;
  const fullPath = path.join(writingDirectory, file);
  if (!fs.existsSync(fullPath)) return null;
  return normalizePost(file);
}

export function renderPost(content: string): RenderedPost {
  const headings: HeadingItem[] = [];

  for (const line of content.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[`*_~[\]]/g, "").replace(/\([^)]*\)/g, "");
    headings.push({
      depth: match[1].length,
      text,
      id: slugify(text)
    });
  }

  const rawMarkdownHtml = marked.parse(content, {
    gfm: true,
    breaks: false
  }) as string;

  // Sanitize Markdown HTML output before heading anchor injection
  const sanitizedHtml = sanitizeHtmlOutput(rawMarkdownHtml);

  let index = 0;
  let html = sanitizedHtml.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (full, depth, body) => {
      const heading = headings[index++];
      if (!heading) return full;
      return `<h${depth} id="${heading.id}">${body}<a class="heading-anchor" href="#${heading.id}" aria-label="Link to this section">#</a></h${depth}>`;
    }
  );

  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/myPortflio" : "";
  if (basePath) {
    html = html.replace(/(src|href)="\/blog\//g, `$1="${basePath}/blog/`);
  }

  return { html, headings };
}

export function formatDate(value?: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}
