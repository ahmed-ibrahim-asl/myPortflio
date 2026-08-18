import React from "react";
import Link from "next/link";
import { Post } from "@/types/content";
import { formatDate } from "@/lib/utils";
import { IndexedBadge } from "@/components/IndexedBadge";

interface PostCardProps {
  post: Post;
  index: number;
  featured?: boolean;
}

export function PostCard({ post, index, featured = false }: PostCardProps) {
  return (
    <Link
      className={`post-card card-link ${featured ? "featured" : ""}`}
      href={`/writing/${post.slug}`}
    >
      <IndexedBadge index={index + 1} />
      <div className="post-main">
        <div className="post-meta">
          <span>{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingTime} min</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <div className="tag-row">
          {post.tags.slice(0, 4).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
