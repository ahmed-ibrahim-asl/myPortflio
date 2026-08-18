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
import { Timer555MonostableDiagram } from "../diagrams/Timer555MonostableDiagram";

export function Timer555MonostableCalculator() {
  const [r, setR] = useState("100000");
  const [c, setC] = useState("10");
  const [cUnit, setCUnit] = useState(1e-6); // µF

  const pulseWidth = useMemo(() => {
    const resistance = Number(r);
    const capacitance = Number(c) * cUnit;
    if (!Number.isFinite(resistance) || !Number.isFinite(capacitance)) {
      return null;
    }
    return 1.1 * resistance * capacitance;
  }, [r, c, cUnit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          In monostable mode, a 555 timer sits quietly until it&rsquo;s
          triggered — then it outputs one clean pulse of a fixed length and
          goes back to waiting. It&rsquo;s the &ldquo;one-shot&rdquo; mode:
          press a button once, get exactly one timed action, no matter how
          long the button is held.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          The trigger starts a single charge cycle on the capacitor through
          the resistor. The output stays high for as long as that charge
          takes to cross a fixed internal threshold — about two-thirds of
          the supply voltage. Bigger R or bigger C means the capacitor takes
          longer to reach that threshold, so the pulse lasts longer.
        </p>
      </ToolSection>

      <Timer555MonostableDiagram />

      <ToolSection title="The formula">
        <p className="mono">T = 1.1 × R × C</p>
        <p>T is the pulse width in seconds, R in ohms, C in farads.</p>
      </ToolSection>

      <Mnemonic tag="1.1RC" phrase="Same shape as RC, just 10% longer">
        <p>
          It&rsquo;s the RC time constant with a 1.1 out front instead of a
          bare 1 — because the 555&rsquo;s trigger threshold sits a little
          past one full time constant. Remember plain RC first, then tack
          on the 1.1.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">R = 100 kΩ, C = 10 µF</p>
          <p className="step">T = 1.1 × 100,000 × 0.00001</p>
          <p className="step">T = 1.1 seconds</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Resistance"
          suffix="Ω"
          value={r}
          onChange={(event) => setR(event.target.value)}
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
        {pulseWidth !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Pulse width"
              value={formatEngineering(pulseWidth, "s")}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

