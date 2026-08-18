const PREFIXES = [
  { exp: 12, symbol: "T" },
  { exp: 9, symbol: "G" },
  { exp: 6, symbol: "M" },
  { exp: 3, symbol: "k" },
  { exp: 0, symbol: "" },
  { exp: -3, symbol: "m" },
  { exp: -6, symbol: "µ" },
  { exp: -9, symbol: "n" },
  { exp: -12, symbol: "p" }
];

export function formatEngineering(value, unit, { precision = 3 } = {}) {
  if (!Number.isFinite(value)) return `— ${unit}`;
  const abs = Math.abs(value);
  if (abs === 0) return `0 ${unit}`;

  const entry = PREFIXES.find((prefix) => abs >= 10 ** prefix.exp) || PREFIXES[PREFIXES.length - 1];
  const scaled = value / 10 ** entry.exp;

  return `${Number(scaled.toPrecision(precision))} ${entry.symbol}${unit}`;
}

export const CAPACITANCE_UNITS = [
  { label: "F", factor: 1 },
  { label: "mF", factor: 1e-3 },
  { label: "µF", factor: 1e-6 },
  { label: "nF", factor: 1e-9 },
  { label: "pF", factor: 1e-12 }
];

export const RESISTANCE_UNITS = [
  { label: "Ω", factor: 1 },
  { label: "kΩ", factor: 1e3 },
  { label: "MΩ", factor: 1e6 }
];
