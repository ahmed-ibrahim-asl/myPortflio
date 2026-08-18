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

export function LogBase2Calculator() {
  const [value, setValue] = useState("1024");

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.log2(n);
  }, [value]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Log base 2 answers one question: how many times do you have to double 1 to reach this
          number? It shows up constantly in computing because doubling is exactly what an extra bit
          does — one more bit doubles how many values you can represent.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          1 doubled once is 2. Doubled again is 4. Again is 8. Three doublings got you from 1 to 8,
          so log₂(8) = 3. That&rsquo;s also exactly how many bits it takes to count from 0 up to 7 —
          eight distinct values, three bits. Log base 2 and bit counts are the same question asked
          two different ways.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">log₂(x) = y, where 2^y = x</p>
      </ToolSection>

      <Mnemonic tag="log₂" phrase="How many doublings get you there">
        <p>
          Don&rsquo;t think &ldquo;logarithm,&rdquo; think &ldquo;doublings.&rdquo; Count how many
          times you&rsquo;d have to double 1 to land on your number — that count is the answer.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">x = 1024</p>
          <p className="step">1 → 2 → 4 → 8 → … → 1024 (10 doublings)</p>
          <p className="step">log₂(1024) = 10</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult label="log₂(x)" value={Number(result.toPrecision(6))} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a positive number.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
