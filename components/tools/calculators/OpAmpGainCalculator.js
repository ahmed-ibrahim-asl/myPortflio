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
import { OpAmpGainDiagram } from "../diagrams/OpAmpGainDiagram";

export function OpAmpGainCalculator() {
  const [config, setConfig] = useState("inverting");
  const [rf, setRf] = useState("10000");
  const [rin, setRin] = useState("1000");

  const gain = useMemo(() => {
    const feedback = Number(rf);
    const input = Number(rin);
    if (!Number.isFinite(feedback) || !Number.isFinite(input) || input === 0) {
      return null;
    }
    return config === "inverting"
      ? -(feedback / input)
      : 1 + feedback / input;
  }, [config, rf, rin]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          An op-amp on its own has huge, unpredictable gain — nearly
          useless as-is. Wire two resistors around it in a feedback loop
          and that wild gain gets tamed into a precise, predictable
          multiplier set entirely by the resistor values you chose.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          The feedback resistor (Rf) and input resistor (Rin) form a
          ratio, and the op-amp forces its output to whatever it takes to
          keep its two inputs balanced. In the inverting layout, the
          signal enters through Rin and the output flips sign — the gain
          is just Rf over Rin. In the non-inverting layout the input
          bypasses Rin entirely and the output stays the same polarity,
          which is why that configuration always adds one to the ratio
          instead of just returning it.
        </p>
      </ToolSection>

      <OpAmpGainDiagram />

      <ToolSection title="The formula">
        <p className="mono">Inverting: Gain = −Rf / Rin</p>
        <p className="mono">Non-inverting: Gain = 1 + Rf / Rin</p>
      </ToolSection>

      <Mnemonic tag="+1 for non-inverting" phrase="Same ratio, one extra term when the sign doesn't flip">
        <p>
          Both configurations share the same Rf ÷ Rin ratio at their core.
          Inverting keeps it bare (and negative); non-inverting tacks on a
          +1, which is also why non-inverting gain can never drop below 1,
          but inverting gain can.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Inverting, Rf = 10 kΩ, Rin = 1 kΩ</p>
          <p className="step">Gain = −10,000 / 1,000</p>
          <p className="step">Gain = −10 (10× louder, inverted)</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorSelect
          label="Configuration"
          value={config}
          onChange={(event) => setConfig(event.target.value)}
        >
          <option value="inverting">Inverting</option>
          <option value="non-inverting">Non-inverting</option>
        </CalculatorSelect>
        <CalculatorField
          label="Feedback resistor (Rf)"
          suffix="Ω"
          value={rf}
          onChange={(event) => setRf(event.target.value)}
        />
        <CalculatorField
          label="Input resistor (Rin)"
          suffix="Ω"
          value={rin}
          onChange={(event) => setRin(event.target.value)}
        />
        {gain !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Gain"
              value={Number(gain.toPrecision(4))}
              unit="×"
            />
            <CalculatorResult
              label="Gain in dB"
              value={Number((20 * Math.log10(Math.abs(gain))).toPrecision(4))}
              unit="dB"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Enter valid numbers; the input resistor can&rsquo;t be zero.
          </p>
        )}
      </CalculatorPanel>
    </div>
  );
}

