"use client";

import { useId, useState } from "react";
import type { StatusPageStrings } from "@/components/explorables/the-third-thing.content";

export function ZeroBitStatus({ strings }: { strings: StatusPageStrings }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
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
        <span
          className="rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
          style={{ backgroundColor: "var(--sim-warn)", color: "#1b1b19" }}
        >
          {strings.badge}
        </span>
      </div>
      <p className="mt-1 text-xs text-faint">{strings.hint}</p>

      <div className="mt-3 divide-y divide-border">
        {strings.sentences.map(([sentence, annotation], i) => {
          const isOpen = open.has(i);
          const panelId = `${baseId}-note-${i}`;
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
                    (isOpen ? "rotate-90" : "")
                  }
                >
                  ›
                </span>
                <span>{sentence}</span>
              </button>
              {/* Always mounted so aria-controls resolves even while closed. */}
              <p
                id={panelId}
                hidden={!isOpen}
                className="mb-2 mt-1 border-s-2 border-accent/50 ps-3 font-mono text-sm text-muted"
              >
                {annotation}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2 border-t border-border pt-3 text-sm text-muted">
        {strings.footer}
      </p>
    </div>
  );
}
