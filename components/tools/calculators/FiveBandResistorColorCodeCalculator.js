"use client";

import { useMemo, useState } from "react";
import {
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  ColorSwatchPicker,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";
import {
  DIGIT_COLORS,
  MULTIPLIER_COLORS,
  TOLERANCE_COLORS,
  formatOhms
} from "@/lib/resistorColors";
import { ResistorBandsDiagram } from "../diagrams/ResistorBandsDiagram";

const FIVE_BAND_TOLERANCES = TOLERANCE_COLORS.filter((color) => color.name !== "None");

export function FiveBandResistorColorCodeCalculator() {
  const [d1, setD1] = useState(1); // Brown
  const [d2, setD2] = useState(0); // Black
  const [d3, setD3] = useState(0); // Black
  const [mult, setMult] = useState(10); // Brown
  const [tol, setTol] = useState(1); // Brown

  const value = useMemo(() => (d1 * 100 + d2 * 10 + d3) * mult, [d1, d2, d3, mult]);
  const min = value * (1 - tol / 100);

  const bandHexes = [
    DIGIT_COLORS.find((c) => c.digit === d1)?.hex,
    DIGIT_COLORS.find((c) => c.digit === d2)?.hex,
    DIGIT_COLORS.find((c) => c.digit === d3)?.hex,
    MULTIPLIER_COLORS.find((c) => c.multiplier === mult)?.hex,
    TOLERANCE_COLORS.find((c) => c.tolerance === tol)?.hex
  ];
  const max = value * (1 + tol / 100);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Precision resistors need more than two significant digits to say what they mean, so they
          trade one of the multiplier&rsquo;s shortcuts for an extra digit of accuracy. Same idea as
          the 4-band code, one more band of resolution.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Where a 4-band resistor spells out a two-digit number, a 5-band resistor spells out three
          digits before the multiplier kicks in. That&rsquo;s the whole difference — everything else
          about reading the bands works exactly the same way, left to right.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">R = (D1 × 100 + D2 × 10 + D3) × Multiplier</p>
        <p>
          D1, D2, and D3 are the first three digits, read from the band nearest the resistor&rsquo;s
          edge inward.
        </p>
      </ToolSection>

      <Mnemonic phrase="One extra digit, one extra chance to be exact">
        <p>
          Reuse the same color sentence as the 4-band code — Black, Brown, Red, Orange, Yellow,
          Green, Blue, Violet, Grey, White — just read it for three bands instead of two before you
          hit the multiplier. The color order never changes; only how many digits you collect does.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Bands: Brown, Black, Black, Brown, Brown</p>
          <p className="step">Digits: 1, 0, 0 → 100</p>
          <p className="step">Multiplier: Brown → ×10</p>
          <p className="step">R = 100 × 10 = 1,000 Ω = 1 kΩ ± 1%</p>
        </WorkedExample>
      </ToolSection>

      <ResistorBandsDiagram bands={bandHexes} />

      <CalculatorPanel>
        <ColorSwatchPicker
          label="Band 1 (1st digit)"
          colors={DIGIT_COLORS}
          value={d1}
          onChange={setD1}
          colorKey="digit"
        />
        <ColorSwatchPicker
          label="Band 2 (2nd digit)"
          colors={DIGIT_COLORS}
          value={d2}
          onChange={setD2}
          colorKey="digit"
        />
        <ColorSwatchPicker
          label="Band 3 (3rd digit)"
          colors={DIGIT_COLORS}
          value={d3}
          onChange={setD3}
          colorKey="digit"
        />
        <ColorSwatchPicker
          label="Band 4 (multiplier)"
          colors={MULTIPLIER_COLORS}
          value={mult}
          onChange={setMult}
          colorKey="multiplier"
        />
        <ColorSwatchPicker
          label="Band 5 (tolerance)"
          colors={FIVE_BAND_TOLERANCES}
          value={tol}
          onChange={setTol}
          colorKey="tolerance"
        />
        <CalculatorResults>
          <CalculatorResult label="Resistance" value={formatOhms(value)} />
          <CalculatorResult label="Tolerance" value={`± ${tol}%`} />
          <CalculatorResult label="Range" value={`${formatOhms(min)} – ${formatOhms(max)}`} />
        </CalculatorResults>
      </CalculatorPanel>
    </div>
  );
}
