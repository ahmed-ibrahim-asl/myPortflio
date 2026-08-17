import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleEnhancer } from "@/components/ArticleEnhancer";
import { JsonLd } from "@/components/JsonLd";
import {
  getAllPosts,
  getPost,
  renderPost
} from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { createArticleJsonLd, createPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const metadata = createPageMetadata({
    title: post.title,
    description: post.summary,
    pathname: `/writing/${post.slug}/`
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      tags: post.tags
    }
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.draft) notFound();

  const { html, headings } = renderPost(post.content);
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const previous = posts[currentIndex + 1];
  const next = posts[currentIndex - 1];
  const wasUpdated = post.updatedAt && post.updatedAt !== post.publishedAt;

  return (
    <article className="article-page">
      <JsonLd data={createArticleJsonLd(post)} />

      <header className="article-header shell">
        <Link className="article-back" href="/writing">
          <span aria-hidden="true">&larr;</span> All engineering notes
        </Link>
        <div className="article-title-grid">
          <div>
            <h1>{post.title}</h1>
            <p className="article-summary">{post.summary}</p>
          </div>
          <dl className="article-facts">
            <div>
              <dt>Published</dt>
              <dd>{formatDate(post.publishedAt)}</dd>
            </div>
            {wasUpdated ? (
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(post.updatedAt)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Reading time</dt>
              <dd>{post.readingTime} minutes</dd>
            </div>
            {post.difficulty ? (
              <div>
                <dt>Difficulty</dt>
                <dd>{post.difficulty}</dd>
              </div>
            ) : null}
            {post.part ? (
              <div>
                <dt>Series position</dt>
                <dd>Part {post.part}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="tag-row article-tags">
          {post.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="article-layout shell">
        <aside className="article-rail article-rail-left">
          <p className="mono muted">
            <Link href="/about">Ahmed Asl</Link>
          </p>
          <p>Embedded systems engineer and teaching assistant in Egypt.</p>
          <a href="#article-end">Jump to article end <span aria-hidden="true">&darr;</span></a>
        </aside>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="article-rail article-toc">
          <p className="toc-title">On this page</p>
          <ol>
            {headings.map((heading) => (
              <li className={`depth-${heading.depth}`} key={heading.id}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <footer id="article-end" className="article-footer shell">
        <div>
          <h2>Continue with another field note.</h2>
        </div>
        <div className="article-pagination">
          {previous ? (
            <Link href={`/writing/${previous.slug}`}>
              <span>Previous</span>
              <strong>{previous.title}</strong>
            </Link>
          ) : null}
          {next ? (
            <Link href={`/writing/${next.slug}`}>
              <span>Next</span>
              <strong>{next.title}</strong>
            </Link>
          ) : null}
        </div>
      </footer>
      <ArticleEnhancer />
    </article>
  );
}
