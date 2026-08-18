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

const OPERATIONS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => (b === 0 ? null : Math.trunc(a / b))
};

export function HexCalculator() {
  const [a, setA] = useState("2A");
  const [b, setB] = useState("F");
  const [op, setOp] = useState("+");

  const result = useMemo(() => {
    const x = parseInBase(a, 16);
    const y = parseInBase(b, 16);
    if (x === null || y === null) return null;
    return OPERATIONS[op](x, y);
  }, [a, b, op]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Memory addresses, color codes, register values — a lot of the numbers engineers work with
          day to day show up in hex, not decimal. Being able to do quick arithmetic directly in hex
          saves a constant back-and-forth conversion.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Hex has sixteen digits — 0 through 9, then A through F standing in for 10 through 15. Add
          or subtract column by column exactly like decimal, except a column only carries once it
          passes 15, not 9. Everything else about long addition, subtraction, multiplication, and
          division carries straight over.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">decimal(a) [op] decimal(b), converted back to hex</p>
      </ToolSection>

      <Mnemonic tag="A–F = 10–15" phrase="Six extra digits, six extra letters">
        <p>
          The whole system hinges on remembering that A is 10 and F is 15 — everything in between
          follows the alphabet in order. Once that maps in your head, hex arithmetic is just decimal
          arithmetic that carries later.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">2A (42) + F (15)</p>
          <p className="step">42 + 15 = 57</p>
          <p className="step">57 in hex = 39</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Hex A"
          inputMode="text"
          value={a}
          onChange={(event) => setA(event.target.value)}
        />
        <CalculatorSelect
          label="Operation"
          value={op}
          onChange={(event) => setOp(event.target.value)}
        >
          {Object.keys(OPERATIONS).map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </CalculatorSelect>
        <CalculatorField
          label="Hex B"
          inputMode="text"
          value={b}
          onChange={(event) => setB(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Result (hex)"
              value={
                result < 0
                  ? `-${Math.abs(result).toString(16).toUpperCase()}`
                  : result.toString(16).toUpperCase()
              }
            />
            <CalculatorResult label="Result (decimal)" value={result} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid hex digits (0–9, A–F). Division by zero is undefined.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
