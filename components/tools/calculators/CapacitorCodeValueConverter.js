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
import { formatEngineering } from "@/lib/units";

function decodeCapacitor(code) {
  const digits = code.trim();
  if (!/^\d{3}$/.test(digits)) return null;
  const significant = Number(digits.slice(0, 2));
  const multiplierDigit = Number(digits[2]);
  const multiplier =
    multiplierDigit === 8
      ? 0.01
      : multiplierDigit === 9
      ? 0.1
      : 10 ** multiplierDigit;
  const picofarads = significant * multiplier;
  return picofarads * 1e-12; // farads
}

export function CapacitorCodeValueConverter() {
  const [code, setCode] = useState("104");

  const farads = useMemo(() => decodeCapacitor(code), [code]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Small ceramic capacitors are too tiny to print a full value on,
          so manufacturers stamp a three-digit shorthand instead — the
          same space-saving trick resistors solve with color bands,
          capacitors solve with a compact numeric code.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          The first two digits are significant figures, spelling out a
          two-digit number. The third digit is a multiplier — how many
          zeros to add — and the result is always in picofarads, the
          smallest practical capacitance unit, which is why even a
          &ldquo;small&rdquo;-looking code can decode to a surprisingly
          large value once converted to nanofarads or microfarads.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">C (pF) = (D1D2) × 10^D3</p>
        <p>
          Where D1D2 is the two-digit significant number and D3 is the
          multiplier digit.
        </p>
      </ToolSection>

      <Mnemonic tag="Two digits, one multiplier" phrase="Same shape as a resistor's first three bands">
        <p>
          If you already read resistor color codes, you already know this
          pattern — two significant digits, then a power-of-ten
          multiplier. Capacitors just print it as numbers instead of
          colors.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Code: 104</p>
          <p className="step">Significant digits: 10</p>
          <p className="step">Multiplier: 10⁴</p>
          <p className="step">10 × 10,000 = 100,000 pF = 100 nF = 0.1 µF</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Capacitor code"
          inputMode="numeric"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        {farads !== null ? (
          <CalculatorResults>
            <CalculatorResult label="Value" value={formatEngineering(farads, "F")} />
            <CalculatorResult
              label="In picofarads"
              value={Number((farads * 1e12).toPrecision(6))}
              unit="pF"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a 3-digit capacitor code, like 104.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

