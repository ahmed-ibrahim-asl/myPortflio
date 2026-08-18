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
import { Timer555AstableDiagram } from "../diagrams/Timer555AstableDiagram";

function computeAstable(r1, r2, c) {
  if (![r1, r2, c].every(Number.isFinite) || r1 + 2 * r2 === 0) return null;
  const tHigh = 0.693 * (r1 + r2) * c;
  const tLow = 0.693 * r2 * c;
  const period = tHigh + tLow;
  const frequency = 1 / period;
  const duty = (tHigh / period) * 100;
  return { tHigh, tLow, period, frequency, duty };
}

export function Timer555AstableCalculator() {
  const [r1, setR1] = useState("1000");
  const [r2, setR2] = useState("10000");
  const [c, setC] = useState("100");
  const [cUnit, setCUnit] = useState(1e-9); // nF

  const result = useMemo(
    () => computeAstable(Number(r1), Number(r2), Number(c) * cUnit),
    [r1, r2, c, cUnit]
  );

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          In astable mode, a 555 timer never settles — it charges a capacitor up, discharges it back
          down, and repeats forever, producing a square wave with no input signal needed at all. Two
          resistors and a capacitor set the pace.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          The capacitor charges through both R1 and R2 together, which sets how long the output
          stays high. It then discharges through R2 alone, which sets how long the output stays low.
          Because charging always uses more resistance than discharging, the high time is always
          longer than the low time — a plain 555 astable can never produce a perfect 50/50 square
          wave.
        </p>
      </ToolSection>

      <Timer555AstableDiagram />

      <ToolSection title="The formula">
        <p className="mono">t_high = 0.693 × (R1 + R2) × C</p>
        <p className="mono">t_low = 0.693 × R2 × C</p>
        <p className="mono">f = 1 / (t_high + t_low)</p>
      </ToolSection>

      <Mnemonic tag="Charge high, discharge low" phrase="R1 helps you rise, only R2 lets you fall">
        <p>
          R1 only ever appears in the charging (high) time. If you remember that one fact, both
          formulas fall out of it — discharging just drops R1 from the same shape of equation.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">R1 = 1 kΩ, R2 = 10 kΩ, C = 100 nF</p>
          <p className="step">t_high = 0.693 × 11,000 × 1e-7 ≈ 0.76 ms</p>
          <p className="step">t_low = 0.693 × 10,000 × 1e-7 ≈ 0.69 ms</p>
          <p className="step">f = 1 / (0.76 ms + 0.69 ms) ≈ 690 Hz</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="R1"
          suffix="Ω"
          value={r1}
          onChange={(event) => setR1(event.target.value)}
        />
        <CalculatorField
          label="R2"
          suffix="Ω"
          value={r2}
          onChange={(event) => setR2(event.target.value)}
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
        {result ? (
          <CalculatorResults>
            <CalculatorResult label="Frequency" value={formatEngineering(result.frequency, "Hz")} />
            <CalculatorResult
              label="Duty cycle"
              value={Number(result.duty.toPrecision(3))}
              unit="%"
            />
            <CalculatorResult label="High time" value={formatEngineering(result.tHigh, "s")} />
            <CalculatorResult label="Low time" value={formatEngineering(result.tLow, "s")} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
