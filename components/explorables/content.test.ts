import { describe, it, expect } from "vitest";
import { TD_CONTENT, getTechDebtContent } from "./technical-debt.content";
import { TT_CONTENT, getThirdThingContent } from "./the-third-thing.content";
import { LOCALES, type Locale } from "@/lib/i18n";

/** Every leaf path in a nested content record, e.g. "sim.log.critical". */
function paths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => paths(v, `${prefix}[${i}]`));
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(strings);
}

const MODULES = [
  { name: "technical-debt", content: TD_CONTENT, get: getTechDebtContent },
  { name: "the-third-thing", content: TT_CONTENT, get: getThirdThingContent },
] as const;

describe.each(MODULES)("$name content", ({ content, get }) => {
  it("ships copy for every locale", () => {
    expect(Object.keys(content).sort()).toEqual([...LOCALES].sort());
  });

  it("keeps the same shape in every locale", () => {
    for (const locale of LOCALES) {
      expect(paths(content[locale]).sort()).toEqual(paths(content.en).sort());
    }
  });

  it.each(LOCALES)("has no empty strings in %s", (locale) => {
    for (const s of strings(content[locale])) expect(s.trim()).not.toBe("");
  });

  it.each(LOCALES)("resolves %s by language tag", (locale) => {
    expect(get(locale)).toBe(content[locale]);
  });

  it("falls back to the default locale for an unknown language", () => {
    expect(get("fr")).toBe(content.en);
  });

  it("gives the article a distinct title, description, and tags per locale", () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const c = content[locale];
      expect(c.title).toBeTruthy();
      expect(c.description.length).toBeGreaterThan(40);
      expect(c.tags.length).toBeGreaterThan(0);
      seen.add(c.title);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("opens every external link it authors in a new tab, safely", () => {
    for (const locale of LOCALES) {
      for (const s of strings(content[locale])) {
        for (const anchor of s.match(/<a [^>]*>/g) ?? []) {
          expect(anchor).toContain('target="_blank"');
          expect(anchor).toContain('rel="noopener noreferrer"');
        }
      }
    }
  });

  it("closes every inline tag it opens", () => {
    for (const locale of LOCALES) {
      for (const s of strings(content[locale])) {
        for (const tag of ["strong", "em", "code", "a"]) {
          const open = s.match(new RegExp(`<${tag}[ >]`, "g")) ?? [];
          const close = s.match(new RegExp(`</${tag}>`, "g")) ?? [];
          expect(close).toHaveLength(open.length);
        }
      }
    }
  });
});

describe("technical-debt sim strings", () => {
  it.each(LOCALES)("labels the four presets and three bars in %s", (locale) => {
    const sim = TD_CONTENT[locale].sim;
    expect(sim.presets).toHaveLength(4);
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

  it.each(LOCALES)("pairs every hindsight summary with a body in %s", (locale) => {
    const details = TD_CONTENT[locale].details;
    expect(details.length).toBeGreaterThan(0);
    for (const entry of details) {
      expect(entry).toHaveLength(2);
      expect(entry[0].trim()).not.toBe("");
      expect(entry[1].trim()).not.toBe("");
    }
  });
});

describe("the-third-thing widget strings", () => {
  it.each(LOCALES)("labels the four presets and two bars in %s", (locale) => {
    const sim = TT_CONTENT[locale].sim;
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

  it.each(LOCALES)("asks four two-option questions in %s", (locale) => {
    const diagnostic = TT_CONTENT[locale].diagnostic;
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

  it.each(LOCALES)("annotates every status sentence in %s", (locale) => {
    const page = TT_CONTENT[locale].statusPage;
    expect(page.sentences.length).toBeGreaterThan(1);
    for (const sentence of page.sentences) {
      expect(sentence.calm.trim()).not.toBe("");
      expect(sentence.note.trim()).not.toBe("");
      if (sentence.loud !== undefined) expect(sentence.loud).not.toBe(sentence.calm);
    }
  });

  it("leaves exactly one sentence with nothing for urgency to inflate", () => {
    for (const locale of LOCALES) {
      const honest = TT_CONTENT[locale].statusPage.sentences.filter((s) => !s.loud);
      expect(honest).toHaveLength(1);
    }
  });

  it("keeps the honest sentence at the same position in every locale", () => {
    const indexOfHonest = (locale: Locale) =>
      TT_CONTENT[locale].statusPage.sentences.findIndex((s) => !s.loud);
    for (const locale of LOCALES) {
      expect(indexOfHonest(locale)).toBe(indexOfHonest("en"));
    }
  });
});
