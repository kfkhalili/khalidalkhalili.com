import { describe, it, expect } from "vitest";
import en from "./en.json";
import de from "./de.json";
import ar from "./ar.json";
import { LOCALES } from "@/lib/i18n";

/** Every leaf path in a nested string record, e.g. "nav.writing". */
function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leaves(value: unknown): string[] {
  if (typeof value !== "object" || value === null) return [String(value)];
  return Object.values(value).flatMap(leaves);
}

const dictionaries = { en, de, ar } as const;

describe("dictionaries", () => {
  it("ships one per locale", () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort());
  });

  it.each(["de", "ar"] as const)("translates every English key in %s", (locale) => {
    expect(paths(dictionaries[locale]).sort()).toEqual(paths(en).sort());
  });

  it.each(LOCALES)("has no empty or placeholder strings in %s", (locale) => {
    for (const leaf of leaves(dictionaries[locale])) {
      expect(leaf.trim()).not.toBe("");
      expect(leaf).not.toMatch(/^TODO/i);
    }
  });

  it.each(LOCALES)("is strings all the way down in %s", (locale) => {
    const walk = (value: unknown): void => {
      if (typeof value === "string") return;
      expect(value).toBeTypeOf("object");
      Object.values(value as object).forEach(walk);
    };
    walk(dictionaries[locale]);
  });

  it("actually translates the navigation rather than copying English", () => {
    expect(de.nav.writing).not.toBe(en.nav.writing);
    expect(ar.nav.writing).not.toBe(en.nav.writing);
  });

  it("names the site consistently with lib/site", async () => {
    const { site } = await import("@/lib/site");
    expect(en.site.title).toBe(site.title);
    expect(en.site.shortName).toBe(site.shortName);
    expect(en.site.description).toBe(site.description);
  });

  it("labels every project status the cards can render", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(dictionaries[locale].projects.status).sort()).toEqual([
        "beta",
        "building",
        "live",
      ]);
    }
  });

  it("labels every chess outcome the page can render", () => {
    for (const locale of LOCALES) {
      const chess = dictionaries[locale].chess;
      expect(chess.won).toBeTruthy();
      expect(chess.lost).toBeTruthy();
      expect(chess.drew).toBeTruthy();
    }
  });
});
