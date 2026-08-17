"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { profile } from "@/data/portfolio";

export function SystemHud() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMission, setActiveMission] = useState("01 // ORIGIN");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      setScrollPct(pct);

      const current = document.documentElement.getAttribute("data-active-mission");
      if (current) {
        const labels: Record<string, string> = {
          origin: "01 // ORIGIN",
          credentials: "02 // PROOFS",
          projects: "03 // PROJECTS",
          method: "04 // METHOD",
          toolkit: "05 // TOOLKIT",
          story: "06 // JOURNEY",
          writing: "07 // NOTES",
          contact: "08 // BRIEF"
        };
        setActiveMission(labels[current] || "01 // ORIGIN");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h" && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="hud-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle System Telemetry HUD"
        title="Toggle System Telemetry (Shift + H)"
      >
        <span className="hud-dot" aria-hidden="true" />
        <span className="mono">SYS_HUD</span>
      </button>

      {isOpen && (
        <div className="system-hud-overlay" role="dialog" aria-label="System Telemetry HUD">
          <div className="system-hud-panel">
            <div className="hud-header">
              <div className="hud-title mono">
                <span className="hud-badge">TELEMETRY_v2.0</span>
                <span>SYSTEM DIAGNOSTICS &amp; NAVIGATION</span>
              </div>
              <button
                type="button"
                className="hud-close-btn mono"
                onClick={() => setIsOpen(false)}
                aria-label="Close HUD"
              >
                [ESC / CLOSE ×]
              </button>
            </div>

            <div className="hud-body">
              <div className="hud-grid">
                <div className="hud-card">
                  <span className="hud-card-label mono">SYSTEM STATUS</span>
                  <div className="hud-metric mono">
                    <span className="status-green">● OPERATIONAL</span>
                  </div>
                  <p className="hud-desc">Next.js 16 Static Export • SSG Verified</p>
                </div>

                <div className="hud-card">
                  <span className="hud-card-label mono">ACTIVE MISSION</span>
                  <div className="hud-metric mono text-cyan">{activeMission}</div>
                  <p className="hud-desc">Scroll Depth: {scrollPct}%</p>
                </div>

                <div className="hud-card">
                  <span className="hud-card-label mono">ENGINEER SPECS</span>
                  <div className="hud-metric mono text-gold">{profile.name}</div>
                  <p className="hud-desc">{profile.role}</p>
                </div>

                <div className="hud-card">
                  <span className="hud-card-label mono">SECURITY &amp; SANITATION</span>
                  <div className="hud-metric mono text-green">XSS_PROTECTED</div>
                  <p className="hud-desc">Defensive HTML Pass Active</p>
                </div>
              </div>

              <div className="hud-section-nav">
                <span className="hud-card-label mono">DIRECT MISSION JUMP</span>
                <div className="hud-nav-links">
                  <Link href="/#origin" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    01 // ORIGIN
                  </Link>
                  <Link href="/#credentials" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    02 // PROOFS
                  </Link>
                  <Link href="/#projects" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    03 // PROJECTS
                  </Link>
                  <Link href="/#method" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    04 // METHOD
                  </Link>
                  <Link href="/#toolkit" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    05 // TOOLKIT
                  </Link>
                  <Link href="/#story" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    06 // JOURNEY
                  </Link>
                  <Link href="/#writing" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    07 // NOTES
                  </Link>
                  <Link href="/#contact" onClick={() => setIsOpen(false)} className="hud-nav-btn">
                    08 // BRIEF
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
