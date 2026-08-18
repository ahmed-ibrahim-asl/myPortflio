import Link from "next/link";

export function CalculatorShell({ tool, children }) {
  return (
    <article className="tool-page">
      <header className="article-header tool-header shell">
        <Link className="article-back" href="/tools">
          ← All engineering tools
        </Link>
        <p className="eyebrow">{tool.category}</p>
        <h1>{tool.title}</h1>
        <p className="article-summary">{tool.summary}</p>
        <div className="tag-row article-tags">
          {tool.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="tool-body shell">{children}</div>

      <footer className="tool-credit shell">
        <p className="eyebrow">With thanks</p>
        <p>
          This calculator&rsquo;s design and formulas were inspired by{" "}
          <a href={tool.sourceUrl} target="_blank" rel="noreferrer">
            {tool.sourceLabel}
          </a>
          &rsquo;s{" "}
          <a href={tool.sourceUrl} target="_blank" rel="noreferrer">
            {tool.title}
          </a>{" "}
          — thank you for making electronics approachable for makers everywhere.
        </p>
      </footer>
    </article>
  );
}
