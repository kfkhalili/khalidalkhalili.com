import { describe, expect, it } from "vitest";
import {
  QUESTION_COUNT,
  VERDICT_TONE,
  verdictOf,
  type Answer,
} from "@/components/contract-diagnostic.model";

/** [owns, operates, pays, sees]; 0 = first option, 1 = second. */
const answers = (...a: Answer[]) => a;

describe("verdictOf", () => {
  it("withholds a verdict until every question is answered", () => {
    expect(verdictOf(answers(null, null, null, null))).toBeNull();
    expect(verdictOf(answers(1, 1, 1, null))).toBeNull();
    expect(verdictOf(answers(1, 1, 1))).toBeNull();
  });

  it("names the third thing: vendor owns, vendor operates, we pay", () => {
    expect(verdictOf(answers(1, 1, 0, 0))).toBe("thirdThing");
    expect(verdictOf(answers(1, 1, 0, 1))).toBe("thirdThing");
  });

  it("calls the same shape hosted once the vendor carries the bill", () => {
    // "pays" is the single answer separating a hosted product from the disaster.
    expect(verdictOf(answers(1, 1, 1, 0))).toBe("hosted");
  });

  it("calls vendor-owned but self-operated a product", () => {
    expect(verdictOf(answers(1, 0, 0, 0))).toBe("product");
    expect(verdictOf(answers(1, 0, 1, 1))).toBe("product");
  });

  it("calls work we cannot see blind", () => {
    expect(verdictOf(answers(0, 0, 0, 1))).toBe("blind");
  });

  it("calls the visible, self-owned case a service", () => {
    expect(verdictOf(answers(0, 0, 0, 0))).toBe("service");
    expect(verdictOf(answers(0, 1, 1, 0))).toBe("service");
  });

  it("covers every combination without falling through", () => {
    for (let i = 0; i < 16; i++) {
      const a = [0, 1, 2, 3].map((bit) => ((i >> bit) & 1) as Answer);
      expect(verdictOf(a)).not.toBeNull();
    }
  });
});

describe("VERDICT_TONE", () => {
  it("marks only the third thing as bad", () => {
    const bad = Object.entries(VERDICT_TONE)
      .filter(([, tone]) => tone === "bad")
      .map(([verdict]) => verdict);
    expect(bad).toEqual(["thirdThing"]);
  });

  it("warns rather than condemns when the work is merely invisible", () => {
    expect(VERDICT_TONE.blind).toBe("warn");
  });
});

describe("QUESTION_COUNT", () => {
  it("matches the arity verdictOf destructures", () => {
    expect(QUESTION_COUNT).toBe(4);
  });
});
