"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ambientWorlds } from "@/data/ambient";

export function WorldGallery() {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setAnimationsEnabled(!mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener?.("change", syncPreference);
    return () => mediaQuery.removeEventListener?.("change", syncPreference);
  }, []);

  return (
    <section className="section world-select-section" aria-labelledby="world-select-title">
      <div className="shell">
        <div className="world-select-heading">
          <div>
            <h2 id="world-select-title">Choose a topic</h2>
            <p className="world-select-intro">
              Each scene marks a subject area. Select one to browse those field notes.
            </p>
          </div>
        </div>

        <div className="world-grid">
          {ambientWorlds.map((world, index) => (
            <Link
              className={`world-card${world.featured ? " featured" : ""}`}
              key={world.id}
              href={`/writing?topic=${world.filterTerm}#published-field-logs`}
              aria-label={`Browse ${world.label} articles`}
            >
              <div className="world-card-top mono">
                <span>WORLD_{String(index + 1).padStart(2, "0")}</span>
                <span>{world.label}</span>
              </div>
              <div className="world-media">
                {animationsEnabled ? (
                  <img
                    src={world.image}
                    alt={`Pixel-art scene representing ${world.label}`}
                    loading={world.featured ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="world-paused"
                    role="img"
                    aria-label={`${world.label} topic`}
                  >
                    <span className="world-paused-icon" aria-hidden="true">II</span>
                    <span className="mono">REDUCED MOTION</span>
                  </div>
                )}
              </div>
              <div className="world-card-copy">
                <div>
                  <h3>{world.title}</h3>
                  <p>{world.description}</p>
                </div>
                <span className="text-link" aria-hidden="true">
                  Browse notes <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
