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

const MODE_LABELS = {
  force: "Force",
  mass: "Mass",
  acceleration: "Acceleration"
};

const MODE_UNITS = {
  force: "N",
  mass: "kg",
  acceleration: "m/s²"
};

const INPUT_LABELS = {
  force: [
    { key: "a", label: "Mass", suffix: "kg" },
    { key: "b", label: "Acceleration", suffix: "m/s²" }
  ],
  mass: [
    { key: "a", label: "Force", suffix: "N" },
    { key: "b", label: "Acceleration", suffix: "m/s²" }
  ],
  acceleration: [
    { key: "a", label: "Force", suffix: "N" },
    { key: "b", label: "Mass", suffix: "kg" }
  ]
};

function compute(mode, a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (mode === "force") return x * y;
  if (mode === "mass") return y === 0 ? null : x / y;
  if (mode === "acceleration") return y === 0 ? null : x / y;
  return null;
}

export function ForceMassAccelerationCalculator() {
  const [mode, setMode] = useState("force");
  const [a, setA] = useState("10");
  const [b, setB] = useState("5");

  const result = useMemo(() => compute(mode, a, b), [mode, a, b]);
  const inputs = INPUT_LABELS[mode];

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Push on something and it accelerates — how much it accelerates
          depends on how hard you push and how much there is to move.
          Newton&rsquo;s second law is the sentence that pins that
          relationship down exactly.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Push twice as hard on the same object and it accelerates twice
          as fast — force and acceleration scale together directly. But
          push the same amount on something twice as heavy and it only
          accelerates half as fast — mass resists acceleration. Combine
          both observations and force has to equal mass times
          acceleration.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">F = m × a</p>
        <p>F is force in newtons, m is mass in kilograms, a in m/s².</p>
      </ToolSection>

      <Mnemonic tag="F = ma" phrase="Heavier needs harder">
        <p>
          Same shape as Ohm&rsquo;s Law&rsquo;s triangle: F on top, m and a
          on the bottom. Cover what you want, multiply or divide whatever
          is left.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">m = 10 kg, a = 5 m/s²</p>
          <p className="step">F = 10 × 5</p>
          <p className="step">F = 50 N</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorSelect
          label="Solve for"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          {Object.entries(MODE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </CalculatorSelect>
        <CalculatorField
          label={inputs[0].label}
          suffix={inputs[0].suffix}
          value={a}
          onChange={(event) => setA(event.target.value)}
        />
        <CalculatorField
          label={inputs[1].label}
          suffix={inputs[1].suffix}
          value={b}
          onChange={(event) => setB(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label={MODE_LABELS[mode]}
              value={Number(result.toPrecision(4))}
              unit={MODE_UNITS[mode]}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter two valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

