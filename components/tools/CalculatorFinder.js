"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculatorCategories, calculators } from "@/data/calculators";
import { filterCalculators, getRelatedCalculators } from "@/lib/tools/calculator-search";
import { CalculatorThumbnail } from "./CalculatorThumbnail";

export function CalculatorFinder({ activeSlug }) {
  const active = calculators.find(({ slug }) => slug === activeSlug);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(active?.category ?? "All");

  const matches = useMemo(() => {
    if (!query.trim() && category === (active?.category ?? "All")) {
      return getRelatedCalculators(calculators, activeSlug, 6);
    }

    return filterCalculators(calculators, { query, category })
      .filter(({ slug }) => slug !== activeSlug)
      .slice(0, 6);
  }, [active?.category, activeSlug, category, query]);

  return (
    <section className="calculator-finder" aria-labelledby="calculator-finder-title">
      <div className="calculator-finder-heading">
        <div>
          <p className="eyebrow">Stay at the bench</p>
          <h2 id="calculator-finder-title">Find another calculator</h2>
        </div>
        <Link href="/tools/#calculators">Browse all 36 calculators</Link>
      </div>
      <div className="calculator-finder-controls">
        <label className="search-field">
          <span className="sr-only">Search for another calculator</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calculators"
          />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Calculator category">
          <option value="All">All categories</option>
          {calculatorCategories.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      <div className="calculator-finder-results">
        {matches.map((tool) => (
          <Link href={`/tools/${tool.slug}/`} key={tool.slug}>
            <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} compact />
            <span>{tool.title}</span>
          </Link>
        ))}
      </div>
      {!matches.length ? <p className="calculator-finder-empty">No matching calculator. Try another term or category.</p> : null}
    </section>
  );
}
