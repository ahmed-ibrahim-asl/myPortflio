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

const MODE_LABELS = { speed: "Speed", distance: "Distance", time: "Time" };
const MODE_UNITS = { speed: "m/s", distance: "m", time: "s" };
const INPUT_LABELS = {
  speed: [
    { key: "a", label: "Distance", suffix: "m" },
    { key: "b", label: "Time", suffix: "s" }
  ],
  distance: [
    { key: "a", label: "Speed", suffix: "m/s" },
    { key: "b", label: "Time", suffix: "s" }
  ],
  time: [
    { key: "a", label: "Distance", suffix: "m" },
    { key: "b", label: "Speed", suffix: "m/s" }
  ]
};

function compute(mode, a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (mode === "speed") return y === 0 ? null : x / y;
  if (mode === "distance") return x * y;
  if (mode === "time") return y === 0 ? null : x / y;
  return null;
}

export function SpeedDistanceTimeCalculator() {
  const [mode, setMode] = useState("speed");
  const [a, setA] = useState("100");
  const [b, setB] = useState("10");

  const result = useMemo(() => compute(mode, a, b), [mode, a, b]);
  const inputs = INPUT_LABELS[mode];

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Speed is just a way of answering &ldquo;how far, in how
          long?&rdquo; in a single number. Cover more ground in the same
          time, or the same ground in less time, and speed goes up either
          way.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          If something covers 100 meters in 10 seconds, it&rsquo;s covering
          10 meters every second — divide the distance by the time and
          you get the rate. Run that backward and distance is just speed
          multiplied by however long you kept it up; time is distance
          split into speed-sized chunks.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">speed = distance / time</p>
      </ToolSection>

      <Mnemonic tag="DST triangle" phrase="Distance on top, Speed and Time below">
        <p>
          Same triangle trick as Ohm&rsquo;s Law: D over S×T. Cover the one
          you want — D alone means divide, S or T alone means D over the
          other one.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Distance = 100 m, Time = 10 s</p>
          <p className="step">Speed = 100 ÷ 10</p>
          <p className="step">Speed = 10 m/s</p>
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

