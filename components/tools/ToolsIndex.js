"use client";

import { useMemo, useState } from "react";
import { calculatorCategories } from "@/data/calculators";
import { filterCalculators } from "@/lib/tools/calculator-search";
import { ToolCard } from "./ToolCard";

export function ToolsIndex({ tools }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...calculatorCategories];

  const filtered = useMemo(() => {
    return filterCalculators(tools, { query, category });
  }, [tools, query, category]);

  return (
    <>
      <div className="writing-tools">
        <label className="search-field">
          <span className="sr-only">Search calculators</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calculators and components"
          />
        </label>
        <div className="filter-row" aria-label="Filter calculators by category">
          {categories.map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="calculator-results-count" aria-live="polite">
        {query.trim()
          ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"} for “${query.trim()}”`
          : `${filtered.length} calculators`}
      </p>

      <div className="calculator-catalog-grid">
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
