export function ensureTrailingNewline(code) {
  return `${String(code ?? "").replace(/\s+$/u, "")}\n`;
}
