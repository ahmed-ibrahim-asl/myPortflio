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
import { hexToAscii } from "@/lib/numberSystems";

export function HexToAsciiConverter() {
  const [hex, setHex] = useState("48 65 6C 6C 6F");

  const text = useMemo(() => hexToAscii(hex), [hex]);

  return (
    <div className="article-body">
      <ToolSection title="What's going on">
        <p>
          This is ASCII-to-hex run backward: given the raw hex byte values
          a device sent or stored, recover the readable text they were
          meant to represent. Useful the moment you&rsquo;re staring at a
          hex dump and need to know what it actually says.
        </p>
      </ToolSection>

      <ToolSection title="Build it up">
        <p>
          Split the hex string into pairs of digits — each pair is one
          byte, one character. Convert each pair back to a decimal number,
          then look that number up in the ASCII table to get its
          character. Line the characters up in order and you&rsquo;ve got
          the original text back.
        </p>
      </ToolSection>

      <ToolSection title="The formula">
        <p className="mono">char = String.fromCharCode(parseInt(byte, 16))</p>
        <p>Applied to each two-digit hex byte, in order.</p>
      </ToolSection>

      <Mnemonic tag="Pair up, then look up" phrase="Two hex digits in, one character out">
        <p>
          Always split hex into pairs before converting — a lone digit
          isn&rsquo;t a byte. If the string has an odd number of digits,
          something upstream dropped a character.
        </p>
      </Mnemonic>

      <ToolSection title="Worked example">
        <WorkedExample>
          <p className="step">Hex: 48 69</p>
          <p className="step">48 hex = 72 decimal = 'H'</p>
          <p className="step">69 hex = 105 decimal = 'i'</p>
          <p className="step">Result: "Hi"</p>
        </WorkedExample>
      </ToolSection>

      <CalculatorPanel>
        <CalculatorField
          label="Hex bytes"
          inputMode="text"
          value={hex}
          onChange={(event) => setHex(event.target.value)}
        />
        <CalculatorResults>
          <CalculatorResult label="Text" value={text || "—"} />
        </CalculatorResults>
      </CalculatorPanel>
    </div>
  );
}

