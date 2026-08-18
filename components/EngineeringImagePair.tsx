import React from "react";
import { profile } from "@/data/portfolio";

interface EngineeringImagePairProps {
  context: "home" | "about";
}

export function EngineeringImagePair({ context }: EngineeringImagePairProps) {
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/myPortflio" : "";

  return (
    <figure className={`engineering-image-pair engineering-image-pair--${context}`}>
      <div className="engineering-image-frame engineering-image-frame--portrait">
        <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
        <span className="engineering-image-label mono">ENGINEER</span>
      </div>
      <div className="engineering-image-signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="engineering-image-frame engineering-image-frame--bench">
        <img
          src={`${basePath}/images/hardware_bench_hero.jpg`}
          alt="Embedded hardware bench with development boards and electronics tools"
        />
        <span className="engineering-image-label mono">BENCH / BUILD / TEST</span>
      </div>
    </figure>
  );
}
