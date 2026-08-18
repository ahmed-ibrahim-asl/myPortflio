export function parseInBase(value, base) {
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const patterns = {
    2: /^[+-]?[01]+$/,
    8: /^[+-]?[0-7]+$/,
    10: /^[+-]?\d+$/,
    16: /^[+-]?[0-9a-f]+$/i
  };
  const pattern = patterns[base];
  if (!pattern || !pattern.test(trimmed)) return null;

  const n = Number.parseInt(trimmed, base);
  return Number.isSafeInteger(n) ? n : null;
}

function maskFor(bits) {
  return bits === 32 ? 0xffffffff : (1 << bits) - 1;
}

export function toBinaryString(value, bits) {
  return ((value & maskFor(bits)) >>> 0).toString(2).padStart(32, "0").slice(-bits);
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
  if (!Number.isInteger(bits) || bits < 1 || bits > 32) {
    throw new RangeError("bits must be an integer between 1 and 32");
  }
  if (!Number.isInteger(amount) || amount < 0) {
    throw new RangeError("amount must be a non-negative integer");
  }
  if (amount >= bits) return 0;

  const mask = maskFor(bits);
  const v = (value & mask) >>> 0;
  if (direction === "left") return ((v << amount) & mask) >>> 0;
  return ((v >>> amount) & mask) >>> 0;
}

export function asciiToHex(text) {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

export function hexToAscii(hex) {
  const candidate = String(hex).trim();
  if (!candidate) return null;

  let bytes;
  if (/[\s,]/.test(candidate)) {
    const tokens = candidate.split(/[\s,]+/).filter(Boolean);
    if (!tokens.length || tokens.some((token) => !/^(?:0x)?[0-9a-f]{2}$/i.test(token))) {
      return null;
    }
    bytes = tokens.map((token) => token.replace(/^0x/i, ""));
  } else {
    const clean = candidate.replace(/^0x/i, "");
    if (!/^(?:[0-9a-f]{2})+$/i.test(clean)) return null;
    bytes = clean.match(/.{2}/g) || [];
  }

  return bytes.map((byte) => String.fromCharCode(Number.parseInt(byte, 16))).join("");
}
