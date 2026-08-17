import { test } from 'node:test';
import assert from 'node:assert';
import { BATTERY_CHIP_PRESETS, getBatteryChipPreset } from '../../lib/tools/battery-presets.js';

test('BATTERY_CHIP_PRESETS - every preset has a unique id and a label', () => {
  const ids = BATTERY_CHIP_PRESETS.map((preset) => preset.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const preset of BATTERY_CHIP_PRESETS) {
    assert.ok(preset.label && preset.label.length > 0, `${preset.id} needs a label`);
    assert.ok(preset.sourceNote && preset.sourceNote.length > 0, `${preset.id} needs a sourceNote`);
  }
});

test('BATTERY_CHIP_PRESETS - numeric presets have devBoardUa greater than bareChipUa', () => {
  for (const preset of BATTERY_CHIP_PRESETS) {
    if (typeof preset.bareChipUa !== 'number') continue;
    assert.ok(
      preset.devBoardUa > preset.bareChipUa,
      `${preset.id}: dev-board current should exceed the bare-chip datasheet figure`
    );
  }
});

test('BATTERY_CHIP_PRESETS - presets without a verified figure expose null rather than a guessed number', () => {
  const nrf52840 = getBatteryChipPreset('nrf52840');
  assert.strictEqual(nrf52840.bareChipUa, null);
  assert.strictEqual(nrf52840.devBoardUa, null);
});

test('getBatteryChipPreset - returns null for an unknown id', () => {
  assert.strictEqual(getBatteryChipPreset('does-not-exist'), null);
});

test('getBatteryChipPreset - returns the matching preset', () => {
  const preset = getBatteryChipPreset('esp32-c3');
  assert.strictEqual(preset.label, 'ESP32-C3');
  assert.strictEqual(preset.bareChipUa, 5);
});
