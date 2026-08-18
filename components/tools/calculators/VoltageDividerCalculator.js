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
import { VoltageDividerDiagram } from "../diagrams/VoltageDividerDiagram";

function computeDivider(vin, r1, r2) {
  const v = Number(vin);
  const a = Number(r1);
  const b = Number(r2);
  if (![v, a, b].every(Number.isFinite) || a + b === 0) return null;
  const vout = v * (b / (a + b));
  const current = v / (a + b);
  return { vout, current };
}

export function VoltageDividerCalculator() {
  const [vin, setVin] = useState("9");
  const [r1, setR1] = useState("1000");
  const [r2, setR2] = useState("2000");

  const result = useMemo(() => computeDivider(vin, r1, r2), [vin, r1, r2]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Two resistors in series don&rsquo;t just add their resistance — they also split whatever
          voltage is pushed across them, in proportion to their size. Tap the point between them and
          you get a smaller, predictable voltage. It&rsquo;s how a 5 V sensor talks to a 3.3 V
          microcontroller pin without a special chip.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          The same current flows through both resistors — it&rsquo;s one series path. Each
          resistor&rsquo;s share of the total voltage matches its share of the total resistance: a
          resistor that&rsquo;s half the total resistance carries half the total voltage. Tap the
          midpoint between R1 and R2 and you read out whatever share R2 holds.
        </p>
      </ToolSection>

      <VoltageDividerDiagram />

      <ToolSection title="The formula">
        <p className="mono">Vout = Vin × R2 / (R1 + R2)</p>
        <p>Vout is measured across R2 — the resistor between the tap point and ground.</p>
      </ToolSection>

      <Mnemonic tag="TOT" phrase="Top Over Total">
        <p>
          Whichever resistor you&rsquo;re measuring across goes on top, the sum of both resistors
          goes on the bottom, then multiply by Vin. Measuring across R2? R2 over (R1 + R2).
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Vin = 9 V, R1 = 1,000 Ω, R2 = 2,000 Ω</p>
          <p className="step">Vout = 9 × 2000 / (1000 + 2000)</p>
          <p className="step">Vout = 9 × 0.667 = 6 V</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Input voltage"
          suffix="V"
          value={vin}
          onChange={(event) => setVin(event.target.value)}
        />
        <CalculatorField
          label="R1 (top resistor)"
          suffix="Ω"
          value={r1}
          onChange={(event) => setR1(event.target.value)}
        />
        <CalculatorField
          label="R2 (bottom resistor)"
          suffix="Ω"
          value={r2}
          onChange={(event) => setR2(event.target.value)}
        />
        {result ? (
          <CalculatorResults>
            <CalculatorResult
              label="Output voltage"
              value={Number(result.vout.toPrecision(4))}
              unit="V"
            />
            <CalculatorResult
              label="Current"
              value={Number((result.current * 1000).toPrecision(4))}
              unit="mA"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
