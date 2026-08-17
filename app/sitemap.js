export const dynamic = "force-static";

import { getAllPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const routes = [
  { pathname: "", changeFrequency: "weekly", priority: 1 },
  { pathname: "/work", changeFrequency: "monthly", priority: 0.9 },
  { pathname: "/about", changeFrequency: "monthly", priority: 0.9 },
  { pathname: "/writing", changeFrequency: "weekly", priority: 0.9 },
  { pathname: "/tools", changeFrequency: "monthly", priority: 0.85 },
  { pathname: "/tools/battery-estimator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/tools/pid-simulator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/tools/sensor-code-generator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/contact", changeFrequency: "yearly", priority: 0.6 }
];

export default function sitemap() {
  const pages = routes.map((route) => ({
    url: `${siteConfig.url}${route.pathname}/`,
    lastModified: new Date("2026-07-25"),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/writing/${post.slug}/`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [...pages, ...posts];
}