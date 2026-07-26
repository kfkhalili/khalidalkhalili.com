"use client";

import { useState } from "react";
import type { WatermelonStrings } from "@/components/explorables/the-third-thing.content";
import { useSimClock } from "@/components/use-sim-clock";
import {
  DEFAULT_PRESSURE,
  PRESETS,
  healthTone,
  initialState,
  logKey,
  nextState,
  readings,
  type SimState,
  type Tone,
} from "@/components/watermelon-sim.model";

const MIN_BAR_PCT = 12;

const TONE_BG: Record<Tone, string> = {
  good: "var(--sim-good)",
  warn: "var(--sim-warn)",
  bad: "var(--sim-bad)",
};

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
  const [state, setState] = useState<SimState>(initialState);
  const [pressure, setPressure] = useState(DEFAULT_PRESSURE);

  const { ref, running } = useSimClock(() =>
    setState((s) => nextState(s, pressure)),
  );

  const { actualHealth, reportedHealth } = readings(state, pressure);

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
      ref={ref}
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
          // Arabic needs its font's own line box: leading-none clips the marks
          // and descenders that sit outside the em square (the kasra in حرِج).
          className="inline-flex items-center justify-center rounded-full px-2.5 pt-1 pb-1 font-semibold leading-none transition-colors duration-300 rtl:pt-0.5 rtl:pb-0.5 rtl:leading-[normal]"
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
        {strings.log[logKey(actualHealth, reportedHealth, pressure)]}
      </p>
    </div>
  );
}
