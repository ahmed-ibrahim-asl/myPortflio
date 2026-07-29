import { test } from "node:test";
import assert from "node:assert/strict";

import {
  encodeStoredZip,
} from "../../lib/tools/ml-generator/model-mission/stored-zip.js";

const decoder = new TextDecoder("utf-8", { fatal: true });

function signatureAt(view, offset, expected) {
  assert.equal(view.getUint32(offset, true), expected);
}

function parseStoredZip(bytes) {
  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  assert.ok(bytes.byteLength >= 22, "archive includes an EOCD record");
  const eocdOffset = bytes.byteLength - 22;
  signatureAt(view, eocdOffset, 0x06054b50);
  assert.equal(view.getUint16(eocdOffset + 4, true), 0);
  assert.equal(view.getUint16(eocdOffset + 6, true), 0);
  const diskCount = view.getUint16(eocdOffset + 8, true);
  const totalCount = view.getUint16(eocdOffset + 10, true);
  assert.equal(diskCount, totalCount);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  assert.equal(view.getUint16(eocdOffset + 20, true), 0);
  assert.equal(centralOffset + centralSize, eocdOffset);

  const entries = [];
  let offset = centralOffset;
  for (let index = 0; index < totalCount; index += 1) {
    signatureAt(view, offset, 0x02014b50);
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const dosTime = view.getUint16(offset + 12, true);
    const dosDate = view.getUint16(offset + 14, true);
    const crc32 = view.getUint32(offset + 16, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
    const name = decoder.decode(nameBytes);

    assert.equal(flags, 0x0800, `${name} uses the UTF-8 flag`);
    assert.equal(method, 0, `${name} is stored without compression`);
    assert.equal(dosTime, 0, `${name} has a fixed DOS time`);
    assert.equal(dosDate, 0x0021, `${name} has a fixed DOS date`);
    assert.equal(compressedSize, size);
    assert.equal(extraLength, 0);
    assert.equal(commentLength, 0);
    signatureAt(view, localOffset, 0x04034b50);
    assert.equal(view.getUint16(localOffset + 6, true), flags);
    assert.equal(view.getUint16(localOffset + 8, true), method);
    assert.equal(view.getUint16(localOffset + 10, true), dosTime);
    assert.equal(view.getUint16(localOffset + 12, true), dosDate);
    assert.equal(view.getUint32(localOffset + 14, true), crc32);
    assert.equal(view.getUint32(localOffset + 18, true), compressedSize);
    assert.equal(view.getUint32(localOffset + 22, true), size);
    assert.equal(view.getUint16(localOffset + 26, true), nameLength);
    assert.equal(view.getUint16(localOffset + 28, true), 0);
    assert.deepEqual(
      bytes.slice(localOffset + 30, localOffset + 30 + nameLength),
      nameBytes,
    );
    const dataOffset = localOffset + 30 + nameLength;
    entries.push({
      name,
      nameBytes,
      flags,
      method,
      crc32,
      size,
      localOffset,
      data: bytes.slice(dataOffset, dataOffset + size),
    });
    offset += 46 + nameLength;
  }
  assert.equal(offset, eocdOffset);
  return entries;
}

test("stored ZIP contains valid local and central directory records", () => {
  const bytes = encodeStoredZip({
    "README.md": "# Ready\n",
    "src/train.py": "print('ready')\n",
  });
  const entries = parseStoredZip(bytes);

  assert.deepEqual(
    entries.map(({ name }) => name),
    ["README.md", "src/train.py"],
  );
  assert.equal(decoder.decode(entries[0].data), "# Ready\n");
  assert.equal(decoder.decode(entries[1].data), "print('ready')\n");
  assert.equal(entries[0].localOffset, 0);
  assert.equal(
    entries[1].localOffset,
    30 + entries[0].nameBytes.length + entries[0].size,
  );
});

test("stored ZIP encodes an empty archive", () => {
  const bytes = encodeStoredZip({});
  const view = new DataView(bytes.buffer);

  assert.equal(bytes.byteLength, 22);
  assert.equal(view.getUint32(0, true), 0x06054b50);
  assert.equal(view.getUint16(8, true), 0);
  assert.equal(view.getUint16(10, true), 0);
  assert.equal(view.getUint32(12, true), 0);
  assert.equal(view.getUint32(16, true), 0);
});

test("stored ZIP bytes are deterministic regardless of input key order", () => {
  const first = encodeStoredZip({
    "z-last.txt": "last",
    "a-first.txt": "first",
  });
  const second = encodeStoredZip({
    "a-first.txt": "first",
    "z-last.txt": "last",
  });

  assert.deepEqual(first, second);
  assert.deepEqual(
    parseStoredZip(first).map(({ name }) => name),
    ["a-first.txt", "z-last.txt"],
  );
});

test("stored ZIP encodes UTF-8 filenames and empty or binary payloads", () => {
  const binary = new Uint8Array([0, 1, 2, 127, 128, 255]);
  const entries = parseStoredZip(encodeStoredZip({
    "empty.bin": new Uint8Array(),
    "images/píxel-☃.bin": binary,
  }));

  assert.deepEqual(entries[0].data, new Uint8Array());
  assert.equal(entries[0].crc32, 0);
  assert.equal(entries[1].name, "images/píxel-☃.bin");
  assert.deepEqual(entries[1].data, binary);
});

test("stored ZIP writes known CRC32 values", () => {
  const [entry] = parseStoredZip(encodeStoredZip({
    "checksum.txt": "123456789",
  }));

  assert.equal(entry.crc32, 0xcbf43926);
  assert.equal(entry.size, 9);
});

test("stored ZIP does not mutate or alias input values", () => {
  const binary = new Uint8Array([10, 20, 30]);
  const files = {
    "b.bin": binary,
    "a.txt": "ready",
  };
  const originalKeys = Object.keys(files);
  const bytes = encodeStoredZip(files);

  assert.deepEqual(Object.keys(files), originalKeys);
  assert.deepEqual(binary, new Uint8Array([10, 20, 30]));
  binary[0] = 99;
  const archivedBinary = parseStoredZip(bytes)
    .find(({ name }) => name === "b.bin").data;
  assert.deepEqual(archivedBinary, new Uint8Array([10, 20, 30]));
  bytes.fill(0);
  assert.deepEqual(binary, new Uint8Array([99, 20, 30]));
});

test("stored ZIP rejects unsafe or ambiguous entry paths", () => {
  const unsafePaths = [
    "",
    "/absolute.txt",
    "C:/drive.txt",
    "C:\\drive.txt",
    "\\\\server\\share.txt",
    "../escape.txt",
    "safe/../escape.txt",
    "safe\\..\\escape.txt",
    "./dot.txt",
    "safe/./dot.txt",
    "safe//empty.txt",
    "trailing/",
    "back\\slash.txt",
    "colon:name.txt",
    "control\u0000.txt",
    "line\nbreak.txt",
    "unicode-control\u0085.txt",
  ];

  for (const path of unsafePaths) {
    assert.throws(
      () => encodeStoredZip({ [path]: "unsafe" }),
      /safe relative ZIP path/i,
      path,
    );
  }
});

test("stored ZIP rejects unsupported values and ZIP32 limits", () => {
  assert.throws(
    () => encodeStoredZip({ "value.txt": /** @type {any} */ ({}) }),
    /string or Uint8Array/i,
  );
  assert.throws(
    () => encodeStoredZip({
      [`${"a".repeat(65_536)}.txt`]: "",
    }),
    /ZIP32 filename length/i,
  );

  const tooManyFiles = {};
  for (let index = 0; index < 65_536; index += 1) {
    tooManyFiles[`file-${index}`] = "";
  }
  assert.throws(
    () => encodeStoredZip(tooManyFiles),
    /ZIP32 entry count/i,
  );
});
