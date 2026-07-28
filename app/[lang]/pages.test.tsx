import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home, { generateMetadata as homeMetadata } from "./page";
import AboutPage, { generateMetadata as aboutMetadata } from "./about/page";
import ProjectsPage, { generateMetadata as projectsMetadata } from "./projects/page";
import WritingPage, { generateMetadata as writingMetadata } from "./writing/page";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { readContent } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";
import en from "@/dictionaries/en.json";
import de from "@/dictionaries/de.json";
import ar from "@/dictionaries/ar.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));

/** Await an async server component and render what it returned. */
async function renderPage<P>(
  page: (props: { params: Promise<P> }) => Promise<React.ReactNode>,
  params: P,
) {
  return render(await page({ params: Promise.resolve(params) }));
}

describe("Home", () => {
  it.each(LOCALES)("leads with the %s hero copy", async (lang) => {
    const { meta } = readContent(lang, "home");
    await renderPage(Home, { lang });
    expect(screen.getByText(meta.eyebrow)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(meta.heading);
  });

  it("renders the lead's inline markdown as HTML", async () => {
    const { container } = await renderPage(Home, { lang: "en" });
    const lead = container.querySelector("section p.text-lg")!;
    expect(lead.textContent).not.toContain("*");
    expect(lead.textContent!.length).toBeGreaterThan(40);
  });

  it("sends both calls to action into the current locale", async () => {
    await renderPage(Home, { lang: "de" });
    const featured = getAllArticles("de").find((a) => a.featured)!;

    expect(
      screen.getByRole("link", { name: new RegExp(de.home.ctaExplore) }),
    ).toHaveAttribute("href", `/de/writing/${featured.slug}`);
    expect(screen.getByRole("link", { name: de.home.ctaRead })).toHaveAttribute(
      "href",
      "/de/writing",
    );
  });

  it("points the arrows the way the language reads", async () => {
    const { container, unmount } = await renderPage(Home, { lang: "en" });
    expect(container.textContent).toContain("→");
    unmount();

    const rtl = await renderPage(Home, { lang: "ar" });
    expect(rtl.container.textContent).toContain("←");
  });

  it("turns the portrait towards the greeting in either direction", async () => {
    // The photograph looks to the reader's right, so a left-to-right page has
    // to flip it to face the greeting; a right-to-left one already does.
    const ltr = await renderPage(Home, { lang: "en" });
    expect(screen.getByAltText(en.site.title)).toHaveClass("-scale-x-100");
    ltr.unmount();

    await renderPage(Home, { lang: "ar" });
    expect(screen.getByAltText(ar.site.title)).not.toHaveClass("-scale-x-100");
  });

  it("features one article, and links on to the rest", async () => {
    await renderPage(Home, { lang: "en" });
    expect(screen.getByRole("heading", { name: en.home.featured })).toBeInTheDocument();
    const featured = getAllArticles("en").find((a) => a.featured)!;
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(featured.title);
    expect(
      screen.getAllByRole("link", { name: new RegExp(en.home.allWriting) }).length,
    ).toBeGreaterThan(0);
  });

  it("speaks the reader's language throughout", async () => {
    await renderPage(Home, { lang: "ar" });
    expect(screen.getByRole("heading", { name: ar.home.featured })).toBeInTheDocument();
  });

  it("titles itself with the site's own name, unsuffixed", async () => {
    // "Khalid Alkhalili", not "Khalid Alkhalili · Khalid": the home page is the
    // site, not a page within it, so it opts out of the layout's template.
    const metadata = await homeMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata.title).toEqual({ absolute: en.site.title });
    expect(metadata.description).toBe(en.site.description);
  });

  it("names the locale root as its canonical, with no trailing slash", async () => {
    const metadata = await homeMetadata({ params: Promise.resolve({ lang: "ar" }) });
    expect(metadata.alternates?.canonical).toBe("/ar");
    expect(metadata.openGraph).toMatchObject({ url: "/ar", locale: "ar_AR" });
  });
});

describe("AboutPage", () => {
  it.each(LOCALES)("renders the %s about copy", async (lang) => {
    const { meta } = readContent(lang, "about");
    const { container } = await renderPage(AboutPage, { lang });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(meta.title);
    expect(container.querySelector(".prose")!.innerHTML).toContain("<p>");
  });

  it("titles the page from the content's own frontmatter", async () => {
    for (const lang of LOCALES) {
      const { meta } = readContent(lang, "about");
      const metadata = await aboutMetadata({ params: Promise.resolve({ lang }) });
      expect(metadata).toMatchObject({
        title: meta.title,
        description: meta.description,
      });
    }
  });

  it("names its own address, and every locale's, for search engines", async () => {
    const metadata = await aboutMetadata({ params: Promise.resolve({ lang: "de" }) });
    expect(metadata.alternates).toEqual({
      canonical: "/de/about",
      languages: {
        en: "/en/about",
        de: "/de/about",
        ar: "/ar/about",
        "x-default": "/en/about",
      },
    });
  });
});

describe("ProjectsPage", () => {
  it.each(LOCALES)("lists every project in %s", async (lang) => {
    await renderPage(ProjectsPage, { lang });
    const projects = getProjects(lang);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(projects.length);
    for (const project of projects) {
      expect(screen.getByRole("heading", { name: project.name })).toBeInTheDocument();
    }
  });

  it("heads the page in the reader's language", async () => {
    await renderPage(ProjectsPage, { lang: "ar" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(ar.projects.title);
    expect(screen.getByText(ar.projects.subtitle)).toBeInTheDocument();
  });

  it("takes its metadata from the dictionary", async () => {
    const metadata = await projectsMetadata({ params: Promise.resolve({ lang: "de" }) });
    expect(metadata).toMatchObject({
      title: de.projects.title,
      description: de.projects.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/de/projects");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      title: de.projects.title,
      url: "/de/projects",
      siteName: de.site.title,
      locale: "de_DE",
    });
  });
});

describe("WritingPage", () => {
  it.each(LOCALES)("lists every article in %s", async (lang) => {
    await renderPage(WritingPage, { lang });
    const articles = getAllArticles(lang);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(articles.length);
    for (const article of articles) {
      expect(screen.getByRole("heading", { name: article.title })).toBeInTheDocument();
    }
  });

  it("links each card into the current locale", async () => {
    await renderPage(WritingPage, { lang: "de" });
    for (const article of getAllArticles("de")) {
      expect(screen.getByRole("link", { name: new RegExp(article.title) })).toHaveAttribute(
        "href",
        `/de/writing/${article.slug}`,
      );
    }
  });

  it("heads the page in the reader's language", async () => {
    await renderPage(WritingPage, { lang: "en" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.writing.title);
  });

  it("takes its metadata from the dictionary", async () => {
    const metadata = await writingMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata).toMatchObject({
      title: en.writing.title,
      description: en.writing.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/en/writing");
  });

  it("falls back to the default locale's copy for an unknown language", async () => {
    const metadata = await writingMetadata({ params: Promise.resolve({ lang: "fr" }) });
    expect(metadata).toMatchObject({
      title: en.writing.title,
      description: en.writing.subtitle,
    });
    // The copy falls back, but the address is still the one that was asked for.
    expect(metadata.alternates?.canonical).toBe("/fr/writing");
  });

  describe("narrowed to a tag", () => {
    /** The index as a reader arrives at it from a tag on a card or a piece. */
    const renderTagged = async (lang: string, tag?: string | string[]) =>
      render(
        await WritingPage({
          params: Promise.resolve({ lang }),
          searchParams: Promise.resolve({ tag }),
        }),
      );

    it("shows only the pieces carrying the tag, in the shipped HTML", async () => {
      const [first] = getAllArticles("en").filter((a) => a.tags.length > 0);
      await renderTagged("en", first.tags[0]);

      const shown = getAllArticles("en").filter((a) => a.tags.includes(first.tags[0]));
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(shown.length);
      expect(screen.getByRole("heading", { name: first.title })).toBeInTheDocument();
    });

    it("marks the chosen tag, and links every other one back out", async () => {
      const tag = getAllArticles("de")[0].tags[0];
      await renderTagged("de", tag);
      const row = within(screen.getByRole("group", { name: de.writing.filters.tag }));

      expect(row.getByRole("link", { name: new RegExp(tag) })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        row.getByRole("link", { name: new RegExp(de.writing.filters.all) }),
      ).toHaveAttribute("href", "/de/writing");
    });

    it("offers the same tag row filtered or not, so the articles do not move", async () => {
      const tag = getAllArticles("en")[0].tags[0];
      const rowLinks = () =>
        within(screen.getByRole("group", { name: en.writing.filters.tag }))
          .getAllByRole("link")
          .map((l) => l.textContent);

      const unfiltered = await renderTagged("en");
      const before = rowLinks();
      unfiltered.unmount();

      await renderTagged("en", tag);
      expect(rowLinks()).toEqual(before);
    });

    it("says so when the tag names nothing", async () => {
      await renderTagged("en", "no-such-tag");
      expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
      expect(screen.getByText(en.writing.filters.noMatch)).toBeInTheDocument();
    });

    it("opens on the whole index when the URL asks for two tags at once", async () => {
      await renderTagged("en", ["Software Design", "IT Projects"]);
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
        getAllArticles("en").length,
      );
      expect(
        within(screen.getByRole("group", { name: en.writing.filters.tag })).getByRole(
          "link",
          { name: new RegExp(en.writing.filters.all) },
        ),
      ).toHaveAttribute("aria-current", "page");
    });
  });
});
