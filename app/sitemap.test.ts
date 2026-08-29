import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { getAllArticles, getEssaySlugs } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { site } from "@/lib/site";

const entries = sitemap();

/** Path segments of an entry, so assertions anchor instead of substring-match:
 *  an essay at /writing/reading must not read as the /reading page. */
function segments(url: string): string[] {
  return new URL(url).pathname.split("/").filter(Boolean);
}

describe("sitemap", () => {
  it("lists exactly the site's pages, and nothing twice", () => {
    // Naming the URLs rather than counting them: a count passes just as happily
    // when a page is swapped for one that doesn't exist.
    const subs = [
      "",
      "/writing",
      "/projects",
      "/about",
      ...getAllArticles().map((a) => `/writing/${a.slug}`),
    ];
    expect(entries.map((e) => e.url).sort()).toEqual(
      subs.map((sub) => `${site.url}${sub}`).sort(),
    );
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });

  it("lists every explorable and every essay once", () => {
    for (const slug of [...EXPLORABLE_SLUGS, ...getEssaySlugs()]) {
      expect(entries.filter((e) => segments(e.url).at(-1) === slug)).toHaveLength(1);
    }
  });

  it("emits absolute URLs on one origin, with no trailing slash", () => {
    for (const { url } of entries) {
      expect(url === site.url || url.startsWith(`${site.url}/`)).toBe(true);
      expect(url.endsWith("/")).toBe(false);
    }
  });

  it("leaves out the pages a live third-party API renders", () => {
    for (const { url } of entries) {
      const [section] = segments(url);
      expect(section).not.toBe("reading");
      expect(section).not.toBe("chess");
      expect(section).not.toBe("islam");
    }
  });

  it("leaves out assets", () => {
    for (const { url } of entries) {
      expect(segments(url)).not.toContain("opengraph-image");
      expect(segments(url)).not.toContain("icon.svg");
    }
  });

  it("claims only dates that the content itself carries", () => {
    // The property that matters is that no date is invented: a build-time
    // stamp would announce that every page changed on every deploy.
    const authored = new Set(
      [
        ...getAllArticles().map((a) => a.date),
        ...getProjects().map((p) => p.date),
      ].filter(Boolean),
    );
    for (const { lastModified } of entries) {
      if (lastModified === undefined) continue;
      expect(lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(authored).toContain(lastModified);
    }
  });

  it("claims no date for the one page that has none authored", () => {
    const about = entries.find((e) => segments(e.url).join("/") === "about")!;
    expect(about).toBeDefined();
    expect(about.lastModified).toBeUndefined();
  });
});
