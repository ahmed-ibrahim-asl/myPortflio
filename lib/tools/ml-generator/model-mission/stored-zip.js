const MAX_UINT16 = 0xffff;
const MAX_UINT32 = 0xffffffff;
const UTF8_FLAG = 0x0800;
const STORED_METHOD = 0;
const DOS_TIME = 0;
const DOS_DATE = 0x0021;
const LOCAL_HEADER_LENGTH = 30;
const CENTRAL_HEADER_LENGTH = 46;
const EOCD_LENGTH = 22;

const textEncoder = new TextEncoder();

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1
        ? (value >>> 1) ^ 0xedb88320
        : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function checkedZip32Size(label, ...parts) {
  let total = 0;
  for (const part of parts) {
    if (!Number.isSafeInteger(part) || part < 0) {
      throw new Error(`${label} is not a supported ZIP32 size.`);
    }
    total += part;
    if (!Number.isSafeInteger(total) || total > MAX_UINT32) {
      throw new Error(`${label} exceeds the ZIP32 size limit.`);
    }
  }
  return total;
}

function assertSafePath(path) {
  const segments = path.split("/");
  const absolute =
    path.startsWith("/")
    || path.startsWith("\\")
    || /^[A-Za-z]:/u.test(path);
  const unsafeSegment = segments.some((segment) =>
    segment === ""
    || segment === "."
    || segment === ".."
    || /[. ]$/u.test(segment)
    || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment)
  );
  if (
    path === ""
    || absolute
    || path.includes("\\")
    || path.includes(":")
    || /\p{Cc}/u.test(path)
    || unsafeSegment
  ) {
    throw new Error(`"${path}" must be a safe relative ZIP path.`);
  }
}

function prepareEntries(files) {
  if (
    typeof files !== "object"
    || files === null
    || Array.isArray(files)
  ) {
    throw new TypeError("ZIP files must be a record of file contents.");
  }

  const paths = Object.keys(files).sort();
  if (paths.length > MAX_UINT16) {
    throw new Error("ZIP32 entry count cannot exceed 65535 files.");
  }

  let localSize = 0;
  let centralSize = 0;
  const entries = paths.map((path) => {
    assertSafePath(path);
    const name = textEncoder.encode(path);
    if (name.byteLength > MAX_UINT16) {
      throw new Error(
        `"${path}" exceeds the ZIP32 filename length limit.`,
      );
    }

    const value = files[path];
    let data;
    if (typeof value === "string") {
      data = textEncoder.encode(value);
    } else if (value instanceof Uint8Array) {
      data = value;
    } else {
      throw new TypeError(
        `ZIP entry "${path}" must be a string or Uint8Array.`,
      );
    }
    if (data.byteLength > MAX_UINT32) {
      throw new Error(`"${path}" exceeds the ZIP32 file size limit.`);
    }

    const localOffset = localSize;
    localSize = checkedZip32Size(
      "ZIP local records",
      localSize,
      LOCAL_HEADER_LENGTH,
      name.byteLength,
      data.byteLength,
    );
    centralSize = checkedZip32Size(
      "ZIP central directory",
      centralSize,
      CENTRAL_HEADER_LENGTH,
      name.byteLength,
    );
    return {
      name,
      data,
      crc: crc32(data),
      localOffset,
    };
  });

  checkedZip32Size(
    "ZIP archive",
    localSize,
    centralSize,
    EOCD_LENGTH,
  );
  return { entries, localSize, centralSize };
}

function writeLocalRecord(view, bytes, offset, entry) {
  view.setUint32(offset, 0x04034b50, true);
  view.setUint16(offset + 4, 20, true);
  view.setUint16(offset + 6, UTF8_FLAG, true);
  view.setUint16(offset + 8, STORED_METHOD, true);
  view.setUint16(offset + 10, DOS_TIME, true);
  view.setUint16(offset + 12, DOS_DATE, true);
  view.setUint32(offset + 14, entry.crc, true);
  view.setUint32(offset + 18, entry.data.byteLength, true);
  view.setUint32(offset + 22, entry.data.byteLength, true);
  view.setUint16(offset + 26, entry.name.byteLength, true);
  view.setUint16(offset + 28, 0, true);
  bytes.set(entry.name, offset + LOCAL_HEADER_LENGTH);
  bytes.set(
    entry.data,
    offset + LOCAL_HEADER_LENGTH + entry.name.byteLength,
  );
  return (
    offset
    + LOCAL_HEADER_LENGTH
    + entry.name.byteLength
    + entry.data.byteLength
  );
}

function writeCentralRecord(view, bytes, offset, entry) {
  view.setUint32(offset, 0x02014b50, true);
  view.setUint16(offset + 4, 20, true);
  view.setUint16(offset + 6, 20, true);
  view.setUint16(offset + 8, UTF8_FLAG, true);
  view.setUint16(offset + 10, STORED_METHOD, true);
  view.setUint16(offset + 12, DOS_TIME, true);
  view.setUint16(offset + 14, DOS_DATE, true);
  view.setUint32(offset + 16, entry.crc, true);
  view.setUint32(offset + 20, entry.data.byteLength, true);
  view.setUint32(offset + 24, entry.data.byteLength, true);
  view.setUint16(offset + 28, entry.name.byteLength, true);
  view.setUint16(offset + 30, 0, true);
  view.setUint16(offset + 32, 0, true);
  view.setUint16(offset + 34, 0, true);
  view.setUint16(offset + 36, 0, true);
  view.setUint32(offset + 38, 0, true);
  view.setUint32(offset + 42, entry.localOffset, true);
  bytes.set(entry.name, offset + CENTRAL_HEADER_LENGTH);
  return offset + CENTRAL_HEADER_LENGTH + entry.name.byteLength;
}

/**
 * Encode a deterministic ZIP32 archive using method 0 (store).
 *
 * @param {Record<string, string | Uint8Array>} files
 * @returns {Uint8Array}
 */
export function encodeStoredZip(files) {
  const { entries, localSize, centralSize } = prepareEntries(files);
  const archiveSize = localSize + centralSize + EOCD_LENGTH;
  let bytes;
  try {
    bytes = new Uint8Array(archiveSize);
  } catch {
    throw new Error("ZIP archive could not be allocated within ZIP32 limits.");
  }
  const view = new DataView(bytes.buffer);
  let offset = 0;

  for (const entry of entries) {
    offset = writeLocalRecord(view, bytes, offset, entry);
  }
  for (const entry of entries) {
    offset = writeCentralRecord(view, bytes, offset, entry);
  }

  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, entries.length, true);
  view.setUint16(offset + 10, entries.length, true);
  view.setUint32(offset + 12, centralSize, true);
  view.setUint32(offset + 16, localSize, true);
  view.setUint16(offset + 20, 0, true);
  return bytes;
}
