import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ElsewherePage, { generateMetadata } from "./page";
import type { Bookshelf, Book } from "@/lib/goodreads";
import type { Reflections, Reflection } from "@/lib/quran-reflect";
import type { ChessStats, ChessGame } from "@/lib/chess";
import en from "@/dictionaries/en.json";
import de from "@/dictionaries/de.json";
import ar from "@/dictionaries/ar.json";

const getBookshelf = vi.hoisted(() => vi.fn());
const getReflections = vi.hoisted(() => vi.fn());
const getChessStats = vi.hoisted(() => vi.fn());
const getLatestGame = vi.hoisted(() => vi.fn());

// Only the network halves are stubbed. `refLabel`, `excerpt` and
// `ratingForGame` are pure, so the cards are tested against the real thing.
vi.mock("@/lib/goodreads", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/goodreads")>()),
  getBookshelf,
}));
vi.mock("@/lib/quran-reflect", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/quran-reflect")>()),
  getReflections,
}));
vi.mock("@/lib/chess", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/chess")>()),
  getChessStats,
  getLatestGame,
}));

const book = (title: string): Book => ({
  title,
  author: `${title}'s author`,
  cover: `https://i.gr-assets.com/${title}.jpg`,
  rating: 4,
  link: `https://www.goodreads.com/book/show/${title}`,
  review: "",
});

const reflection = (over: Partial<Reflection> = {}): Reflection => ({
  id: 1,
  kind: "reflection",
  body: "A thought worth keeping.",
  lang: "en",
  date: "2026-08-16",
  refs: [
    { chapterId: 2, from: 48, to: 48, verses: "48", url: "https://quran.com/2/48" },
  ],
  tags: [],
  likes: 0,
  comments: 0,
  url: "https://quranreflect.com/posts/1",
  ...over,
});

const shelf = (o: Partial<Bookshelf> = {}): Bookshelf => ({
  currentlyReading: [],
  read: [],
  latestReview: null,
  ok: true,
  ...o,
});

const feed = (o: Partial<Reflections> = {}): Reflections => ({
  posts: [],
  total: 0,
  chapters: { 2: { simple: "Al-Baqarah", arabic: "البقرة" } },
  quotes: {},
  ok: true,
  ...o,
});

const stats = (o: Partial<ChessStats> = {}): ChessStats => ({
  formats: [
    { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 1, loss: 0, draw: 0 },
  ],
  ok: true,
  ...o,
});

const game = (o: Partial<ChessGame> = {}): ChessGame => ({
  url: "https://www.chess.com/game/1",
  timeClass: "rapid",
  white: { user: "kfkhalili", rating: 1234 },
  black: { user: "someone", rating: 1200 },
  youAre: "white",
  outcome: "won",
  fens: ["a", "b"],
  sans: ["e4"],
  ...o,
});

const renderPage = async (lang = "en") =>
  render(await ElsewherePage({ params: Promise.resolve({ lang }) }));

beforeEach(() => {
  for (const m of [getBookshelf, getReflections, getChessStats, getLatestGame]) {
    m.mockReset();
  }
  // Every feed answers by default, so a quiet card in any test below is
  // something that test asked for rather than a leftover of the setup.
  getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Default")] }));
  getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
  getChessStats.mockResolvedValue(stats());
  getLatestGame.mockResolvedValue(game());
});

describe("ElsewherePage", () => {
  it("heads the page in the reader's language", async () => {
    await renderPage("ar");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      ar.elsewhere.title,
    );
    expect(screen.getByText(ar.elsewhere.subtitle)).toBeInTheDocument();
  });

  // A whole card is the link, so its accessible name is everything on it; the
  // heading is what identifies which feed the card is for.
  it("offers one way in per feed, inside the reader's locale", async () => {
    await renderPage("de");
    for (const [sub, title] of [
      ["reading", de.reading.title],
      ["islam", de.islam.title],
      ["chess", de.chess.title],
    ] as const) {
      expect(
        screen.getByRole("heading", { name: title }).closest("a"),
      ).toHaveAttribute("href", `/de/${sub}`);
    }
  });

  describe("the reading card", () => {
    it("shows what I'm in the middle of", async () => {
      getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Dune")] }));
      await renderPage();
      expect(screen.getByText("Dune")).toBeInTheDocument();
      expect(screen.getByText("Dune's author")).toBeInTheDocument();
    });

    // The card wants the freshest thing the shelf can offer, and between books
    // that is the last one I finished and wrote about.
    it("falls back to the latest review when I'm between books", async () => {
      getBookshelf.mockResolvedValue(shelf({ latestReview: book("Finished") }));
      await renderPage();
      expect(screen.getByText("Finished")).toBeInTheDocument();
    });
  });

  describe("the islam card", () => {
    it("shows the newest reflection, cited and cut short", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      await renderPage();
      expect(screen.getByText("Al-Baqarah 2:48")).toBeInTheDocument();
      expect(screen.getByText(/A thought worth keeping/)).toBeInTheDocument();
    });

    it("names the surah in Arabic on the Arabic page", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      await renderPage("ar");
      expect(screen.getByText("البقرة 2:48")).toBeInTheDocument();
    });

    it("renders a reflection that cites nothing", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection({ refs: [] })] }));
      await renderPage();
      expect(screen.getByText(/A thought worth keeping/)).toBeInTheDocument();
    });

    // The lib explicitly degrades to no chapter names when the content scope
    // is out of reach; the card must cite bare rather than crash on the hole.
    it("cites bare when the surah names are out of reach", async () => {
      getReflections.mockResolvedValue(
        feed({ posts: [reflection()], chapters: {} }),
      );
      await renderPage();
      expect(screen.getByText("2:48")).toBeInTheDocument();
    });

    // A card can carry an Arabic citation over a Latin excerpt at once, so
    // the excerpt marks its own direction rather than inheriting the chip's.
    it("lets the excerpt set its own direction", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      await renderPage("ar");
      expect(screen.getByText(/A thought worth keeping/)).toHaveAttribute(
        "dir",
        "auto",
      );
    });

    it("asks for only what the card can show", async () => {
      await renderPage();
      expect(getReflections).toHaveBeenCalledWith(3);
    });
  });

  describe("the chess card", () => {
    it("shows the rating for the format I last played, and how it went", async () => {
      const { container } = await renderPage();
      // The outcome sits as a bare text node beside a break, so the card is
      // read whole rather than element by element.
      expect(container.textContent).toContain("1234");
      expect(container.textContent).toContain("Rapid");
      expect(container.textContent).toContain(en.chess.won);
    });

    // The rating shown belongs to the last game's format; another format's
    // number under the last game's name would be a different claim.
    it("goes quiet when the last game's format has no rated record", async () => {
      getLatestGame.mockResolvedValue(game({ timeClass: "bullet" }));
      await renderPage();
      expect(screen.getByText(en.elsewhere.quiet)).toBeInTheDocument();
    });
  });

  describe("when a platform is down", () => {
    it("quiets only its own card and leaves the others standing", async () => {
      getReflections.mockResolvedValue(feed({ ok: false }));
      getBookshelf.mockResolvedValue(shelf({ currentlyReading: [book("Dune")] }));
      await renderPage();

      expect(screen.getAllByText(en.elsewhere.quiet)).toHaveLength(1);
      expect(screen.getByText("Dune")).toBeInTheDocument();
      expect(screen.getByText("1234")).toBeInTheDocument();
    });

    it("still offers all three ways in when every feed is down", async () => {
      getBookshelf.mockResolvedValue(shelf({ ok: false }));
      getReflections.mockResolvedValue(feed({ ok: false }));
      getChessStats.mockResolvedValue(stats({ formats: [], ok: false }));
      getLatestGame.mockResolvedValue(null);
      await renderPage();

      expect(screen.getAllByText(en.elsewhere.quiet)).toHaveLength(3);
      expect(screen.getAllByRole("link")).toHaveLength(3);
    });
  });

  it("describes itself at its own locale-qualified URL", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ lang: "ar" }) });
    expect(meta.title).toBe(ar.elsewhere.title);
    expect(meta.alternates?.canonical).toContain("/ar/elsewhere");
  });
});
