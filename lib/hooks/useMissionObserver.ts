"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface MissionState {
  activeMission: string;
  completedMissions: Set<string>;
  hasMissions: boolean;
}

export function useMissionObserver(): MissionState {
  const pathname = usePathname();
  const [activeMission, setActiveMission] = useState<string>("origin");
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [hasMissions, setHasMissions] = useState<boolean>(false);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-mission]"));
    const hasSections = sections.length > 0;

    setHasMissions(hasSections);
    setCompletedMissions(new Set());

    if (!hasSections) {
      setActiveMission("origin");
      document.documentElement.removeAttribute("data-active-mission");
      return;
    }

    const missionOrder = sections.map((sec) => sec.getAttribute("data-mission") || "");

    let ticking = false;

    const updateActiveMission = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const triggerPoint = scrollY + windowHeight * 0.4; // 40% from top

      let currentMission = missionOrder[0];
      let currentIndex = 0;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const offsetTop = sec.offsetTop;
        // If the trigger point is within this section, or we've scrolled past it
        if (triggerPoint >= offsetTop) {
          currentMission = missionOrder[i];
          currentIndex = i;
        } else {
          // Since sections are in order, we can break early once we pass the trigger
          break;
        }
      }

      if (currentMission) {
        setActiveMission(currentMission);
        document.documentElement.setAttribute("data-active-mission", currentMission);

        setCompletedMissions((prev) => {
          const updated = new Set(prev);
          for (let i = 0; i <= currentIndex; i++) {
            if (missionOrder[i]) updated.add(missionOrder[i]);
          }
          return updated;
        });
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveMission);
        ticking = true;
      }
    };

    // Run once on mount
    updateActiveMission();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      document.documentElement.removeAttribute("data-active-mission");
    };
  }, [pathname]);

  return { activeMission, completedMissions, hasMissions };
}
