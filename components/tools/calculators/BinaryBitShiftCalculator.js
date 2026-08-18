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
import { shiftValue, toBinaryString } from "@/lib/numberSystems";

const WIDTHS = [4, 8, 16];

export function BinaryBitShiftCalculator() {
  const [value, setValue] = useState("5");
  const [amount, setAmount] = useState("2");
  const [direction, setDirection] = useState("left");
  const [bits, setBits] = useState(8);

  const result = useMemo(() => {
    const n = Number(value);
    const shift = Number(amount);
    if (!Number.isInteger(n) || !Number.isInteger(shift) || shift < 0) {
      return null;
    }
    return shiftValue(n, bits, shift, direction);
  }, [value, amount, direction, bits]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Every binary digit is worth twice the one to its right. Slide the
          whole pattern one place left and every bit is suddenly worth
          double what it was — the value doubles. Slide it right and every
          bit is worth half — the value halves. A bit shift is
          multiplication or division by two, done by moving digits instead
          of doing arithmetic.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Shifting left by one is the same move as writing a decimal number
          and adding a zero on the end — ×10 in decimal becomes ×2 in
          binary. Shifting right drops the last digit, which is the binary
          equivalent of integer-dividing by 10 in decimal. Shift by more
          than one place and you&rsquo;re just repeating the move — shift
          left by 3 is ×2×2×2, or ×8.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">value ≪ n  =  value × 2ⁿ</p>
        <p className="mono">value ≫ n  =  value ÷ 2ⁿ (rounded down)</p>
      </ToolSection>

      <Mnemonic tag="Left grows, right shrinks" phrase="The arrow points at what happens to the value">
        <p>
          The shift arrow doesn&rsquo;t describe the bits, it describes the
          result: ≪ points away from zero (the value grows), ≫ points
          toward zero (the value shrinks).
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">5 in 8-bit binary: 00000101</p>
          <p className="step">Shift left by 2: 00010100</p>
          <p className="step">= 20 (5 × 2² = 5 × 4)</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Value (decimal)"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <CalculatorField
          label="Shift amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <CalculatorSelect
          label="Direction"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="left">Left (≪)</option>
          <option value="right">Right (≫)</option>
        </CalculatorSelect>
        <CalculatorSelect
          label="Bit width"
          value={bits}
          onChange={(event) => setBits(Number(event.target.value))}
        >
          {WIDTHS.map((w) => (
            <option key={w} value={w}>
              {w}-bit
            </option>
          ))}
        </CalculatorSelect>
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Result (binary)"
              value={toBinaryString(result, bits)}
            />
            <CalculatorResult label="Result (decimal)" value={result} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a whole number value and shift amount.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

