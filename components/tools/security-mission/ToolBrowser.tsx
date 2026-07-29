"use client";

import {
  useMemo,
  useState,
} from "react";

import styles from "./SecurityMission.module.css";

export function ToolBrowser({
  tools,
  selectedId,
  onSelectTool,
}: {
  tools: any[];
  selectedId?: string | null;
  onSelectTool: (toolId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () => [...new Set(tools.flatMap((tool) => tool.categories ?? []))],
    [tools],
  );
  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tools.filter((tool) => {
      const searchValues = [
        tool.name,
        tool.description,
        ...(tool.aliases ?? []),
        ...(tool.executableNames ?? []),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return (
        (!query || searchValues.some((value) => value.includes(query)))
        && (
          category === "all"
          || (tool.categories ?? []).includes(category)
        )
      );
    });
  }, [category, search, tools]);
  const resultLabel = `${filteredTools.length} ${
    filteredTools.length === 1 ? "tool" : "tools"
  }`;

  return (
    <div className={styles.browser}>
      <div className={styles.searchBar}>
        <label className={styles.searchField}>
          <span>Find a tool</span>
          <input
            type="search"
            value={search}
            data-tool-search
            placeholder="Search name, alias, or executable"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className={styles.filterField}>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All compatible categories</option>
            {categories.map((value) => (
              <option value={value} key={value}>
                {value.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className={styles.resultCount}
        data-tool-result-count
        aria-live="polite"
      >
        {resultLabel}
      </div>
      {filteredTools.length > 0 ? (
        <div className={styles.cardGrid}>
          {filteredTools.map((tool) => (
            <button
              type="button"
              key={tool.id}
              className={styles.choiceCard}
              data-tool-id={tool.id}
              data-selected={selectedId === tool.id ? "true" : "false"}
              aria-pressed={selectedId === tool.id}
              onClick={() => onSelectTool(tool.id)}
            >
              <span className={styles.cardTopline}>
                <strong>{tool.name}</strong>
                <span className={styles.badge}>
                  {tool.interface === "gui-companion" ? "GUI" : "CLI"}
                </span>
              </span>
              <span className={styles.cardDescription}>
                {tool.description}
              </span>
              <span className={styles.cardFoot}>
                <span>
                  {(tool.aliases ?? []).length > 0
                    ? `Aliases: ${tool.aliases.join(", ")}`
                    : tool.executableNames?.[0]}
                </span>
                <span>{tool.privilege}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <strong>No compatible tools found.</strong>
          <span>Clear the search or change the category.</span>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
