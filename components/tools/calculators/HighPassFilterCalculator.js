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

export function HighPassFilterCalculator() {
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
          A high pass filter is a gatekeeper for frequency: signals above a certain pitch sail
          through mostly untouched, while anything below that pitch gets weaker the lower it goes.
          It&rsquo;s the circuit behind stripping DC offset or hum out of an audio signal.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Build it from a capacitor and a resistor in series, and take the output across the
          resistor. A capacitor&rsquo;s resistance to AC (its reactance) drops as frequency rises —
          so at high frequency the capacitor barely blocks anything, and most of the signal reaches
          the resistor&rsquo;s output. At low frequency the capacitor&rsquo;s reactance climbs and
          starts eating the signal before it gets there. The cutoff frequency is the point where the
          resistor and the capacitor are fighting the signal equally.
        </p>
      </ToolSection>

      <SeriesRCDiagram
        first="capacitor"
        firstLabel="C"
        second="resistor"
        secondLabel="R"
        caption="C blocks the lows, R defines Vout — highs pass through relatively unblocked"
      />

      <ToolSection title="The formula">
        <p className="mono">fc = 1 / (2π × R × C)</p>
        <p>fc is the cutoff frequency in Hz, R in ohms, C in farads.</p>
      </ToolSection>

      <Mnemonic
        tag="fc = 1/2πRC"
        phrase="Same formula as RC time constant, flipped and framed as frequency"
      >
        <p>
          If you already know τ = RC, you already know this — the cutoff frequency is just 1 divided
          by (2π × τ). One formula, two ways to think about the same RC pair.
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
