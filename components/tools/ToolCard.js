import Link from "next/link";
import { CalculatorThumbnail } from "./CalculatorThumbnail";

export function ToolCard({ tool, index }) {
  return (
    <article className="calculator-catalog-card">
      <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} />
      <div className="calculator-catalog-copy">
        <div className="post-meta">
          <span>{String(index + 1).padStart(2, "0")} / {tool.category}</span>
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
