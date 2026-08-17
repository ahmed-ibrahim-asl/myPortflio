import { test } from 'node:test';
import assert from 'node:assert';
import { createPidEngine, calculatePidMetrics } from '../../lib/tools/pid-physics.js';

test('PID Engine - Zero gains produce no force', () => {
  const engine = createPidEngine();
  const state = engine.step({
    dt: 0.016,
    mass: 1,
    damping: 0,
    target: 50,
    kp: 0,
    ki: 0,
    kd: 0
  });
  
  assert.strictEqual(state.position, 0);
  assert.strictEqual(state.velocity, 0);
});

test('PID Engine - Positive Kp moves mass toward target', () => {
  const engine = createPidEngine();
  const state = engine.step({
    dt: 0.1,
    mass: 1,
    damping: 0,
    target: 50,
    kp: 1,
    ki: 0,
    kd: 0
  });
  
  assert.ok(state.velocity > 0);
  assert.ok(state.position > 0);
});

test('PID Engine - Output clamp limits force', () => {
  const engine = createPidEngine();
  const state = engine.step({
    dt: 0.1,
    mass: 1,
    damping: 0,
    target: 100,
    kp: 100, // Very high kp
    ki: 0,
    kd: 0,
    maxForce: 5 // Clamp at 5
  });
  
  // F = ma => a = F/m = 5/1 = 5
  // v = a * dt = 5 * 0.1 = 0.5
  assert.ok(Math.abs(state.velocity - 0.5) < 0.001);
});

test('PID Engine - Reset restores state', () => {
  const engine = createPidEngine();
  engine.step({ dt: 0.1, mass: 1, damping: 0, target: 50, kp: 1, ki: 0, kd: 0 });
  
  engine.reset();
  const state = engine.getState();
  
  assert.strictEqual(state.timeSec, 0);
  assert.strictEqual(state.position, 0);
  assert.strictEqual(state.velocity, 0);
  assert.strictEqual(state.integralError, 0);
  assert.deepStrictEqual(state.history, []);
});

test('PID Engine - thermal plant never overshoots (no momentum to carry past the target)', () => {
  const engine = createPidEngine();
  let state;
  let peak = 0;
  for (let i = 0; i < 400; i += 1) {
    state = engine.step({
      dt: 1 / 60,
      target: 50,
      kp: 2,
      ki: 0,
      kd: 0,
      plant: 'thermal',
      thermalTau: 4
    });
    peak = Math.max(peak, state.position);
  }
  // A P-only controller still leaves steady-state error on the thermal plant too (force
  // settles where force === position, i.e. kp*(target-p) === p => p = kp*target/(1+kp) = 33.33
  // for kp=2, target=50) — the thermal plant changes overshoot behavior, not this.
  assert.ok(Math.abs(state.position - 33.33) < 0.5, `expected P-only steady state near 33.33, got ${state.position}`);
  assert.ok(peak <= 50 + 0.01, `expected no overshoot past target, got peak ${peak}`);
});

test('PID Engine - adding Ki lets the thermal plant reach the target despite no overshoot risk', () => {
  // ki must be large enough that the integral needed to sustain force === target at equilibrium
  // (integralError = target / ki, since kp's own contribution is 0 once error reaches 0) stays
  // under the engine's fixed anti-windup clamp of 50 — otherwise the integrator saturates before
  // closing the gap, which is itself a real, correct control-systems interaction (see the
  // windup-saturation test below), just not the one this test is demonstrating.
  const engine = createPidEngine();
  let state;
  for (let i = 0; i < 3000; i += 1) {
    state = engine.step({
      dt: 1 / 60,
      target: 50,
      kp: 2,
      ki: 2,
      kd: 0,
      plant: 'thermal',
      thermalTau: 4
    });
  }
  assert.ok(Math.abs(state.position - 50) < 1, `expected Ki to close the remaining gap, got ${state.position}`);
});

test('PID Engine - integral windup can saturate against the anti-windup clamp before reaching the target', () => {
  // With kp=2, ki=0.5, target=50: closing the gap fully would require integralError = 100
  // (since force must equal 50 at equilibrium and kp's contribution is 0 once error is 0,
  // so 0.5 * integralError = 50), but integralError is clamped to +/-50 — so the system
  // permanently stalls short of the target, not because it needs more simulated time.
  const engine = createPidEngine();
  let state;
  for (let i = 0; i < 3000; i += 1) {
    state = engine.step({
      dt: 1 / 60,
      target: 50,
      kp: 2,
      ki: 0.5,
      kd: 0,
      plant: 'thermal',
      thermalTau: 4
    });
  }
  assert.ok(state.position < 45, `expected windup saturation to stall well short of target, got ${state.position}`);
  assert.strictEqual(state.integralError, 50, 'expected the integral term to be pinned at its clamp');
});

test('PID Engine - a smaller thermal time constant reaches the target faster', () => {
  const runFor = (steps, thermalTau) => {
    const engine = createPidEngine();
    let state;
    for (let i = 0; i < steps; i += 1) {
      state = engine.step({ dt: 1 / 60, target: 50, kp: 2, ki: 0, kd: 0, plant: 'thermal', thermalTau });
    }
    return state.position;
  };

  const fast = runFor(60, 2);
  const slow = runFor(60, 20);
  assert.ok(fast > slow, `expected tau=2 (${fast}) to lead tau=20 (${slow}) after the same elapsed time`);
});

test('calculatePidMetrics - zero travel avoids a divide-by-zero and reports no overshoot', () => {
  const metrics = calculatePidMetrics({
    state: { peakPosition: 0, history: [] },
    target: 50,
    travelStartPos: 50
  });
  assert.strictEqual(metrics.overshootPercent, 0);
});

test('calculatePidMetrics - peak position below the target reports zero overshoot, not negative', () => {
  const metrics = calculatePidMetrics({
    state: { peakPosition: 40, history: [] },
    target: 50,
    travelStartPos: 0
  });
  assert.strictEqual(metrics.overshootPercent, 0);
});

test('calculatePidMetrics - overshoot percent is measured against the distance travelled', () => {
  const metrics = calculatePidMetrics({
    state: { peakPosition: 60, history: [] },
    target: 50,
    travelStartPos: 0
  });
  assert.ok(Math.abs(metrics.overshootPercent - 20) < 0.001);
});

test('calculatePidMetrics - steady-state error is the mean absolute error of recent history', () => {
  const metrics = calculatePidMetrics({
    state: {
      peakPosition: 50,
      history: [
        { position: 48, target: 50 },
        { position: 52, target: 50 }
      ]
    },
    target: 50,
    travelStartPos: 0
  });
  assert.ok(Math.abs(metrics.steadyStateError - 2) < 0.001);
});

test('calculatePidMetrics - only the most recent 30 history samples count toward steady-state error', () => {
  const staleNoise = Array.from({ length: 5 }, () => ({ position: 0, target: 50 })); // error = 50
  const settled = Array.from({ length: 30 }, () => ({ position: 50, target: 50 })); // error = 0
  const metrics = calculatePidMetrics({
    state: { peakPosition: 50, history: [...staleNoise, ...settled] },
    target: 50,
    travelStartPos: 0
  });
  assert.strictEqual(metrics.steadyStateError, 0);
});
