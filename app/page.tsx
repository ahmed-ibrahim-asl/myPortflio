import React from "react";
import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { PostCard } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { FreeToolsHook } from "@/components/FreeToolsHook";
import {
  education,
  experience,
  profile,
  projects,
  publication,
  technologyGroups,
  toolkitHeading,
  toolkitIntro,
  workingMethod
} from "@/data/portfolio";
import { getAllPosts } from "@/lib/content";

export default function HomePage() {
  const posts = getAllPosts();
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
  const competitionProject = projects.find(
    (project) => project.slug === "megasumo-autonomous-robot"
  ) || projects[0];

  return (
    <>
      {/* 1. Hero: client outcome + primary project CTA */}
      <section className="hero" data-mission="origin" data-mission-label="ORIGIN" data-mission-num="01">
        <div className="shell hero-shell">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="status-dot" aria-hidden="true" />
                {profile.label}
              </div>
              <h1 className="identity-title">
                <span className="identity-name">{profile.name}</span>
                <span className="identity-role">{profile.role}</span>
              </h1>
              <p className="hero-lede">
                {profile.headline}
              </p>
              <p className="hero-sub">
                {profile.summary}
              </p>
              <FreeToolsHook />
              <div className="hero-actions">
                <Link className="button primary" href="/contact">
                  Tell me about your project
                </Link>
                <Link className="button text-button" href="#method">
                  See how I solve problems
                </Link>
              </div>
            </div>
            <ProfilePortrait context="home" />
          </div>
        </div>
      </section>

      {/* 2. Credibility row */}
      <section className="section home-about-section" data-mission="credentials" data-mission-label="CREDENTIALS" data-mission-num="02">
        <div className="shell home-about-grid">
          <div className="home-about-copy">
            <h2>From problem to working prototype, across the full system.</h2>
            <p>
              I trace a problem from sensor or board through transport, application state,
              and the operator interface. Teaching shapes how I engineer: I document
              assumptions, explain failure modes, and check whether someone else can
              understand and use the result.
            </p>
            <Link className="text-link" href="/about">
              Read my full background
            </Link>
          </div>
          <dl className="home-about-facts">
            <div>
              <dt>Current role</dt>
              <dd>
                {experience[0].role}
                <span>{experience[0].organization}</span>
              </dd>
            </div>
            {education[0] ? (
              <div>
                <dt>Study</dt>
                <dd>{education[0].credential}</dd>
              </div>
            ) : null}
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Core focus</dt>
              <dd>Hardware prototypes, IoT products, robotics, and engineering education</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 3. Featured projects */}
      <section className="section shell" data-mission="projects" data-mission-label="PROJECTS" data-mission-num="03">
        <SectionHeading
         
          title="Projects built around a problem, a build, and a result."
          action={
            <Link className="text-link" href="/work">
              View all projects
            </Link>
          }
        />
        <div className="project-grid">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* Experience and results strip */}
      <section className="section home-proof-section">
        <div className="shell">
          <SectionHeading
           
            title="Teaching, research, and competition work."
          />
          <div className="proof-strip">
            <article className="proof-card">
              <span className="proof-index mono">01</span>
              <p className="proof-label">University teaching</p>
              <h3>{experience[0].role}</h3>
              <p>{experience[0].organization}</p>
              <Link className="text-link" href="/about#experience">
                View experience
              </Link>
            </article>
            <article className="proof-card">
              <span className="proof-index mono">02</span>
              <p className="proof-label">Research publication</p>
              <h3>{publication.title}</h3>
              <p>{publication.description}</p>
              <Link className="text-link" href="/about#publications">
                View publication record
              </Link>
            </article>
            <article className="proof-card">
              <span className="proof-index mono">03</span>
              <p className="proof-label">Robotics competition</p>
              <h3>{competitionProject.title}</h3>
              <p>{competitionProject.outcome}</p>
              <Link className="text-link" href={`/work#${competitionProject.slug}`}>
                View project
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Working method */}
      <section id="method" className="section section-ink home-method-section" data-mission="method" data-mission-label="METHOD" data-mission-num="04">
        <div className="shell">
          <SectionHeading
           
            title="Question, learn, build, test."
          />
          <div className="method-signal-path" aria-hidden="true">
            <svg viewBox="0 0 1000 12" preserveAspectRatio="none" className="method-svg-path">
              <line x1="0" y1="6" x2="1000" y2="6" className="method-path-track" />
              <line x1="0" y1="6" x2="1000" y2="6" className="method-path-pulse" />
            </svg>
          </div>
          <div className="method-grid">
            {workingMethod.map((item) => (
              <article key={item.step} className="method-step" data-step={item.step}>
                <span className="method-step-index mono">{item.step}</span>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Toolkit */}
      <section className="section shell home-toolkit-section" data-mission="toolkit" data-mission-label="TOOLKIT" data-mission-num="05">
        <SectionHeading
         
          title={toolkitHeading}
          action={
            <Link className="text-link" href="/about#skills">
              View full toolkit
            </Link>
          }
        />
        <p className="section-intro toolkit-intro">{toolkitIntro}</p>
        <div className="technology-matrix">
          {technologyGroups.map((group) => (
            <article className="technology-cluster" key={group.index} data-node={group.index}>
              <div className="technology-cluster-top">
                <span className="technology-cluster-index mono">{group.index}</span>
                <span className="mono">SYSTEM CLASS</span>
              </div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul className="technology-tool-list" aria-label={`${group.title} tools`}>
                {group.tools.map((tool, i) => (
                  <li key={tool}>
                    <span className="mono" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <strong>{tool}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Curiosity origin teaser */}
      <section className="section home-origin-section" data-mission="story" data-mission-label="STORY" data-mission-num="06">
        <div className="shell home-origin-grid">
          <div className="home-origin-copy">
            <h2>Titles tell you where someone works. Questions tell you how they think.</h2>
            <p>
              Mine started with an ATM. I wanted to know how it recognized an account,
              checked whether money was available, and exchanged information with systems
              somewhere else. That curiosity moved into Windows CMD, BIOS passwords, online
              games, electronics, networks, and eventually the machines and connected
              products I build today.
            </p>
            <Link className="text-link" href="/about">
              Read the full story
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Writing and teaching */}
      <section className="section shell" data-mission="writing" data-mission-label="WRITING" data-mission-num="07">
        <SectionHeading
         
          title="Linux, embedded systems, Flutter, and security walkthroughs."
          action={
            <Link className="text-link" href="/writing">
              Browse all writing
            </Link>
          }
        />
        <div className="post-list">
          {posts.slice(0, 3).map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      {/* 8. Structured project-brief CTA */}
      <section className="section home-contact-section" data-mission="contact" data-mission-label="CONTACT" data-mission-num="08">
        <div className="shell home-contact-grid">
          <div>
            <h2>Bring me the problem, even if the solution is not clear yet.</h2>
            <p>
              Tell me what you are trying to build or fix, what already exists, and where
              you are stuck. I will tell you whether I can help and what the next useful
              step should be.
            </p>
          </div>
          <div className="home-contact-actions">
            <Link className="button primary" href="/contact">
              Send your project brief
            </Link>
            <a className="button text-button" href={`mailto:${profile.email}`}>
              Email directly
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
