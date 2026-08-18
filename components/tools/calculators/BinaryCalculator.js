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

export function BinaryCalculator() {
  const [a, setA] = useState("1010");
  const [b, setB] = useState("11");
  const [op, setOp] = useState("+");

  const result = useMemo(() => {
    const x = parseInBase(a, 2);
    const y = parseInBase(b, 2);
    if (x === null || y === null) return null;
    return OPERATIONS[op](x, y);
  }, [a, b, op]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Binary arithmetic works exactly like decimal arithmetic — you
          just run out of digits sooner. Where decimal carries after 9,
          binary carries after 1. Same rules, smaller alphabet.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Line the two binary numbers up by place value, just like long
          addition in decimal. Add column by column from the right; any
          time a column sums to 2 or more, write down the remainder and
          carry a 1 into the next column. Subtraction, multiplication, and
          division follow their decimal-arithmetic counterparts the same
          way, just base 2 instead of base 10.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">decimal(a) [op] decimal(b), converted back to binary</p>
        <p>
          The easiest way to do it by hand is exactly that: convert each
          binary number to decimal, do the arithmetic you already know,
          then convert the answer back.
        </p>
      </ToolSection>

      <Mnemonic tag="Carry at 2, not 10" phrase="Same arithmetic, earlier carries">
        <p>
          If you can add decimal numbers, you can add binary ones — the
          only rule that changes is when you carry. In binary, 1 + 1 = 10,
          not 2.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">1010 (10) + 11 (3)</p>
          <p className="step">10 + 3 = 13</p>
          <p className="step">13 in binary = 1101</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Binary A"
          inputMode="numeric"
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
          label="Binary B"
          inputMode="numeric"
          value={b}
          onChange={(event) => setB(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Result (binary)"
              value={result < 0 ? `-${Math.abs(result).toString(2)}` : result.toString(2)}
            />
            <CalculatorResult label="Result (decimal)" value={result} />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Enter valid binary digits (0s and 1s). Division by zero is
            undefined.
          </p>
        )}
      </CalculatorPanel>
    </div>
  );
}

