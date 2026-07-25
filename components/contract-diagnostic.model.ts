/**
 * Model: the four-question contract diagnostic, as a truth table.
 *
 * Kept apart from the widget so the table is assertable directly, rather than
 * through eight button clicks per case. It answers in domain terms; the widget
 * decides what an answer looks like.
 */

export type Answer = 0 | 1 | null;

export type Verdict = "hosted" | "thirdThing" | "product" | "blind" | "service";

/** How many questions the diagnostic asks. The widget seeds its answers from this. */
export const QUESTION_COUNT = 4;

/**
 * Verdict from [owns, operates, pays, sees], index 0 = first option.
 * "pays" separates the third thing from a plain hosted product: vendor-owned
 * and vendor-operated is only the disaster when it runs on the customer's bill.
 * For "who can see the work" the options are [we can, we cannot],
 * so sees === 1 means the work is invisible.
 *
 * Null until every question is answered.
 */
export function verdictOf(answers: readonly Answer[]): Verdict | null {
  const [owns, operates, pays, sees] = answers;
  if (answers.length < QUESTION_COUNT) return null;
  if (answers.some((a) => a === null)) return null;
  if (owns === 1 && operates === 1)
    return pays === 1 ? "hosted" : "thirdThing";
  if (owns === 1 && operates === 0) return "product";
  if (sees === 1) return "blind";
  return "service";
}

export type Tone = "good" | "warn" | "bad";

/** The third thing is the only outright bad answer; being blind to the work is a warning. */
export const VERDICT_TONE: Record<Verdict, Tone> = {
  hosted: "good",
  thirdThing: "bad",
  product: "good",
  blind: "warn",
  service: "good",
};
