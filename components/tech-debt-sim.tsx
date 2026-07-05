"use client";

import { useEffect, useRef, useState } from "react";
import type { SimStrings } from "@/components/explorables/technical-debt.content";

/* ---------------------------------------------------------------------------
   Model: pure, deterministic stock-and-flow of technical debt.
   Ported 1:1 from the original vanilla-JS sim; the reducer is unchanged.
--------------------------------------------------------------------------- */

type SimState = {
  tdr: number; // technical-debt ratio (0–100)
  velocity: number; // feature throughput (0–100)
  morale: number; // team morale (0–100)
  tick: number; // elapsed "weeks"
};

const BASE_DEBT_GROWTH = 2.0;
const TICK_MS = 1000;
const MIN_BAR_PCT = 12;
const INTEREST_EXPONENT = 1.04; // debt compounds: interest rises with TDR
const DEFAULT_RATE = 30; // "Sustainable": the allocation the sim opens on
const BASELINE_TDR = 10; // the healthy debt level Sustainable is meant to hold flat

// Calibrate refactoring efficiency so the Sustainable allocation is a *true* steady
// state at a healthy debt level: pick the value where, at r = DEFAULT_RATE and
// TDR = BASELINE_TDR, new debt exactly cancels paid-down debt
// (inflow === outflow). This is what makes 30% actually sustainable: the bars hold
// flat and green, instead of drifting up to a higher, amber equilibrium.
const REFACTOR_EFFICIENCY =
  ((1 - DEFAULT_RATE / 100) * BASE_DEBT_GROWTH * (1 + BASELINE_TDR / 100)) /
  ((DEFAULT_RATE / 100) * Math.pow(INTEREST_EXPONENT, BASELINE_TDR));

const clamp = (val: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, val));

/** Core simulation step: the battle between entropy (inflow) and investment (outflow). */
function nextState(current: SimState, refactorRate: number): SimState {
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

function getLogMessage(state: SimState, log: SimStrings["log"]): string {
  if (state.tdr >= 80) return log.critical;
  if (state.tdr >= 40) return log.warning;
  if (state.velocity < 20) return log.stalled;
  if (state.tdr < 10 && state.velocity > 60) return log.healthy;
  return log.normal;
}

/**
 * The steady state for a refactor rate, where debt inflow and outflow balance.
 * Starting the sim here means the default (Sustainable) allocation holds flat:
 * the bars don't move until you change the slider. Previously the sim opened on
 * arbitrary "healthy" numbers (TDR 10 / velocity 80) that then drifted toward
 * this equilibrium, which read as the sustainable strategy decaying on its own.
 */
function settle(refactorRate: number): SimState {
  let s: SimState = { tdr: 0, velocity: 100, morale: 100, tick: 0 };
  for (let i = 0; i < 2000; i++) s = nextState(s, refactorRate);
  return { ...s, tick: 0 };
}

const INITIAL: SimState = settle(DEFAULT_RATE);

// Archetype allocations, aligned by index with the localized preset labels.
const PRESETS = [10, 30, 50, 80] as const;

type Tone = "good" | "warn" | "bad";
const TONE_BG: Record<Tone, string> = {
  good: "var(--sim-good)",
  warn: "var(--sim-warn)",
  bad: "var(--sim-bad)",
};

const velocityTone = (v: number): Tone =>
  v > 60 ? "good" : v > 30 ? "warn" : "bad";
const tdrTone = (v: number): Tone => (v < 20 ? "good" : v < 50 ? "warn" : "bad");
const moraleTone = (v: number): Tone =>
  v > 70 ? "good" : v > 40 ? "warn" : "bad";

/* ---------------------------------------------------------------------------
   View
--------------------------------------------------------------------------- */

function Bar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  const rounded = Math.round(value);
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex h-36 w-full items-end">
        <div
          className="flex w-full justify-center rounded-t-md pt-1 text-xs font-semibold transition-[height,background-color] duration-300 ease-out"
          style={{
            height: `${Math.max(MIN_BAR_PCT, value)}%`,
            backgroundColor: TONE_BG[tone],
            color: tone === "warn" ? "#1b1b19" : "#ffffff",
          }}
        >
          {/* Remounting via key replays the pulse animation on each change. */}
          <span key={rounded} className="sim-pulse tabular-nums">
            {rounded}
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs text-muted">{label}</span>
    </div>
  );
}

export function TechDebtSim({ strings }: { strings: SimStrings }) {
  const [state, setState] = useState<SimState>(INITIAL);
  const [refactorRate, setRefactorRate] = useState(DEFAULT_RATE);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const rateRef = useRef(refactorRate);
  rateRef.current = refactorRate; // interval always reads the latest rate

  // Pause the loop when scrolled off-screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause the loop when the tab is hidden.
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = onScreen && tabVisible;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setState((s) => nextState(s, rateRef.current)),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [running]);

  return (
    <div
      ref={containerRef}
      className="not-prose rounded-xl border border-border bg-card p-5 font-mono sm:p-6"
    >
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="text-muted">{strings.allocation}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {refactorRate}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={refactorRate}
          onChange={(e) => setRefactorRate(parseInt(e.target.value, 10))}
          className="sim-range mt-3 w-full"
          aria-label={strings.allocationAria}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((value, i) => {
          const active = refactorRate === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRefactorRate(value)}
              className={
                "rounded-md border px-2.5 py-1 text-xs transition-colors " +
                (active
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-border text-muted hover:text-foreground")
              }
            >
              {strings.presets[i]} <span className="text-faint">{value}%</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Bar label={strings.bars[0]} value={state.velocity} tone={velocityTone(state.velocity)} />
        <Bar label={strings.bars[1]} value={state.tdr} tone={tdrTone(state.tdr)} />
        <Bar label={strings.bars[2]} value={state.morale} tone={moraleTone(state.morale)} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>
          {strings.week} {state.tick}
        </span>
        <span className="text-faint">
          {running ? strings.running : strings.paused}
        </span>
      </div>
      <p className="mt-3 min-h-[1.4em] border-t border-border pt-3 text-sm text-muted">
        {getLogMessage(state, strings.log)}
      </p>
    </div>
  );
}
