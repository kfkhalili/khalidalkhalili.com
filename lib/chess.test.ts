import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getChessStats,
  getLatestGame,
  parseGame,
  parseStats,
  ratingForGame,
  isReplayable,
  CHESS_PROFILE_URL,
} from "./chess";
import type { ChessGame, ChessStats, GamePayload, StatsPayload } from "./chess";

const USER = "kfkhalili";
const ARCHIVE = `https://api.chess.com/pub/player/${USER}/games/archives/2026/07`;

// A four-ply game, enough to prove the PGN is replayed into positions.
const PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[White "kfkhalili"]
[Black "opponent"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 1-0`;

/** Typed against the payload the transform actually accepts, so the fixture
 *  cannot drift away from the shape chess.com is read as. Overrides stay loose:
 *  several cases below deliberately supply payloads that are not valid. */
const GAME: GamePayload = {
  url: "https://www.chess.com/game/live/1",
  time_class: "rapid",
  pgn: PGN,
  white: { username: "kfkhalili", rating: 1200, result: "win" },
  black: { username: "opponent", rating: 1180, result: "resigned" },
};

function game(overrides: Record<string, unknown> = {}) {
  return { ...GAME, ...overrides };
}

const RATED_RAPID: StatsPayload = {
  chess_rapid: {
    last: { rating: 1234 },
    best: { rating: 1300 },
    record: { win: 10, loss: 5, draw: 2 },
  },
};

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

  // The transform itself is asserted against parseStats, with no network.
  // What is left here is the wiring: that a live answer reaches it, and that a
  // dead one degrades instead of throwing.
  it("hands a live answer to the transform and marks it ok", async () => {
    mockApi({ [statsUrl]: RATED_RAPID });
    const stats = await getChessStats();
    expect(stats.ok).toBe(true);
    expect(stats).toMatchObject(parseStats(RATED_RAPID));
  });

  it("degrades to not-ok when chess.com errors", async () => {
    mockApi({ [statsUrl]: { status: 503 } });
    expect(await getChessStats()).toEqual({ ok: false, formats: [] });
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
      white: { user: "kfkhalili", rating: 1200 },
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

  // Everything about the shape of a game is asserted against parseGame, with no
  // network. What is left here is the two-hop walk to it: newest archive, newest
  // game, and the ways that walk can come back empty.
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

  it("is null when chess.com errors", async () => {
    mockApi({ [archivesUrl]: { status: 500 } });
    expect(await getLatestGame()).toBeNull();
  });
});

/* ----------------------------------------------------------- transform ---- */

describe("parseStats", () => {
  it("maps each rated format, best rating, and record", () => {
    const reading = parseStats({
      ...RATED_RAPID,
      chess_blitz: { last: { rating: 999 } },
    });
    expect(reading.formats).toEqual([
      { key: "rapid", label: "Rapid", rating: 1234, best: 1300, win: 10, loss: 5, draw: 2 },
      { key: "blitz", label: "Blitz", rating: 999, best: null, win: 0, loss: 0, draw: 0 },
    ]);
  });

  it("drops formats that have never been played", () => {
    expect(parseStats({}).formats).toEqual([]);
    expect(parseStats({ chess_bullet: {} }).formats).toEqual([]);
    expect(parseStats({ chess_bullet: { last: {} } }).formats).toEqual([]);
  });

  it("keeps the formats in the order the page draws them", () => {
    const rated = { last: { rating: 1000 } };
    const reading = parseStats({
      chess_bullet: rated,
      chess_blitz: rated,
      chess_rapid: rated,
    });
    expect(reading.formats.map((f) => f.key)).toEqual(["rapid", "blitz", "bullet"]);
  });
});

describe("parseGame", () => {
  it("replays the PGN into a position per ply, plus the start", () => {
    const parsed = parseGame(game())!;
    expect(parsed.sans).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    expect(parsed.fens).toHaveLength(5);
    expect(parsed.fens[0]).toContain("rnbqkbnr/pppppppp");
  });

  it("carries the players, the time class, and the url through", () => {
    const parsed = parseGame(game())!;
    expect(parsed.url).toBe("https://www.chess.com/game/live/1");
    expect(parsed.timeClass).toBe("rapid");
    expect(parsed.white).toEqual({ user: "kfkhalili", rating: 1200 });
    expect(parsed.black).toEqual({ user: "opponent", rating: 1180 });
  });

  it("knows which side I played, whatever case chess.com returns", () => {
    expect(parseGame(game())!.youAre).toBe("white");
    expect(
      parseGame(
        game({
          white: { username: "Opponent", rating: 1300, result: "resigned" },
          black: { username: "KFKhalili", rating: 1250, result: "win" },
        }),
      )!.youAre,
    ).toBe("black");
  });

  it("reads the outcome from the side I played", () => {
    expect(parseGame(game())!.outcome).toBe("won");
    expect(
      parseGame(
        game({
          white: { username: "opponent", rating: 1300, result: "win" },
          black: { username: USER, rating: 1250, result: "resigned" },
        }),
      )!.outcome,
    ).toBe("lost");
  });

  it("calls a game with no winner a draw", () => {
    expect(
      parseGame(
        game({
          white: { username: USER, rating: 1200, result: "agreed" },
          black: { username: "opponent", rating: 1180, result: "agreed" },
        }),
      )!.outcome,
    ).toBe("drew");
  });

  it("keeps the game but drops the replay when the PGN will not parse", () => {
    const parsed = parseGame(game({ pgn: "not a pgn at all" }))!;
    expect(parsed.url).toBe("https://www.chess.com/game/live/1");
    expect(parsed.fens).toEqual([]);
    expect(parsed.sans).toEqual([]);
    // Which is exactly the state isReplayable exists to refuse.
    expect(isReplayable(parsed)).toBe(false);
  });

  it("is null when there is no game at all", () => {
    expect(parseGame(undefined)).toBeNull();
  });

  it.each([
    ["a missing white player", { white: undefined }],
    ["a missing black player", { black: undefined }],
    ["an unnamed player", { black: { username: "", rating: 1180, result: "resigned" } }],
    ["a rating that is not a number", { black: { username: "o", rating: null, result: "resigned" } }],
    ["no url", { url: undefined }],
    ["no time class", { time_class: undefined }],
    ["no pgn", { pgn: undefined }],
  ])("is null for a game with %s, rather than rendering it with holes", (_label, over) => {
    expect(parseGame(game(over))).toBeNull();
  });
});

/* ------------------------------------------------------- what to draw ---- */

const asStats = (o: Partial<ChessStats> = {}): ChessStats => ({
  ok: true,
  formats: [],
  ...o,
});

const rapid = {
  key: "rapid",
  label: "Rapid",
  rating: 1200,
  best: null,
  win: 1,
  loss: 0,
  draw: 0,
};

const blitz = { ...rapid, key: "blitz", label: "Blitz", rating: 1400 };

const asGame = (o: Partial<ChessGame> = {}): ChessGame => ({
  url: "https://www.chess.com/game/live/1",
  timeClass: "rapid",
  white: { user: USER, rating: 1200 },
  black: { user: "opponent", rating: 1180 },
  youAre: "white",
  outcome: "won",
  fens: ["start", "after-1"],
  sans: [],
  ...o,
});

describe("ratingForGame", () => {
  const played = (timeClass: string) => asGame({ timeClass });

  it("picks the format the last game was played in", () => {
    const stats = asStats({ formats: [rapid, blitz] });
    expect(ratingForGame(stats, played("blitz"))).toBe(blitz);
    expect(ratingForGame(stats, played("rapid"))).toBe(rapid);
  });

  it("has nothing to draw without a game to take the format from", () => {
    expect(ratingForGame(asStats({ formats: [rapid] }), null)).toBeNull();
  });

  it("draws nothing rather than another format's number", () => {
    // A daily game, or a first game in a format: the profile carries no rated
    // record for it, and the rapid rating is not an answer to that question.
    expect(ratingForGame(asStats({ formats: [rapid] }), played("daily"))).toBeNull();
  });

  it("is false for a live account with nothing rated", () => {
    // The case `ok` cannot answer: chess.com replied, there is just nothing yet.
    expect(ratingForGame(asStats({ ok: true }), played("rapid"))).toBeNull();
  });

  it("is false when the fetch failed", () => {
    expect(ratingForGame(asStats({ ok: false }), played("rapid"))).toBeNull();
  });

  it("matches whatever case chess.com returns the time class in", () => {
    expect(ratingForGame(asStats({ formats: [blitz] }), played("Blitz"))).toBe(blitz);
  });
});

describe("isReplayable", () => {
  const withFens = (fens: string[]) => asGame({ fens });

  it("is true for a game the board can step through", () => {
    expect(isReplayable(withFens(["start", "after-1"]))).toBe(true);
  });

  it("is false when there is no game", () => {
    expect(isReplayable(null)).toBe(false);
  });

  it("is false when the PGN yielded nothing", () => {
    expect(isReplayable(withFens([]))).toBe(false);
  });

  it("is false for a lone position, which would render a static board", () => {
    expect(isReplayable(withFens(["start"]))).toBe(false);
  });
});
