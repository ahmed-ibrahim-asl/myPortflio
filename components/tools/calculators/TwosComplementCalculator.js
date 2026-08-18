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
import { onesComplement, signedValue, toBinaryString, twosComplement } from "@/lib/numberSystems";

const WIDTHS = [4, 8, 16];

export function TwosComplementCalculator() {
  const [value, setValue] = useState("18");
  const [bits, setBits] = useState(8);

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n >= 2 ** (bits - 1)) return null;
    const ones = onesComplement(n, bits);
    const twos = twosComplement(n, bits);
    return { ones, twos, check: signedValue(twos, bits) };
  }, [value, bits]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Computers don&rsquo;t have a minus sign — everything is bits. Two&rsquo;s complement is
          the trick that lets a fixed set of bits represent negative numbers too, using ordinary
          addition hardware with no special subtraction circuit needed.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Start from one&rsquo;s complement — flip every bit — then add 1. That single extra step is
          what makes the arithmetic work out: adding a number to its two&rsquo;s complement always
          produces all zeros (ignoring the overflow bit), which is exactly what you&rsquo;d want
          from &ldquo;a number plus its negative.&rdquo; The top bit ends up doubling as a sign flag
          — 0 for positive, 1 for negative.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">two's complement = NOT(value) + 1</p>
      </ToolSection>

      <Mnemonic tag="Flip, then +1" phrase="One's complement with one extra step">
        <p>
          If you already know one&rsquo;s complement, you know two&rsquo;s complement — just add 1
          to the result. That&rsquo;s the entire difference between the two.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">18 in 8-bit binary: 00010010</p>
          <p className="step">One's complement: 11101101</p>
          <p className="step">Two's complement: 11101110 (+1)</p>
          <p className="step">Read as signed 8-bit: −18 ✓</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Value (decimal, positive)"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
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
        {result ? (
          <CalculatorResults>
            <CalculatorResult
              label="Original (binary)"
              value={toBinaryString(Number(value), bits)}
            />
            <CalculatorResult label="One's complement" value={toBinaryString(result.ones, bits)} />
            <CalculatorResult label="Two's complement" value={toBinaryString(result.twos, bits)} />
            <CalculatorResult label="Signed check" value={result.check} />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Enter a positive whole number that fits in the chosen signed bit width.
          </p>
        )}
      </CalculatorPanel>
    </div>
  );
}
