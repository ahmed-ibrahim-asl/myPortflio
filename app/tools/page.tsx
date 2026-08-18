import React from "react";
import { engineeringTools } from "@/data/tools";
import { ToolNavCard } from "@/components/tools/ToolNavCard";
import { ToolsIndex } from "@/components/tools/ToolsIndex";
import { getAllTools } from "@/lib/tools";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering Tools: Workbenches and Electronics Calculators",
  description:
    "Five advanced engineering workbenches and 36 interactive electronics calculators for circuits, components, number systems, firmware, IoT, ML, and security labs.",
  pathname: "/tools/"
});

export default function ToolsIndexPage() {
  const calculators = getAllTools();

  return (
    <>
      <section id="calculators" className="section shell tools-calculator-section">
        <div className="tools-intro-grid">
          <div>
            <p className="eyebrow">36 free electronics calculators</p>
            <h1>Start with the calculation in front of you.</h1>
            <p className="section-intro">
              Search circuits, component values, timing, number systems, conversions, and
              engineering math. Every calculator is interactive and works without an account.
            </p>
          </div>
          <aside className="tools-intro-note">
            <span className="mono">BENCH MODE</span>
            <strong>Search first. Filter only when you need it.</strong>
            <p>Choose a card to calculate, then find related formulas without returning to this page.</p>
          </aside>
        </div>

        <ToolsIndex tools={calculators} />
      </section>

      <div className="shell tools-scroll-cue" aria-hidden="true">
        <span className="mono">SCROLL FOR GENERATORS</span>
        <span className="tools-scroll-track"><span /></span>
      </div>

      <section id="advanced-tools" className="section shell tool-page tools-featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Advanced engineering workbenches</p>
            <h2>Generate, simulate, and learn the full workflow.</h2>
            <p className="section-intro">
              Guided workbenches for firmware, IoT, control, machine learning, and authorized
              security labs—built as working tools rather than static demos.
            </p>
          </div>
        </div>

        <div className="project-grid">
          {engineeringTools.map((tool, index) => (
            <ToolNavCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}
