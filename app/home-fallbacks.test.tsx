import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Article } from "@/lib/articles";
import { strings } from "@/lib/strings";

/**
 * The home page picks one article to lead with. These are the shapes the
 * registry can take that the happy-path tests never produce: nothing marked
 * featured, and nothing published at all.
 */
const getAllArticles = vi.hoisted(() => vi.fn<() => Article[]>());

vi.mock("@/lib/articles", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/articles")>()),
  getAllArticles,
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const Home = (await import("./page")).default;

const article = (slug: string, featured?: boolean): Article => ({
  slug,
  title: `Title of ${slug}`,
  description: "A description.",
  date: "2026-01-01",
  tags: [],
  featured,
  kind: "essay",
  collection: "writing",
  readingTime: 3,
});

const renderHome = () => render(Home());

beforeEach(() => {
  getAllArticles.mockReset();
});

describe("Home, when nothing is featured", () => {
  it("leads with the newest article instead", async () => {
    getAllArticles.mockReturnValue([article("newest"), article("older")]);
    renderHome();

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title of newest");
    expect(screen.getByRole("link", { name: new RegExp(strings.home.ctaExplore) })).toHaveAttribute(
      "href",
      "/writing/newest",
    );
  });

  it("prefers a featured article over a newer unfeatured one", async () => {
    getAllArticles.mockReturnValue([article("newest"), article("chosen", true)]);
    renderHome();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title of chosen");
  });
});

describe("Home, when there is nothing to read yet", () => {
  it("still renders the hero", async () => {
    getAllArticles.mockReturnValue([]);
    const { container } = renderHome();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(container.querySelector("section p.text-lg")).toBeInTheDocument();
  });

  it("drops the explore call to action rather than linking nowhere", async () => {
    getAllArticles.mockReturnValue([]);
    renderHome();
    expect(
      screen.queryByRole("link", { name: new RegExp(strings.home.ctaExplore) }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: strings.home.ctaRead })).toHaveAttribute(
      "href",
      "/writing",
    );
  });

  it("drops the featured section entirely", async () => {
    getAllArticles.mockReturnValue([]);
    renderHome();
    expect(screen.queryByRole("heading", { name: strings.home.featured })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});
