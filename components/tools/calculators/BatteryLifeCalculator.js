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

export function BatteryLifeCalculator() {
  const [capacity, setCapacity] = useState("2000");
  const [load, setLoad] = useState("120");
  const [efficiency, setEfficiency] = useState("85");

  const hours = useMemo(() => {
    const cap = Number(capacity);
    const current = Number(load);
    const eff = Number(efficiency);
    if (
      !Number.isFinite(cap) ||
      !Number.isFinite(current) ||
      !Number.isFinite(eff) ||
      current <= 0
    ) {
      return null;
    }
    return (cap * (eff / 100)) / current;
  }, [capacity, load, efficiency]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A battery&rsquo;s printed capacity is a promise made under ideal lab conditions. Real
          circuits draw current unevenly, waste some of it as heat, and rarely get to fully drain a
          cell — so a quick estimate needs to knock a chunk off the label number to be realistic.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Capacity in milliamp-hours literally means &ldquo;this many milliamps, for this many
          hours, before it&rsquo;s empty.&rdquo; Divide that capacity by how many milliamps your
          circuit actually draws and you get the raw number of hours it could theoretically run.
          Then discount that by an efficiency factor — regulators, self-discharge, and non-ideal
          discharge curves usually eat 10–20% of the rated capacity in practice.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">Life (h) = Capacity (mAh) × Efficiency / Load (mA)</p>
      </ToolSection>

      <Mnemonic tag="Capacity ÷ Draw" phrase="Then knock a fifth off for reality">
        <p>
          The raw division gets you the optimistic number. Multiplying by an efficiency around
          80–85% is what turns it into a number you can actually plan around.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Capacity = 2,000 mAh, Load = 120 mA, Efficiency = 85%</p>
          <p className="step">Life = 2,000 × 0.85 / 120</p>
          <p className="step">Life ≈ 14.2 hours</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Battery capacity"
          suffix="mAh"
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
        />
        <CalculatorField
          label="Average load current"
          suffix="mA"
          value={load}
          onChange={(event) => setLoad(event.target.value)}
        />
        <CalculatorField
          label="Efficiency"
          suffix="%"
          value={efficiency}
          onChange={(event) => setEfficiency(event.target.value)}
        />
        {hours !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Estimated life"
              value={Number(hours.toPrecision(4))}
              unit="hours"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers; load current must be greater than zero.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
