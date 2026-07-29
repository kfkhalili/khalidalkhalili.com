"use client";

import { useState } from "react";
import type { SimStrings } from "@/components/explorables/technical-debt.content";
import { useSimClock } from "@/components/use-sim-clock";
import {
  DEFAULT_RATE,
  LOG_KEYS,
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

// One ink for all three fills, themed alongside them in globals.css.
const TONE_FG = "var(--sim-fg)";

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

/**
 * One line showing, the rest stacked underneath it in the same grid cell.
 *
 * The cell is as tall as the longest line at whatever width it is rendered at,
 * so swapping lines never moves anything below. That matters here because the
 * two places copy changes, picking an archetype and the log reacting to it, sit
 * directly above the bars: sizing the box to the line in play would jog the bars
 * on every click, exactly when the reader is trying to watch them.
 *
 * The hidden lines are `invisible` rather than unmounted (visibility keeps them
 * out of the a11y tree while they hold the box open) and `aria-hidden` on top of
 * that, so `live` announces only the line that is actually showing. It is opt-in:
 * worth it for the line answering a click, noise for the one a timer drives.
 */
function Layered({
  lines,
  active,
  live = false,
  className,
}: {
  lines: string[];
  active: number;
  live?: boolean;
  className?: string;
}) {
  return (
    <div
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
      className={"grid " + className}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          aria-hidden={i !== active}
          className={
            "col-start-1 row-start-1 " + (i === active ? "" : "invisible")
          }
        >
          {/* Remounting via key replays the fade, so a changed line reads as
              changed rather than as text that was always there. */}
          <span key={active} className="status-rewrite">
            {line}
          </span>
        </p>
      ))}
    </div>
  );
}

export function TechDebtSim({ strings }: { strings: SimStrings }) {
  const [state, setState] = useState<SimState>(initialState);
  const [refactorRate, setRefactorRate] = useState(DEFAULT_RATE);

  const { ref, running } = useSimClock(() =>
    setState((s) => nextState(s, refactorRate)),
  );

  // Off a preset, the slider is between archetypes: `custom` is the line after
  // the four, so an unmatched rate lands on it.
  const archetypes = [...strings.archetypes, strings.custom];
  const matched = PRESETS.findIndex((value) => value === refactorRate);
  const archetype = matched === -1 ? strings.archetypes.length : matched;

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

      <div className="mb-3 flex flex-wrap gap-2">
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

      <Layered
        lines={archetypes}
        active={archetype}
        live
        className="mb-6 text-sm leading-snug text-muted"
      />

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
      <Layered
        lines={LOG_KEYS.map((key) => strings.log[key])}
        active={LOG_KEYS.indexOf(logKey(state))}
        className="mt-3 border-t border-border pt-3 text-sm text-muted"
      />
    </div>
  );
}
