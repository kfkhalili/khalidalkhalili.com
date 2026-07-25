import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Article } from "@/lib/articles";
import { site } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";

/**
 * The essay half of the sitemap. The repo ships no essays yet, so sitemap.test.ts
 * exercises the chrome and explorable entries against real data; this drives the
 * registry from a stub to reach the cases an essay introduces.
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
  lang: "en",
  kind: "essay",
  readingTime: 3,
  ...over,
});

/** Entries for a slug, whatever locale they sit under. */
const forSlug = (slug: string) =>
  sitemap().filter((e) => new URL(e.url).pathname.endsWith(`/${slug}`));

beforeEach(() => {
  getAllArticles.mockReset().mockReturnValue([]);
});

describe("sitemap, essay entries", () => {
  it("lists an essay once, at the language it was written in", () => {
    getAllArticles.mockReturnValue([essay({ lang: "de" })]);
    const entries = forSlug("excel-sheets");

    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe(`${site.url}/de/writing/excel-sheets`);
    expect(entries[0].alternates).toBeUndefined();
  });

  it("files an essay in an unknown language under the default locale", () => {
    // Better a real URL in the default locale than a /fr/ one the site has no
    // route for and the proxy would redirect away from.
    getAllArticles.mockReturnValue([essay({ lang: "fr" })]);
    expect(forSlug("excel-sheets")[0].url).toBe(`${site.url}/en/writing/excel-sheets`);
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
    const home = sitemap().find((e) => e.url === `${site.url}/en`)!;
    const writing = sitemap().find((e) => e.url === `${site.url}/en/writing`)!;
    expect(home.lastModified).toBe("2026-05-04");
    expect(writing.lastModified).toBe("2026-05-04");
  });

  it("leaves those pages undated when no article carries a date", () => {
    getAllArticles.mockReturnValue([essay({ date: "" })]);
    const home = sitemap().find((e) => e.url === `${site.url}/en`)!;
    expect(home).not.toHaveProperty("lastModified");
  });

  it("claims no date for an undated explorable either", () => {
    getAllArticles.mockReturnValue([
      essay({ slug: "undated-sim", kind: "explorable", date: "" }),
    ]);
    const entries = forSlug("undated-sim");
    expect(entries).toHaveLength(LOCALES.length);
    for (const entry of entries) {
      expect(entry).not.toHaveProperty("lastModified");
      // Translated all the same: an explorable is a real page in each locale.
      expect(entry.alternates?.languages).toBeDefined();
    }
  });

  it("still lists the chrome pages in every locale when there is no writing", () => {
    const entries = sitemap();
    for (const lang of LOCALES) {
      for (const sub of ["", "/writing", "/projects", "/about"]) {
        expect(entries.map((e) => e.url)).toContain(`${site.url}/${lang}${sub}`);
      }
    }
  });

  it("never claims a translation of the about page it does not carry a date for", () => {
    const about = sitemap().find((e) => e.url === `${site.url}/en/about`)!;
    expect(about).not.toHaveProperty("lastModified");
    expect(about.alternates?.languages).toBeDefined();
  });
});
