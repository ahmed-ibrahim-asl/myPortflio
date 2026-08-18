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
import { asciiToHex } from "@/lib/numberSystems";

export function AsciiToHexConverter() {
  const [text, setText] = useState("Hi!");

  const hex = useMemo(() => (text ? asciiToHex(text) : ""), [text]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          A computer never stores the letter &ldquo;A&rdquo; — it stores the number 65. ASCII is
          just an agreed-upon table that maps every character you can type to a number, and hex is
          the compact way engineers usually write that number down.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Take a string, and look up each character&rsquo;s position in the ASCII table one at a
          time. That position is a plain decimal number between 0 and 255, which converts to exactly
          two hex digits. String those hex pairs together, usually with a space between characters,
          and you&rsquo;ve got the raw bytes a program or a serial monitor would actually see.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">hex = ASCII_code(char).toString(16)</p>
        <p>Repeated for every character in the string, left to right.</p>
      </ToolSection>

      <Mnemonic tag="One char, two hex digits" phrase="ASCII always fits in a single byte">
        <p>
          Every standard ASCII character maxes out at 127 — well under 256 — so it never needs more
          than two hex digits. If you ever see three or more per character, you&rsquo;re looking at
          a different encoding.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Text: "Hi"</p>
          <p className="step">'H' = 72 decimal = 48 hex</p>
          <p className="step">'i' = 105 decimal = 69 hex</p>
          <p className="step">Result: 48 69</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Text"
          inputMode="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <CalculatorResults>
          <CalculatorResult label="Hex bytes" value={hex || "—"} />
        </CalculatorResults>
      </CalculatorPanel>
    </div>
  );
}
