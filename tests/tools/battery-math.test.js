import { test } from 'node:test';
import assert from 'node:assert';
import { estimateBatteryLife } from '../../lib/tools/battery-math.js';

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
