import React from "react";
import { Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
  index: number;
  compact?: boolean;
}

export function ProjectCard({ project, index, compact = false }: ProjectCardProps) {
  return (
    <article
      className={`project-card ${compact ? "compact" : ""}`}
      id={project.slug}
    >
      <div className="project-card-top">
        <span className="mono muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="mono muted">{project.year}</span>
      </div>

      {project.image ? (
        <div className="project-media">
          <img
            src={project.image}
            alt={`${project.title} hardware or interface`}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="project-media project-placeholder" aria-hidden="true">
          <span>{project.tags[0]}</span>
        </div>
      )}

      {compact && project.gallery?.length ? (
        <div
          className="project-evidence-strip"
          aria-label={`${project.title} additional images`}
        >
          {project.gallery.map((image) => (
            <img src={image.src} alt={image.alt} loading="lazy" key={image.src} />
          ))}
        </div>
      ) : null}
      <div className="project-copy">
        <p className="project-category">{project.category}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>

      <div className="project-meta">
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <span className="outcome">Result / {project.outcome}</span>
      </div>
    </article>
  );
}
