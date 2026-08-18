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
import { formatOhms } from "@/lib/resistorColors";

function computeLedResistor(supply, forward, current) {
  if (![supply, forward, current].every(Number.isFinite) || current <= 0) {
    return null;
  }
  const drop = supply - forward;
  if (drop <= 0) return null;
  const resistance = drop / current;
  const power = drop * current;
  return { resistance, power };
}

export function LedSeriesResistorCalculator() {
  const [supply, setSupply] = useState("5");
  const [forward, setForward] = useState("2");
  const [current, setCurrent] = useState("20");

  const result = useMemo(
    () => computeLedResistor(Number(supply), Number(forward), Number(current) / 1000),
    [supply, forward, current]
  );

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          An LED has no built-in resistance to speak of — wire one straight to a battery and it
          draws as much current as the supply can give, which is usually enough to destroy it in
          about a second. The series resistor&rsquo;s only job is to eat the extra voltage the LED
          doesn&rsquo;t need, so the current stays at a safe level.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          An LED has a fixed forward voltage — the voltage it drops once it&rsquo;s lit, regardless
          of the supply. Whatever voltage is left over from the supply has to be absorbed by
          something else in the loop, or it forces too much current through the LED. That something
          else is the resistor: it drops the leftover voltage while limiting current to whatever the
          LED is rated for.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">R = (Vsupply − Vforward) / Iforward</p>
      </ToolSection>

      <Mnemonic phrase="Source minus Forward, over Flow">
        <p>
          Subtract what the LED keeps (its forward voltage) from what the supply gives (source
          voltage), then divide by how much current you want flowing. Leftover voltage, over desired
          flow.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Vsupply = 5 V, Vforward = 2 V, I = 20 mA</p>
          <p className="step">R = (5 − 2) / 0.02</p>
          <p className="step">R = 150 Ω</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Supply voltage"
          suffix="V"
          value={supply}
          onChange={(event) => setSupply(event.target.value)}
        />
        <CalculatorField
          label="LED forward voltage"
          suffix="V"
          value={forward}
          onChange={(event) => setForward(event.target.value)}
        />
        <CalculatorField
          label="Target current"
          suffix="mA"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
        {result ? (
          <CalculatorResults>
            <CalculatorResult label="Series resistor" value={formatOhms(result.resistance)} />
            <CalculatorResult
              label="Resistor power"
              value={Number(result.power.toPrecision(3))}
              unit="W"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Supply voltage must be higher than the LED&rsquo;s forward voltage.
          </p>
        )}
      </CalculatorPanel>
    </div>
  );
}
