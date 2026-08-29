import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReadingPage, { generateMetadata } from "./page";
import type { Bookshelf, Book } from "@/lib/goodreads";
import { site } from "@/lib/site";
import { strings } from "@/lib/strings";

const getBookshelf = vi.hoisted(() => vi.fn());

// Only the network half is stubbed: `excerpt` is pure, so the page is tested
// against the real truncation rather than against a stand-in for it.
vi.mock("@/lib/goodreads", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/goodreads")>()),
  getBookshelf,
}));

const book = (title: string, rating = 0, review = ""): Book => ({
  title,
  author: `${title}'s author`,
  cover: `https://covers.test/${title}.jpg`,
  rating,
  link: `https://www.goodreads.com/book/show/${title}`,
  review,
});

function shelf(overrides: Partial<Bookshelf> = {}): Bookshelf {
  return { currentlyReading: [], read: [], latestReview: null, ok: true, ...overrides };
}

const renderPage = async () => render(await ReadingPage());

beforeEach(() => {
  getBookshelf.mockReset();
  getBookshelf.mockResolvedValue(shelf());
});

describe("ReadingPage", () => {
  it("heads the page", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(strings.reading.title);
    expect(screen.getByText(strings.reading.subtitle)).toBeInTheDocument();
  });

  it("shows what's being read right now, cover and all", async () => {
    getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Dune")] }));
    await renderPage();

    expect(screen.getByRole("heading", { name: strings.reading.currentlyReading })).toBeInTheDocument();
    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Dune's author")).toBeInTheDocument();
    // Covers are unoptimized, so the src is Goodreads' URL itself: the metered
    // optimizer never sees it.
    expect(screen.getByRole("img", { name: "Dune" }).getAttribute("src")).toBe(
      book("Dune").cover,
    );
  });

  it("shows the shelf of finished books", async () => {
    getBookshelf.mockResolvedValue(shelf({ read: [book("A", 4), book("B")] }));
    await renderPage();

    expect(screen.getByRole("heading", { name: strings.reading.recentlyRead })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("renders a rating out of five, labelled for screen readers", async () => {
    getBookshelf.mockResolvedValue(shelf({ read: [book("A", 4)] }));
    const { container } = await renderPage();

    const stars = screen.getByLabelText("4/5");
    expect(stars.textContent).toBe("★".repeat(5));
    expect(container.querySelector(".text-border")!.textContent).toBe("★");
  });

  it("leaves an unrated book unstarred", async () => {
    getBookshelf.mockResolvedValue(shelf({ read: [book("A")] }));
    await renderPage();
    expect(screen.queryByLabelText(/\/5$/)).not.toBeInTheDocument();
  });

  it("links every book out to Goodreads safely", async () => {
    getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Now")], read: [book("Then")] }));
    await renderPage();

    for (const title of ["Now", "Then"]) {
      const link = screen.getByRole("link", { name: new RegExp(title) });
      expect(link).toHaveAttribute("href", `https://www.goodreads.com/book/show/${title}`);
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("loads covers lazily", async () => {
    getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Now")], read: [book("Then")] }));
    await renderPage();
    for (const img of screen.getAllByRole("img")) {
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });

  it("leads with the latest review", async () => {
    getBookshelf.mockResolvedValue(
      shelf({ latestReview: book("Maus", 4, "A brilliant reconstruction.") }),
    );
    await renderPage();

    expect(screen.getByRole("heading", { name: strings.reading.latestReview })).toBeInTheDocument();
    expect(screen.getByText("A brilliant reconstruction.")).toBeInTheDocument();
    expect(screen.getByText("Maus")).toBeInTheDocument();
    expect(screen.getByLabelText("4/5")).toBeInTheDocument();
  });

  it("shows only the opening of a long review, and links out for the rest", async () => {
    const long = `${"word ".repeat(300)}end`;
    getBookshelf.mockResolvedValue(shelf({ latestReview: book("Long", 3, long) }));
    await renderPage();

    const shown = screen.getByText(/^word word/).textContent!;
    expect(shown.length).toBeLessThan(long.length);
    expect(shown.endsWith("…")).toBe(true);

    const link = screen.getByRole("link", { name: new RegExp(strings.reading.readFullReview) });
    expect(link).toHaveAttribute("href", "https://www.goodreads.com/book/show/Long");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  // A review or title in another script sets its own direction, or the
  // ellipsis and the punctuation land on the wrong end.
  it("lets the review find its own direction", async () => {
    getBookshelf.mockResolvedValue(
      shelf({ latestReview: book("Maus", 4, "A brilliant reconstruction.") }),
    );
    const { container } = await renderPage();

    expect(screen.getByText("A brilliant reconstruction.")).toHaveAttribute("dir", "auto");
    expect(screen.getByText("Maus").closest("[dir]")).toHaveAttribute("dir", "auto");
    expect(container.querySelector("[dir='rtl'], [dir='ltr']")).toBeNull();
  });

  it("hides an empty section rather than showing an empty heading", async () => {
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.reading.latestReview })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: strings.reading.currentlyReading })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: strings.reading.recentlyRead })).not.toBeInTheDocument();
  });

  it("always offers the full shelf on Goodreads", async () => {
    await renderPage();
    const link = screen.getByRole("link", { name: new RegExp(strings.reading.viewOnGoodreads) });
    expect(link).toHaveAttribute("href", site.goodreads);
  });

  it("degrades to a plain link when Goodreads can't be reached", async () => {
    getBookshelf.mockResolvedValue(shelf({ ok: false }));
    await renderPage();
    expect(screen.getByRole("link", { name: new RegExp(strings.reading.unavailable) })).toHaveAttribute(
      "href",
      site.goodreads,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("takes its metadata from the site's copy, and names its own address", () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({
      title: strings.reading.title,
      description: strings.reading.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/reading");
  });
});
