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

export function PercentageChangeCalculator() {
  const [oldValue, setOldValue] = useState("80");
  const [newValue, setNewValue] = useState("100");

  const change = useMemo(() => {
    const o = Number(oldValue);
    const n = Number(newValue);
    if (!Number.isFinite(o) || !Number.isFinite(n) || o === 0) return null;
    return ((n - o) / o) * 100;
  }, [oldValue, newValue]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Saying a value &ldquo;went up by 20&rdquo; means something different depending on where it
          started. Percentage change fixes that — it always measures the change relative to where
          you began, so a jump from 80 to 100 and a jump from 8,000 to 10,000 both read the same
          way: up 25%.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          First find the plain change — new value minus old value. That number alone doesn&rsquo;t
          mean much without context, so divide it by the old value to turn it into a fraction of
          where you started. Multiply by 100 to read that fraction as a percentage.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">% change = (new − old) / old × 100</p>
        <p>A negative result means the value decreased.</p>
      </ToolSection>

      <Mnemonic tag="New minus Old, over Old" phrase="Always divide by where you started">
        <p>
          The easiest mistake is dividing by the new value instead of the old one. Anchor it:
          percentage change always measures against the starting point, never the ending one.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Old = 80, New = 100</p>
          <p className="step">(100 − 80) / 80 × 100</p>
          <p className="step">= 25% increase</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Old value"
          value={oldValue}
          onChange={(event) => setOldValue(event.target.value)}
        />
        <CalculatorField
          label="New value"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
        />
        {change !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Change"
              value={`${change >= 0 ? "+" : ""}${Number(change.toPrecision(4))}`}
              unit="%"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers; the old value can&rsquo;t be zero.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
