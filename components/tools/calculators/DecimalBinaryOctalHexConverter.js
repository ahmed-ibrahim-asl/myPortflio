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
import { parseInBase } from "@/lib/numberSystems";

const BASES = [
  { label: "Decimal", value: 10 },
  { label: "Binary", value: 2 },
  { label: "Octal", value: 8 },
  { label: "Hexadecimal", value: 16 }
];

export function DecimalBinaryOctalHexConverter() {
  const [value, setValue] = useState("42");
  const [base, setBase] = useState(10);

  const decimal = useMemo(() => parseInBase(value, base), [value, base]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A number doesn&rsquo;t change just because you write it differently — 42, 101010, 52, and
          2A are all the exact same quantity, just counted in groups of ten, two, eight, and
          sixteen. Base just decides how many symbols you get before you have to carry into the next
          column.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Decimal carries every 10 because it has ten digits (0–9). Binary carries every 2 because
          it only has two (0–1) — which happens to match a transistor being on or off, so computers
          think natively in it. Octal groups binary three bits at a time (2³ = 8), and hex groups it
          four bits at a time (2⁴ = 16), which is why hex shows up constantly in memory addresses:
          one hex digit is exactly one nibble.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">value = Σ (digit × base^position)</p>
        <p>
          Read right to left, each digit is worth the digit times the base raised to how many places
          it sits from the end.
        </p>
      </ToolSection>

      <Mnemonic tag="4 bits = 1 hex digit" phrase="Group binary in fours to read hex instantly">
        <p>
          Split any binary string into groups of four from the right — 0000 through 1111 — and each
          group is a single hex digit, 0 through F. It&rsquo;s the fastest way to convert binary to
          hex by eye, no arithmetic required.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Decimal 42</p>
          <p className="step">42 ÷ 2 repeatedly → binary 101010</p>
          <p className="step">Group in fours: 0010 1010 → hex 2A</p>
          <p className="step">Group in threes: 101 010 → octal 52</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorSelect
          label="Input is in"
          value={base}
          onChange={(event) => setBase(Number(event.target.value))}
        >
          {BASES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </CalculatorSelect>
        <CalculatorField
          label="Value"
          inputMode="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {decimal !== null ? (
          <CalculatorResults>
            <CalculatorResult label="Decimal" value={decimal.toString(10)} />
            <CalculatorResult label="Binary" value={decimal.toString(2)} />
            <CalculatorResult label="Octal" value={decimal.toString(8)} />
            <CalculatorResult label="Hex" value={decimal.toString(16).toUpperCase()} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a value valid for the selected base.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
