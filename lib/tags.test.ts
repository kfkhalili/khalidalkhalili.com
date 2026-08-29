import { describe, it, expect } from "vitest";
import { TAG_PARAM, tagHref, readTag, filterByTag, countTags } from "./tags";

const tagged = (slug: string, tags: string[]) => ({ slug, tags });

describe("tagHref", () => {
  it("lands on the writing index", () => {
    expect(tagHref("IT Projects")).toBe("/writing?tag=IT%20Projects");
  });

  it("escapes a tag so a space or an ampersand cannot rewrite the query", () => {
    expect(tagHref("Software Design")).toBe("/writing?tag=Software%20Design");
    expect(tagHref("speed & correctness")).toContain("%26");
  });

  it("carries an Arabic tag through intact", () => {
    const href = tagHref("تصميم البرمجيات");
    expect(href.startsWith("/writing?tag=")).toBe(true);
    expect(decodeURIComponent(href.split("=")[1])).toBe("تصميم البرمجيات");
  });

  it("names the query key once, for the index to read back", () => {
    expect(tagHref("x")).toContain(`?${TAG_PARAM}=`);
  });
});

describe("readTag", () => {
  it("reads the tag a request asks for", () => {
    expect(readTag("Software Design")).toBe("Software Design");
  });

  it("asks for no tag when the parameter is absent or blank", () => {
    expect(readTag(undefined)).toBe("");
    expect(readTag("   ")).toBe("");
  });

  it("refuses a repeated parameter rather than picking one of them", () => {
    // `?tag=a&tag=b` asks for two shelves at once. Answering with the whole
    // index is honest; answering with "a" would put a chip on screen claiming
    // a filter the reader did not ask for.
    expect(readTag(["Software Design", "IT Projects"])).toBe("");
  });
});

describe("filterByTag", () => {
  const articles = [
    tagged("technical-debt", ["Software Design"]),
    tagged("the-third-thing", ["IT Projects"]),
    tagged("a-quiet-room", []),
  ];

  it("keeps only what carries the tag", () => {
    expect(filterByTag(articles, "IT Projects").map((a) => a.slug)).toEqual([
      "the-third-thing",
    ]);
  });

  it("hands back the whole shelf when no tag is asked for", () => {
    expect(filterByTag(articles, "")).toEqual(articles);
  });

  it("matches a tag exactly, so a partial word narrows to nothing", () => {
    expect(filterByTag(articles, "Software")).toEqual([]);
  });
});

describe("countTags", () => {
  it("counts each tag across the index, in the order the index reads", () => {
    expect(
      countTags([
        tagged("a", ["IT Projects", "Software Design"]),
        tagged("b", ["Software Design"]),
        tagged("c", []),
      ]),
    ).toEqual([
      { tag: "IT Projects", count: 1 },
      { tag: "Software Design", count: 2 },
    ]);
  });

  it("names a tag once however many pieces carry it", () => {
    const counted = countTags([
      tagged("a", ["Software Design"]),
      tagged("b", ["Software Design"]),
    ]);
    expect(counted).toHaveLength(1);
  });

  it("counts nothing for an untagged index", () => {
    expect(countTags([tagged("a", []), tagged("b", [])])).toEqual([]);
  });
});
