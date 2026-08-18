import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const catalogUrl = new URL("../../data/calculators.js", import.meta.url);
const registryUrl = new URL("../../components/tools/calculators/index.js", import.meta.url);

test("all 36 completed calculators are present and registered", async () => {
  assert.equal(existsSync(catalogUrl), true, "calculator catalog must be restored");
  assert.equal(existsSync(registryUrl), true, "calculator component registry must be restored");

  const { calculators } = await import(catalogUrl.href);
  const registrySource = readFileSync(registryUrl, "utf8");
  const componentFiles = (
    await readdir(new URL("../../components/tools/calculators/", import.meta.url))
  ).filter((name) => name.endsWith(".js") && name !== "index.js");

  assert.equal(calculators.length, 36);
  assert.equal(new Set(calculators.map(({ slug }) => slug)).size, 36);
  assert.equal(componentFiles.length, 36);
  for (const { slug } of calculators) {
    assert.match(
      registrySource,
      new RegExp(`[\"]${slug}[\"]\\s*:`),
      `${slug} must be registered`
    );
  }
});

test("restored utility modules retain representative behavior", async () => {
  const unitsUrl = new URL("../../lib/units.js", import.meta.url);
  const resistorUrl = new URL("../../lib/resistorColors.js", import.meta.url);
  const numbersUrl = new URL("../../lib/numberSystems.js", import.meta.url);
  assert.equal(existsSync(unitsUrl), true);
  assert.equal(existsSync(resistorUrl), true);
  assert.equal(existsSync(numbersUrl), true);

  const [{ formatEngineering }, { formatOhms }, numbers] = await Promise.all([
    import(unitsUrl.href),
    import(resistorUrl.href),
    import(numbersUrl.href)
  ]);
  assert.equal(formatEngineering(0.000001, "F"), "1 µF");
  assert.equal(formatOhms(4700), "4.7 kΩ");
  assert.equal(numbers.toBinaryString(10, 8), "00001010");
  assert.equal(numbers.twosComplement(1, 8), 255);
  assert.equal(numbers.asciiToHex("Hi"), "48 69");
  assert.equal(numbers.hexToAscii("48 69"), "Hi");
});
