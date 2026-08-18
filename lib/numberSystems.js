export function parseInBase(value, base) {
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, base);
  return Number.isFinite(n) ? n : null;
}

function maskFor(bits) {
  return bits === 32 ? 0xffffffff : (1 << bits) - 1;
}

export function toBinaryString(value, bits) {
  return ((value & maskFor(bits)) >>> 0)
    .toString(2)
    .padStart(32, "0")
    .slice(-bits);
}

export function onesComplement(value, bits) {
  const mask = maskFor(bits);
  return (~value & mask) >>> 0;
}

export function twosComplement(value, bits) {
  const mask = maskFor(bits);
  return ((onesComplement(value, bits) + 1) & mask) >>> 0;
}

export function signedValue(bitPattern, bits) {
  const mask = maskFor(bits);
  const value = bitPattern & mask;
  const signBit = 1 << (bits - 1);
  return value & signBit ? value - (mask + 1) : value;
}

export function shiftValue(value, bits, amount, direction) {
  const mask = maskFor(bits);
  const v = value & mask;
  if (direction === "left") return (v << amount) & mask;
  return (v >>> amount) & mask;
}

export function asciiToHex(text) {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

export function hexToAscii(hex) {
  const clean = hex.replace(/0x/gi, " ").replace(/[^0-9a-fA-F]/g, "");
  const bytes = clean.match(/.{1,2}/g) || [];
  return bytes
    .map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join("");
}

