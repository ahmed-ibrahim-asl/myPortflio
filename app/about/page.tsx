import React from "react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
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

      <section className="page-intro shell about-intro">
        <div>
          <h1>Titles tell you where someone works. Questions tell you how they think.</h1>
          <p className="page-lede">
            Mine started with an ATM. I wanted to know how it recognized an account,
            checked whether money was available, and exchanged information with systems
            somewhere else.
          </p>
        </div>
        <figure className="about-portrait">
          <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
        </figure>
      </section>

      <section className="shell about-statement about-statement-focused">
        <div className="about-narrative">
          <p>
            That curiosity moved into Windows CMD, BIOS passwords, online games,
            electronics, networks, and eventually the machines and connected products
            I build today.
          </p>
          <p>
            I do not see firmware, electronics, Linux, security, Flutter, or design as
            separate identities. They are tools I learned while building projects and
            trying to solve problems. I keep sharpening them because the next problem
            rarely stays inside one field.
          </p>
          <p>
            That is what I bring to a project: I stay with the problem, learn what is
            missing, test what I build, and make the result understandable.
          </p>
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
            Open CV <span aria-hidden="true">↗</span>
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
              Open Google Scholar <span aria-hidden="true">↗</span>
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
                    Open publication <span aria-hidden="true">↗</span>
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
                <span className="text-link">Watch session <span aria-hidden="true">↗</span></span>
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
              Send your project brief <span aria-hidden="true">&rarr;</span>
            </Link>
            <a className="button text-button" href={`mailto:${profile.email}`}>
              Email directly <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
