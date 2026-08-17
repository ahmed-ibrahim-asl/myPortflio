import React from "react";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  siBehance,
  siGithub,
  siGooglescholar,
  siTryhackme,
  siYoutube
} from "simple-icons";

interface IconData {
  path: string;
  viewBox: string;
}

const icons: Record<string, IconData> = {
  GitHub: { path: siGithub.path, viewBox: "0 0 24 24" },
  LinkedIn: {
    path: Array.isArray(faLinkedin.icon[4])
      ? faLinkedin.icon[4].join(" ")
      : String(faLinkedin.icon[4]),
    viewBox: `0 0 ${faLinkedin.icon[0]} ${faLinkedin.icon[1]}`
  },
  "Google Scholar": { path: siGooglescholar.path, viewBox: "0 0 24 24" },
  TryHackMe: { path: siTryhackme.path, viewBox: "0 0 24 24" },
  Behance: { path: siBehance.path, viewBox: "0 0 24 24" },
  YouTube: { path: siYoutube.path, viewBox: "0 0 24 24" }
};

interface SocialIconProps {
  label: string;
}

export function SocialIcon({ label }: SocialIconProps) {
  const icon = icons[label];
  if (!icon) return null;

  return (
    <svg
      className="social-icon"
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}
