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

export function CapacitiveReactanceCalculator() {
  const [f, setF] = useState("1000");
  const [c, setC] = useState("100");
  const [cUnit, setCUnit] = useState(1e-9); // nF

  const reactance = useMemo(() => {
    const frequency = Number(f);
    const capacitance = Number(c) * cUnit;
    if (
      !Number.isFinite(frequency) ||
      !Number.isFinite(capacitance) ||
      frequency <= 0 ||
      capacitance <= 0
    ) {
      return null;
    }
    return 1 / (2 * Math.PI * frequency * capacitance);
  }, [f, c, cUnit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A capacitor blocks steady DC but lets AC through — sort of. It doesn&rsquo;t just let AC
          pass freely; it resists it by an amount that depends on frequency. That
          frequency-dependent resistance is called reactance, and for a capacitor, it goes down as
          frequency goes up.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          A capacitor resists change by storing charge and pushing back. At low frequency, the
          voltage barely changes before the capacitor keeps up — so it blocks current effectively,
          and reactance is high. At high frequency, the voltage is constantly reversing before the
          capacitor can catch up, so more current slips through — reactance drops. A bigger
          capacitor stores more charge for the same voltage swing, so it resists less at any given
          frequency too.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">Xc = 1 / (2π × f × C)</p>
        <p>Xc is reactance in ohms, f is frequency in hertz, C is capacitance in farads.</p>
      </ToolSection>

      <Mnemonic tag="Xc = 1 / (2πfC)" phrase="Everything on the bottom, so bigger means lower">
        <p>
          Every quantity that can grow — frequency, capacitance — sits in the denominator. Grow
          either one and reactance has nowhere to go but down.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">f = 1 kHz, C = 100 nF</p>
          <p className="step">Xc = 1 / (2π × 1,000 × 1e-7)</p>
          <p className="step">Xc ≈ 1,592 Ω</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Frequency"
          suffix="Hz"
          value={f}
          onChange={(event) => setF(event.target.value)}
        />
        <CalculatorField
          label="Capacitance"
          value={c}
          onChange={(event) => setC(event.target.value)}
        />
        <CalculatorSelect
          label="Capacitance unit"
          value={cUnit}
          onChange={(event) => setCUnit(Number(event.target.value))}
        >
          {CAPACITANCE_UNITS.map((unit) => (
            <option key={unit.label} value={unit.factor}>
              {unit.label}
            </option>
          ))}
        </CalculatorSelect>
        {reactance !== null ? (
          <CalculatorResults>
            <CalculatorResult label="Reactance" value={formatEngineering(reactance, "Ω")} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}
