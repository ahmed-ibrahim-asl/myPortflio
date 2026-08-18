"use client";

import { useMemo, useState } from "react";
import {
  CalculatorField,
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  CalculatorSelect,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";
import { CAPACITANCE_UNITS, formatEngineering } from "@/lib/units";
import { SeriesRCDiagram } from "../diagrams/SeriesRCDiagram";

export function LowPassFilterCalculator() {
  const [r, setR] = useState("1600");
  const [c, setC] = useState("100");
  const [cUnit, setCUnit] = useState(1e-9); // nF

  const cutoff = useMemo(() => {
    const resistance = Number(r);
    const capacitance = Number(c) * cUnit;
    if (
      !Number.isFinite(resistance) ||
      !Number.isFinite(capacitance) ||
      resistance <= 0 ||
      capacitance <= 0
    ) {
      return null;
    }
    return 1 / (2 * Math.PI * resistance * capacitance);
  }, [r, c, cUnit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A low pass filter is a high pass filter&rsquo;s mirror image: low frequencies pass through
          mostly untouched, and anything above the cutoff gets progressively weaker. It&rsquo;s the
          circuit behind smoothing out a jittery sensor reading or knocking the buzz out of a PWM
          signal before it reaches an amplifier.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Same resistor and capacitor in series as a high pass filter — the only change is which
          component you read the output across. Take it across the capacitor instead of the
          resistor, and the behavior flips: at low frequency the capacitor&rsquo;s reactance is
          high, so it happily passes the voltage through to the output; at high frequency its
          reactance drops, and it starts shorting the signal to ground instead of letting it reach
          the output.
        </p>
      </ToolSection>

      <SeriesRCDiagram
        first="resistor"
        firstLabel="R"
        second="capacitor"
        secondLabel="C"
        caption="R and C in series — Vout is read across C, so lows pass and highs get shorted to ground"
      />

      <ToolSection title="The formula">
        <p className="mono">fc = 1 / (2π × R × C)</p>
        <p>Identical formula to the high pass filter — only the output tap point differs.</p>
      </ToolSection>

      <Mnemonic tag="Same fc, different tap" phrase="Read across the capacitor, not the resistor">
        <p>
          The math is exactly the same as a high pass filter. The only thing to remember is which
          leg of the RC pair you&rsquo;re measuring: capacitor for low pass, resistor for high pass.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">R = 1.6 kΩ, C = 100 nF</p>
          <p className="step">fc = 1 / (2π × 1,600 × 1e-7)</p>
          <p className="step">fc ≈ 995 Hz</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Resistance"
          suffix="Ω"
          value={r}
          onChange={(event) => setR(event.target.value)}
        />
        <CalculatorField
          label="Capacitance"
          value={c}
          onChange={(event) => setC(event.target.value)}
        />
        <CalculatorSelect
          label="Capacitance unit"
          value={cUnit}
          onChange={(event) => setCUnit(Number(event.target.value))}
        >
          {CAPACITANCE_UNITS.map((unit) => (
            <option key={unit.label} value={unit.factor}>
              {unit.label}
            </option>
          ))}
        </CalculatorSelect>
        {cutoff !== null ? (
          <CalculatorResults>
            <CalculatorResult label="Cutoff frequency" value={formatEngineering(cutoff, "Hz")} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid, positive numbers.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
