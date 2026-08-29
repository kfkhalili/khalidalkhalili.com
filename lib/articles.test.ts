import { describe, it, expect } from "vitest";
import { toIsoDay, isEssayFile, mergeWriting, type Article } from "./articles";

function article(over: Partial<Article>): Article {
  return {
    slug: "s",
    title: "T",
    description: "",
    date: "2026-01-01",
    tags: [],
    kind: "explorable",
    collection: "writing",
    readingTime: 1,
    ...over,
  };
}

describe("toIsoDay", () => {
  it("accepts an ISO day, however YAML hands it over", () => {
    // Unquoted frontmatter parses to a Date, quoted to a string.
    expect(toIsoDay(new Date("2026-03-04T00:00:00Z"))).toBe("2026-03-04");
    expect(toIsoDay("2026-03-04")).toBe("2026-03-04");
  });

  it("refuses anything that is not one", () => {
    // Each of these used to reach <lastmod> verbatim. "July 5, 2026" sorts
    // after every ISO date and would poison the newest-article date the home
    // and writing pages carry; "2026-99-99" silently became 2034-06-07; an "&"
    // makes the whole sitemap unparseable, since Next interpolates it raw.
    for (const bad of [
      "July 5, 2026",
      "2026-99-99",
      "2026-02-30", // shaped like a day, but there is no such day
      "a & b",
      "2026-07",
      "",
      undefined,
      null,
      new Date("nonsense"),
    ]) {
      expect(toIsoDay(bad)).toBe("");
    }
  });
});

describe("isEssayFile", () => {
  it("accepts kebab-case markdown", () => {
    for (const ok of ["a.md", "my-essay.md", "excel-sheets-2.md"]) {
      expect(isEssayFile(ok)).toBe(true);
    }
  });

  it("refuses names that would corrupt the sitemap or the URL", () => {
    for (const bad of [
      "speed & correctness.md", // & breaks the XML for every entry, not just this one
      "My Essay.md",
      "trailing-.md",
      "under_score.md",
      "no-extension",
    ]) {
      expect(isEssayFile(bad)).toBe(false);
    }
  });
});

describe("mergeWriting", () => {
  it("sorts newest first across both kinds", () => {
    const merged = mergeWriting(
      [article({ slug: "old-essay", kind: "essay", date: "2025-01-01" })],
      [article({ slug: "new-sim", date: "2026-06-01" })],
    );
    expect(merged.map((a) => a.slug)).toEqual(["new-sim", "old-essay"]);
  });

  it("lets an essay shadow an explorable of the same slug, even an older one", () => {
    // The article route renders `essay ?? explorable`, so the index and the
    // sitemap have to agree that the essay is what that URL is.
    const merged = mergeWriting(
      [
        article({
          slug: "clash",
          kind: "essay",
          date: "2020-01-01",
          title: "Essay",
        }),
      ],
      [article({ slug: "clash", date: "2026-01-01", title: "Explorable" })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("Essay");
  });
});
