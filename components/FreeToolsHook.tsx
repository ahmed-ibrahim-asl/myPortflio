import Link from "next/link";
import React from "react";

const featuredTools = [
  { href: "/tools/#calculators", label: "36 electronics calculators" },
  { href: "/tools/sensor-code-generator/", label: "Embedded code generator" },
  { href: "/tools/ai-script-generator/", label: "AI project builder" }
];

export function FreeToolsHook() {
  return (
    <aside className="free-tools-hook" aria-labelledby="free-tools-title">
      <div>
        <span className="free-tools-kicker mono">FREE / NO SIGN-UP</span>
        <h2 id="free-tools-title">Use the engineering tools I build for real work.</h2>
        <p>Calculate a circuit, generate embedded starter code, or build a complete machine-learning project.</p>
      </div>
      <div className="free-tools-links" aria-label="Featured free tools">
        {featuredTools.map((tool) => (
          <Link href={tool.href} key={tool.href}>{tool.label}</Link>
        ))}
      </div>
    </aside>
  );
}
