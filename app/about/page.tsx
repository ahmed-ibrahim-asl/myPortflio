import React from "react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import {
  coursesTaught,
  education,
  experience,
  profile,
  publications,
  publicationSource,
  technologyGroups,
  toolkitHeading,
  toolkitIntro,
  tutorials
} from "@/data/portfolio";
import { createPageMetadata, createProfilePageJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Embedded Systems Engineer and Educator",
  description:
    "Meet Ahmed Asl, an embedded systems and IoT engineer and teaching assistant. View his experience, technical skills, publications, courses, CV, and workshops.",
  pathname: "/about/"
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={createProfilePageJsonLd()} />

      <section className="page-intro shell about-intro about-story-intro">
        <div className="about-intro-copy">
          <span className="eyebrow">Engineer / educator / lifelong learner</span>
          <h1>I build by following the question through the whole system.</h1>
          <p className="page-lede">
            My first big question was about an ATM: how one machine could recognize an
            account, check money somewhere else, and complete a physical action safely.
            That question became a career across electronics, firmware, networks, software,
            security, robotics, and teaching.
          </p>
        </div>
        <ProfilePortrait context="about" />
      </section>

      <section className="shell about-statement about-statement-focused">
        <div className="about-story-grid">
          <article>
            <span className="mono">01 / FOLLOW THE SIGNAL</span>
            <h2>Across boundaries, not inside one job title.</h2>
            <p>Firmware, electronics, Linux, security, apps, and interface design are tools for tracing one system from input to useful result.</p>
          </article>
          <article>
            <span className="mono">02 / PROVE THE BUILD</span>
            <h2>Make the idea observable.</h2>
            <p>I document assumptions, test failure modes, and turn uncertain requirements into a prototype that people can inspect and improve.</p>
          </article>
          <article>
            <span className="mono">03 / TEACH THE SYSTEM</span>
            <h2>Leave understanding behind.</h2>
            <p>Teaching sharpened a useful engineering habit: a result is stronger when another person can understand, operate, and extend it.</p>
          </article>
        </div>
        <aside className="profile-credential-card">
          <div>
            <h2>Education, experience, and technical record</h2>
            <p>
              Open my CV for degree, work history, projects, courses, and
              technical skills.
            </p>
          </div>
          <a className="button primary" href={profile.cv} target="_blank" rel="noreferrer">
            Open CV
          </a>
        </aside>
      </section>

      <section id="experience" className="section section-ink">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Engineering experience and university teaching</h2>
            </div>
          </div>
          
          <div className="timeline">
            {experience.map((item, index) => (
              <article className="timeline-item" key={`${item.role}-${item.period}`}>
                <span className="timeline-index mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.role}</h3>
                  <p className="timeline-org">{item.organization}</p>
                  <p className="timeline-type mono">{item.type}</p>
                </div>
                <div>
                  <p>{item.description}</p>
                  <div className="tag-row dark">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="timeline-meta mono">
                  <span>{item.period}</span>
                  <span>{item.location}</span>
                </div>
              </article>
            ))}

            {/* Render Education from the data layer */}
            {education.map((item, index) => (
              <article className="timeline-item" key={`edu-${index}`}>
                <span className="timeline-index mono">
                  {String(experience.length + index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.institution}</h3>
                  <p className="timeline-org">Education</p>
                </div>
                <div>
                  <p>{item.credential}</p>
                </div>
                <div className="timeline-meta mono">
                  <span>{item.period}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="teaching" className="section teaching-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Courses taught</h2>
            </div>
          </div>
          <div className="courses-grid">
            {coursesTaught.map((course, index) => (
              <article className="course-card" key={course}>
                <div className="course-card-top mono">
                  <span>COURSE_{String(index + 1).padStart(2, "0")}</span>
                  <span>Delta University</span>
                </div>
                <h3>{course}</h3>
                <p>Undergraduate lectures and laboratory instruction.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="section shell about-capabilities-section">
        <div className="section-heading">
          <div>
            <h2>{toolkitHeading}</h2>
            <p className="section-intro">
              {toolkitIntro}
            </p>
          </div>
        </div>
        <div className="technology-matrix">
          {technologyGroups.map((group) => (
            <article className="technology-cluster" key={group.index}>
              <div className="technology-cluster-top">
                <span className="technology-cluster-index mono">{group.index}</span>
                <span className="mono">SYSTEM CLASS</span>
              </div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul className="technology-tool-list" aria-label={`${group.title} tools`}>
                {group.tools.map((tool, index) => (
                  <li key={tool}>
                    <span className="mono" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{tool}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="publications" className="section section-ink research-record-section">
        <div className="shell research-feed">
          <div className="section-heading research-feed-heading">
            <div>
              <h2>Publications</h2>
              <p className="section-intro">
                Journal and conference papers from my Google Scholar profile,
                with publication type, ranking, year, and citation count.
              </p>
            </div>
            <a
              className="text-link"
              href={publicationSource.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Google Scholar
            </a>
          </div>
          <div className="publication-list">
            {publications.map((item, index) => (
              <article className="publication-record" key={item.id}>
                <div className="publication-record-index mono">
                  <span>PUBLICATION_{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.year}</strong>
                </div>
                <div className="publication-record-copy">
                  <div
                    className="publication-classification"
                    aria-label="Publication classification"
                  >
                    {item.ranking ? (
                      <span className="publication-ranking">{item.ranking}</span>
                    ) : null}
                    <span className="publication-type">
                      {item.publicationType || "Publication"}
                    </span>
                  </div>
                  <h3>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className="publication-authors">{item.authors}</p>
                  <p className="publication-venue">{item.venue}</p>
                  <div className="tag-row dark">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="publication-record-meta mono">
                  <span>
                    {item.citedBy} {item.citedBy === 1 ? "citation" : "citations"}
                  </span>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Open publication
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="publication-sync-note">
            Each record links to the paper or its Google Scholar entry.
          </p>
        </div>
      </section>

      <section id="tutorials" className="section shell">
        <div className="section-heading">
          <div>
            <h2>Technical Tutorials &amp; Workshops</h2>
            <p className="section-intro">
              Recorded lessons and workshops on ROS, embedded systems, digital
              logic, Matlab, and networking.
            </p>
          </div>
        </div>
        <div className="tutorial-grid">
          {tutorials.map((tutorial) => (
            <a className="tutorial-card" href={tutorial.href} target="_blank" rel="noreferrer" key={tutorial.title}>
              <img src={tutorial.image} alt={`${tutorial.title} cover`} loading="lazy" />
              <div>
                <div className="tag-row">
                  {tutorial.tags.map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <h3>{tutorial.title}</h3>
                <p>{tutorial.description}</p>
                <span className="text-link">Watch session</span>
              </div>
            </a>
          ))}
        </div>
      </section>
      
      {/* Client CTA at bottom as per spec */}
      <section className="section home-contact-section">
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
