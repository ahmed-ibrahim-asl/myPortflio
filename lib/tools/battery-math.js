export function normalizeBatteryInputs(rawInputs) {
  const getNum = (val, def) => (val !== undefined && val !== null && !isNaN(val)) ? Number(val) : def;
  return {
    capacityMah: Math.max(0, Math.min(50000, getNum(rawInputs.capacityMah, 2000))),
    usableCapacityPercent: Math.max(10, Math.min(100, getNum(rawInputs.usableCapacityPercent, 100))),
    activeCurrentMa: Math.max(0, Math.min(1000, getNum(rawInputs.activeCurrentMa, 120))),
    activeDurationMs: Math.max(0, Math.min(60000, getNum(rawInputs.activeDurationMs, 500))),
    wifiEnabled: Boolean(rawInputs.wifiEnabled),
    wifiCurrentMa: Math.max(0, Math.min(1000, getNum(rawInputs.wifiCurrentMa, 140))),
    wifiDurationMs: Math.max(0, Math.min(60000, getNum(rawInputs.wifiDurationMs, 2000))),
    sleepCurrentUa: Math.max(0, Math.min(100000, getNum(rawInputs.sleepCurrentUa, 10))),
    sleepDurationSec: Math.max(0, Math.min(604800, getNum(rawInputs.sleepDurationSec, 300)))
  };
}

export function estimateBatteryLife(rawInputs) {
  const inputs = normalizeBatteryInputs(rawInputs);

  const activeSec = inputs.activeDurationMs / 1000;
  const wifiSec = inputs.wifiEnabled ? inputs.wifiDurationMs / 1000 : 0;
  const sleepSec = inputs.sleepDurationSec;

  const effectiveCapacityMah = inputs.capacityMah * (inputs.usableCapacityPercent / 100);

  const activeMah = (inputs.activeCurrentMa * activeSec) / 3600;
  const wifiMah = inputs.wifiEnabled ? (inputs.wifiCurrentMa * wifiSec) / 3600 : 0;
  const sleepCurrentMa = inputs.sleepCurrentUa / 1000;
  const sleepMah = (sleepCurrentMa * sleepSec) / 3600;

  const cycleDurationSec = activeSec + wifiSec + sleepSec;
  const cycleConsumptionMah = activeMah + wifiMah + sleepMah;

  if (cycleDurationSec <= 0 || cycleConsumptionMah <= 0 || effectiveCapacityMah <= 0) {
    return { ok: false, error: "INVALID_ENERGY_MODEL" };
  }

  const cycleCount = effectiveCapacityMah / cycleConsumptionMah;
  const totalHours = (cycleCount * cycleDurationSec) / 3600;
  const averageCurrentMa = (cycleConsumptionMah / cycleDurationSec) * 3600;

  return {
    ok: true,
    totalHours,
    totalDays: totalHours / 24,
    totalMonths: totalHours / 24 / 30.44,
    averageCurrentMa,
    cycleDurationSec,
    cycleConsumptionMah,
    cyclesPerDay: 86400 / cycleDurationSec,
    activeTimePercent: (activeSec / cycleDurationSec) * 100,
    wifiTimePercent: (wifiSec / cycleDurationSec) * 100,
    sleepTimePercent: (sleepSec / cycleDurationSec) * 100,
    phaseConsumptionMah: {
      active: activeMah,
      wifi: wifiMah,
      sleep: sleepMah
    }
  };
}

export function formatBatteryLife(totalDays) {
  if (totalDays < 2) {
    return {
      primary: `${Math.round(totalDays * 24)} hours`,
      secondary: `${totalDays.toFixed(1)} days`
    };
  }
  if (totalDays < 90) {
    return {
      primary: `${Math.round(totalDays)} days`,
      secondary: `${(totalDays / 30.44).toFixed(1)} months`
    };
  }
  return {
    primary: `${(totalDays / 365.25).toFixed(1)} years`,
    secondary: `${Math.round(totalDays)} days`
  };
}
