import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Article } from "@/lib/articles";
import { site } from "@/lib/site";

/**
 * The essay half of the sitemap. sitemap.test.ts exercises the chrome and
 * explorable entries against real data; this drives the registry from a stub
 * to reach the cases an essay introduces.
 */
const getAllArticles = vi.hoisted(() => vi.fn<() => Article[]>());

vi.mock("@/lib/articles", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/articles")>()),
  getAllArticles,
}));

const sitemap = (await import("./sitemap")).default;

const essay = (over: Partial<Article> = {}): Article => ({
  slug: "excel-sheets",
  title: "Excel Sheets",
  description: "",
  date: "2026-05-04",
  tags: [],
  kind: "essay",
  collection: "writing",
  readingTime: 3,
  ...over,
});

/** Entries for a slug. */
const forSlug = (slug: string) =>
  sitemap().filter((e) => new URL(e.url).pathname.endsWith(`/${slug}`));

beforeEach(() => {
  getAllArticles.mockReset().mockReturnValue([]);
});

describe("sitemap, essay entries", () => {
  it("lists an essay once", () => {
    getAllArticles.mockReturnValue([essay()]);
    const entries = forSlug("excel-sheets");

    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(`${site.url}/writing/excel-sheets`);
  });

  it("stamps an essay with its own date", () => {
    getAllArticles.mockReturnValue([essay()]);
    expect(forSlug("excel-sheets")[0].lastModified).toBe("2026-05-04");
  });

  it("claims no date for an undated essay, rather than inventing one", () => {
    getAllArticles.mockReturnValue([essay({ date: "" })]);
    expect(forSlug("excel-sheets")[0]).not.toHaveProperty("lastModified");
  });

  it("dates the home and writing pages from the newest article", () => {
    getAllArticles.mockReturnValue([
      essay({ slug: "older", date: "2020-01-01" }),
      essay({ slug: "newer", date: "2026-05-04" }),
    ]);
    const home = sitemap().find((e) => e.url === site.url)!;
    const writing = sitemap().find((e) => e.url === `${site.url}/writing`)!;
    expect(home.lastModified).toBe("2026-05-04");
    expect(writing.lastModified).toBe("2026-05-04");
  });

  it("leaves those pages undated when no article carries a date", () => {
    getAllArticles.mockReturnValue([essay({ date: "" })]);
    const home = sitemap().find((e) => e.url === site.url)!;
    expect(home).not.toHaveProperty("lastModified");
  });

  it("still lists the chrome pages when there is no writing", () => {
    const entries = sitemap();
    for (const sub of ["", "/writing", "/projects", "/about"]) {
      expect(entries.map((e) => e.url)).toContain(`${site.url}${sub}`);
    }
  });
});
