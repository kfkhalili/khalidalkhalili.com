import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { LOCALES, DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import { localeUrl, localeAlternateUrls } from "@/lib/share";

/**
 * Every page the site offers for indexing.
 *
 * A page is listed once per locale, carrying the whole `hreflang` set, when the
 * three locales are genuine translations: the chrome pages are, and so are the
 * explorables, which hold real per-locale copy. An essay is not. It is one
 * document in one language that renders under any locale with translated chrome
 * around it, so it is listed once, at its own language, claiming no
 * translations it doesn't have.
 *
 * Two things are deliberately absent. `reading` and `chess` render a live
 * third-party API and degrade to a bare link when it's down, so the site links
 * them but doesn't nominate them. And `lastModified` is omitted wherever the
 * repo holds no real date: stamping the build time would announce that the
 * whole site changed on every deploy, which is how a `lastmod` stops being
 * believed at all.
 */

/** The newest real date, ignoring articles whose frontmatter carried none. */
function newest(dates: string[]): string | undefined {
  return dates.filter(Boolean).sort().at(-1); // ISO dates sort lexicographically
}

/** A page that exists in all three languages, with its alternates. */
function translated(
  lang: string,
  sub: string,
  lastModified?: string,
): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl(lang, sub),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages: localeAlternateUrls(sub) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Slugs and dates don't vary by locale (only titles do), so the inventory is
  // taken once. getAllArticles has already settled any slug collision the same
  // way the article route does, so there is nothing to tie-break here.
  const articles = getAllArticles(DEFAULT_LOCALE);
  const latestArticle = newest(articles.map((a) => a.date));

  const chrome: { sub: string; lastModified?: string }[] = [
    { sub: "", lastModified: latestArticle }, // the home page leads with the featured article
    { sub: "/writing", lastModified: latestArticle },
    {
      sub: "/projects",
      lastModified: newest(getProjects(DEFAULT_LOCALE).map((p) => p.date)),
    },
    { sub: "/about" }, // no date is authored for it, so none is claimed
  ];

  const explorables = articles.filter((a) => a.kind === "explorable");
  const essays = articles.filter((a) => a.kind === "essay");

  return [
    ...LOCALES.flatMap((lang) => [
      ...chrome.map((p) => translated(lang, p.sub, p.lastModified)),
      ...explorables.map((a) =>
        translated(lang, `/writing/${a.slug}`, a.date || undefined),
      ),
    ]),
    ...essays.map((a) => ({
      url: localeUrl(
        isLocale(a.lang) ? a.lang : DEFAULT_LOCALE,
        `/writing/${a.slug}`,
      ),
      ...(a.date ? { lastModified: a.date } : {}),
    })),
  ];
}
