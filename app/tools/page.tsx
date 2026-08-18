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
      <section className="section shell tool-page tools-featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured Engineering Workbenches</p>
            <h1>Built to be used, not just demoed.</h1>
            <p className="section-intro">
              Advanced generators, simulators, and guided engineering workbenches for hardware,
              firmware, IoT, machine learning, and authorized security labs.
            </p>
          </div>
        </div>

        <div className="project-grid">
          {engineeringTools.map((tool, index) => (
            <ToolNavCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </section>

      <section className="section shell tools-calculator-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Electronics Calculators</p>
            <h2>Bench formulas, ready when you need them.</h2>
            <p className="section-intro">
              Search 36 interactive calculators for circuits, components, number systems,
              conversions, and engineering math.
            </p>
          </div>
        </div>

        <ToolsIndex tools={calculators} />
      </section>
    </>
  );
}
