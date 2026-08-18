"use client";

import { useMemo, useState } from "react";
import {
  CalculatorField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";
import { formatEngineering } from "@/lib/units";

export function WavelengthCalculator() {
  const [speed, setSpeed] = useState("299792458");
  const [frequency, setFrequency] = useState("100000000");

  const wavelength = useMemo(() => {
    const v = Number(speed);
    const f = Number(frequency);
    if (!Number.isFinite(v) || !Number.isFinite(f) || f === 0) return null;
    return v / f;
  }, [speed, frequency]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A wave is a pattern that repeats as it travels — a radio signal,
          a sound, a ripple in water. Wavelength is simply the physical
          length of one full repeat, measured in meters, and it depends on
          how fast the wave travels and how often it repeats.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          If a wave repeats faster (higher frequency) but travels at the
          same speed, each repeat has to be squeezed into a shorter
          stretch of space — the wavelength shrinks. If it travels faster
          without repeating any more often, each repeat gets to stretch
          out further before the next one starts — the wavelength grows.
          Wavelength is speed shared out among however many repeats
          happen per second.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">λ = v / f</p>
        <p>
          λ is wavelength in meters, v is wave speed in m/s, f is
          frequency in Hz.
        </p>
      </ToolSection>

      <Mnemonic tag="λ = v/f" phrase="Faster repeats, shorter waves">
        <p>
          Frequency is on the bottom, so it works against wavelength: crank
          frequency up and wavelength has to come down, for the same wave
          speed.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">v = speed of light = 3 × 10⁸ m/s</p>
          <p className="step">f = 100 MHz (FM radio) = 1 × 10⁸ Hz</p>
          <p className="step">λ = 3×10⁸ ÷ 1×10⁸ = 3 m</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Wave speed"
          suffix="m/s"
          value={speed}
          onChange={(event) => setSpeed(event.target.value)}
        />
        <CalculatorField
          label="Frequency"
          suffix="Hz"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value)}
        />
        {wavelength !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Wavelength"
              value={formatEngineering(wavelength, "m")}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Enter valid numbers; frequency can&rsquo;t be zero.
          </p>
        )}
      </CalculatorPanel>
    </div>
  );
}

