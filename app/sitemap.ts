import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { pageUrl } from "@/lib/share";

/**
 * Every page the site offers for indexing.
 *
 * Two things are deliberately absent. The three live-feed pages (`reading`,
 * `islam`, `chess`) render a live third-party API and degrade to a bare link
 * when it's down, so the site links them but doesn't nominate them.
 * And `lastModified` is omitted wherever the repo holds no real date: stamping
 * the build time would announce that the whole site changed on every deploy,
 * which is how a `lastmod` stops being believed at all.
 */

/** The newest real date, ignoring articles whose frontmatter carried none. */
function newest(dates: string[]): string | undefined {
  return dates.filter(Boolean).sort().at(-1); // ISO dates sort lexicographically
}

export default function sitemap(): MetadataRoute.Sitemap {
  // getAllArticles has already settled any slug collision the same way the
  // article route does, so there is nothing to tie-break here.
  const articles = getAllArticles();
  const latestArticle = newest(articles.map((a) => a.date));

  const chrome: { sub: string; lastModified?: string }[] = [
    { sub: "", lastModified: latestArticle }, // the home page leads with the featured article
    { sub: "/writing", lastModified: latestArticle },
    {
      sub: "/projects",
      lastModified: newest(getProjects().map((p) => p.date)),
    },
    { sub: "/about" }, // no date is authored for it, so none is claimed
  ];

  return [
    ...chrome.map((p) => ({
      url: pageUrl(p.sub),
      ...(p.lastModified ? { lastModified: p.lastModified } : {}),
    })),
    ...articles.map((a) => ({
      url: pageUrl(`/writing/${a.slug}`),
      ...(a.date ? { lastModified: a.date } : {}),
    })),
  ];
}
