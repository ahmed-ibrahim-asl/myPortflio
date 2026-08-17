"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolShell } from "@/components/tools/ToolShell";
import { ToolSlider } from "@/components/tools/ToolSlider";
import { ToolInput } from "@/components/tools/ToolInput";
import { PidSvgViz } from "@/components/tools/PidSvgViz";
import { ToolResultCard } from "@/components/tools/ToolResultCard";

type Plant = "mass-spring" | "thermal";

interface Lesson {
  id: string;
  label: string;
  title: string;
  blurb: string;
  plant: Plant;
  plantLocked: boolean;
  lockedGains: { ki?: number; kd?: number };
}

const LESSONS: Lesson[] = [
  {
    id: "p-only",
    label: "1. P only",
    title: "Proportional only",
    blurb:
      "Kp alone pushes toward the target proportionally to how far away it is. Push it up and the response gets faster — but watch STEADY-STATE ERR: it never reaches zero, no matter how high Kp goes. A proportional controller always needs some remaining error to keep producing a correcting force.",
    plant: "mass-spring",
    plantLocked: true,
    lockedGains: { ki: 0, kd: 0 }
  },
  {
    id: "add-integral",
    label: "2. Add I",
    title: "Adding integral",
    blurb:
      "Ki accumulates error over time and keeps pushing until it's gone — watch STEADY-STATE ERR drop toward zero. The trade-off shows up in OVERSHOOT: the accumulated correction doesn't stop the instant the target is reached, so the system tends to sail past it before settling back.",
    plant: "mass-spring",
    plantLocked: true,
    lockedGains: { kd: 0 }
  },
  {
    id: "add-derivative",
    title: "Adding derivative",
    label: "3. Add D",
    blurb:
      "Kd reacts to how fast the error is changing, not the error itself — it acts as a brake on the approach. Raise it and watch OVERSHOOT come back down from where Lesson 2 left it, usually without giving back much of the SETTLING TIME improvement.",
    plant: "mass-spring",
    plantLocked: true,
    lockedGains: {}
  },
  {
    id: "thermal",
    title: "A slower real system",
    label: "4. Thermal lag",
    blurb:
      "Same controller, a different plant: a heater warming toward a commanded power instead of a mass being pushed. There's no inertia here, so it can't overshoot from momentum the way Lessons 1–3 could — aggressive gains still cause other problems (oscillation, slow settling), but the failure mode looks different. This is the more realistic model for a lot of embedded control — thermal, PWM-averaged, or anything without real mechanical mass.",
    plant: "thermal",
    plantLocked: true,
    lockedGains: {}
  },
  {
    id: "free",
    title: "Free tuning",
    label: "5. Your turn",
    blurb:
      "Everything unlocked, including the plant. Try to beat Lesson 3's settling time without letting overshoot back above a few percent — or switch to the thermal plant and see how differently the same gains behave.",
    plant: "mass-spring",
    plantLocked: false,
    lockedGains: {}
  }
];

const RESULT_GLOSSARY = {
  overshoot:
    "How far past the target the response swings before settling — driven by momentum (or accumulated I) carrying past the setpoint.",
  settlingTime:
    "How long until the response stays within a small tolerance band of the target for a full second.",
  steadyStateError:
    "The remaining gap between the target and the response once it's no longer actively correcting."
};

export default function PidSimulatorPage() {
  const [lessonId, setLessonId] = useState(LESSONS[0].id);
  const [params, setParams] = useState({
    kp: 2,
    ki: 0,
    kd: 0.5,
    target: 70,
    mass: 1,
    damping: 0.8,
    thermalTau: 8
  });
  const [freePlant, setFreePlant] = useState<Plant>("mass-spring");

  const [isRunning, setIsRunning] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [metrics, setMetrics] = useState({
    overshoot: 0,
    steadyStateError: 0,
    settlingTime: null as number | null
  });

  const lesson = useMemo(
    () => LESSONS.find((item) => item.id === lessonId) || LESSONS[0],
    [lessonId]
  );
  const activePlant = lesson.plantLocked ? lesson.plant : freePlant;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: Number(e.target.value) });
  };

  const handleMetricsUpdate = useCallback((newMetrics: any) => {
    setMetrics(newMetrics);
  }, []);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const selectLesson = (nextLessonId: string) => {
    const nextLesson = LESSONS.find((item) => item.id === nextLessonId);
    if (!nextLesson) return;
    setLessonId(nextLessonId);
    setParams((prev) => ({
      ...prev,
      ...(typeof nextLesson.lockedGains.ki === "number" ? { ki: nextLesson.lockedGains.ki } : {}),
      ...(typeof nextLesson.lockedGains.kd === "number" ? { kd: nextLesson.lockedGains.kd } : {})
    }));
    setResetTrigger((prev) => prev + 1);
  };

  const kiLocked = typeof lesson.lockedGains.ki === "number";
  const kdLocked = typeof lesson.lockedGains.kd === "number";

  return (
    <ToolShell
      title="Interactive PID Simulator"
      description="Five short lessons on proportional, integral, and derivative control, ending with a free-tuning sandbox."
    >
      <div className="tool-controls">
        <h3 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "0 0 8px" }}>LESSON</h3>
        <div
          role="tablist"
          aria-label="PID lessons"
          style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}
        >
          {LESSONS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={lesson.id === item.id}
              onClick={() => selectLesson(item.id)}
              className="button"
              style={{
                padding: "6px 10px",
                fontSize: "0.7rem",
                background: lesson.id === item.id ? "var(--pixel-cyan)" : "transparent",
                color: lesson.id === item.id ? "#050711" : "var(--muted)",
                border: "1px solid",
                borderColor: lesson.id === item.id ? "var(--pixel-cyan)" : "#354064"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="tool-result-card"
          style={{ padding: "12px 14px", marginBottom: "16px", borderColor: "#465176" }}
        >
          <span className="hud-card-label mono" style={{ color: "var(--pixel-gold)" }}>{lesson.title.toUpperCase()}</span>
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {lesson.blurb}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: 0 }}>CONTROLLER TUNING</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`button ${isRunning ? 'text-button' : 'primary'}`}
              onClick={() => setIsRunning(!isRunning)}
              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
            <button
              className="button text-button"
              onClick={handleReset}
              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
            >
              RESET
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ToolInput label="Proportional (Kp)" id="kp" name="kp" type="number" step="0.01" value={params.kp} onChange={handleChange} />
          <ToolSlider label="" id="kpSlide" name="kp" min="0" max="10" step="0.01" value={params.kp} onChange={handleChange} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", opacity: kiLocked ? 0.4 : 1 }}>
          <ToolInput label={`Integral (Ki)${kiLocked ? " — locked at 0" : ""}`} id="ki" name="ki" type="number" step="0.001" value={params.ki} onChange={handleChange} disabled={kiLocked} />
          <ToolSlider label="" id="kiSlide" name="ki" min="0" max="2" step="0.001" value={params.ki} onChange={handleChange} disabled={kiLocked} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", opacity: kdLocked ? 0.4 : 1 }}>
          <ToolInput label={`Derivative (Kd)${kdLocked ? " — locked at 0" : ""}`} id="kd" name="kd" type="number" step="0.01" value={params.kd} onChange={handleChange} disabled={kdLocked} />
          <ToolSlider label="" id="kdSlide" name="kd" min="0" max="5" step="0.01" value={params.kd} onChange={handleChange} disabled={kdLocked} />
        </div>

        <h3 className="mono" style={{ fontSize: "0.8rem", color: "var(--pixel-gold)", margin: "16px 0 0" }}>PLANT MODEL</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ToolInput label="Target Setpoint (%)" id="target" name="target" type="number" value={params.target} onChange={handleChange} />
          <ToolSlider label="" id="targetSlide" name="target" min="10" max="90" step="1" value={params.target} onChange={handleChange} />
        </div>

        {!lesson.plantLocked ? (
          <div className="tool-input">
            <label htmlFor="freePlant">
              Plant type
              <select
                id="freePlant"
                value={freePlant}
                onChange={(e) => {
                  setFreePlant(e.target.value as Plant);
                  setResetTrigger((prev) => prev + 1);
                }}
              >
                <option value="mass-spring">Mass + damping (Lessons 1–3)</option>
                <option value="thermal">Thermal lag (Lesson 4)</option>
              </select>
            </label>
          </div>
        ) : null}

        {activePlant === "thermal" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <ToolInput label="Thermal Time Constant (τ, sec)" id="thermalTau" name="thermalTau" type="number" step="0.5" value={params.thermalTau} onChange={handleChange} />
            <ToolSlider label="" id="thermalTauSlide" name="thermalTau" min="1" max="30" step="0.5" value={params.thermalTau} onChange={handleChange} />
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <ToolInput label="System Mass (kg)" id="mass" name="mass" type="number" step="0.1" value={params.mass} onChange={handleChange} />
              <ToolSlider label="" id="massSlide" name="mass" min="0.5" max="5" step="0.1" value={params.mass} onChange={handleChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <ToolInput label="Damping" id="damping" name="damping" type="number" step="0.05" value={params.damping} onChange={handleChange} />
              <ToolSlider label="" id="dampingSlide" name="damping" min="0" max="5" step="0.05" value={params.damping} onChange={handleChange} />
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <PidSvgViz
          kp={params.kp}
          ki={params.ki}
          kd={params.kd}
          target={params.target}
          mass={params.mass}
          damping={params.damping}
          plant={activePlant}
          thermalTau={params.thermalTau}
          isRunning={isRunning}
          resetTrigger={resetTrigger}
          onMetricsUpdate={handleMetricsUpdate}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
          <ToolResultCard
            label="OVERSHOOT"
            value={metrics.overshoot.toFixed(1)}
            unit="%"
          >
            <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: "var(--muted)", lineHeight: 1.5 }}>
              {RESULT_GLOSSARY.overshoot}
            </p>
          </ToolResultCard>
          <ToolResultCard
            label="SETTLING TIME"
            value={metrics.settlingTime !== null ? metrics.settlingTime.toFixed(2) : "—"}
            unit={metrics.settlingTime !== null ? "s" : ""}
          >
            <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: "var(--muted)", lineHeight: 1.5 }}>
              {RESULT_GLOSSARY.settlingTime}
            </p>
          </ToolResultCard>
          <ToolResultCard
            label="STEADY-STATE ERR"
            value={metrics.steadyStateError.toFixed(2)}
            unit="%"
          >
            <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: "var(--muted)", lineHeight: 1.5 }}>
              {RESULT_GLOSSARY.steadyStateError}
            </p>
          </ToolResultCard>
        </div>
      </div>
    </ToolShell>
  );
}
