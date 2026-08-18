import Link from "next/link";
import { IndexedBadge } from "@/components/IndexedBadge";

export function ToolCard({ tool, index }) {
  return (
    <article className="post-card">
      <IndexedBadge index={index + 1} />
      <div className="post-main">
        <div className="post-meta">
          <span>{tool.category}</span>
        </div>
        <h3>
          <Link href={`/tools/${tool.slug}`}>{tool.title}</Link>
        </h3>
        <p>{tool.summary}</p>
        <div className="tag-row">
          {tool.tags.slice(0, 4).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
