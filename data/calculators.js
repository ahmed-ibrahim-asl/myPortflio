const SOURCE_LABEL = "Last Minute Engineers";

const calculatorCatalog = [
  {
    slug: "ohms-law-calculator",
    title: "Ohm's Law Calculator",
    category: "Fundamentals",
    summary:
      "Find voltage, current, or resistance from the other two — the one relationship every circuit obeys.",
    tags: ["Voltage", "Current", "Resistance"],
    sourceUrl: "https://lastminuteengineers.com/ohms-law-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "resistor-color-code-calculator",
    title: "Resistor Color Code Calculator",
    category: "Resistors",
    summary:
      "Turn four color bands into an exact resistance and tolerance, with a picker instead of a chart to squint at.",
    tags: ["Resistors", "Color code", "4-band"],
    sourceUrl: "https://lastminuteengineers.com/resistor-color-code-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "5-band-resistor-color-code-calculator",
    title: "5-Band Resistor Color Code Calculator",
    category: "Resistors",
    summary:
      "The same idea with one more digit of precision — for the tighter-tolerance resistors that use five bands.",
    tags: ["Resistors", "Color code", "5-band"],
    sourceUrl: "https://lastminuteengineers.com/5-band-resistor-color-code-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "series-resistor-calculator",
    title: "Series Resistor Calculator",
    category: "Resistors",
    summary:
      "Add resistors end to end and their resistances just add up. Enter a few values, get the total.",
    tags: ["Resistors", "Series circuit"],
    sourceUrl: "https://lastminuteengineers.com/series-resistor-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "parallel-resistor-calculator",
    title: "Parallel Resistor Calculator",
    category: "Resistors",
    summary:
      "Wire resistors side by side and the math flips — flip each value, add them, flip the sum back.",
    tags: ["Resistors", "Parallel circuit"],
    sourceUrl: "https://lastminuteengineers.com/parallel-resistor-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "voltage-divider-calculator",
    title: "Voltage Divider Calculator",
    category: "Fundamentals",
    summary:
      "Two resistors in series split a voltage in proportion to their size — the trick behind most sensor circuits.",
    tags: ["Voltage divider", "Resistors"],
    sourceUrl: "https://lastminuteengineers.com/voltage-divider-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "rc-time-constant-calculator",
    title: "RC Time Constant Calculator",
    category: "Timing & Filters",
    summary:
      "How fast a resistor and capacitor charge or discharge together, boiled down to one number: tau.",
    tags: ["RC circuit", "Capacitors", "Timing"],
    sourceUrl: "https://lastminuteengineers.com/rc-time-constant-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "555-timer-astable-circuit-calculator",
    title: "555 Timer Astable Circuit Calculator",
    category: "Timing & Filters",
    summary:
      "Set two resistors and a capacitor to tune a free-running 555 timer's frequency and duty cycle.",
    tags: ["555 timer", "Astable", "Frequency"],
    sourceUrl: "https://lastminuteengineers.com/555-timer-astable-circuit-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "555-timer-monostable-circuit-calculator",
    title: "555 Timer Monostable Circuit Calculator",
    category: "Timing & Filters",
    summary:
      "One trigger, one pulse — work out exactly how long a 555 timer's one-shot output stays high.",
    tags: ["555 timer", "Monostable", "Pulse width"],
    sourceUrl: "https://lastminuteengineers.com/555-timer-monostable-circuit-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "capacitive-reactance-calculator",
    title: "Capacitive Reactance Calculator",
    category: "Timing & Filters",
    summary:
      "See how much a capacitor resists AC current at a given frequency — resistance's frequency-dependent cousin.",
    tags: ["Capacitors", "AC circuits", "Reactance"],
    sourceUrl: "https://lastminuteengineers.com/capacitive-reactance-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "led-series-resistor-calculator",
    title: "LED Series Resistor Calculator",
    category: "Fundamentals",
    summary:
      "The one calculation every LED circuit needs, so the LED lights up instead of burning out.",
    tags: ["LED", "Resistors", "Current limiting"],
    sourceUrl: "https://lastminuteengineers.com/led-series-resistor-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "battery-life-calculator",
    title: "Battery Life Calculator",
    category: "Fundamentals",
    summary:
      "Estimate how many hours a battery will actually power a project once real-world efficiency is factored in.",
    tags: ["Battery", "Power budget"],
    sourceUrl: "https://lastminuteengineers.com/battery-life-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "rms-voltage-calculator",
    title: "RMS Voltage Calculator",
    category: "Timing & Filters",
    summary:
      "Convert an AC signal's peak voltage into the steady DC-equivalent value that actually does the work.",
    tags: ["AC circuits", "RMS"],
    sourceUrl: "https://lastminuteengineers.com/rms-voltage-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "high-pass-filter-calculator",
    title: "High Pass Filter Calculator",
    category: "Timing & Filters",
    summary:
      "Find the cutoff frequency of an RC filter that lets highs through and blocks the lows.",
    tags: ["Filters", "RC circuit", "Cutoff frequency"],
    sourceUrl: "https://lastminuteengineers.com/high-pass-filter-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "low-pass-filter-calculator",
    title: "Low Pass Filter Calculator",
    category: "Timing & Filters",
    summary:
      "The same RC pair, wired the other way round — keep the lows, roll off everything above the cutoff.",
    tags: ["Filters", "RC circuit", "Cutoff frequency"],
    sourceUrl: "https://lastminuteengineers.com/low-pass-filter-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "op-amp-gain-calculator",
    title: "Op-Amp Gain Calculator",
    category: "Timing & Filters",
    summary:
      "Two resistors decide how much an op-amp amplifies a signal — and whether it flips polarity on the way.",
    tags: ["Op-amp", "Gain", "Amplifier"],
    sourceUrl: "https://lastminuteengineers.com/op-amp-gain-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "capacitor-code-value-converter",
    title: "Capacitor Code-Value Converter",
    category: "Conversions",
    summary:
      "Decode the three-digit number printed on a small ceramic capacitor into a real, usable capacitance.",
    tags: ["Capacitors", "Component codes"],
    sourceUrl: "https://lastminuteengineers.com/capacitor-code-value-converter/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "capacitance-conversion",
    title: "Capacitance Conversion",
    category: "Conversions",
    summary:
      "Move between farads, microfarads, nanofarads, and picofarads without losing track of the decimal point.",
    tags: ["Capacitors", "Unit conversion"],
    sourceUrl: "https://lastminuteengineers.com/capacitance-conversion/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "temperature-conversion",
    title: "Temperature Conversion",
    category: "Conversions",
    summary:
      "Celsius, Fahrenheit, and Kelvin — three scales for the same thing, converted both ways at once.",
    tags: ["Temperature", "Unit conversion"],
    sourceUrl: "https://lastminuteengineers.com/temperature-conversion/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "decimal-binary-octal-hex-converter",
    title: "Decimal, Binary, Octal and Hex Converter",
    category: "Number Systems",
    summary:
      "Type a number in any base and read it back in all four at once — decimal, binary, octal, and hex.",
    tags: ["Number bases", "Binary", "Hex"],
    sourceUrl: "https://lastminuteengineers.com/decimal-binary-octal-hex-converter/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "binary-bit-shift-calculator",
    title: "Binary Bit Shift Calculator",
    category: "Number Systems",
    summary:
      "Slide a binary number's bits left or right and see exactly how that multiplies or divides it by two.",
    tags: ["Binary", "Bitwise"],
    sourceUrl: "https://lastminuteengineers.com/binary-bit-shift-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "ones-1s-complement-calculator",
    title: "One's Complement Calculator",
    category: "Number Systems",
    summary:
      "Flip every bit in a binary number — the building block behind how computers represent negative numbers.",
    tags: ["Binary", "Complement"],
    sourceUrl: "https://lastminuteengineers.com/ones-1s-complement-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "twos-2s-complement-calculator",
    title: "Two's Complement Calculator",
    category: "Number Systems",
    summary:
      "The actual system computers use to store negative numbers in binary, one bit-flip past one's complement.",
    tags: ["Binary", "Complement", "Signed integers"],
    sourceUrl: "https://lastminuteengineers.com/twos-2s-complement-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "ascii-to-hex-converter",
    title: "ASCII to HEX Converter",
    category: "Number Systems",
    summary: "See the raw hex bytes your text actually turns into once a computer gets hold of it.",
    tags: ["ASCII", "Hex", "Text encoding"],
    sourceUrl: "https://lastminuteengineers.com/ascii-to-hex-converter/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "hex-to-ascii-converter",
    title: "HEX to ASCII Converter",
    category: "Number Systems",
    summary: "Turn a string of hex byte values back into the readable text it was encoding.",
    tags: ["ASCII", "Hex", "Text encoding"],
    sourceUrl: "https://lastminuteengineers.com/hex-to-ascii-converter/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "log-base-2-calculator",
    title: "Log Base 2 Calculator",
    category: "Number Systems",
    summary:
      "Find out how many times a number has to double to reach another — the question log base 2 answers.",
    tags: ["Logarithms", "Binary"],
    sourceUrl: "https://lastminuteengineers.com/log-base-2-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "binary-calculator",
    title: "Binary Calculator",
    category: "Number Systems",
    summary:
      "Add, subtract, multiply, or divide two binary numbers directly, without converting to decimal first.",
    tags: ["Binary", "Arithmetic"],
    sourceUrl: "https://lastminuteengineers.com/binary-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "hex-calculator",
    title: "Hex Calculator",
    category: "Number Systems",
    summary:
      "The same arithmetic, base 16 — handy for anyone reading memory addresses or register values all day.",
    tags: ["Hex", "Arithmetic"],
    sourceUrl: "https://lastminuteengineers.com/hex-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "acceleration-calculator",
    title: "Acceleration Calculator",
    category: "Physics & Math",
    summary:
      "Work out how quickly something is speeding up or slowing down from its change in velocity over time.",
    tags: ["Motion", "Physics"],
    sourceUrl: "https://lastminuteengineers.com/acceleration-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "force-mass-acceleration-calculator",
    title: "Force, Mass & Acceleration Calculator",
    category: "Physics & Math",
    summary:
      "Newton's second law, solved for whichever of force, mass, or acceleration you don't already know.",
    tags: ["Motion", "Physics", "Newton's laws"],
    sourceUrl: "https://lastminuteengineers.com/force-mass-acceleration-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "speed-distance-time-calculator",
    title: "Speed Distance Time Calculator",
    category: "Physics & Math",
    summary:
      "The classic travel formula, rearranged to solve for whichever of the three you're missing.",
    tags: ["Motion", "Physics"],
    sourceUrl: "https://lastminuteengineers.com/speed-distance-time-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "wavelength-calculator",
    title: "Wavelength Calculator",
    category: "Physics & Math",
    summary:
      "Find the physical length of one wave cycle from its speed and frequency — light, sound, or radio.",
    tags: ["Waves", "Physics", "RF"],
    sourceUrl: "https://lastminuteengineers.com/wavelength-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "frequency-to-period-calculator",
    title: "Frequency-to-Period Calculator",
    category: "Physics & Math",
    summary:
      "Frequency and period are just each other's reciprocal — flip one to get the other, either direction.",
    tags: ["Waves", "Timing"],
    sourceUrl: "https://lastminuteengineers.com/frequency-to-period-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "percentage-change-calculator",
    title: "Percentage Change Calculator",
    category: "Physics & Math",
    summary:
      "See exactly how much something grew or shrank, expressed the way everyone actually talks about it.",
    tags: ["Math", "Percentages"],
    sourceUrl: "https://lastminuteengineers.com/percentage-change-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "square-root-calculator",
    title: "Square Root Calculator",
    category: "Physics & Math",
    summary: "The number that multiplies by itself to give you the one you started with.",
    tags: ["Math", "Roots"],
    sourceUrl: "https://lastminuteengineers.com/square-root-calculator/",
    sourceLabel: SOURCE_LABEL
  },
  {
    slug: "cube-root-calculator",
    title: "Cube Root Calculator",
    category: "Physics & Math",
    summary:
      "Same idea as a square root, one dimension further — the number that multiplies by itself three times.",
    tags: ["Math", "Roots"],
    sourceUrl: "https://lastminuteengineers.com/cube-root-calculator/",
    sourceLabel: SOURCE_LABEL
  }
];

export const calculatorCategories = Object.freeze([
  "Fundamentals",
  "Resistors",
  "Timing & Filters",
  "Conversions",
  "Number Systems",
  "Physics & Math"
]);

function resolveVisualKey(tool) {
  if (tool.slug === "ohms-law-calculator" || tool.slug === "op-amp-gain-calculator") {
    return "ohms";
  }
  if (tool.slug === "voltage-divider-calculator") return "divider";
  if (tool.slug === "led-series-resistor-calculator") return "led";
  if (tool.slug === "battery-life-calculator") return "battery";
  if (tool.category === "Resistors") return "resistor";
  if (tool.slug.includes("555-timer")) return "timer";
  if (tool.slug.includes("filter") || tool.slug.includes("reactance")) return "filter";
  if (tool.category === "Timing & Filters") return "wave";
  if (tool.slug.includes("capacitor") || tool.slug.includes("capacitance")) return "capacitor";
  if (tool.category === "Conversions") return "conversion";
  if (tool.category === "Number Systems") return "number";
  if (tool.slug.includes("wavelength") || tool.slug.includes("frequency")) return "wave";
  return "physics";
}

export const calculators = Object.freeze(
  calculatorCatalog.map((tool) => Object.freeze({
    ...tool,
    visualKey: resolveVisualKey(tool)
  }))
);
