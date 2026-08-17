"use client";
import React, { useRef, useEffect, useState } from "react";
import { createPidEngine, calculatePidMetrics } from "@/lib/tools/pid-physics";

interface PidSvgVizProps {
  kp: number;
  ki: number;
  kd: number;
  target: number;
  mass: number;
  damping: number;
  plant?: "mass-spring" | "thermal";
  thermalTau?: number;
  isRunning: boolean;
  onMetricsUpdate: (metrics: { overshoot: number, steadyStateError: number, settlingTime: number | null }) => void;
  resetTrigger: number;
}

const FIXED_STEP_SEC = 1 / 120;
const MAX_FRAME_SEC = 0.1;
const HISTORY_INTERVAL_SEC = 1 / 30; // 30Hz history

export function PidSvgViz({ kp, ki, kd, target, mass, damping, plant = "mass-spring", thermalTau = 8, isRunning, onMetricsUpdate, resetTrigger }: PidSvgVizProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const blockRef = useRef<SVGRectElement>(null);
  const targetLineRef = useRef<SVGLineElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  
  const engineRef = useRef(createPidEngine());
  
  const simStateRef = useRef({
    travelStartPos: 0,
    currentTarget: target,
    lastHistoryTime: 0,
    settlingTime: null as number | null,
    inToleranceSince: null as number | null,
    lastMetricsUpdate: 0
  });

  useEffect(() => {
    engineRef.current.reset();
    simStateRef.current = {
      travelStartPos: 0,
      currentTarget: target,
      lastHistoryTime: 0,
      settlingTime: null,
      inToleranceSince: null,
      lastMetricsUpdate: 0
    };
    onMetricsUpdate({ overshoot: 0, steadyStateError: 0, settlingTime: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  useEffect(() => {
    if (target !== simStateRef.current.currentTarget) {
      simStateRef.current.travelStartPos = engineRef.current.getState().position;
      simStateRef.current.currentTarget = target;
      simStateRef.current.settlingTime = null;
      simStateRef.current.inToleranceSince = null;
      engineRef.current.resetPeak();
    }
  }, [target]);

  useEffect(() => {
    let raf: number;
    let previousTimestampMs: number | null = null;
    let accumulatorSec = 0;

    const tick = (timestampMs: number) => {
      if (previousTimestampMs === null) {
        previousTimestampMs = timestampMs;
      }

      const frameSec = Math.min((timestampMs - previousTimestampMs) / 1000, MAX_FRAME_SEC);
      previousTimestampMs = timestampMs;

      // Handle reduced motion rate limiting visually, but keep physics accurate
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      if (isRunning || isReducedMotion) {
        accumulatorSec += frameSec;
      }

      let ranPhysics = false;
      while (accumulatorSec >= FIXED_STEP_SEC && isRunning) {
        engineRef.current.step({
          dt: FIXED_STEP_SEC,
          mass,
          damping,
          target,
          kp,
          ki,
          kd,
          plant,
          thermalTau
        });
        
        accumulatorSec -= FIXED_STEP_SEC;
        ranPhysics = true;

        const currentState = engineRef.current.getState();
        if (currentState.timeSec - simStateRef.current.lastHistoryTime >= HISTORY_INTERVAL_SEC) {
          engineRef.current.pushHistory({ timeSec: currentState.timeSec, position: currentState.position, target });
          simStateRef.current.lastHistoryTime = currentState.timeSec;
        }

        // Settling time logic
        const travel = Math.abs(target - simStateRef.current.travelStartPos);
        const tolerance = Math.max(0.02 * travel, 0.005);
        if (Math.abs(target - currentState.position) <= tolerance) {
          if (simStateRef.current.inToleranceSince === null) {
            simStateRef.current.inToleranceSince = currentState.timeSec;
          } else if (currentState.timeSec - simStateRef.current.inToleranceSince >= 1.0 && simStateRef.current.settlingTime === null) {
            simStateRef.current.settlingTime = simStateRef.current.inToleranceSince;
          }
        } else {
          simStateRef.current.inToleranceSince = null;
        }
      }

      if (ranPhysics || !isRunning) {
        const state = engineRef.current.getState();
        if (svgRef.current && blockRef.current && targetLineRef.current && trailRef.current) {
          const width = 1000;
          const height = 240;
          
          const xPos = Math.max(0, Math.min(1, state.position / 100)) * width;
          const targetPos = (target / 100) * width;
          
          blockRef.current.setAttribute("transform", `translate(${xPos - 20}, 0)`);
          targetLineRef.current.setAttribute("x1", String(targetPos));
          targetLineRef.current.setAttribute("x2", String(targetPos));

          if (!isReducedMotion) {
            const points = (state.history as any[]).map((h, i) => {
              const hx = (h.position / 100) * width;
              const y = 20 + ((state.history.length - i) / 300) * (height - 40);
              return `${hx},${y}`;
            }).join(" ");
            trailRef.current.setAttribute("points", points);
          } else {
            trailRef.current.setAttribute("points", "");
          }
        }
        
        // Throttle React state updates to ~5Hz (200ms)
        if (timestampMs - simStateRef.current.lastMetricsUpdate > 200) {
          const metrics = calculatePidMetrics({ state, target, travelStartPos: simStateRef.current.travelStartPos });
          onMetricsUpdate({
            overshoot: metrics.overshootPercent,
            steadyStateError: metrics.steadyStateError,
            settlingTime: simStateRef.current.settlingTime
          });
          simStateRef.current.lastMetricsUpdate = timestampMs;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    
    raf = requestAnimationFrame(tick);
    
    const handleVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        previousTimestampMs = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [isRunning, kp, ki, kd, target, mass, damping, plant, thermalTau, onMetricsUpdate]);

  return (
    <div className="tool-canvas-frame">
      <svg ref={svgRef} viewBox="0 0 1000 240" className="pid-svg" style={{ shapeRendering: "crispEdges", width: "100%", height: "240px", backgroundColor: "#050711", border: "1px solid #30395e" }}>
        <line ref={targetLineRef} className="pid-target" y1="0" y2="100%" stroke="var(--pixel-gold)" strokeWidth="2" strokeDasharray="4 4" />
        <polyline ref={trailRef} className="pid-trail" fill="none" stroke="#55d5d855" strokeWidth="2" />
        <rect ref={blockRef} className="pid-block" y="20" width="40" height="20" fill="var(--pixel-cyan)" />
      </svg>
    </div>
  );
}
