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
import { CAPACITANCE_UNITS, formatEngineering } from "@/lib/units";

export function CapacitanceConversion() {
  const [value, setValue] = useState("100");
  const [unit, setUnit] = useState(1e-9); // nF

  const farads = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? n * unit : null;
  }, [value, unit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Capacitance is measured in farads, but a farad is an enormous
          unit — most real capacitors are millions or billions of times
          smaller. In practice you&rsquo;ll almost always see µF, nF, or
          pF printed on the component, so converting between them is a
          daily occurrence, not an edge case.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Every prefix is just a power of ten away from the farad: milli
          is a thousandth, micro is a millionth, nano is a billionth, pico
          is a trillionth. Convert into farads first as a common baseline,
          then convert back out to whichever unit you actually need.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">F = value × unit_factor</p>
        <p>Where unit_factor is 10⁻³ for mF, 10⁻⁶ for µF, 10⁻⁹ for nF, 10⁻¹² for pF.</p>
      </ToolSection>

      <Mnemonic tag="m, µ, n, p" phrase="Each step down is a thousand times smaller">
        <p>
          Milli, micro, nano, pico — each one is exactly a thousand times
          smaller than the last. Know that one fact and you can convert
          between any pair just by counting how many steps apart they are.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">100 nF</p>
          <p className="step">100 × 10⁻⁹ = 1 × 10⁻⁷ F</p>
          <p className="step">= 0.1 µF = 100,000 pF</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <CalculatorSelect
          label="Unit"
          value={unit}
          onChange={(event) => setUnit(Number(event.target.value))}
        >
          {CAPACITANCE_UNITS.map((u) => (
            <option key={u.label} value={u.factor}>
              {u.label}
            </option>
          ))}
        </CalculatorSelect>
        {farads !== null ? (
          <CalculatorResults>
            {CAPACITANCE_UNITS.map((u) => (
              <CalculatorResult
                key={u.label}
                label={u.label}
                value={Number((farads / u.factor).toPrecision(6))}
              />
            ))}
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a valid number.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

