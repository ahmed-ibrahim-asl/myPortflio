"use client";

import React, { useEffect } from "react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

export function MotionSystem() {
  useScrollProgress();

  // Bounded pointer parallax effect for hero elements
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        const maxOffset = 8;
        const px = (dx * maxOffset).toFixed(2);
        const py = (dy * maxOffset).toFixed(2);

        document.documentElement.style.setProperty("--parallax-x", `${px}px`);
        document.documentElement.style.setProperty("--parallax-y", `${py}px`);
        ticking = false;
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return null;
}
