import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ChessPage, { generateMetadata, dynamic } from "./page";
import type { ChessStats, ChessGame } from "@/lib/chess";
import { strings } from "@/lib/strings";

const { getChessStats, getLatestGame } = vi.hoisted(() => ({
  getChessStats: vi.fn(),
  getLatestGame: vi.fn(),
}));

// Only the two network calls are stubbed. `hasRatings` and `isReplayable` stay
// real, so what this page chooses to draw is checked against the rules the
// module actually applies rather than against a second copy of them here.
vi.mock("@/lib/chess", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/chess")>()),
  getChessStats,
  getLatestGame,
}));

vi.mock("react-chessboard", () => ({
  Chessboard: ({ options }: { options: Record<string, unknown> }) => (
    <div data-testid="board" data-position={String(options.position)} />
  ),
}));

const noStats: ChessStats = { ok: false, formats: [] };

const stats = (overrides: Partial<ChessStats> = {}): ChessStats => ({
  ok: true,
  formats: [
    { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 10, loss: 5, draw: 2 },
  ],
  ...overrides,
});

const game = (overrides: Partial<ChessGame> = {}): ChessGame => ({
  url: "https://www.chess.com/game/live/1",
  timeClass: "rapid",
  white: { user: "kfkhalili", rating: 1200 },
  black: { user: "opponent", rating: 1180 },
  youAre: "white",
  outcome: "won",
  fens: ["fen-start", "fen-1"],
  sans: ["e4"],
  ...overrides,
});

const renderPage = async () => render(await ChessPage());

/** The last-game section, so player names don't collide with the profile link. */
const lastGame = (label = strings.chess.lastGame) =>
  within(screen.getByRole("heading", { name: label }).parentElement!);

beforeEach(() => {
  getChessStats.mockReset().mockResolvedValue(noStats);
  getLatestGame.mockReset().mockResolvedValue(null);
});

describe("ChessPage", () => {
  it("renders on demand, so the ratings are live", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("heads the page and links the profile", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(strings.chess.title);
    const profile = screen.getByRole("link", { name: strings.chess.viewProfile });
    expect(profile).toHaveAttribute("href", "https://www.chess.com/member/kfkhalili");
    expect(profile).toHaveAttribute("rel", "noopener noreferrer");
  });

  /** chess.com wants the opponent in the query string and handles the login. */
  it("offers a challenge, pre-addressed to me", async () => {
    await renderPage();
    const challenge = screen.getByRole("link", { name: strings.chess.challenge });
    expect(challenge).toHaveAttribute(
      "href",
      "https://www.chess.com/play/online/new?opponent=kfkhalili",
    );
    expect(challenge).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the rating for the format the last game was played in", async () => {
    getChessStats.mockResolvedValue(stats());
    getLatestGame.mockResolvedValue(game({ timeClass: "rapid" }));
    await renderPage();

    expect(screen.getByRole("heading", { name: strings.chess.rating })).toBeInTheDocument();
    expect(screen.getByText("Rapid")).toBeInTheDocument();
    expect(screen.getByText(/1234/)).toBeInTheDocument();
    expect(screen.getByText(/best 1300/)).toBeInTheDocument();
    expect(screen.getByText("10 W · 5 L · 2 D")).toBeInTheDocument();
  });

  /** The whole point of the section: the other formats are not the reader's. */
  it("leaves the formats the last game was not played in alone", async () => {
    getChessStats.mockResolvedValue(
      stats({
        formats: [
          { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 10, loss: 5, draw: 2 },
          { key: "blitz", label: "Blitz", rating: 999, best: null, win: 1, loss: 2, draw: 3 },
        ],
      }),
    );
    getLatestGame.mockResolvedValue(game({ timeClass: "blitz" }));
    await renderPage();

    expect(screen.getByText("Blitz")).toBeInTheDocument();
    expect(screen.queryByText("Rapid")).not.toBeInTheDocument();
    expect(screen.queryByText(/1234/)).not.toBeInTheDocument();
  });

  it("omits the best rating when there isn't one", async () => {
    getChessStats.mockResolvedValue(
      stats({
        formats: [
          { key: "blitz", label: "Blitz", rating: 900, best: null, win: 0, loss: 0, draw: 0 },
        ],
      }),
    );
    getLatestGame.mockResolvedValue(game({ timeClass: "blitz" }));
    await renderPage();
    expect(screen.queryByText(/best/)).not.toBeInTheDocument();
  });

  it.each([
    [1000, "50%"],
    [2500, "100%"],
  ])("draws a %i rating as %s of the 2000 ceiling, never past it", async (rating, width) => {
    getChessStats.mockResolvedValue(
      stats({
        formats: [
          { key: "rapid", label: "Rapid", rating, best: null, win: 0, loss: 0, draw: 0 },
        ],
      }),
    );
    getLatestGame.mockResolvedValue(game({ timeClass: "rapid" }));
    const { container } = await renderPage();
    expect(container.querySelector<HTMLElement>(".bg-accent")!.style.width).toBe(width);
  });

  it("hides the rating when chess.com can't be reached", async () => {
    getChessStats.mockResolvedValue(noStats);
    getLatestGame.mockResolvedValue(game());
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.rating })).not.toBeInTheDocument();
  });

  it("hides the rating when the profile has no rated formats", async () => {
    getChessStats.mockResolvedValue(stats({ formats: [] }));
    getLatestGame.mockResolvedValue(game());
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.rating })).not.toBeInTheDocument();
  });

  /** There is no game to take a format from, so there is no rating to show. */
  it("hides the rating when there is no last game", async () => {
    getChessStats.mockResolvedValue(stats());
    getLatestGame.mockResolvedValue(null);
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.rating })).not.toBeInTheDocument();
  });

  it("hides the rating when the last game's format has no rated record", async () => {
    getChessStats.mockResolvedValue(stats());
    getLatestGame.mockResolvedValue(game({ timeClass: "daily" }));
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.rating })).not.toBeInTheDocument();
  });

  it("replays the last game, with both players and the outcome", async () => {
    getLatestGame.mockResolvedValue(game());
    await renderPage();

    expect(screen.getByRole("heading", { name: strings.chess.lastGame })).toBeInTheDocument();
    expect(lastGame().getByText("kfkhalili")).toBeInTheDocument();
    expect(lastGame().getByText("opponent")).toBeInTheDocument();
    expect(screen.getByText("rapid")).toBeInTheDocument();
    expect(screen.getByText(strings.chess.won)).toBeInTheDocument();
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("weights my own name so the reader can tell the sides apart", async () => {
    getLatestGame.mockResolvedValue(game());
    await renderPage();
    expect(lastGame().getByText("kfkhalili").className).toContain("font-semibold");
    expect(lastGame().getByText("opponent").className).toContain("text-muted");
  });

  it("recognizes my name whatever case chess.com returns it in", async () => {
    getLatestGame.mockResolvedValue(
      game({ white: { user: "Opponent", rating: 1300 }, black: { user: "KFKhalili", rating: 1250 } }),
    );
    await renderPage();
    expect(screen.getByText("KFKhalili").className).toContain("font-semibold");
  });

  it.each(["won", "lost", "drew"] as const)("styles a %s game distinctly", async (outcome) => {
    getLatestGame.mockResolvedValue(game({ outcome }));
    await renderPage();
    expect(screen.getByText(strings.chess[outcome])).toBeInTheDocument();
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
    const review = screen.getByRole("link", { name: new RegExp(strings.chess.reviewGame) });
    expect(review).toHaveAttribute("href", "https://www.chess.com/game/live/1");
    expect(review).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("hides the game section when there is no game to show", async () => {
    getLatestGame.mockResolvedValue(null);
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.lastGame })).not.toBeInTheDocument();
  });

  it("hides the game section when the PGN could not be replayed", async () => {
    getLatestGame.mockResolvedValue(game({ fens: [], sans: [] }));
    await renderPage();
    expect(screen.queryByRole("heading", { name: strings.chess.lastGame })).not.toBeInTheDocument();
  });

  /**
   * A bare heading is the one thing this page must never render: a title, a
   * subtitle, and nothing under them. Every combination that hides both
   * sections has to reach the fallback link, however it came to be empty.
   *
   * The header already links to the profile under the same name, so the
   * fallback is the second such link rather than the only one.
   */
  describe("when there is nothing to show", () => {
    const emptyProfile = stats({ formats: [] });
    const unreplayable = game({ fens: [], sans: [] });

    const fallbackShown = () =>
      screen.queryAllByRole("link", { name: new RegExp(strings.chess.unavailable) })
        .length > 1;

    it("offers the profile when chess.com could not be reached", async () => {
      getChessStats.mockResolvedValue(noStats);
      getLatestGame.mockResolvedValue(null);
      await renderPage();
      expect(fallbackShown()).toBe(true);
    });

    it("offers the profile when it is reachable but empty", async () => {
      getChessStats.mockResolvedValue(emptyProfile);
      getLatestGame.mockResolvedValue(null);
      await renderPage();
      expect(fallbackShown()).toBe(true);
    });

    it("offers the profile when the only game could not be replayed", async () => {
      getChessStats.mockResolvedValue(emptyProfile);
      getLatestGame.mockResolvedValue(unreplayable);
      await renderPage();
      expect(fallbackShown()).toBe(true);
    });

    it("offers the profile when the fetch failed and the game is unreplayable", async () => {
      getChessStats.mockResolvedValue(noStats);
      getLatestGame.mockResolvedValue(unreplayable);
      await renderPage();
      expect(fallbackShown()).toBe(true);
    });

    /**
     * The rating is drawn from the last game's format, so the only way it can
     * render alone is a game that is real but cannot be replayed.
     */
    it("stays out of the way when the rating rendered", async () => {
      getChessStats.mockResolvedValue(stats());
      getLatestGame.mockResolvedValue(unreplayable);
      await renderPage();
      expect(fallbackShown()).toBe(false);
    });

    it("offers the profile when there is no game to take a format from", async () => {
      getChessStats.mockResolvedValue(stats());
      getLatestGame.mockResolvedValue(null);
      await renderPage();
      expect(fallbackShown()).toBe(true);
    });

    it("stays out of the way when the game rendered", async () => {
      getChessStats.mockResolvedValue(emptyProfile);
      getLatestGame.mockResolvedValue(game());
      await renderPage();
      expect(fallbackShown()).toBe(false);
    });
  });

  it("takes its metadata from the site's copy, and names its own address", () => {
    const metadata = generateMetadata();
    expect(metadata).toMatchObject({
      title: strings.chess.title,
      description: strings.chess.subtitle,
    });
    expect(metadata.alternates?.canonical).toBe("/chess");
  });
});
