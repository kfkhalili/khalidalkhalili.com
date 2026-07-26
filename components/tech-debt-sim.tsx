"use client";

import { useState } from "react";
import type { SimStrings } from "@/components/explorables/technical-debt.content";
import { useSimClock } from "@/components/use-sim-clock";
import {
  DEFAULT_RATE,
  PRESETS,
  initialState,
  logKey,
  moraleTone,
  nextState,
  tdrTone,
  velocityTone,
  type SimState,
  type Tone,
} from "@/components/tech-debt-sim.model";

const MIN_BAR_PCT = 12;

const TONE_BG: Record<Tone, string> = {
  good: "var(--sim-good)",
  warn: "var(--sim-warn)",
  bad: "var(--sim-bad)",
};

// One ink for all three fills; white falls under AA on the green and the red.
// A literal rather than a token: the fills do not flip with the theme, so the
// text on them must not either.
const TONE_FG = "#1b1b19";

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
            color: TONE_FG,
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
  const [state, setState] = useState<SimState>(initialState);
  const [refactorRate, setRefactorRate] = useState(DEFAULT_RATE);

  const { ref, running } = useSimClock(() =>
    setState((s) => nextState(s, refactorRate)),
  );

  return (
    <div
      ref={ref}
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
                "sim-control text-xs transition-colors " +
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
        {strings.log[logKey(state)]}
      </p>
    </div>
  );
}
