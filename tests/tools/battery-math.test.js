import { test } from 'node:test';
import assert from 'node:assert';
import { estimateBatteryLife, formatBatteryLife, normalizeBatteryInputs } from '../../lib/tools/battery-math.js';

test('Battery Estimator - Default configuration', () => {
  const result = estimateBatteryLife({
    capacityMah: 2000,
    usableCapacityPercent: 100,
    activeCurrentMa: 120,
    activeDurationMs: 500,
    wifiEnabled: true,
    wifiCurrentMa: 140,
    wifiDurationMs: 2000,
    sleepCurrentUa: 10,
    sleepDurationSec: 300
  });

  assert.strictEqual(result.ok, true);
  assert.ok(Math.abs(result.cycleDurationSec - 302.5) < 0.001);
  assert.ok(Math.abs(result.cycleConsumptionMah - 0.095278) < 0.0001);
  assert.ok(Math.abs(result.averageCurrentMa - 1.13388) < 0.001);
  assert.ok(Math.abs(result.totalDays - 73.48) < 0.1);
});

test('Battery Estimator - Wi-Fi disabled', () => {
  const result = estimateBatteryLife({
    capacityMah: 2000,
    usableCapacityPercent: 100,
    activeCurrentMa: 100,
    activeDurationMs: 1000,
    wifiEnabled: false,
    sleepCurrentUa: 10,
    sleepDurationSec: 300
  });

  assert.strictEqual(result.ok, true);
  assert.ok(Math.abs(result.averageCurrentMa - 0.342) < 0.001);
  assert.ok(Math.abs(result.totalDays - 243.5) < 0.5);
  assert.strictEqual(result.phaseConsumptionMah.wifi, 0);
});

test('Battery Estimator - Zero capacity returns error', () => {
  const result = estimateBatteryLife({ capacityMah: 0 });
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.error, "INVALID_ENERGY_MODEL");
});

test('Battery Estimator - Microamps convert to milliamps correctly', () => {
  const result = estimateBatteryLife({
    capacityMah: 1000,
    usableCapacityPercent: 100,
    activeCurrentMa: 10,
    activeDurationMs: 1000,
    wifiEnabled: false,
    sleepCurrentUa: 500, // 0.5 mA
    sleepDurationSec: 1000
  });
  assert.strictEqual(result.ok, true);
  assert.ok(Math.abs(result.averageCurrentMa - 0.509) < 0.001);
});

test('formatBatteryLife - under 2 days shows hours as primary', () => {
  const formatted = formatBatteryLife(1.5);
  assert.strictEqual(formatted.primary, '36 hours');
  assert.strictEqual(formatted.secondary, '1.5 days');
});

test('formatBatteryLife - boundary at exactly 2 days switches to days as primary', () => {
  const justUnder = formatBatteryLife(1.999);
  const atBoundary = formatBatteryLife(2);
  assert.match(justUnder.primary, /hours$/);
  assert.match(atBoundary.primary, /days$/);
});

test('formatBatteryLife - between 2 and 90 days shows days as primary', () => {
  const formatted = formatBatteryLife(45);
  assert.strictEqual(formatted.primary, '45 days');
  assert.strictEqual(formatted.secondary, '1.5 months');
});

test('formatBatteryLife - boundary at exactly 90 days switches to years as primary', () => {
  const justUnder = formatBatteryLife(89.9);
  const atBoundary = formatBatteryLife(90);
  assert.match(justUnder.primary, /days$/);
  assert.match(atBoundary.primary, /years$/);
});

test('formatBatteryLife - 90 days or more shows years as primary', () => {
  const formatted = formatBatteryLife(730.5);
  assert.strictEqual(formatted.primary, '2.0 years');
  assert.strictEqual(formatted.secondary, '731 days');
});

test('normalizeBatteryInputs - clamps capacity to the 0-50000 mAh range', () => {
  assert.strictEqual(normalizeBatteryInputs({ capacityMah: -100 }).capacityMah, 0);
  assert.strictEqual(normalizeBatteryInputs({ capacityMah: 999999 }).capacityMah, 50000);
  assert.strictEqual(normalizeBatteryInputs({ capacityMah: 50000 }).capacityMah, 50000);
});

test('normalizeBatteryInputs - clamps usable capacity percent to 10-100', () => {
  assert.strictEqual(normalizeBatteryInputs({ usableCapacityPercent: 0 }).usableCapacityPercent, 10);
  assert.strictEqual(normalizeBatteryInputs({ usableCapacityPercent: 500 }).usableCapacityPercent, 100);
});

test('normalizeBatteryInputs - clamps sleep duration to 0-604800 seconds (one week)', () => {
  assert.strictEqual(normalizeBatteryInputs({ sleepDurationSec: -1 }).sleepDurationSec, 0);
  assert.strictEqual(normalizeBatteryInputs({ sleepDurationSec: 1_000_000 }).sleepDurationSec, 604800);
});

test('normalizeBatteryInputs - falls back to defaults for non-numeric input', () => {
  const normalized = normalizeBatteryInputs({ capacityMah: 'not-a-number' });
  assert.strictEqual(normalized.capacityMah, 2000);
});
