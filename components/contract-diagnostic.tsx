"use client";

import { useId, useState } from "react";
import type { DiagnosticStrings } from "@/components/explorables/the-third-thing.content";
import {
  QUESTION_COUNT,
  VERDICT_TONE,
  verdictOf,
  type Answer,
  type Tone,
} from "@/components/contract-diagnostic.model";

const TONE_COLOR: Record<Tone, string> = {
  good: "var(--sim-good)",
  warn: "var(--sim-warn)",
  bad: "var(--sim-bad)",
};

export function ContractDiagnostic({ strings }: { strings: DiagnosticStrings }) {
  const [answers, setAnswers] = useState<Answer[]>(() =>
    Array<Answer>(QUESTION_COUNT).fill(null),
  );
  const id = useId();

  const verdict = verdictOf(answers);
  const verdictColor = verdict ? TONE_COLOR[VERDICT_TONE[verdict]] : undefined;
  const answered = answers.filter((a) => a !== null).length;
  const remaining = answers.length - answered;

  return (
    <div className="not-prose rounded-xl border border-border bg-card p-5 sm:p-6">
      <p className="mb-4 text-sm font-semibold text-foreground">
        {strings.heading}
      </p>
      <div className="flex flex-col gap-4">
        {strings.questions.map((question, qi) => (
          <div
            key={qi}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
          >
            <span id={`${id}-q${qi}`} className="text-sm text-muted">
              {question.q}
            </span>
            {/* Radio semantics: the options are mutually exclusive and cannot
                be deselected, and the group label ties the otherwise identical
                option names back to their question for assistive tech. */}
            <div
              role="radiogroup"
              aria-labelledby={`${id}-q${qi}`}
              className="flex gap-2"
            >
              {question.options.map((option, oi) => {
                const active = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() =>
                      setAnswers((prev) =>
                        prev.map((a, i) => (i === qi ? (oi as Answer) : a)),
                      )
                    }
                    className={
                      "sim-control text-xs transition-colors " +
                      (active
                        ? "border-accent bg-accent/10 text-accent-strong"
                        : "border-border text-muted hover:text-foreground")
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-3" role="status">
        {verdict ? (
          // Remounting via key replays the pulse when the verdict changes.
          <div
            key={verdict}
            className="border-s-2 ps-3"
            style={{ borderColor: verdictColor }}
          >
            <span
              className="sim-pulse font-mono text-xs uppercase tracking-wide"
              style={{ color: verdictColor }}
            >
              {strings.verdictLabel}
            </span>
            <p className="mt-1 text-sm text-foreground">
              {strings.verdicts[verdict]}
            </p>
          </div>
        ) : (
          <p key={remaining} className="sim-pulse font-mono text-xs text-faint">
            {answered === 0 ? strings.prompt : strings.countdown[remaining - 1]}
          </p>
        )}
      </div>
    </div>
  );
}
