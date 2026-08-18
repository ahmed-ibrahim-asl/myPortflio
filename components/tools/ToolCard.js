import Link from "next/link";

export function ToolCard({ tool, index }) {
  return (
    <article className="post-card">
      <div className="post-index mono">{String(index + 1).padStart(2, "0")}</div>
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
      <Link
        className="post-arrow"
        href={`/tools/${tool.slug}`}
        aria-label={`Open ${tool.title}`}
      >
        ↗
      </Link>
    </article>
  );
}

