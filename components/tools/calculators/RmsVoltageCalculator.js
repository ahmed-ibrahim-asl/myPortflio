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

const SQRT2 = Math.SQRT2;

export function RmsVoltageCalculator() {
  const [mode, setMode] = useState("peak");
  const [value, setValue] = useState("325");

  const result = useMemo(() => {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return null;
    const peak = mode === "peak" ? v : v / 2;
    return { peak, peakToPeak: peak * 2, rms: peak / SQRT2 };
  }, [value, mode]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          An AC voltage is constantly changing — it doesn&rsquo;t sit at
          one value the way a battery does. RMS voltage is the single
          steady number that would deliver the exact same heating power as
          that constantly-changing AC signal, which is why it&rsquo;s what
          gets printed on wall sockets instead of the peak voltage.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          A sine wave spends most of its time well below its peak — it
          only touches the very top for an instant each cycle. Average the
          power delivered across the whole cycle (which means squaring the
          voltage, averaging that, then rooting it back — Root Mean
          Square) and for a clean sine wave, the answer always works out
          to the peak divided by √2.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">Vrms = Vpeak / √2</p>
        <p>Applies to a sine wave. √2 ≈ 1.414.</p>
      </ToolSection>

      <Mnemonic tag="÷ √2" phrase="RMS is peak, taken down a notch">
        <p>
          For a sine wave, RMS is always about 70.7% of the peak (1 ÷ √2).
          Peak-to-peak is just double the peak — keep those two divisions
          straight and the rest follows.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Vpeak = 325 V (typical 230 V mains)</p>
          <p className="step">Vrms = 325 ÷ √2</p>
          <p className="step">Vrms ≈ 230 V</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorSelect
          label="I have"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          <option value="peak">Peak voltage</option>
          <option value="peak-to-peak">Peak-to-peak voltage</option>
        </CalculatorSelect>
        <CalculatorField
          label={mode === "peak" ? "Peak voltage" : "Peak-to-peak voltage"}
          suffix="V"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {result ? (
          <CalculatorResults>
            <CalculatorResult
              label="RMS voltage"
              value={Number(result.rms.toPrecision(4))}
              unit="V"
            />
            <CalculatorResult
              label="Peak-to-peak"
              value={Number(result.peakToPeak.toPrecision(4))}
              unit="V"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a valid, non-negative voltage.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

