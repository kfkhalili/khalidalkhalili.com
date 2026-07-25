import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { getAllArticles, getEssaySlugs } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { site } from "@/lib/site";

const entries = sitemap();

/** Path segments of an entry, so assertions anchor instead of substring-match:
 *  an essay at /en/writing/reading must not read as the /en/reading page. */
function segments(url: string): string[] {
  return new URL(url).pathname.split("/").filter(Boolean);
}

describe("sitemap", () => {
  it("lists exactly the translated pages, in each locale, and nothing twice", () => {
    // Naming the URLs rather than counting them: a count passes just as happily
    // when a page is swapped for one that doesn't exist.
    const translatedSubs = [
      "",
      "/writing",
      "/projects",
      "/about",
      ...EXPLORABLE_SLUGS.map((s) => `/writing/${s}`),
    ];
    // An essay is one document in one language, so it appears under that
    // language only, not once per locale like the translated pages.
    const essays = getAllArticles(DEFAULT_LOCALE).filter(
      (a) => a.kind === "essay",
    );
    for (const lang of LOCALES) {
      const subs = [
        ...translatedSubs,
        ...essays
          .filter((e) => (LOCALES.includes(e.lang as never) ? e.lang : DEFAULT_LOCALE) === lang)
          .map((e) => `/writing/${e.slug}`),
      ];
      const mine = entries
        .map((e) => e.url)
        .filter((u) => segments(u)[0] === lang);
      expect(mine.sort()).toEqual(
        subs.map((sub) => `${site.url}/${lang}${sub}`).sort(),
      );
    }
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });

  it("lists an untranslated essay once, at its own language", () => {
    // An essay renders under any locale, but that is one document with
    // translated chrome, so it must not appear three times or claim siblings.
    for (const slug of getEssaySlugs()) {
      const mine = entries.filter((e) => segments(e.url).at(-1) === slug);
      expect(mine).toHaveLength(1);
      expect(mine[0].alternates?.languages).toBeUndefined();
    }
  });

  it("emits absolute URLs on one origin, with no trailing slash", () => {
    for (const { url } of entries) {
      expect(url.startsWith(`${site.url}/`)).toBe(true);
      expect(url.endsWith("/")).toBe(false);
    }
  });

  it("opens every URL with a known locale", () => {
    for (const { url } of entries) {
      expect(LOCALES).toContain(segments(url)[0]);
    }
  });

  it("leaves out the pages a live third-party API renders", () => {
    for (const { url } of entries) {
      const [, section] = segments(url);
      expect(section).not.toBe("reading");
      expect(section).not.toBe("chess");
    }
  });

  it("leaves out assets and the bare redirecting root", () => {
    for (const { url } of entries) {
      expect(segments(url)).not.toContain("opengraph-image");
      expect(segments(url)).not.toContain("icon.svg");
    }
    expect(entries.some((e) => e.url === site.url)).toBe(false);
  });

  it("pairs each hreflang key with that locale's URL, itself included", () => {
    const translated = entries.filter((e) => e.alternates?.languages);
    expect(translated.length).toBeGreaterThan(0);

    for (const entry of translated) {
      const languages: Record<string, string> = {
        ...(entry.alternates?.languages as Record<string, string>),
      };
      expect(Object.keys(languages)).toEqual([...LOCALES, "x-default"]);

      // Membership alone would pass if every key held the same URL, so check
      // the pairing: key `de` must be the `de` URL of this very page.
      const [lang, ...rest] = segments(entry.url);
      for (const [key, url] of Object.entries(languages)) {
        expect(segments(url)).toEqual([
          key === "x-default" ? DEFAULT_LOCALE : key,
          ...rest,
        ]);
      }
      expect(languages[lang]).toBe(entry.url);
    }
  });

  it("claims only dates that the content itself carries", () => {
    // The property that matters is that no date is invented: a build-time
    // stamp would announce that every page changed on every deploy.
    const authored = new Set(
      [
        ...getAllArticles(DEFAULT_LOCALE).map((a) => a.date),
        ...getProjects(DEFAULT_LOCALE).map((p) => p.date),
      ].filter(Boolean),
    );
    for (const { lastModified } of entries) {
      if (lastModified === undefined) continue;
      expect(lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(authored).toContain(lastModified);
    }
  });

  it("claims no date for the one page that has none authored", () => {
    const about = entries.filter((e) => {
      const [, section, ...rest] = segments(e.url);
      return section === "about" && rest.length === 0;
    });
    expect(about).toHaveLength(LOCALES.length);
    for (const entry of about) expect(entry.lastModified).toBeUndefined();
  });
});
