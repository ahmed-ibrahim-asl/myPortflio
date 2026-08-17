"use client";

import React from "react";
import { Mission } from "@/types/portfolio";

const MISSIONS: Mission[] = [
  { id: "origin", label: "ORIGIN", num: "01" },
  { id: "credentials", label: "PROOFS", num: "02" },
  { id: "projects", label: "PROJECTS", num: "03" },
  { id: "method", label: "METHOD", num: "04" },
  { id: "toolkit", label: "TOOLKIT", num: "05" },
  { id: "story", label: "JOURNEY", num: "06" },
  { id: "writing", label: "NOTES", num: "07" },
  { id: "contact", label: "BRIEF", num: "08" }
];

interface MissionRailProps {
  activeMission: string;
  completedMissions: Set<string>;
}

export function MissionRail({ activeMission, completedMissions }: MissionRailProps) {
  const currentMission = MISSIONS.find((m) => m.id === activeMission) || MISSIONS[0];

  return (
    <>
      {/* Fixed desktop rail for wide screens (min-width: 1440px) */}
      <aside className="mission-rail" aria-label="Mission navigation rail">
        <div className="mission-rail-inner">
          <div className="mission-rail-header">
            <span className="rail-title">MISSION_SYSTEM</span>
            <span className="rail-status">SYS_OK</span>
          </div>
          <ol className="mission-rail-list">
            {MISSIONS.map((m) => {
              const isActive = activeMission === m.id;
              const isCompleted = completedMissions.has(m.id);
              const itemClass = isActive
                ? "mission-rail-item active"
                : isCompleted
                ? "mission-rail-item completed"
                : "mission-rail-item";

              return (
                <li key={m.id} className={itemClass}>
                  <span className="rail-num">{m.num}</span>
                  <span className="rail-label">{m.label}</span>
                  <span className="rail-marker" aria-hidden="true" />
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* Compact readout badge for screens under 1440px */}
      <div className="mobile-mission-readout" aria-live="polite">
        <span className="readout-tag">MISSION_{currentMission.num}</span>
        <span className="readout-label">{currentMission.label}</span>
      </div>
    </>
  );
}
