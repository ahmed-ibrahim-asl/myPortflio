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

function toCelsius(value, unit) {
  if (unit === "C") return value;
  if (unit === "F") return ((value - 32) * 5) / 9;
  return value - 273.15;
}

export function TemperatureConversion() {
  const [value, setValue] = useState("25");
  const [unit, setUnit] = useState("C");

  const celsius = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? toCelsius(n, unit) : null;
  }, [value, unit]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          Celsius, Fahrenheit, and Kelvin all measure the same thing — how
          hot something is — they just picked different zero points and
          different step sizes to count with. Datasheets, weather
          reports, and lab equipment don&rsquo;t agree on which one to
          use, so converting between them comes up constantly.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Celsius sets 0° at water freezing. Kelvin uses the same size
          degree as Celsius but starts counting from absolute zero
          instead, so it&rsquo;s just Celsius shifted up by 273.15.
          Fahrenheit uses a smaller degree and a different zero point
          entirely, so converting to or from it needs both a scale factor
          (9/5) and an offset (32) — Celsius to Kelvin is a pure shift,
          Celsius to Fahrenheit is a shift and a stretch.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">°F = °C × 9/5 + 32</p>
        <p className="mono">K = °C + 273.15</p>
      </ToolSection>

      <Mnemonic tag="×9/5, +32" phrase="Stretch it, then shift it">
        <p>
          Going to Fahrenheit, always stretch before you shift: multiply
          by 9/5 first, add 32 second. Reverse both steps, in reverse
          order, to come back the other way.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">25°C</p>
          <p className="step">°F = 25 × 9/5 + 32 = 77°F</p>
          <p className="step">K = 25 + 273.15 = 298.15 K</p>
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
          onChange={(event) => setUnit(event.target.value)}
        >
          <option value="C">Celsius (°C)</option>
          <option value="F">Fahrenheit (°F)</option>
          <option value="K">Kelvin (K)</option>
        </CalculatorSelect>
        {celsius !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label="Celsius"
              value={Number(celsius.toPrecision(6))}
              unit="°C"
            />
            <CalculatorResult
              label="Fahrenheit"
              value={Number(((celsius * 9) / 5 + 32).toPrecision(6))}
              unit="°F"
            />
            <CalculatorResult
              label="Kelvin"
              value={Number((celsius + 273.15).toPrecision(6))}
              unit="K"
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a valid number.</p>
        )}
      </CalculatorPanel>
    </div>
  );
}

