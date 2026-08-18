import Link from "next/link";
import { CalculatorThumbnail } from "./CalculatorThumbnail";

export function ToolCard({ tool, index }) {
  return (
    <Link className="calculator-catalog-card card-link" href={`/tools/${tool.slug}/`}>
      <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} />
      <div className="calculator-catalog-copy">
        <div className="post-meta">
          <span>{String(index + 1).padStart(2, "0")} / {tool.category}</span>
        </div>
        <h3>{tool.title}</h3>
        <p>{tool.summary}</p>
      </div>
    </Link>
  );
}
