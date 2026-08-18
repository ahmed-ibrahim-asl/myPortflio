import React from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";

export function ToolShell({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <section className="section shell tool-page">
      <div className="tool-shell-heading">
        <Link href="/tools" className="text-link tool-shell-back">
          Back to Tools
        </Link>
        <SectionHeading
         
          title={title}
        />
        <p className="section-intro tool-shell-description">
          {description}
        </p>
      </div>
      <div className="tool-grid">
        {children}
      </div>
    </section>
  );
}
