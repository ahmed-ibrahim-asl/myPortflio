import React from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";

export function ToolShell({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <section className="section shell tool-page">
      <div style={{ marginBottom: "32px" }}>
        <Link href="/tools" className="text-link" style={{ display: "inline-block", marginBottom: "16px" }}>
          <span aria-hidden="true">&larr;</span> Back to Tools
        </Link>
        <SectionHeading
         
          title={title}
        />
        <p className="section-intro" style={{ marginTop: "-20px" }}>
          {description}
        </p>
      </div>
      <div className="tool-grid">
        {children}
      </div>
    </section>
  );
}
