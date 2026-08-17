import React from "react";
import { engineeringTools } from "@/data/tools";
import { ToolNavCard } from "@/components/tools/ToolNavCard";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering Tools: ML Pipelines, Pentest Commands, and Hardware Calculators",
  description: "A guided Python ML project generator, a validated pentest command builder for eCPPT/CPTS, plus a PID simulator, battery estimator, and sensor code generator for hardware and IoT development.",
  pathname: "/tools/"
});

export default function ToolsIndexPage() {
  return (
    <section className="section shell tool-page">
      <div className="section-heading" style={{ marginBottom: "40px" }}>
        <div>
          <h1>Built to be used, not just demoed.</h1>
          <p className="section-intro">
            A guided ML project generator and a certification-grade pentest command builder,
            alongside calculators and code generators for hardware, firmware, and IoT development.
          </p>
        </div>
      </div>
      
      <div className="project-grid">
        {engineeringTools.map((tool, index) => (
          <ToolNavCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </section>
  );
}
