"use client";

import { useId, useState } from "react";
import type { StatusPageStrings } from "@/components/explorables/the-third-thing.content";

export function ZeroBitStatus({ strings }: { strings: StatusPageStrings }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  // Escalating rewrites the sentences in a louder register and flips the badge
  // to red. The annotations never change, so the information does not either.
  const [escalated, setEscalated] = useState(false);
  const baseId = useId();

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="not-prose rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{strings.heading}</span>
        <span className="flex items-center gap-2">
          <span
            // Arabic needs its font's own line box: leading-none clips the
            // marks and descenders that sit outside the em square.
            className="inline-flex items-center justify-center rounded-full px-2.5 pt-1 pb-1 font-mono text-xs font-semibold leading-none transition-colors duration-300 rtl:pt-0.5 rtl:pb-0.5 rtl:leading-[normal]"
            style={{
              backgroundColor: escalated ? "var(--sim-bad)" : "var(--sim-warn)",
              color: escalated ? "#ffffff" : "#1b1b19",
            }}
          >
            {escalated ? strings.badgeRed : strings.badge}
          </span>
          <button
            type="button"
            onClick={() => setEscalated((prev) => !prev)}
            aria-pressed={escalated}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            {escalated ? strings.deescalate : strings.escalate}
          </button>
        </span>
      </div>
      <p className="mt-1 text-xs text-faint">{strings.hint}</p>

      <div className="mt-3 divide-y divide-border">
        {strings.sentences.map((entry, i) => {
          const isOpen = open.has(i);
          const panelId = `${baseId}-note-${i}`;
          const sentence =
            escalated && entry.loud ? entry.loud : entry.calm;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-baseline gap-2 py-2 text-start text-sm text-foreground transition-colors hover:bg-accent/5"
              >
                <span
                  aria-hidden="true"
                  className={
                    "inline-block shrink-0 font-mono text-xs text-faint transition-transform duration-200 " +
                    (isOpen ? "rotate-90" : "rtl:rotate-180")
                  }
                >
                  ›
                </span>
                {/* Remounting on rewrite replays the fade, so the reader sees
                    the wording change; the one honest sentence never does. */}
                <span key={sentence} className="status-rewrite">
                  {sentence}
                </span>
              </button>
              {/* Always mounted so aria-controls resolves even while closed. */}
              <p
                id={panelId}
                hidden={!isOpen}
                className="mb-2 mt-1 border-s-2 border-accent/50 ps-3 font-mono text-xs text-muted"
              >
                {entry.note}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2 border-t border-border pt-3 text-sm text-muted">
        {strings.footer}
      </p>
      {/* Always mounted so the live region is in the a11y tree before it fills.
          De-escalating clears it: the line only describes the red state. */}
      <p
        role="status"
        aria-live="polite"
        className={"font-mono text-xs text-muted " + (escalated ? "mt-2" : "")}
      >
        {escalated ? strings.aftermath : null}
      </p>
    </div>
  );
}
