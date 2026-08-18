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

export function AccelerationCalculator() {
  const [vi, setVi] = useState("0");
  const [vf, setVf] = useState("20");
  const [t, setT] = useState("4");

  const acceleration = useMemo(() => {
    const initial = Number(vi);
    const final = Number(vf);
    const time = Number(t);
    if (![initial, final, time].every(Number.isFinite) || time === 0) {
      return null;
    }
    return (final - initial) / time;
  }, [vi, vf, t]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Acceleration isn&rsquo;t speed — it&rsquo;s how fast speed itself is changing. A car
          holding a steady 60 km/h has zero acceleration no matter how fast it&rsquo;s going; a car
          going from 0 to 60 in five seconds has a lot.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Take the velocity you ended with, subtract the velocity you started with, and that
          difference is how much speed you gained (or lost). Spread that gain over however long it
          took to happen, and you get a rate — the gain per second, which is exactly what
          acceleration means.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">a = (v_f − v_i) / t</p>
        <p>
          a is acceleration in m/s², v_f and v_i are final and initial velocity in m/s, t is time in
          seconds.
        </p>
      </ToolSection>

      <Mnemonic tag="Δv / t" phrase="Change in speed, spread over time">
        <p>
          Acceleration is just a rate, like speed itself is a rate. Speed is distance change over
          time; acceleration is speed change over time — one level up.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">v_i = 0 m/s, v_f = 20 m/s, t = 4 s</p>
          <p className="step">a = (20 − 0) / 4</p>
          <p className="step">a = 5 m/s²</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Initial velocity"
          suffix="m/s"
          value={vi}
          onChange={(event) => setVi(event.target.value)}
        />
        <CalculatorField
          label="Final velocity"
          suffix="m/s"
          value={vf}
          onChange={(event) => setVf(event.target.value)}
        />
        <CalculatorField
          label="Time"
          suffix="s"
          value={t}
          onChange={(event) => setT(event.target.value)}
        />
        {acceleration !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Acceleration"
              value={Number(acceleration.toPrecision(4))}
              unit="m/s²"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers; time can't be zero.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
