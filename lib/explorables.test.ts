import { describe, it, expect } from "vitest";
import { getExplorables, findExplorable, EXPLORABLE_SLUGS } from "./explorables";
import { LOCALES } from "./i18n";

describe("EXPLORABLE_SLUGS", () => {
  it("lists every registered explorable, once", () => {
    expect(EXPLORABLE_SLUGS).toEqual(["the-third-thing", "technical-debt"]);
    expect(new Set(EXPLORABLE_SLUGS).size).toBe(EXPLORABLE_SLUGS.length);
  });

  it("matches what getExplorables returns", () => {
    expect(getExplorables("en").map((e) => e.slug)).toEqual(EXPLORABLE_SLUGS);
  });
});

describe("getExplorables", () => {
  it.each(LOCALES)("resolves every explorable in %s", (locale) => {
    const explorables = getExplorables(locale);
    expect(explorables).toHaveLength(EXPLORABLE_SLUGS.length);
    for (const e of explorables) {
      expect(e.lang).toBe(locale);
      expect(e.kind).toBe("explorable");
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(e.tags.length).toBeGreaterThan(0);
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.readingTime).toBeGreaterThan(0);
      expect(e.Body).toBeTypeOf("function");
    }
  });

  it("localizes the title and tags", () => {
    const [en] = getExplorables("en");
    const [de] = getExplorables("de");
    const [ar] = getExplorables("ar");
    expect(de.title).not.toBe(en.title);
    expect(ar.title).not.toBe(en.title);
    expect(de.tags).not.toEqual(en.tags);
  });

  it("keeps locale-independent facts identical across locales", () => {
    const [en] = getExplorables("en");
    const [ar] = getExplorables("ar");
    expect(ar.slug).toBe(en.slug);
    expect(ar.date).toBe(en.date);
    expect(ar.readingTime).toBe(en.readingTime);
    expect(ar.Body).toBe(en.Body);
  });

  it("falls back to the default locale for an unknown language", () => {
    expect(getExplorables("fr")).toEqual(getExplorables("en"));
  });

  it("features the explorables meant for the home page", () => {
    expect(getExplorables("en").every((e) => e.featured)).toBe(true);
  });
});

describe("findExplorable", () => {
  it("finds one by slug, localized", () => {
    const found = findExplorable("technical-debt", "de");
    expect(found?.slug).toBe("technical-debt");
    expect(found?.lang).toBe("de");
  });

  it("returns undefined for an unregistered slug", () => {
    expect(findExplorable("no-such-thing", "en")).toBeUndefined();
  });

  it("agrees with getExplorables", () => {
    for (const slug of EXPLORABLE_SLUGS) {
      expect(findExplorable(slug, "ar")).toEqual(
        getExplorables("ar").find((e) => e.slug === slug),
      );
    }
  });
});
