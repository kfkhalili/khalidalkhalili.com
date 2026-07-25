/**
 * Model: pure, deterministic stock-and-flow of technical debt.
 * Ported 1:1 from the original vanilla-JS sim; the reducer is unchanged.
 *
 * Kept apart from the sim component so the article's actual claims (that 30% is
 * a true steady state, that neglect compounds) are assertable without mounting
 * React. Nothing here imports the view, the strings, or the clock.
 */

export type SimState = {
  tdr: number; // technical-debt ratio (0–100)
  velocity: number; // feature throughput (0–100)
  morale: number; // team morale (0–100)
  tick: number; // elapsed "weeks"
};

const BASE_DEBT_GROWTH = 2.0;
const INTEREST_EXPONENT = 1.04; // debt compounds: interest rises with TDR

/** "Sustainable": the allocation the sim opens on. */
export const DEFAULT_RATE = 30;

/** The healthy debt level Sustainable is meant to hold flat. */
export const BASELINE_TDR = 10;

// Calibrate refactoring efficiency so the Sustainable allocation is a *true* steady
// state at a healthy debt level: pick the value where, at r = DEFAULT_RATE and
// TDR = BASELINE_TDR, new debt exactly cancels paid-down debt
// (inflow === outflow). This is what makes 30% actually sustainable: the bars hold
// flat and green, instead of drifting up to a higher, amber equilibrium.
const REFACTOR_EFFICIENCY =
  ((1 - DEFAULT_RATE / 100) * BASE_DEBT_GROWTH * (1 + BASELINE_TDR / 100)) /
  ((DEFAULT_RATE / 100) * Math.pow(INTEREST_EXPONENT, BASELINE_TDR));

/** Archetype allocations, aligned by index with the localized preset labels. */
export const PRESETS = [10, 30, 50, 80] as const;

const clamp = (val: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, val));

/** Core simulation step: the battle between entropy (inflow) and investment (outflow). */
export function nextState(current: SimState, refactorRate: number): SimState {
  const r = refactorRate / 100;

  // Compound interest: as TDR grows, existing debt gets exponentially heavier.
  const complexityFactor = Math.pow(INTEREST_EXPONENT, current.tdr);

  // Inflow: new debt from feature work. Outflow: debt paid down by refactoring.
  const debtInflow = (1 - r) * BASE_DEBT_GROWTH * (1 + current.tdr / 100);
  const debtOutflow = r * REFACTOR_EFFICIENCY * complexityFactor;

  const nextTdr = clamp(current.tdr + debtInflow - debtOutflow);

  // Velocity = 100% − time spent refactoring − drag from accumulated debt.
  const debtDrag = nextTdr * 0.8;
  const nextVelocity = clamp(100 - refactorRate * 1.0 - debtDrag);

  // Morale hates slow velocity (0.6) and bad code (0.4).
  const velocityPenalty = (100 - nextVelocity) * 0.6;
  const codeQualityPenalty = nextTdr * 0.4;
  const nextMorale = clamp(100 - velocityPenalty - codeQualityPenalty);

  return {
    tdr: nextTdr,
    velocity: nextVelocity,
    morale: nextMorale,
    tick: current.tick + 1,
  };
}

/**
 * The steady state for a refactor rate, where debt inflow and outflow balance.
 * Starting the sim here means the default (Sustainable) allocation holds flat:
 * the bars don't move until you change the slider. Previously the sim opened on
 * arbitrary "healthy" numbers (TDR 10 / velocity 80) that then drifted toward
 * this equilibrium, which read as the sustainable strategy decaying on its own.
 */
export function settle(refactorRate: number): SimState {
  let s: SimState = { tdr: 0, velocity: 100, morale: 100, tick: 0 };
  for (let i = 0; i < 2000; i++) s = nextState(s, refactorRate);
  return { ...s, tick: 0 };
}

let initial: SimState | undefined;

/**
 * The state the sim opens on, settled once per process rather than at import.
 * Computing it eagerly made every importer pay 2000 steps, including tests that
 * only read the surrounding prose.
 */
export function initialState(): SimState {
  return (initial ??= settle(DEFAULT_RATE));
}

export type Tone = "good" | "warn" | "bad";

export const velocityTone = (v: number): Tone =>
  v > 60 ? "good" : v > 30 ? "warn" : "bad";
export const tdrTone = (v: number): Tone =>
  v < 20 ? "good" : v < 50 ? "warn" : "bad";
export const moraleTone = (v: number): Tone =>
  v > 70 ? "good" : v > 40 ? "warn" : "bad";

/**
 * Which line the log shows. A key rather than the line itself: the model has no
 * locale, and the sim's strings arrive per Locale from the content module.
 */
export type LogKey = "critical" | "warning" | "stalled" | "healthy" | "normal";

export function logKey(state: SimState): LogKey {
  if (state.tdr >= 80) return "critical";
  if (state.tdr >= 40) return "warning";
  if (state.velocity < 20) return "stalled";
  if (state.tdr < 10 && state.velocity > 60) return "healthy";
  return "normal";
}
