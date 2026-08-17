import React from "react";
import Link from "next/link";
import { Post } from "@/types/content";

interface Track {
  id: string;
  title: string;
  description: string;
  terms: string[];
}

const learnWithMeTracks: Track[] = [
  {
    id: "linux",
    title: "Linux",
    description: "Shell use, permissions, processes, networking, and system troubleshooting.",
    terms: ["linux"]
  },
  {
    id: "python",
    title: "Python",
    description: "Programming foundations, automation, data work, and engineering scripts.",
    terms: ["python"]
  },
  {
    id: "dart-flutter",
    title: "Dart / Flutter",
    description: "Dart foundations and Flutter interfaces for mobile and connected products.",
    terms: ["dart", "flutter"]
  },
  {
    id: "git",
    title: "Git",
    description: "Version-control habits, safe recovery, branches, and team workflows.",
    terms: ["git", "version control"]
  },
  {
    id: "electronics",
    title: "Electronics",
    description: "Digital logic, circuit analysis, PCB concepts, and hardware experimentation.",
    terms: ["electronics", "digital logic", "pcb", "hardware"]
  },
  {
    id: "cybersecurity",
    title: "Cyber Security & Information Security",
    description: "Cybersecurity concepts, information security practice, and legal challenge labs.",
    terms: ["cybersecurity", "security", "information security", "bandit", "hacking"]
  },
  {
    id: "ml-ai",
    title: "Image Processing, ML & AI",
    description: "Image processing pipelines, machine learning experiments, and AI-assisted engineering.",
    terms: ["ai", "machine learning", "ml", "image processing", "computer vision", "opencv"]
  }
];

function searchablePostText(post: Post): string {
  return [post.category, post.series || "", ...post.tags].join(" ").toLowerCase();
}

function matchesTrack(post: Post, track: Track): boolean {
  if ((post.series || "").toLowerCase() !== "learn with me") return false;
  const haystack = searchablePostText(post);
  return track.terms.some((term) => haystack.includes(term));
}

function PostEntry({ post }: { post: Post }) {
  return (
    <li className="series-entry">
      <span className={`series-entry-state ${post.draft ? "draft" : "published"}`}>
        {post.draft ? "Draft" : "Published"}
      </span>
      {post.draft ? (
        <span className="series-entry-title">{post.title}</span>
      ) : (
        <Link className="series-entry-title" href={`/writing/${post.slug}`}>
          {post.title}
        </Link>
      )}
    </li>
  );
}

export function WritingSeries({ posts }: { posts: Post[] }) {
  const banditPosts = posts
    .filter((post) => (post.series || "").toLowerCase() === "overthewire bandit")
    .sort((left, right) => Number((left as any).part || 0) - Number((right as any).part || 0));

  return (
    <section
      className="shell page-section writing-series-section"
      aria-labelledby="writing-series-title"
    >
      <div className="section-heading writing-series-heading">
        <div>
          <h2 id="writing-series-title">Follow a subject from the first lesson</h2>
          <p className="section-intro">
            Choose the Bandit walkthrough or a Learn With Me track. Drafts stay
            marked as drafts until the complete article is public.
          </p>
        </div>
        <span className="series-count mono">02 SERIES / 08 ROUTES</span>
      </div>

      <div className="writing-series-grid">
        <article className="writing-series-panel bandit-series" id="bandit-walkthrough">
          <div className="series-panel-top mono">
            <span>SERIES_01</span>
            <span>CYBERSECURITY / LINUX</span>
          </div>
          <div className="series-panel-copy">
            <p className="series-label">OverTheWire</p>
            <h3>Bandit Walkthrough</h3>
            <p>
              Each entry explains the level goal, investigation, working
              command, Linux concept, and a way to verify the result.
            </p>
          </div>
          <ul className="series-entry-list">
            {banditPosts.length ? (
              banditPosts.map((post) => <PostEntry key={post.slug} post={post} />)
            ) : (
              <li className="series-empty">The first walkthrough is planned.</li>
            )}
          </ul>
        </article>

        <article className="writing-series-panel learn-series" id="learn-with-me">
          <div className="series-panel-top mono">
            <span>SERIES_02</span>
            <span>FOUNDATIONS / BUILDING</span>
          </div>
          <div className="series-panel-copy">
            <p className="series-label">Learn With Me</p>
            <h3>Core tools for engineering work</h3>
            <p>
              Connected lessons build useful habits in Linux, Python, Dart and
              Flutter, and Git.
            </p>
          </div>
          <div className="learn-track-grid">
            {learnWithMeTracks.map((track, index) => {
              const trackPosts = posts.filter((post) => matchesTrack(post, track));
              const publishedCount = trackPosts.filter((post) => !post.draft).length;
              const draftCount = trackPosts.length - publishedCount;

              return (
                <section className="learn-track" key={track.id}>
                  <div className="learn-track-top">
                    <span className="mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="learn-track-status mono">
                      {publishedCount
                        ? `${publishedCount} published`
                        : draftCount
                          ? `${draftCount} draft`
                          : "Planned"}
                    </span>
                  </div>
                  <h4>{track.title}</h4>
                  <p>{track.description}</p>
                  {trackPosts.length ? (
                    <ul className="series-entry-list compact">
                      {trackPosts.map((post) => (
                        <PostEntry key={post.slug} post={post} />
                      ))}
                    </ul>
                  ) : (
                    <p className="learn-track-empty">No public lessons yet.</p>
                  )}
                </section>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
