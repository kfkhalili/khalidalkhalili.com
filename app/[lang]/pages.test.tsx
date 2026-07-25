import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";
import AboutPage, { generateMetadata as aboutMetadata } from "./about/page";
import ProjectsPage, { generateMetadata as projectsMetadata } from "./projects/page";
import WritingPage, { generateMetadata as writingMetadata } from "./writing/page";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { readContent } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";
import en from "@/dictionaries/en.json";
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
    const de = (await import("@/dictionaries/de.json")).default;
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
      expect(await aboutMetadata({ params: Promise.resolve({ lang }) })).toEqual({
        title: meta.title,
        description: meta.description,
      });
    }
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
    expect(await projectsMetadata({ params: Promise.resolve({ lang: "de" }) })).toEqual({
      title: (await import("@/dictionaries/de.json")).default.projects.title,
      description: (await import("@/dictionaries/de.json")).default.projects.subtitle,
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
    expect(await writingMetadata({ params: Promise.resolve({ lang: "en" }) })).toEqual({
      title: en.writing.title,
      description: en.writing.subtitle,
    });
  });

  it("falls back to the default locale's copy for an unknown language", async () => {
    expect(await writingMetadata({ params: Promise.resolve({ lang: "fr" }) })).toEqual({
      title: en.writing.title,
      description: en.writing.subtitle,
    });
  });
});
