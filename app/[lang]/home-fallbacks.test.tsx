import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Article } from "@/lib/articles";
import en from "@/dictionaries/en.json";

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
vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));

const Home = (await import("./page")).default;

const article = (slug: string, featured?: boolean): Article => ({
  slug,
  title: `Title of ${slug}`,
  description: "A description.",
  date: "2026-01-01",
  tags: [],
  lang: "en",
  featured,
  kind: "essay",
  collection: "writing",
  readingTime: 3,
});

const renderHome = async () => render(await Home({ params: Promise.resolve({ lang: "en" }) }));

beforeEach(() => {
  getAllArticles.mockReset();
});

describe("Home, when nothing is featured", () => {
  it("leads with the newest article instead", async () => {
    getAllArticles.mockReturnValue([article("newest"), article("older")]);
    await renderHome();

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title of newest");
    expect(screen.getByRole("link", { name: new RegExp(en.home.ctaExplore) })).toHaveAttribute(
      "href",
      "/en/writing/newest",
    );
  });

  it("prefers a featured article over a newer unfeatured one", async () => {
    getAllArticles.mockReturnValue([article("newest"), article("chosen", true)]);
    await renderHome();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title of chosen");
  });
});

describe("Home, when there is nothing to read yet", () => {
  it("still renders the hero", async () => {
    getAllArticles.mockReturnValue([]);
    const { container } = await renderHome();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(container.querySelector("section p.text-lg")).toBeInTheDocument();
  });

  it("drops the explore call to action rather than linking nowhere", async () => {
    getAllArticles.mockReturnValue([]);
    await renderHome();
    expect(
      screen.queryByRole("link", { name: new RegExp(en.home.ctaExplore) }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.home.ctaRead })).toHaveAttribute(
      "href",
      "/en/writing",
    );
  });

  it("drops the featured section entirely", async () => {
    getAllArticles.mockReturnValue([]);
    await renderHome();
    expect(screen.queryByRole("heading", { name: en.home.featured })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});
