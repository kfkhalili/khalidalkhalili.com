import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getChessStats, getLatestGame, CHESS_PROFILE_URL } from "./chess";

const USER = "ibnalkhalili";
const ARCHIVE = `https://api.chess.com/pub/player/${USER}/games/archives/2026/07`;

// A four-ply game, enough to prove the PGN is replayed into positions.
const PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[White "ibnalkhalili"]
[Black "opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 1-0`;

function game(overrides: Record<string, unknown> = {}) {
  return {
    url: "https://www.chess.com/game/live/1",
    time_class: "rapid",
    pgn: PGN,
    white: { username: "ibnalkhalili", rating: 1200, result: "win" },
    black: { username: "opponent", rating: 1180, result: "resigned" },
    ...overrides,
  };
}

/** Route each request URL to a canned JSON body, or to a status for failures. */
function mockApi(routes: Record<string, unknown | { status: number }>) {
  const fetchMock = vi.fn(async (url: string) => {
    const body = routes[url];
    if (body === undefined) return { ok: false, status: 404, json: async () => ({}) };
    if (typeof body === "object" && body !== null && "status" in body) {
      return { ok: false, status: (body as { status: number }).status, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => body };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CHESS_PROFILE_URL", () => {
  it("points at the public profile", () => {
    expect(CHESS_PROFILE_URL).toBe(`https://www.chess.com/member/${USER}`);
  });
});

describe("getChessStats", () => {
  const statsUrl = `https://api.chess.com/pub/player/${USER}/stats`;

  it("maps each rated format, best rating, and record", async () => {
    mockApi({
      [statsUrl]: {
        chess_rapid: {
          last: { rating: 1234 },
          best: { rating: 1300 },
          record: { win: 10, loss: 5, draw: 2 },
        },
        chess_blitz: { last: { rating: 999 }, record: { win: 1, loss: 1, draw: 0 } },
        tactics: { highest: { rating: 2100 } },
        puzzle_rush: { best: { score: 33 } },
      },
    });

    const stats = await getChessStats();
    expect(stats.ok).toBe(true);
    expect(stats.formats).toEqual([
      { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 10, loss: 5, draw: 2 },
      { key: "blitz", label: "Blitz", rating: 999, best: null, win: 1, loss: 1, draw: 0 },
    ]);
    expect(stats.tactics).toBe(2100);
    expect(stats.puzzleRush).toBe(33);
  });

  it("drops formats that have never been played", async () => {
    mockApi({ [statsUrl]: { chess_bullet: { last: { rating: 800 } } } });
    const stats = await getChessStats();
    expect(stats.formats.map((f) => f.key)).toEqual(["bullet"]);
    expect(stats.formats[0]).toMatchObject({ label: "Bullet", win: 0, loss: 0, draw: 0 });
  });

  it("reports no tactics or puzzle rush when the profile has none", async () => {
    mockApi({ [statsUrl]: {} });
    const stats = await getChessStats();
    expect(stats).toEqual({ ok: true, formats: [], tactics: null, puzzleRush: null });
  });

  it("degrades to not-ok when chess.com errors", async () => {
    mockApi({ [statsUrl]: { status: 503 } });
    expect(await getChessStats()).toEqual({
      ok: false,
      formats: [],
      tactics: null,
      puzzleRush: null,
    });
  });

  it("degrades to not-ok when the request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));
    expect((await getChessStats()).ok).toBe(false);
  });

  it("asks for live data, not a cached copy", async () => {
    const fetchMock = mockApi({ [statsUrl]: {} });
    await getChessStats();
    expect(fetchMock).toHaveBeenCalledWith(statsUrl, expect.objectContaining({ cache: "no-store" }));
  });
});

describe("getLatestGame", () => {
  const archivesUrl = `https://api.chess.com/pub/player/${USER}/games/archives`;

  it("replays the newest game in the newest archive", async () => {
    mockApi({
      [archivesUrl]: { archives: ["https://old.example/2026/06", ARCHIVE] },
      [ARCHIVE]: { games: [game({ url: "https://www.chess.com/game/live/0" }), game()] },
    });

    const latest = await getLatestGame();
    expect(latest).toMatchObject({
      url: "https://www.chess.com/game/live/1",
      timeClass: "rapid",
      white: { user: "ibnalkhalili", rating: 1200 },
      black: { user: "opponent", rating: 1180 },
      youAre: "white",
      outcome: "won",
    });
    expect(latest!.sans).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    // One position before the first move, then one after each.
    expect(latest!.fens).toHaveLength(5);
    expect(latest!.fens[0]).toContain("rnbqkbnr/pppppppp");
    expect(latest!.fens[4]).not.toBe(latest!.fens[0]);
  });

  it("reads the result from the black side when that's the side played", async () => {
    mockApi({
      [archivesUrl]: { archives: [ARCHIVE] },
      [ARCHIVE]: {
        games: [
          game({
            white: { username: "Opponent", rating: 1300, result: "win" },
            black: { username: "IbnAlKhalili", rating: 1250, result: "checkmated" },
          }),
        ],
      },
    });

    const latest = await getLatestGame();
    expect(latest).toMatchObject({ youAre: "black", outcome: "lost" });
  });

  it("calls a game with no winner a draw", async () => {
    mockApi({
      [archivesUrl]: { archives: [ARCHIVE] },
      [ARCHIVE]: {
        games: [
          game({
            white: { username: "ibnalkhalili", rating: 1200, result: "agreed" },
            black: { username: "opponent", rating: 1180, result: "agreed" },
          }),
        ],
      },
    });

    expect((await getLatestGame())!.outcome).toBe("drew");
  });

  it("keeps the game but drops the replay when the PGN won't parse", async () => {
    mockApi({
      [archivesUrl]: { archives: [ARCHIVE] },
      [ARCHIVE]: { games: [game({ pgn: "1. Zz9 total nonsense" })] },
    });

    const latest = await getLatestGame();
    expect(latest!.url).toBe("https://www.chess.com/game/live/1");
    expect(latest!.fens).toEqual([]);
    expect(latest!.sans).toEqual([]);
  });

  it("is null when there are no archives", async () => {
    mockApi({ [archivesUrl]: { archives: [] } });
    expect(await getLatestGame()).toBeNull();
  });

  it("is null when the archives key is missing entirely", async () => {
    mockApi({ [archivesUrl]: {} });
    expect(await getLatestGame()).toBeNull();
  });

  it("is null when the newest archive has no games", async () => {
    mockApi({ [archivesUrl]: { archives: [ARCHIVE] }, [ARCHIVE]: { games: [] } });
    expect(await getLatestGame()).toBeNull();
  });

  it("is null when the newest game carries no PGN", async () => {
    mockApi({
      [archivesUrl]: { archives: [ARCHIVE] },
      [ARCHIVE]: { games: [game({ pgn: undefined })] },
    });
    expect(await getLatestGame()).toBeNull();
  });

  it("is null when chess.com errors", async () => {
    mockApi({ [archivesUrl]: { status: 500 } });
    expect(await getLatestGame()).toBeNull();
  });
});
