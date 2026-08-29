import { describe, it, expect } from "vitest";
import { getExplorables, findExplorable, EXPLORABLE_SLUGS } from "./explorables";

describe("EXPLORABLE_SLUGS", () => {
  it("lists every registered explorable, once", () => {
    expect(EXPLORABLE_SLUGS).toEqual(["the-third-thing", "technical-debt"]);
    expect(new Set(EXPLORABLE_SLUGS).size).toBe(EXPLORABLE_SLUGS.length);
  });

  it("matches what getExplorables returns", () => {
    expect(getExplorables().map((e) => e.slug)).toEqual(EXPLORABLE_SLUGS);
  });
});

describe("getExplorables", () => {
  it("resolves every explorable", () => {
    const explorables = getExplorables();
    expect(explorables).toHaveLength(EXPLORABLE_SLUGS.length);
    for (const e of explorables) {
      expect(e.kind).toBe("explorable");
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(e.tags.length).toBeGreaterThan(0);
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.readingTime).toBeGreaterThan(0);
      expect(e.Body).toBeTypeOf("function");
    }
  });

  it("features the explorables meant for the home page", () => {
    expect(getExplorables().every((e) => e.featured)).toBe(true);
  });
});

describe("findExplorable", () => {
  it("finds one by slug", () => {
    const found = findExplorable("technical-debt");
    expect(found?.slug).toBe("technical-debt");
  });

  it("returns undefined for an unregistered slug", () => {
    expect(findExplorable("no-such-thing")).toBeUndefined();
  });

  it("agrees with getExplorables", () => {
    for (const slug of EXPLORABLE_SLUGS) {
      expect(findExplorable(slug)).toEqual(
        getExplorables().find((e) => e.slug === slug),
      );
    }
  });
});
