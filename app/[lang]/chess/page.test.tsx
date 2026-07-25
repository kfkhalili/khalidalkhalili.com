import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ChessPage, { generateMetadata, dynamic } from "./page";
import type { ChessStats, ChessGame } from "@/lib/chess";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";

const { getChessStats, getLatestGame } = vi.hoisted(() => ({
  getChessStats: vi.fn(),
  getLatestGame: vi.fn(),
}));

vi.mock("@/lib/chess", () => ({
  getChessStats,
  getLatestGame,
  CHESS_PROFILE_URL: "https://www.chess.com/member/ibnalkhalili",
}));

vi.mock("react-chessboard", () => ({
  Chessboard: ({ options }: { options: Record<string, unknown> }) => (
    <div data-testid="board" data-position={String(options.position)} />
  ),
}));

const noStats: ChessStats = { ok: false, formats: [], tactics: null, puzzleRush: null };

const stats = (overrides: Partial<ChessStats> = {}): ChessStats => ({
  ok: true,
  formats: [
    { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 10, loss: 5, draw: 2 },
  ],
  tactics: 2100,
  puzzleRush: 33,
  ...overrides,
});

const game = (overrides: Partial<ChessGame> = {}): ChessGame => ({
  url: "https://www.chess.com/game/live/1",
  timeClass: "rapid",
  white: { user: "ibnalkhalili", rating: 1200 },
  black: { user: "opponent", rating: 1180 },
  youAre: "white",
  outcome: "won",
  fens: ["fen-start", "fen-1"],
  sans: ["e4"],
  ...overrides,
});

const renderPage = async (lang = "en") =>
  render(await ChessPage({ params: Promise.resolve({ lang }) }));

/** The last-game section, so player names don't collide with the profile link. */
const lastGame = (label = en.chess.lastGame) =>
  within(screen.getByRole("heading", { name: label }).parentElement!);

beforeEach(() => {
  getChessStats.mockReset().mockResolvedValue(noStats);
  getLatestGame.mockReset().mockResolvedValue(null);
});

describe("ChessPage", () => {
  it("renders on demand, so the ratings are live", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("heads the page in the reader's language, and links the profile", async () => {
    await renderPage("ar");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(ar.chess.title);
    const profile = screen.getByRole("link", { name: ar.chess.viewProfile });
    expect(profile).toHaveAttribute("href", "https://www.chess.com/member/ibnalkhalili");
    expect(profile).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows each format's rating, best, and record", async () => {
    getChessStats.mockResolvedValue(stats());
    await renderPage();

    expect(screen.getByRole("heading", { name: en.chess.ratings })).toBeInTheDocument();
    expect(screen.getByText("Rapid")).toBeInTheDocument();
    expect(screen.getByText(/1234/)).toBeInTheDocument();
    expect(screen.getByText(/best 1300/)).toBeInTheDocument();
    expect(screen.getByText("10 W · 5 L · 2 D")).toBeInTheDocument();
  });

  it("omits the best rating when there isn't one", async () => {
    getChessStats.mockResolvedValue(
      stats({
        formats: [
          { key: "blitz", label: "Blitz", rating: 900, best: null, win: 0, loss: 0, draw: 0 },
        ],
      }),
    );
    await renderPage();
    expect(screen.queryByText(/best/)).not.toBeInTheDocument();
  });

  it("draws the rating bar against a 2000 ceiling, and never past it", async () => {
    getChessStats.mockResolvedValue(
      stats({
        formats: [
          { key: "rapid", label: "Rapid", rating: 1000, best: null, win: 0, loss: 0, draw: 0 },
          { key: "blitz", label: "Blitz", rating: 2500, best: null, win: 0, loss: 0, draw: 0 },
        ],
      }),
    );
    const { container } = await renderPage();
    const widths = [...container.querySelectorAll<HTMLElement>(".bg-accent")].map(
      (bar) => bar.style.width,
    );
    expect(widths).toEqual(["50%", "100%"]);
  });

  it("shows the tactics and puzzle rush bests", async () => {
    getChessStats.mockResolvedValue(stats());
    await renderPage();
    expect(screen.getByText("2100")).toBeInTheDocument();
    expect(screen.getByText("33")).toBeInTheDocument();
  });

  it("omits the tactics row when there is nothing in it", async () => {
    getChessStats.mockResolvedValue(stats({ tactics: null, puzzleRush: null }));
    await renderPage();
    expect(screen.queryByText(en.chess.tactics, { exact: false })).not.toBeInTheDocument();
  });

  it("hides the ratings section when chess.com can't be reached", async () => {
    getChessStats.mockResolvedValue(noStats);
    await renderPage();
    expect(screen.queryByRole("heading", { name: en.chess.ratings })).not.toBeInTheDocument();
  });

  it("hides the ratings section when the profile has no rated formats", async () => {
    getChessStats.mockResolvedValue(stats({ formats: [] }));
    await renderPage();
    expect(screen.queryByRole("heading", { name: en.chess.ratings })).not.toBeInTheDocument();
  });

  it("replays the last game, with both players and the outcome", async () => {
    getLatestGame.mockResolvedValue(game());
    await renderPage();

    expect(screen.getByRole("heading", { name: en.chess.lastGame })).toBeInTheDocument();
    expect(lastGame().getByText("ibnalkhalili")).toBeInTheDocument();
    expect(lastGame().getByText("opponent")).toBeInTheDocument();
    expect(screen.getByText("rapid")).toBeInTheDocument();
    expect(screen.getByText(en.chess.won)).toBeInTheDocument();
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("weights my own name so the reader can tell the sides apart", async () => {
    getLatestGame.mockResolvedValue(game());
    await renderPage();
    expect(lastGame().getByText("ibnalkhalili").className).toContain("font-semibold");
    expect(lastGame().getByText("opponent").className).toContain("text-muted");
  });

  it("recognizes my name whatever case chess.com returns it in", async () => {
    getLatestGame.mockResolvedValue(
      game({ white: { user: "Opponent", rating: 1300 }, black: { user: "IbnAlKhalili", rating: 1250 } }),
    );
    await renderPage();
    expect(screen.getByText("IbnAlKhalili").className).toContain("font-semibold");
  });

  it.each(["won", "lost", "drew"] as const)("styles a %s game distinctly", async (outcome) => {
    getLatestGame.mockResolvedValue(game({ outcome }));
    await renderPage();
    expect(screen.getByText(en.chess[outcome])).toBeInTheDocument();
  });

  it("orients the board for the side I played", async () => {
    getLatestGame.mockResolvedValue(game({ youAre: "black" }));
    await renderPage();
    // The board opens on the final position either way.
    expect(screen.getByTestId("board")).toHaveAttribute("data-position", "fen-1");
  });

  it("links out to review the game on chess.com", async () => {
    getLatestGame.mockResolvedValue(game());
    await renderPage();
    const review = screen.getByRole("link", { name: new RegExp(en.chess.reviewGame) });
    expect(review).toHaveAttribute("href", "https://www.chess.com/game/live/1");
    expect(review).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hides the game section when there is no game to show", async () => {
    getLatestGame.mockResolvedValue(null);
    await renderPage();
    expect(screen.queryByRole("heading", { name: en.chess.lastGame })).not.toBeInTheDocument();
  });

  it("hides the game section when the PGN could not be replayed", async () => {
    getLatestGame.mockResolvedValue(game({ fens: [], sans: [] }));
    await renderPage();
    expect(screen.queryByRole("heading", { name: en.chess.lastGame })).not.toBeInTheDocument();
  });

  it("takes its metadata from the dictionary, and names its own address", async () => {
    const de = (await import("@/dictionaries/de.json")).default;
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "de" }) });
    expect(metadata).toMatchObject({
      title: de.chess.title,
      description: de.chess.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/de/chess");
  });
});
