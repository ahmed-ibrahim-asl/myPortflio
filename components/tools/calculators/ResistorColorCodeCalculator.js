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

export function ResistorColorCodeCalculator() {
  const [d1, setD1] = useState(1); // Brown
  const [d2, setD2] = useState(0); // Black
  const [mult, setMult] = useState(100); // Red
  const [tol, setTol] = useState(5); // Gold

  const value = useMemo(() => (d1 * 10 + d2) * mult, [d1, d2, mult]);
  const min = value * (1 - tol / 100);
  const max = value * (1 + tol / 100);

  const bandHexes = [
    DIGIT_COLORS.find((c) => c.digit === d1)?.hex,
    DIGIT_COLORS.find((c) => c.digit === d2)?.hex,
    MULTIPLIER_COLORS.find((c) => c.multiplier === mult)?.hex,
    TOLERANCE_COLORS.find((c) => c.tolerance === tol)?.hex
  ];

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A resistor is too small to print a number on, so manufacturers
          paint the number instead — as a sequence of colored bands. Learn
          the code once and any resistor in the drawer becomes readable at a
          glance, no multimeter required.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Four bands, four jobs. The first two bands are digits — they spell
          out a two-digit number. The third band is a multiplier — it tells
          you how many zeros to add (or, for gold and silver, how far to
          shift the decimal point). The fourth band is tolerance — how far
          the real resistance is allowed to drift from that number.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">R = (D1 × 10 + D2) × Multiplier</p>
        <p>
          D1 and D2 are the first two digits, read left to right starting
          from the band closest to the edge of the resistor.
        </p>
      </ToolSection>

      <Mnemonic phrase="Big Bears Race Over Yellow Grass, Blue Violets Grow Wild">
        <p>
          Black, Brown, Red, Orange, Yellow, Green, Blue, Violet, Grey,
          White — digits 0 through 9, in the order the bands are always
          printed. The sentence walks the color wheel in the same order the
          bands do, so once it&rsquo;s stuck, so is the code.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Bands: Brown, Black, Red, Gold</p>
          <p className="step">Digits: 1, 0 → 10</p>
          <p className="step">Multiplier: Red → ×100</p>
          <p className="step">R = 10 × 100 = 1,000 Ω = 1 kΩ ± 5%</p>
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
          label="Band 3 (multiplier)"
          colors={MULTIPLIER_COLORS}
          value={mult}
          onChange={setMult}
          colorKey="multiplier"
        />
        <ColorSwatchPicker
          label="Band 4 (tolerance)"
          colors={TOLERANCE_COLORS}
          value={tol}
          onChange={setTol}
          colorKey="tolerance"
        />
        <CalculatorResults>
          <CalculatorResult label="Resistance" value={formatOhms(value)} />
          <CalculatorResult label="Tolerance" value={`± ${tol}%`} />
          <CalculatorResult
            label="Range"
            value={`${formatOhms(min)} – ${formatOhms(max)}`}
          />
        </CalculatorResults>
      </CalculatorPanel>
    </div>
  );
}

