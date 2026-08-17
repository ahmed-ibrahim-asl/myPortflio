import React from "react";
import Link from "next/link";

interface ToolNavCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    highlight?: string;
  };
  index: number;
}

export function ToolNavCard({ tool, index }: ToolNavCardProps) {
  return (
    <article className="project-card">
      <div className="project-card-top mono">
        <span>TOOL_{String(index + 1).padStart(2, "0")}</span>
        <span>{tool.icon}</span>
      </div>
      <div className="project-card-copy">
        <h3>
          <Link href={tool.href}>{tool.title}</Link>
        </h3>
        {tool.highlight ? (
          <span className="tag tool-card-highlight">{tool.highlight}</span>
        ) : null}
        <p>{tool.description}</p>
      </div>
      <Link className="post-arrow" href={tool.href} aria-label={`Open ${tool.title}`}>
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
