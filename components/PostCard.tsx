import React from "react";
import Link from "next/link";
import { Post } from "@/types/content";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  index: number;
  featured?: boolean;
}

export function PostCard({ post, index, featured = false }: PostCardProps) {
  return (
    <article className={`post-card ${featured ? "featured" : ""}`}>
      <div className="post-index mono">{String(index + 1).padStart(2, "0")}</div>
      <div className="post-main">
        <div className="post-meta">
          <span>{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingTime} min</span>
        </div>
        <h3>
          <Link href={`/writing/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.summary}</p>
        <div className="tag-row">
          {post.tags.slice(0, 4).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Link
        className="post-arrow"
        href={`/writing/${post.slug}`}
        aria-label={`Read ${post.title}`}
      >
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
