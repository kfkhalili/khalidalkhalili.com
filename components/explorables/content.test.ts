import { describe, it, expect } from "vitest";
import { TD_CONTENT } from "./technical-debt.content";
import { TT_CONTENT } from "./the-third-thing.content";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(strings);
}

const MODULES = [
  { name: "technical-debt", content: TD_CONTENT },
  { name: "the-third-thing", content: TT_CONTENT },
] as const;

describe.each(MODULES)("$name content", ({ content }) => {
  it("has no empty strings", () => {
    for (const s of strings(content)) expect(s.trim()).not.toBe("");
  });

  it("gives the article a title, description, and tags", () => {
    expect(content.title).toBeTruthy();
    expect(content.description.length).toBeGreaterThan(40);
    expect(content.tags.length).toBeGreaterThan(0);
  });

  it("opens every external link it authors in a new tab, safely", () => {
    for (const s of strings(content)) {
      for (const anchor of s.match(/<a [^>]*>/g) ?? []) {
        expect(anchor).toContain('target="_blank"');
        expect(anchor).toContain('rel="noopener noreferrer"');
      }
    }
  });

  it("closes every inline tag it opens", () => {
    for (const s of strings(content)) {
      for (const tag of ["strong", "em", "code", "a"]) {
        const open = s.match(new RegExp(`<${tag}[ >]`, "g")) ?? [];
        const close = s.match(new RegExp(`</${tag}>`, "g")) ?? [];
        expect(close).toHaveLength(open.length);
      }
    }
  });
});

describe("technical-debt sim strings", () => {
  it("labels the four presets and three bars", () => {
    const sim = TD_CONTENT.sim;
    expect(sim.presets).toHaveLength(4);
    // Every preset explains itself when picked, plus a line for the allocations
    // between them.
    expect(sim.archetypes).toHaveLength(sim.presets.length);
    expect(sim.custom.trim()).not.toBe("");
    expect(sim.bars).toHaveLength(3);
    expect(Object.keys(sim.log).sort()).toEqual([
      "critical",
      "healthy",
      "normal",
      "stalled",
      "warning",
    ]);
    expect(sim.allocationAria).toBeTruthy();
  });

  it("pairs every hindsight summary with a body", () => {
    const details = TD_CONTENT.details;
    expect(details.length).toBeGreaterThan(0);
    for (const entry of details) {
      expect(entry).toHaveLength(2);
      expect(entry[0].trim()).not.toBe("");
      expect(entry[1].trim()).not.toBe("");
    }
  });
});

describe("the-third-thing widget strings", () => {
  it("labels the four presets and two bars", () => {
    const sim = TT_CONTENT.sim;
    expect(sim.presets).toHaveLength(4);
    expect(sim.bars).toHaveLength(2);
    expect(Object.keys(sim.badges).sort()).toEqual(["green", "red", "yellow"]);
    expect(Object.keys(sim.log).sort()).toEqual([
      "collapse",
      "drifting",
      "honest",
      "recovery",
      "watermelon",
    ]);
  });

  it("asks four two-option questions", () => {
    const diagnostic = TT_CONTENT.diagnostic;
    expect(diagnostic.questions).toHaveLength(4);
    for (const question of diagnostic.questions) {
      expect(question.q.trim()).not.toBe("");
      expect(question.options).toHaveLength(2);
      expect(question.options[0]).not.toBe(question.options[1]);
    }
    expect(diagnostic.countdown).toHaveLength(3);
    expect(Object.keys(diagnostic.verdicts).sort()).toEqual([
      "blind",
      "hosted",
      "product",
      "service",
      "thirdThing",
    ]);
  });

  it("annotates every status sentence", () => {
    const page = TT_CONTENT.statusPage;
    expect(page.sentences.length).toBeGreaterThan(1);
    for (const sentence of page.sentences) {
      expect(sentence.calm.trim()).not.toBe("");
      expect(sentence.note.trim()).not.toBe("");
      if (sentence.loud !== undefined) expect(sentence.loud).not.toBe(sentence.calm);
    }
  });

  it("leaves exactly one sentence with nothing for urgency to inflate", () => {
    const honest = TT_CONTENT.statusPage.sentences.filter((s) => !s.loud);
    expect(honest).toHaveLength(1);
  });
});
