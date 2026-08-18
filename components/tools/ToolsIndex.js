"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "./ToolCard";

export function ToolsIndex({ tools }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(tools.map((tool) => tool.category))];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const inCategory = category === "All" || tool.category === category;
      const haystack = [tool.title, tool.summary, tool.category, ...tool.tags]
        .join(" ")
        .toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [tools, query, category]);

  return (
    <>
      <div className="writing-tools">
        <label className="search-field">
          <span className="sr-only">Search calculators</span>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calculators, formulas, and components"
          />
        </label>
        <div className="filter-row" aria-label="Filter calculators by category">
          {categories.map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="post-list">
        {filtered.map((tool, index) => (
          <ToolCard key={tool.slug} tool={tool} index={index} />
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <p className="eyebrow">No matches</p>
          <h2>Try a broader term or another category.</h2>
        </div>
      ) : null}
    </>
  );
}

