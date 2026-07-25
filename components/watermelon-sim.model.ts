/**
 * Model: pure, deterministic loop of blame pressure and dishonest reporting.
 * Problems flow in every sprint; only *reported* problems get fixed, and
 * pressure decides how much of reality makes it into the report.
 *
 * Kept apart from the sim component so the calibration this article rests on
 * (that the Watermelon preset really does settle green-outside-red-inside) is
 * assertable without mounting React.
 */

export type SimState = {
  p: number; // problems (0..100)
  tick: number; // elapsed "sprints"
};

const INFLOW = 3; // new problems per sprint
const FIX_RATE = 0.35; // fraction of *reported* problems fixed per sprint

// Unreported problems breed more problems. Calibrated so the Watermelon preset
// (70%) settles with the inside actually red (actual health < 40) while the
// badge still reads green off the reported bar; much below ~0.1 the inside
// only ever reaches amber and the preset breaks its own metaphor.
const HIDDEN_COMPOUND = 0.11;

export const DEFAULT_PRESSURE = 30;

// Below this actual health the team is firefighting and fix capacity decays.
// Without it the model has a false floor: every equilibrium pins reported
// health near 73 regardless of how rotten the inside is, because fixes must
// balance inflow. Must stay below the Watermelon preset's equilibrium actual
// health (~32) or that preset stops being sustainable.
const CRISIS_FLOOR = 25;

// Even a collapsed project keeps a sliver of fix capacity, so recovery exists:
// under low pressure, honest reports plus this sliver claw health back, slowly
// at first, then compounding. Must exceed INFLOW / (FIX_RATE * 100) = 0.086 or
// recovery can never start, and stay small enough that high blame pressure
// still holds a collapsed project down.
const RESIDUAL_CAPACITY = 0.1;

/** Archetype pressures, aligned by index with the localized preset labels. */
export const PRESETS = [0, 30, 70, 100] as const;

const clamp = (val: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, val));

/** How much of the truth survives the report at a given pressure and problem level. */
export function honesty(p: number, pressure: number): number {
  let h = 1 - 0.95 * (pressure / 100);
  // Truth leaks out near collapse: past p = 80 reality forces itself into the report.
  if (p > 80) h = Math.min(1, h + ((p - 80) / 20) * (1 - h));
  return h;
}

export function reportedProblems(p: number, pressure: number): number {
  return p * honesty(p, pressure);
}

/** Core simulation step: only reported problems get fixed; hidden ones compound. */
export function nextState(current: SimState, pressure: number): SimState {
  const rp = reportedProblems(current.p, pressure);
  const capacity = clamp(
    (100 - current.p) / CRISIS_FLOOR,
    RESIDUAL_CAPACITY,
    1,
  );
  const nextP = clamp(
    current.p +
      INFLOW +
      HIDDEN_COMPOUND * (current.p - rp) -
      FIX_RATE * rp * capacity,
  );
  return { p: nextP, tick: current.tick + 1 };
}

/**
 * The steady state for a blame pressure, where problem inflow and fixes balance.
 * Starting here means the default preset holds flat until the slider moves.
 */
export function settle(pressure: number): SimState {
  let s: SimState = { p: 0, tick: 0 };
  for (let i = 0; i < 2000; i++) s = nextState(s, pressure);
  return { ...s, tick: 0 };
}

let initial: SimState | undefined;

/**
 * The state the sim opens on, settled once per process rather than at import.
 * Computing it eagerly made every importer pay 2000 steps, including tests that
 * only read the surrounding prose.
 */
export function initialState(): SimState {
  return (initial ??= settle(DEFAULT_PRESSURE));
}

/**
 * The two numbers the sim draws: what is actually true, and what the report
 * claims. The gap between them is the whole point of the piece.
 */
export function readings(
  state: SimState,
  pressure: number,
): { actualHealth: number; reportedHealth: number } {
  return {
    actualHealth: 100 - state.p,
    reportedHealth: 100 - reportedProblems(state.p, pressure),
  };
}

export type Tone = "good" | "warn" | "bad";

export const healthTone = (v: number): Tone =>
  v > 70 ? "good" : v > 40 ? "warn" : "bad";

/**
 * Which line the log shows. A key rather than the line itself: the model has no
 * locale, and the sim's strings arrive per Locale from the content module.
 */
export type LogKey =
  | "honest"
  | "drifting"
  | "watermelon"
  | "collapse"
  | "recovery";

export function logKey(
  actualHealth: number,
  reportedHealth: number,
  pressure: number,
): LogKey {
  // Low health with low pressure is a project climbing out, not one held down:
  // low-pressure equilibria all sit far above these thresholds, so this state
  // only exists on the way up from a collapse.
  if (actualHealth < 15) return pressure > 50 ? "collapse" : "recovery";
  const gap = reportedHealth - actualHealth;
  if (gap < 5)
    return pressure <= 50 && actualHealth < 70 ? "recovery" : "honest";
  if (gap < 25) return "drifting";
  // The watermelon line makes literal color claims ("green outside, red
  // inside"), so it only fires when the bars actually show those tones;
  // in the amber in-between states the drifting line stays accurate.
  return healthTone(actualHealth) === "bad" &&
    healthTone(reportedHealth) === "good"
    ? "watermelon"
    : "drifting";
}
