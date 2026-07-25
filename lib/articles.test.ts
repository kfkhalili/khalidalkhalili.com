import { describe, it, expect, beforeEach, vi } from "vitest";
import path from "node:path";

/**
 * The essay half of the article registry reads `content/writing`, which the repo
 * doesn't ship yet. Rather than commit fixture prose, back the filesystem with an
 * in-memory map so the parser can be exercised on essays of our choosing; the
 * explorable half still comes from the real registry.
 */
const WRITING_DIR = path.join(process.cwd(), "content/writing");
let files: Record<string, string> = {};
let hasWritingDir = true;

vi.mock("node:fs", async (importActual) => {
  const actual = await importActual<typeof import("node:fs")>();
  const fake = {
    ...actual,
    existsSync: (p: string) =>
      p === WRITING_DIR ? hasWritingDir : p in files || actual.existsSync(p),
    readdirSync: ((p: string) =>
      p === WRITING_DIR
        ? Object.keys(files).map((f) => path.basename(f))
        : actual.readdirSync(p)) as unknown as typeof actual.readdirSync,
    readFileSync: ((p: string, enc?: unknown) =>
      p in files ? files[p] : actual.readFileSync(p, enc as never)) as unknown as typeof actual.readFileSync,
  };
  return { ...fake, default: fake };
});

const {
  getAllArticles,
  getEssaySlugs,
  getEssayContent,
  getExplorable,
  formatDate,
  formatReadingTime,
} = await import("./articles");
const { getExplorables } = await import("./explorables");

function writeEssay(name: string, contents: string) {
  files[path.join(WRITING_DIR, name)] = contents;
}

beforeEach(() => {
  files = {};
  hasWritingDir = true;
});

describe("getEssaySlugs", () => {
  it("is empty when there is no writing directory", () => {
    hasWritingDir = false;
    writeEssay("ignored.md", "---\ntitle: x\n---\nbody");
    expect(getEssaySlugs()).toEqual([]);
  });

  it("lists markdown files by slug, ignoring everything else", () => {
    writeEssay("first.md", "---\ntitle: First\n---\nbody");
    writeEssay("second.md", "---\ntitle: Second\n---\nbody");
    writeEssay("notes.txt", "not an essay");
    expect(getEssaySlugs().sort()).toEqual(["first", "second"]);
  });
});

describe("getEssayContent", () => {
  it("returns undefined for a slug with no file", () => {
    expect(getEssayContent("missing")).toBeUndefined();
  });

  it("reads frontmatter into an article and renders the body", () => {
    writeEssay(
      "excel.md",
      [
        "---",
        "title: Excel Sheets",
        "description: On spreadsheets.",
        "date: 2026-05-04",
        "tags: [Software, Work]",
        "lang: en",
        "featured: true",
        "---",
        "",
        "A paragraph with a [link](https://example.com).",
      ].join("\n"),
    );

    const result = getEssayContent("excel");
    expect(result?.article).toMatchObject({
      slug: "excel",
      title: "Excel Sheets",
      description: "On spreadsheets.",
      date: "2026-05-04",
      tags: ["Software", "Work"],
      lang: "en",
      featured: true,
      kind: "essay",
    });
    expect(result?.html).toContain("<p>");
    expect(result?.html).toContain('target="_blank"');
  });

  it("falls back to the filename, empty copy, no tags, and the default locale", () => {
    writeEssay("bare.md", "---\n---\nJust a body.");
    const { article } = getEssayContent("bare")!;
    expect(article).toMatchObject({
      slug: "bare",
      title: "bare.md",
      description: "",
      date: "",
      tags: [],
      lang: "en",
      featured: false,
    });
  });

  it("normalizes a YAML date into an ISO day", () => {
    writeEssay("dated.md", "---\ntitle: D\ndate: 2026-01-02\n---\nbody");
    expect(getEssayContent("dated")!.article.date).toBe("2026-01-02");
  });

  it("stringifies a non-string date and non-string tags", () => {
    writeEssay("odd.md", "---\ntitle: O\ndate: 20260102\ntags: notalist\n---\nbody");
    const { article } = getEssayContent("odd")!;
    expect(article.date).toBe("20260102");
    expect(article.tags).toEqual([]);
  });

  it("estimates reading time at 200 words a minute, never below one", () => {
    writeEssay("short.md", "---\ntitle: S\n---\nOnly a few words here.");
    writeEssay("long.md", `---\ntitle: L\n---\n${"word ".repeat(1000)}`);
    expect(getEssayContent("short")!.article.readingTime).toBe(1);
    expect(getEssayContent("long")!.article.readingTime).toBe(5);
  });
});

describe("getAllArticles", () => {
  it("returns the explorables when there are no essays", () => {
    expect(getAllArticles("en")).toEqual(getExplorables("en"));
  });

  it("merges essays with explorables, newest first", () => {
    writeEssay("old.md", "---\ntitle: Old\ndate: 2020-01-01\n---\nbody");
    writeEssay("new.md", "---\ntitle: New\ndate: 2099-01-01\n---\nbody");

    const articles = getAllArticles("en");
    expect(articles[0].title).toBe("New");
    expect(articles[articles.length - 1].title).toBe("Old");
    expect(articles).toHaveLength(getExplorables("en").length + 2);

    const dates = articles.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("keeps a stable order for articles sharing a date", () => {
    writeEssay("a.md", "---\ntitle: A\ndate: 2050-01-01\n---\nbody");
    writeEssay("b.md", "---\ntitle: B\ndate: 2050-01-01\n---\nbody");
    expect(getAllArticles("en").slice(0, 2).map((a) => a.title)).toEqual(["A", "B"]);
  });

  it("localizes the explorables it merges in", () => {
    const titles = getAllArticles("de").map((a) => a.title);
    expect(titles).toEqual(getExplorables("de").map((e) => e.title));
  });
});

describe("getExplorable", () => {
  it("resolves a registered explorable in the requested locale", () => {
    expect(getExplorable("technical-debt", "de")).toEqual(
      getExplorables("de").find((e) => e.slug === "technical-debt"),
    );
  });

  it("is undefined for an unknown slug", () => {
    expect(getExplorable("nope", "en")).toBeUndefined();
  });
});

describe("formatDate", () => {
  it("is empty for a missing date", () => {
    expect(formatDate("", "en")).toBe("");
  });

  it("writes the date the way each language does", () => {
    expect(formatDate("2026-02-09", "en")).toBe("February 9, 2026");
    expect(formatDate("2026-02-09", "de")).toBe("9. Februar 2026");
    expect(formatDate("2026-02-09", "ar")).toBe("9 فبراير 2026");
  });

  it("falls back to US English for an unknown language", () => {
    expect(formatDate("2026-02-09", "fr")).toBe(formatDate("2026-02-09", "en"));
  });

  it("reads the date as local midnight, so the day never slips", () => {
    expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
    expect(formatDate("2026-12-31", "en")).toBe("December 31, 2026");
  });
});

describe("formatReadingTime", () => {
  it("uses an invariant unit in English and German", () => {
    expect(formatReadingTime(6, "en")).toBe("6 min read");
    expect(formatReadingTime(1, "en")).toBe("1 min read");
    expect(formatReadingTime(6, "de")).toBe("6 Min. Lesezeit");
  });

  it("falls back to English for an unknown language", () => {
    expect(formatReadingTime(6, "fr")).toBe("6 min read");
  });

  it("agrees the Arabic counted noun with its number", () => {
    expect(formatReadingTime(1, "ar")).toBe("دقيقة قراءة");
    expect(formatReadingTime(2, "ar")).toBe("دقيقتان قراءة");
    expect(formatReadingTime(6, "ar")).toBe("6 دقائق قراءة");
    expect(formatReadingTime(11, "ar")).toBe("11 دقيقة قراءة");
    expect(formatReadingTime(100, "ar")).toBe("100 دقيقة قراءة");
  });

  it("drops the number entirely for the singular and dual", () => {
    expect(formatReadingTime(1, "ar")).not.toMatch(/\d/);
    expect(formatReadingTime(2, "ar")).not.toMatch(/\d/);
  });
});
