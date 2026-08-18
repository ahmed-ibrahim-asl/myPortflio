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

export function RcTimeConstantCalculator() {
  const [r, setR] = useState("10000");
  const [c, setC] = useState("100");
  const [cUnit, setCUnit] = useState(1e-6); // µF

  const tau = useMemo(() => {
    const resistance = Number(r);
    const capacitance = Number(c) * cUnit;
    if (!Number.isFinite(resistance) || !Number.isFinite(capacitance)) {
      return null;
    }
    return resistance * capacitance;
  }, [r, c, cUnit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A capacitor doesn&rsquo;t charge instantly — it fills up like a
          bucket under a tap. A resistor in the circuit controls how fast
          that bucket fills. Put the two together and there&rsquo;s a
          single number that describes the pace: the RC time constant,
          tau (τ).
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          A bigger resistor is a narrower tap — it slows the flow of
          charge into the capacitor. A bigger capacitor is a bigger bucket
          — it takes more charge to fill to the same level. Slow the flow
          or grow the bucket and either way, filling takes longer. So the
          time constant just grows with both.
        </p>
        <p>
          In one time constant, a charging capacitor reaches about 63% of
          its final voltage. After roughly five time constants (5τ),
          it&rsquo;s considered fully charged for practical purposes.
        </p>
      </ToolSection>

      <SeriesRCDiagram
        first="resistor"
        firstLabel="R"
        second="capacitor"
        secondLabel="C"
        caption="R charges C — Vout is the voltage building up across the capacitor"
      />

      <ToolSection title="The formula">
        <p className="mono">τ = R × C</p>
        <p>τ is in seconds when R is in ohms and C is in farads.</p>
      </ToolSection>

      <Mnemonic tag="τ = RC" phrase="Resistance times Capacitance, that's it">
        <p>
          No division, no square roots — the two letters you fed in are the
          two letters you multiply. If you can remember there&rsquo;s
          nothing else to the formula, you&rsquo;ve remembered the formula.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">R = 10 kΩ, C = 100 µF</p>
          <p className="step">τ = 10,000 × 0.0001</p>
          <p className="step">τ = 1 second</p>
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
        {tau !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Time constant (τ)"
              value={formatEngineering(tau, "s")}
            />
            <CalculatorResult
              label="Fully charged (5τ)"
              value={formatEngineering(tau * 5, "s")}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

