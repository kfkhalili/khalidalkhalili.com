import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechnicalDebtArticle } from "./technical-debt";
import { ThirdThingArticle } from "./the-third-thing";
import { getTechDebtContent, TD_CONTENT } from "./technical-debt.content";
import { getThirdThingContent, TT_CONTENT } from "./the-third-thing.content";
import { LOCALES } from "@/lib/i18n";

/** Strip the authored inline HTML so prose can be matched against the DOM's text. */
const text = (html: string) => html.replace(/<[^>]+>/g, "");

beforeEach(() => {
  // Both bodies embed sims that run on an interval and watch for scroll.
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("TechnicalDebtArticle", () => {
  it.each(LOCALES)("renders the %s prose", (locale) => {
    const c = getTechDebtContent(locale);
    const { container } = render(<TechnicalDebtArticle lang={locale} />);
    expect(container.textContent).toContain(text(c.intro));
    expect(container.textContent).toContain(text(c.trap));
    expect(container.textContent).toContain(text(c.conclusion));
  });

  it("falls back to the default locale's prose for an unknown language", () => {
    const { container } = render(<TechnicalDebtArticle lang="fr" />);
    expect(container.textContent).toContain(text(TD_CONTENT.en.intro));
  });

  it("renders the authored inline HTML rather than escaping it", () => {
    const { container } = render(<TechnicalDebtArticle lang="en" />);
    expect(container.querySelectorAll("strong").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("<strong>");
  });

  it("embeds the live simulation", () => {
    render(<TechnicalDebtArticle lang="en" />);
    expect(
      screen.getByRole("slider", { name: TD_CONTENT.en.sim.allocationAria }),
    ).toBeInTheDocument();
  });

  it("lays out the argument as headings, a list, and numbered steps", () => {
    const c = getTechDebtContent("en");
    const { container } = render(<TechnicalDebtArticle lang="en" />);
    expect(screen.getByRole("heading", { name: c.archetypesHeading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: c.modelHeading })).toBeInTheDocument();
    expect(container.querySelectorAll("ul > li")).toHaveLength(c.archetypes.length);
    expect(container.querySelectorAll("ol > li")).toHaveLength(c.modelSteps.length);
  });

  it("folds the hindsight notes away behind their summaries", () => {
    const c = getTechDebtContent("en");
    const { container } = render(<TechnicalDebtArticle lang="en" />);
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(c.details.length);
    for (const [i, entry] of c.details.entries()) {
      expect(details[i].querySelector("summary")).toHaveTextContent(entry[0]);
      expect(details[i].open).toBe(false);
    }
  });

  it("embeds the talk, titled in the page's language", () => {
    const { container } = render(<TechnicalDebtArticle lang="de" />);
    const iframe = container.querySelector("iframe")!;
    expect(iframe).toHaveAttribute("title", TD_CONTENT.de.videoTitle);
    expect(iframe.getAttribute("src")).toContain("youtube.com/embed/");
    expect(iframe).toHaveAttribute("allowfullscreen");
  });
});

describe("ThirdThingArticle", () => {
  it.each(LOCALES)("renders the %s prose", (locale) => {
    const c = getThirdThingContent(locale);
    const { container } = render(<ThirdThingArticle lang={locale} />);
    expect(container.textContent).toContain(text(c.opening[0]));
    expect(container.textContent).toContain(text(c.thirdThing));
    expect(container.textContent).toContain(text(c.closing[c.closing.length - 1]));
  });

  it("falls back to the default locale's prose for an unknown language", () => {
    const { container } = render(<ThirdThingArticle lang="fr" />);
    expect(container.textContent).toContain(text(TT_CONTENT.en.thirdThing));
  });

  it("renders every paragraph of every prose block", () => {
    const c = getThirdThingContent("en");
    const { container } = render(<ThirdThingArticle lang="en" />);
    for (const paragraph of [...c.opening, ...c.symptoms, ...c.dialect, ...c.why, ...c.fix, ...c.closing]) {
      expect(container.textContent).toContain(text(paragraph));
    }
  });

  it("embeds all three interactive artifacts", () => {
    const c = getThirdThingContent("en");
    render(<ThirdThingArticle lang="en" />);
    expect(screen.getByText(c.statusPage.heading)).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: c.sim.pressureAria })).toBeInTheDocument();
    expect(screen.getByText(c.diagnostic.heading)).toBeInTheDocument();
  });

  it("puts each artifact where the argument produces it", () => {
    const c = getThirdThingContent("en");
    const { container } = render(<ThirdThingArticle lang="en" />);
    const order = [...container.children].map((el) => el.textContent ?? "");
    const indexOf = (needle: string) => order.findIndex((t) => t.includes(needle));

    expect(indexOf(c.statusPage.heading)).toBeGreaterThan(indexOf(text(c.dialectIntro)));
    expect(indexOf(c.sim.badgeLabel)).toBeGreaterThan(indexOf(text(c.why[c.why.length - 1])));
    expect(indexOf(c.diagnostic.heading)).toBeGreaterThan(indexOf(text(c.audit)));
  });

  it("captions the sim with the line that operates it, in the machine's voice", () => {
    const c = getThirdThingContent("en");
    const { container } = render(<ThirdThingArticle lang="en" />);
    const figures = [...container.querySelectorAll("figure")];

    // Caption and machine are one unit, so the line reads as a label rather
    // than as another paragraph of the essay. Only the sim needs one: the other
    // two artifacts say what they are.
    expect(figures).toHaveLength(1);
    const figcaption = figures[0].querySelector("figcaption")!;
    expect(figcaption).toHaveTextContent(text(c.simCaption));
    expect(figcaption.className).toContain("font-mono");
    expect(figures[0].textContent).toContain(c.sim.badgeLabel);
  });

  it.each(LOCALES)("leaves the four questions to the diagnostic in %s", (locale) => {
    // The machine asks them with buttons, so the prose that hands off to it
    // names the count and stays out of the enumeration.
    const c = getThirdThingContent(locale);
    const prose = text(c.audit).toLowerCase();
    for (const question of c.diagnostic.questions) {
      expect(prose).not.toContain(question.q.replace(/[?؟]/g, "").toLowerCase());
    }
  });

  it("renders the authored links rather than escaping them", () => {
    const { container } = render(<ThirdThingArticle lang="en" />);
    const links = container.querySelectorAll("a[href^='https://']");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
