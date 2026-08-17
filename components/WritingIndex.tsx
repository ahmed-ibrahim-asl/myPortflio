"use client";

import React, { useMemo, useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/types/content";

interface WritingIndexProps {
  posts: Post[];
}

export function WritingIndex({ posts }: WritingIndexProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];

  // Initialize query from URL search params (e.g. ?topic=linux)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get("topic");
      if (topic) {
        setQuery(topic);
        const element = document.getElementById("published-field-logs");
        if (element) {
          setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    }
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const inCategory = category === "All" || post.category === category;
      const haystack = [
        post.title,
        post.summary,
        post.category,
        ...post.tags
      ]
        .join(" ")
        .toLowerCase();
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [posts, query, category]);

  return (
    <>
      <div className="writing-tools">
        <label className="search-field">
          <span className="sr-only">Search published engineering articles</span>
          <span className="mono" aria-hidden="true">SEARCH</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by topic, tool, or command"
          />
        </label>
        <div className="filter-row" aria-label="Filter articles by category">
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

      <div className="post-list">
        {filtered.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <h2>Change the search term or choose another category.</h2>
        </div>
      ) : null}
    </>
  );
}
