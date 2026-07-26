import { Chess } from "chess.js";

// Lowercase, because both readers of it compare against a lowercased name:
// chess.com echoes the handle back in whatever case it was typed in.
export const CHESS_USER = "kfkhalili";
const UA = "khalidalkhalili.com personal site (contact kfkhalili)";
export const CHESS_PROFILE_URL = `https://www.chess.com/member/${CHESS_USER}`;
// chess.com's new-game panel, with the opponent field already filled in. It
// asks the visitor to log in itself, so the site never handles that.
export const CHESS_CHALLENGE_URL = `https://www.chess.com/play/online/new?opponent=${CHESS_USER}`;

/**
 * The slices of chess.com's payloads this module reads. Every field is optional
 * because it is someone else's JSON: the readers below decide what a missing one
 * means, rather than trusting the shape.
 */
type RatingSnapshot = { rating?: number };

type FormatPayload = {
  last?: RatingSnapshot;
  best?: RatingSnapshot;
  record?: { win?: number; loss?: number; draw?: number };
};

export type StatsPayload = {
  chess_rapid?: FormatPayload;
  chess_blitz?: FormatPayload;
  chess_bullet?: FormatPayload;
};

type ArchivesPayload = { archives?: string[] };

type PlayerPayload = { username?: string; rating?: number; result?: string };

export type GamePayload = {
  url?: string;
  pgn?: string;
  time_class?: string;
  white?: PlayerPayload;
  black?: PlayerPayload;
};

type MonthPayload = { games?: GamePayload[] };

async function api<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    cache: "no-store", // on-demand: live data each page load
  });
  if (!res.ok) throw new Error(`chess.com ${res.status}`);
  return res.json();
}

/* ---------------------------------------------------------------- stats ---- */

type FormatStat = {
  key: string;
  label: string;
  rating: number;
  best: number | null;
  win: number;
  loss: number;
  draw: number;
};

/** Everything chess.com's stats payload says, before transport state is added. */
export type StatsReading = {
  formats: FormatStat[];
};

export type ChessStats = StatsReading & {
  /**
   * Whether chess.com answered. Not whether there is anything to draw: a live
   * account with no rated games answers 200 with no formats at all. Ask
   * `ratingForGame` for that; reading this instead is what once let the page
   * suppress its own fallback and render a bare heading.
   */
  ok: boolean;
};

function toFormat(
  key: string,
  label: string,
  s: FormatPayload | undefined,
): FormatStat | null {
  const rating = s?.last?.rating;
  if (!rating) return null;
  return {
    key,
    label,
    rating,
    best: s.best?.rating ?? null,
    win: s.record?.win ?? 0,
    loss: s.record?.loss ?? 0,
    draw: s.record?.draw ?? 0,
  };
}

/** Pure stats payload → StatsReading transform. The test surface; no network. */
export function parseStats(payload: StatsPayload): StatsReading {
  const formats = [
    toFormat("rapid", "Rapid", payload.chess_rapid),
    toFormat("blitz", "Blitz", payload.chess_blitz),
    toFormat("bullet", "Bullet", payload.chess_bullet),
  ].filter((f): f is FormatStat => f !== null);
  return { formats };
}

/** Reads the public profile stats. Never throws; degrades to a link. */
export async function getChessStats(): Promise<ChessStats> {
  try {
    const payload = await api<StatsPayload>(
      `https://api.chess.com/pub/player/${CHESS_USER}/stats`,
    );
    return { ...parseStats(payload), ok: true };
  } catch {
    return { formats: [], ok: false };
  }
}

/* ------------------------------------------------------------ last game ---- */

export type ChessGame = {
  url: string;
  timeClass: string;
  white: { user: string; rating: number };
  black: { user: string; rating: number };
  youAre: "white" | "black";
  outcome: "won" | "lost" | "drew";
  fens: string[]; // positions from start to final
  sans: string[]; // moves in SAN
};

/**
 * Whether a game can be replayed. The board steps between positions, so a game
 * whose PGN yielded fewer than two has nothing to show even though the game
 * itself is real.
 */
export function isReplayable(game: ChessGame | null): game is ChessGame {
  return game !== null && game.fens.length > 1;
}

/**
 * The one rating worth drawing: the format the last game was played in. Every
 * other number on the profile is a format the reader is not looking at.
 *
 * No game means no format to pick, and a game in a format the profile carries
 * no rated record for reads the same way, rather than falling back to some
 * other format's number under the last game's name.
 */
export function ratingForGame(
  stats: ChessStats,
  game: ChessGame | null,
): FormatStat | null {
  if (!game) return null;
  const key = game.timeClass.toLowerCase();
  return stats.formats.find((f) => f.key === key) ?? null;
}

/**
 * A PGN replayed into the positions the board steps through, server-side, which
 * is what keeps chess.js off the client. A PGN chess.js cannot read yields no
 * positions rather than throwing, so an unreadable game is reported as a game
 * with nothing to replay.
 */
function replay(pgn: string): { fens: string[]; sans: string[] } {
  try {
    const parsed = new Chess();
    parsed.loadPgn(pgn);
    const sans = parsed.history();
    const board = new Chess();
    const fens = [board.fen()];
    for (const san of sans) {
      board.move(san);
      fens.push(board.fen());
    }
    return { fens, sans };
  } catch {
    return { fens: [], sans: [] };
  }
}

/**
 * Pure game payload → ChessGame transform. The test surface; no network.
 *
 * Everything the card renders has to be there. A game missing a player or a
 * rating is reported as no game at all, rather than rendered with holes.
 */
export function parseGame(g: GamePayload | undefined): ChessGame | null {
  const white = g?.white;
  const black = g?.black;
  if (!g?.pgn || !g.url || !g.time_class) return null;
  if (!white?.username || typeof white.rating !== "number") return null;
  if (!black?.username || typeof black.rating !== "number") return null;

  const youAre = white.username.toLowerCase() === CHESS_USER ? "white" : "black";
  const youResult = youAre === "white" ? white.result : black.result;
  const oppResult = youAre === "white" ? black.result : white.result;
  const outcome =
    youResult === "win" ? "won" : oppResult === "win" ? "lost" : "drew";

  return {
    url: g.url,
    timeClass: g.time_class,
    white: { user: white.username, rating: white.rating },
    black: { user: black.username, rating: black.rating },
    youAre,
    outcome,
    ...replay(g.pgn),
  };
}

/** Reads the most recent archived game. Never throws; degrades to no game. */
export async function getLatestGame(): Promise<ChessGame | null> {
  try {
    const arch = await api<ArchivesPayload>(
      `https://api.chess.com/pub/player/${CHESS_USER}/games/archives`,
    );
    const archiveUrl = arch.archives?.at(-1);
    if (!archiveUrl) return null;

    const month = await api<MonthPayload>(archiveUrl);
    return parseGame(month.games?.at(-1));
  } catch {
    return null;
  }
}
