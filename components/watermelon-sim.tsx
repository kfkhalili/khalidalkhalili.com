"use client";

import { useEffect, useRef, useState } from "react";
import type { WatermelonStrings } from "@/components/explorables/the-third-thing.content";

/* ---------------------------------------------------------------------------
   Model: pure, deterministic loop of blame pressure and dishonest reporting.
   Problems flow in every sprint; only *reported* problems get fixed, and
   pressure decides how much of reality makes it into the report.
--------------------------------------------------------------------------- */

type SimState = {
  p: number; // problems (0..100)
  tick: number; // elapsed "sprints"
};

const INFLOW = 3; // new problems per sprint
const FIX_RATE = 0.35; // fraction of *reported* problems fixed per sprint
const HIDDEN_COMPOUND = 0.03; // unreported problems breed more problems
const TICK_MS = 1000;
const MIN_BAR_PCT = 12;
const DEFAULT_PRESSURE = 30;

// Archetype pressures, aligned by index with the localized preset labels.
const PRESETS = [0, 30, 70, 100] as const;

const clamp = (val: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, val));

/** How much of the truth survives the report at a given pressure and problem level. */
function honesty(p: number, pressure: number): number {
  let h = 1 - 0.95 * (pressure / 100);
  // Truth leaks out near collapse: past p = 80 reality forces itself into the report.
  if (p > 80) h = Math.min(1, h + ((p - 80) / 20) * (1 - h));
  return h;
}

function reportedProblems(p: number, pressure: number): number {
  return p * honesty(p, pressure);
}

/** Core simulation step: only reported problems get fixed; hidden ones compound. */
function nextState(current: SimState, pressure: number): SimState {
  const rp = reportedProblems(current.p, pressure);
  const nextP = clamp(
    current.p + INFLOW + HIDDEN_COMPOUND * (current.p - rp) - FIX_RATE * rp,
  );
  return { p: nextP, tick: current.tick + 1 };
}

/**
 * The steady state for a blame pressure, where problem inflow and fixes balance.
 * Starting here means the default preset holds flat until the slider moves.
 */
function settle(pressure: number): SimState {
  let s: SimState = { p: 0, tick: 0 };
  for (let i = 0; i < 2000; i++) s = nextState(s, pressure);
  return { ...s, tick: 0 };
}

const INITIAL: SimState = settle(DEFAULT_PRESSURE);

type Tone = "good" | "warn" | "bad";
const TONE_BG: Record<Tone, string> = {
  good: "var(--sim-good)",
  warn: "var(--sim-warn)",
  bad: "var(--sim-bad)",
};

const healthTone = (v: number): Tone =>
  v > 70 ? "good" : v > 40 ? "warn" : "bad";

function getLogMessage(
  actualHealth: number,
  reportedHealth: number,
  log: WatermelonStrings["log"],
): string {
  if (actualHealth < 15) return log.collapse;
  const gap = reportedHealth - actualHealth;
  if (gap < 5) return log.honest;
  if (gap < 25) return log.drifting;
  return log.watermelon;
}

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

export function WatermelonSim({ strings }: { strings: WatermelonStrings }) {
  const [state, setState] = useState<SimState>(INITIAL);
  const [pressure, setPressure] = useState(DEFAULT_PRESSURE);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const pressureRef = useRef(pressure);
  pressureRef.current = pressure; // interval always reads the latest pressure

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
      () => setState((s) => nextState(s, pressureRef.current)),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [running]);

  const rp = reportedProblems(state.p, pressure);
  const actualHealth = 100 - state.p;
  const reportedHealth = 100 - rp;

  // The joke made visible: the badge follows the *reported* bar, not the actual one.
  const badgeTone = healthTone(reportedHealth);
  const badgeText =
    badgeTone === "good"
      ? strings.badges.green
      : badgeTone === "warn"
        ? strings.badges.yellow
        : strings.badges.red;

  return (
    <div
      ref={containerRef}
      className="not-prose rounded-xl border border-border bg-card p-5 font-mono sm:p-6"
    >
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="text-muted">{strings.pressure}</span>
          <span className="font-semibold tabular-nums text-foreground">
            {pressure}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pressure}
          onChange={(e) => setPressure(parseInt(e.target.value, 10))}
          className="sim-range mt-3 w-full"
          aria-label={strings.pressureAria}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((value, i) => {
          const active = pressure === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setPressure(value)}
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
        <Bar
          label={strings.bars[0]}
          value={actualHealth}
          tone={healthTone(actualHealth)}
        />
        <Bar
          label={strings.bars[1]}
          value={reportedHealth}
          tone={healthTone(reportedHealth)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="text-muted">{strings.badgeLabel}</span>
        <span
          className="rounded-full px-2.5 py-0.5 font-semibold transition-colors duration-300"
          style={{
            backgroundColor: TONE_BG[badgeTone],
            color: badgeTone === "warn" ? "#1b1b19" : "#ffffff",
          }}
        >
          {badgeText}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>
          {strings.sprint} {state.tick}
        </span>
        <span className="text-faint">
          {running ? strings.running : strings.paused}
        </span>
      </div>
      <p className="mt-3 min-h-[1.4em] border-t border-border pt-3 text-sm text-muted">
        {getLogMessage(actualHealth, reportedHealth, strings.log)}
      </p>
    </div>
  );
}
