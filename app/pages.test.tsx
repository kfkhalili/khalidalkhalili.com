import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home, { generateMetadata as homeMetadata } from "./page";
import AboutPage, { generateMetadata as aboutMetadata } from "./about/page";
import ProjectsPage, { generateMetadata as projectsMetadata } from "./projects/page";
import WritingPage, { generateMetadata as writingMetadata } from "./writing/page";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { readContent } from "@/lib/content";
import { strings } from "@/lib/strings";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("Home", () => {
  it("leads with the hero copy", () => {
    const { meta } = readContent("home");
    render(Home());
    expect(screen.getByText(meta.eyebrow!)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(meta.heading!);
  });

  it("renders the lead's inline markdown as HTML", () => {
    const { container } = render(Home());
    const lead = container.querySelector("section p.text-lg")!;
    expect(lead.textContent).not.toContain("*");
    expect(lead.textContent!.length).toBeGreaterThan(40);
  });

  it("sends both calls to action to the writing", () => {
    render(Home());
    const featured = getAllArticles().find((a) => a.featured)!;

    expect(
      screen.getByRole("link", { name: new RegExp(strings.home.ctaExplore) }),
    ).toHaveAttribute("href", `/writing/${featured.slug}`);
    expect(screen.getByRole("link", { name: strings.home.ctaRead })).toHaveAttribute(
      "href",
      "/writing",
    );
  });

  it("turns the portrait towards the greeting", () => {
    // The photograph looks to the reader's right, which is off the page in a
    // left-to-right layout, so it is flipped to face the greeting.
    render(Home());
    expect(screen.getByAltText(strings.site.title)).toHaveClass("-scale-x-100");
  });

  it("features one article, and links on to the rest", () => {
    render(Home());
    expect(screen.getByRole("heading", { name: strings.home.featured })).toBeInTheDocument();
    const featured = getAllArticles().find((a) => a.featured)!;
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(featured.title);
    expect(
      screen.getAllByRole("link", { name: new RegExp(strings.home.allWriting) }).length,
    ).toBeGreaterThan(0);
  });

  it("titles itself with the site's own name, unsuffixed", () => {
    // "Khalid Alkhalili", not "Khalid Alkhalili · Khalid": the home page is the
    // site, not a page within it, so it opts out of the layout's template.
    const metadata = homeMetadata();
    expect(metadata.title).toEqual({ absolute: strings.site.title });
    expect(metadata.description).toBe(strings.site.description);
  });

  it("names the root as its canonical", () => {
    const metadata = homeMetadata();
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({ url: "/", locale: "en_US" });
  });
});

describe("AboutPage", () => {
  it("renders the about copy", () => {
    const { meta } = readContent("about");
    const { container } = render(AboutPage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(meta.title!);
    expect(container.querySelector(".prose")!.innerHTML).toContain("<p>");
  });

  it("titles the page from the content's own frontmatter", () => {
    const { meta } = readContent("about");
    expect(aboutMetadata()).toMatchObject({
      title: meta.title,
      description: meta.description,
    });
  });

  it("names its own address for search engines", () => {
    expect(aboutMetadata().alternates).toEqual({ canonical: "/about" });
  });
});

describe("ProjectsPage", () => {
  it("lists every project", () => {
    render(ProjectsPage());
    const projects = getProjects();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(projects.length);
    for (const project of projects) {
      expect(screen.getByRole("heading", { name: project.name })).toBeInTheDocument();
    }
  });

  it("heads the page", () => {
    render(ProjectsPage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(strings.projects.title);
    expect(screen.getByText(strings.projects.subtitle)).toBeInTheDocument();
  });

  it("takes its metadata from the site's copy", () => {
    const metadata = projectsMetadata();
    expect(metadata).toMatchObject({
      title: strings.projects.title,
      description: strings.projects.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/projects");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      title: strings.projects.title,
      url: "/projects",
      siteName: strings.site.title,
      locale: "en_US",
    });
  });
});

describe("WritingPage", () => {
  /** The index, optionally as a reader arrives at it from a tag. */
  const renderIndex = async (tag?: string | string[]) =>
    render(
      await WritingPage({
        searchParams: Promise.resolve(tag === undefined ? {} : { tag }),
      }),
    );

  it("lists every article", async () => {
    await renderIndex();
    const articles = getAllArticles();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(articles.length);
    for (const article of articles) {
      expect(screen.getByRole("heading", { name: article.title })).toBeInTheDocument();
    }
  });

  it("links each card to its article", async () => {
    await renderIndex();
    for (const article of getAllArticles()) {
      expect(screen.getByRole("link", { name: new RegExp(article.title) })).toHaveAttribute(
        "href",
        `/writing/${article.slug}`,
      );
    }
  });

  it("heads the page", async () => {
    await renderIndex();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(strings.writing.title);
  });

  it("takes its metadata from the site's copy", () => {
    const metadata = writingMetadata();
    expect(metadata).toMatchObject({
      title: strings.writing.title,
      description: strings.writing.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/writing");
  });

  describe("narrowed to a tag", () => {
    it("shows only the pieces carrying the tag, in the shipped HTML", async () => {
      const [first] = getAllArticles().filter((a) => a.tags.length > 0);
      await renderIndex(first.tags[0]);

      const shown = getAllArticles().filter((a) => a.tags.includes(first.tags[0]));
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(shown.length);
      expect(screen.getByRole("heading", { name: first.title })).toBeInTheDocument();
    });

    it("marks the chosen tag, and links every other one back out", async () => {
      const tag = getAllArticles()[0].tags[0];
      await renderIndex(tag);
      const row = within(screen.getByRole("group", { name: strings.writing.filters.tag }));

      expect(row.getByRole("link", { name: new RegExp(tag) })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        row.getByRole("link", { name: new RegExp(strings.writing.filters.all) }),
      ).toHaveAttribute("href", "/writing");
    });

    it("offers the same tag row filtered or not, so the articles do not move", async () => {
      const tag = getAllArticles()[0].tags[0];
      const rowLinks = () =>
        within(screen.getByRole("group", { name: strings.writing.filters.tag }))
          .getAllByRole("link")
          .map((l) => l.textContent);

      const unfiltered = await renderIndex();
      const before = rowLinks();
      unfiltered.unmount();

      await renderIndex(tag);
      expect(rowLinks()).toEqual(before);
    });

    it("says so when the tag names nothing", async () => {
      await renderIndex("no-such-tag");
      expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
      expect(screen.getByText(strings.writing.filters.noMatch)).toBeInTheDocument();
    });

    it("opens on the whole index when the URL asks for two tags at once", async () => {
      await renderIndex(["Software Design", "IT Projects"]);
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
        getAllArticles().length,
      );
      expect(
        within(screen.getByRole("group", { name: strings.writing.filters.tag })).getByRole(
          "link",
          { name: new RegExp(strings.writing.filters.all) },
        ),
      ).toHaveAttribute("aria-current", "page");
    });
  });
});
