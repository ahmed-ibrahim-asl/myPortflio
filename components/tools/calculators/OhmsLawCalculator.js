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
  current: "Current",
  voltage: "Voltage",
  resistance: "Resistance"
};

const MODE_UNITS = {
  current: "A",
  voltage: "V",
  resistance: "Ω"
};

const INPUT_LABELS = {
  current: [
    { key: "a", label: "Voltage", suffix: "V" },
    { key: "b", label: "Resistance", suffix: "Ω" }
  ],
  voltage: [
    { key: "a", label: "Current", suffix: "A" },
    { key: "b", label: "Resistance", suffix: "Ω" }
  ],
  resistance: [
    { key: "a", label: "Voltage", suffix: "V" },
    { key: "b", label: "Current", suffix: "A" }
  ]
};

function computeOhmsLaw(mode, a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  if (mode === "current") {
    if (y === 0) return null;
    const current = x / y;
    return { value: current, power: x * current };
  }
  if (mode === "voltage") {
    const voltage = x * y;
    return { value: voltage, power: voltage * x };
  }
  if (mode === "resistance") {
    if (y === 0) return null;
    const resistance = x / y;
    return { value: resistance, power: x * y };
  }
  return null;
}

export function OhmsLawCalculator() {
  const [mode, setMode] = useState("current");
  const [a, setA] = useState("12");
  const [b, setB] = useState("4");

  const result = useMemo(() => computeOhmsLaw(mode, a, b), [mode, a, b]);
  const inputs = INPUT_LABELS[mode];

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Push electricity through a wire and three things share the room:
          how hard you&rsquo;re pushing (voltage), how much charge is
          actually moving (current), and how much the wire fights back
          against that flow (resistance). Squeeze one of them and the other
          two react. Ohm&rsquo;s Law is just the sentence that keeps them
          honest.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Start from something intuitive: the harder you push (more
          voltage), the more current flows — so current grows with voltage.
          Now add resistance: for the same push, a wire that resists more
          lets less current through — so current shrinks as resistance
          grows. Put those two observations together and current has to be
          voltage divided by resistance.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">V = I × R</p>
        <p>
          V is voltage in volts, I is current in amps, R is resistance in
          ohms. Rearrange it however the problem needs: I = V ÷ R, or
          R = V ÷ I.
        </p>
      </ToolSection>

      <Mnemonic tag="VIR" phrase="Very Important Rule">
        <p>
          Stack the letters in a triangle — V on top, I and R side by side
          underneath. Cover the quantity you&rsquo;re solving for; whatever
          is left tells you whether to multiply or divide. Cover V and
          you&rsquo;re left with I next to R — multiply. Cover I or R and
          you&rsquo;re left with V over the other — divide.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Known: V = 12 V, R = 4 Ω</p>
          <p className="step">I = V ÷ R = 12 ÷ 4</p>
          <p className="step">I = 3 A</p>
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
        {result ? (
          <CalculatorResults>
            <CalculatorResult
              label={MODE_LABELS[mode]}
              value={Number(result.value.toPrecision(4))}
              unit={MODE_UNITS[mode]}
            />
            <CalculatorResult
              label="Power"
              value={Number(result.power.toPrecision(4))}
              unit="W"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter two valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

