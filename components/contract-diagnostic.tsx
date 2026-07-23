"use client";

import { useState } from "react";
import type { DiagnosticStrings } from "@/components/explorables/the-third-thing.content";

type Answer = 0 | 1 | null;

/**
 * Verdict from [owns, operates, pays, sees], index 0 = first option.
 * "pays" separates the third thing from a plain hosted product: vendor-owned
 * and vendor-operated is only the disaster when it runs on the customer's bill.
 * For "who can see the work" the options are [we can, we cannot],
 * so sees === 1 means the work is invisible.
 */
function getVerdict(
  answers: Answer[],
  verdicts: DiagnosticStrings["verdicts"],
): { text: string; color: string } | null {
  const [owns, operates, pays, sees] = answers;
  if (answers.some((a) => a === null)) return null;
  if (owns === 1 && operates === 1)
    return pays === 1
      ? { text: verdicts.hosted, color: "var(--sim-good)" }
      : { text: verdicts.thirdThing, color: "var(--sim-bad)" };
  if (owns === 1 && operates === 0)
    return { text: verdicts.product, color: "var(--sim-good)" };
  if (sees === 1) return { text: verdicts.blind, color: "var(--sim-warn)" };
  return { text: verdicts.service, color: "var(--sim-good)" };
}

export function ContractDiagnostic({ strings }: { strings: DiagnosticStrings }) {
  const [answers, setAnswers] = useState<Answer[]>([null, null, null, null]);

  const verdict = getVerdict(answers, strings.verdicts);
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
            <span className="text-sm text-muted">{question.q}</span>
            <div className="flex gap-2">
              {question.options.map((option, oi) => {
                const active = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setAnswers((prev) =>
                        prev.map((a, i) => (i === qi ? (oi as Answer) : a)),
                      )
                    }
                    className={
                      "rounded-md border px-2.5 py-1 text-xs transition-colors " +
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
            key={verdict.text}
            className="border-s-2 ps-3"
            style={{ borderColor: verdict.color }}
          >
            <span
              className="sim-pulse font-mono text-xs uppercase tracking-wide"
              style={{ color: verdict.color }}
            >
              {strings.verdictLabel}
            </span>
            <p className="mt-1 text-sm text-foreground">{verdict.text}</p>
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
