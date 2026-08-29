import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechnicalDebtArticle } from "./technical-debt";
import { ThirdThingArticle } from "./the-third-thing";
import { TD_CONTENT } from "./technical-debt.content";
import { TT_CONTENT } from "./the-third-thing.content";

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
  it("renders the prose", () => {
    const c = TD_CONTENT;
    const { container } = render(<TechnicalDebtArticle />);
    expect(container.textContent).toContain(text(c.intro));
    expect(container.textContent).toContain(text(c.trap));
    expect(container.textContent).toContain(text(c.conclusion));
  });

  it("renders the authored inline HTML rather than escaping it", () => {
    const { container } = render(<TechnicalDebtArticle />);
    expect(container.querySelectorAll("strong").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("<strong>");
  });

  it("embeds the live simulation", () => {
    render(<TechnicalDebtArticle />);
    expect(
      screen.getByRole("slider", { name: TD_CONTENT.sim.allocationAria }),
    ).toBeInTheDocument();
  });

  it("lays out the argument as headings and numbered steps", () => {
    const c = TD_CONTENT;
    const { container } = render(<TechnicalDebtArticle />);
    expect(screen.getByRole("heading", { name: c.modelHeading })).toBeInTheDocument();
    expect(container.querySelectorAll("ol > li")).toHaveLength(c.modelSteps.length);
  });

  it("hands the four archetypes off to the sim", () => {
    // The sim explains each archetype when you pick it, so the paragraph that
    // introduces the sim names the count and stays out of the enumeration. It
    // is the same prose that sets the sim up, not a section of its own.
    const c = TD_CONTENT;
    const prose = text(c.intro).toLowerCase();
    for (const label of c.sim.presets) {
      expect(prose).not.toContain(label.toLowerCase());
    }
    for (const blurb of c.sim.archetypes) {
      expect(prose).not.toContain(text(blurb).toLowerCase());
    }
  });

  it("introduces the sim in the paragraph directly above it", () => {
    const c = TD_CONTENT;
    const { container } = render(<TechnicalDebtArticle />);
    const order = [...container.children];
    const intro = order.findIndex((el) => el.textContent?.includes(text(c.intro)));
    const sim = order.findIndex((el) => el.textContent?.includes(c.sim.allocation));
    expect(intro).toBeGreaterThanOrEqual(0);
    expect(sim).toBe(intro + 1);
  });

  it("folds the hindsight notes away behind their summaries", () => {
    const c = TD_CONTENT;
    const { container } = render(<TechnicalDebtArticle />);
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(c.details.length);
    for (const [i, entry] of c.details.entries()) {
      expect(details[i].querySelector("summary")).toHaveTextContent(entry[0]);
      expect(details[i].open).toBe(false);
    }
  });

  it("embeds the talk, with a title", () => {
    const { container } = render(<TechnicalDebtArticle />);
    const iframe = container.querySelector("iframe")!;
    expect(iframe).toHaveAttribute("title", TD_CONTENT.videoTitle);
    expect(iframe.getAttribute("src")).toContain("youtube.com/embed/");
    expect(iframe).toHaveAttribute("allowfullscreen");
  });
});

describe("ThirdThingArticle", () => {
  it("renders the prose", () => {
    const c = TT_CONTENT;
    const { container } = render(<ThirdThingArticle />);
    expect(container.textContent).toContain(text(c.opening[0]));
    expect(container.textContent).toContain(text(c.thirdThing));
    expect(container.textContent).toContain(text(c.closing[c.closing.length - 1]));
  });

  it("renders every paragraph of every prose block", () => {
    const c = TT_CONTENT;
    const { container } = render(<ThirdThingArticle />);
    for (const paragraph of [...c.opening, ...c.symptoms, ...c.dialect, ...c.why, ...c.fix, ...c.closing]) {
      expect(container.textContent).toContain(text(paragraph));
    }
  });

  it("embeds all three interactive artifacts", () => {
    const c = TT_CONTENT;
    render(<ThirdThingArticle />);
    expect(screen.getByText(c.statusPage.heading)).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: c.sim.pressureAria })).toBeInTheDocument();
    expect(screen.getByText(c.diagnostic.heading)).toBeInTheDocument();
  });

  it("puts each artifact where the argument produces it", () => {
    const c = TT_CONTENT;
    const { container } = render(<ThirdThingArticle />);
    const order = [...container.children].map((el) => el.textContent ?? "");
    const indexOf = (needle: string) => order.findIndex((t) => t.includes(needle));

    expect(indexOf(c.statusPage.heading)).toBeGreaterThan(indexOf(text(c.dialectIntro)));
    expect(indexOf(c.sim.badgeLabel)).toBeGreaterThan(indexOf(text(c.why[c.why.length - 1])));
    expect(indexOf(c.diagnostic.heading)).toBeGreaterThan(indexOf(text(c.audit)));
  });

  it("captions the sim with the line that operates it, in the machine's voice", () => {
    const c = TT_CONTENT;
    const { container } = render(<ThirdThingArticle />);
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

  it("leaves the four questions to the diagnostic", () => {
    // The machine asks them with buttons, so the prose that hands off to it
    // names the count and stays out of the enumeration.
    const c = TT_CONTENT;
    const prose = text(c.audit).toLowerCase();
    for (const question of c.diagnostic.questions) {
      expect(prose).not.toContain(question.q.replace(/[?؟]/g, "").toLowerCase());
    }
  });

  it("renders the authored links rather than escaping them", () => {
    const { container } = render(<ThirdThingArticle />);
    const links = container.querySelectorAll("a[href^='https://']");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
