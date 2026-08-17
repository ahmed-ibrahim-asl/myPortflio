const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export function createPidEngine() {
  let state = {
    timeSec: 0,
    position: 0,
    velocity: 0,
    integralError: 0,
    previousPosition: 0,
    peakPosition: 0,
    history: []
  };
  
  return {
    step({
      dt,
      mass,
      damping = 0.8,
      target,
      kp,
      ki,
      kd,
      maxForce = 50,
      plant = "mass-spring",
      thermalTau = 8
    }) {
      const error = target - state.position;

      const integralLimit = 50; // simple windup protection
      state.integralError = clamp(state.integralError + error * dt, -integralLimit, integralLimit);

      const measurementDerivative = (state.position - state.previousPosition) / dt;

      let force = (kp * error) + (ki * state.integralError) - (kd * measurementDerivative);
      force = clamp(force, -maxForce, maxForce);

      if (plant === "thermal") {
        // First-order lag (e.g. a heater warming toward its commanded power): the plant has
        // no inertia of its own, it just relaxes toward `force` at a rate set by thermalTau.
        // This is what makes a thermal system feel slower and smoother than a mass-spring one
        // even with identical gains — there is no momentum to overshoot with.
        state.velocity = (force - state.position) / thermalTau;
        state.position += state.velocity * dt;
      } else {
        const acceleration = (force - (damping * state.velocity)) / mass;
        state.velocity += acceleration * dt;
        state.position += state.velocity * dt;
      }

      state.previousPosition = state.position;
      state.timeSec += dt;

      if (state.position > state.peakPosition) {
        state.peakPosition = state.position;
      }

      return { ...state };
    },
    pushHistory(sample) {
      state.history.push({ t: sample.timeSec, position: sample.position, target: sample.target });
      if (state.history.length > 300) {
        state.history.shift();
      }
    },
    reset() {
      state = {
        timeSec: 0,
        position: 0,
        velocity: 0,
        integralError: 0,
        previousPosition: 0,
        peakPosition: 0,
        history: []
      };
    },
    resetPeak() {
      state.peakPosition = state.position;
    },
    getState() {
      return { ...state };
    }
  };
}

export function calculatePidMetrics({ state, target, travelStartPos }) {
  const EPSILON = 0.0001;
  const travel = Math.abs(target - travelStartPos);
  
  let overshootPercent = 0;
  if (travel > EPSILON) {
    const overshoot = Math.max(0, state.peakPosition - target);
    overshootPercent = (overshoot / travel) * 100;
  }
  
  // Steady state error is mean absolute error over the last 1 second (which is ~30 history samples)
  let steadyStateError = 0;
  if (state.history.length > 0) {
    const recent = state.history.slice(-30);
    const sumErr = recent.reduce((sum, h) => sum + Math.abs(target - h.position), 0);
    steadyStateError = sumErr / recent.length;
  }
  
  return { overshootPercent, steadyStateError };
}
