export const DIGIT_COLORS = [
  { name: "Black", hex: "#2b2b2b", digit: 0 },
  { name: "Brown", hex: "#7b4a2d", digit: 1 },
  { name: "Red", hex: "#c1272d", digit: 2 },
  { name: "Orange", hex: "#e07b1a", digit: 3 },
  { name: "Yellow", hex: "#e8c31e", digit: 4 },
  { name: "Green", hex: "#3a7d34", digit: 5 },
  { name: "Blue", hex: "#2f5fa8", digit: 6 },
  { name: "Violet", hex: "#6b3fa0", digit: 7 },
  { name: "Grey", hex: "#8a8a8a", digit: 8 },
  { name: "White", hex: "#f2f2f2", digit: 9 }
];

export const MULTIPLIER_COLORS = [
  { name: "Black", hex: "#2b2b2b", multiplier: 1 },
  { name: "Brown", hex: "#7b4a2d", multiplier: 10 },
  { name: "Red", hex: "#c1272d", multiplier: 100 },
  { name: "Orange", hex: "#e07b1a", multiplier: 1000 },
  { name: "Yellow", hex: "#e8c31e", multiplier: 10000 },
  { name: "Green", hex: "#3a7d34", multiplier: 100000 },
  { name: "Blue", hex: "#2f5fa8", multiplier: 1000000 },
  { name: "Violet", hex: "#6b3fa0", multiplier: 10000000 },
  { name: "Grey", hex: "#8a8a8a", multiplier: 0.01 },
  { name: "White", hex: "#f2f2f2", multiplier: 0.1 },
  { name: "Gold", hex: "#c9a227", multiplier: 0.1 },
  { name: "Silver", hex: "#c7c9cc", multiplier: 0.01 }
];

export const TOLERANCE_COLORS = [
  { name: "Brown", hex: "#7b4a2d", tolerance: 1 },
  { name: "Red", hex: "#c1272d", tolerance: 2 },
  { name: "Green", hex: "#3a7d34", tolerance: 0.5 },
  { name: "Blue", hex: "#2f5fa8", tolerance: 0.25 },
  { name: "Violet", hex: "#6b3fa0", tolerance: 0.1 },
  { name: "Gold", hex: "#c9a227", tolerance: 5 },
  { name: "Silver", hex: "#c7c9cc", tolerance: 10 },
  { name: "None", hex: "transparent", tolerance: 20 }
];

export function formatOhms(value) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1e6) return `${Number((value / 1e6).toPrecision(4))} MΩ`;
  if (value >= 1e3) return `${Number((value / 1e3).toPrecision(4))} kΩ`;
  return `${Number(value.toPrecision(4))} Ω`;
}

