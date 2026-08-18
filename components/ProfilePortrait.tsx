import React from "react";
import { profile } from "@/data/portfolio";

interface ProfilePortraitProps {
  context: "home" | "about";
}

export function ProfilePortrait({ context }: ProfilePortraitProps) {
  return (
    <figure className={`profile-portrait profile-portrait--${context}`}>
      <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
    </figure>
  );
}
