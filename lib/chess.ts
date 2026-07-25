import { Chess } from "chess.js";

const USER = "ibnalkhalili";
const UA = "khalidalkhalili.com personal site (contact kfkhalili)";
export const CHESS_PROFILE_URL = `https://www.chess.com/member/${USER}`;

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

type StatsPayload = {
  chess_rapid?: FormatPayload;
  chess_blitz?: FormatPayload;
  chess_bullet?: FormatPayload;
  tactics?: { highest?: RatingSnapshot };
  puzzle_rush?: { best?: { score?: number } };
};

type ArchivesPayload = { archives?: string[] };

type PlayerPayload = { username?: string; rating?: number; result?: string };

type GamePayload = {
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

export type FormatStat = {
  key: string;
  label: string;
  rating: number;
  best: number | null;
  win: number;
  loss: number;
  draw: number;
};

export type ChessStats = {
  ok: boolean;
  formats: FormatStat[];
  tactics: number | null;
  puzzleRush: number | null;
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

export async function getChessStats(): Promise<ChessStats> {
  try {
    const s = await api<StatsPayload>(
      `https://api.chess.com/pub/player/${USER}/stats`,
    );
    const formats = [
      toFormat("rapid", "Rapid", s.chess_rapid),
      toFormat("blitz", "Blitz", s.chess_blitz),
      toFormat("bullet", "Bullet", s.chess_bullet),
    ].filter((f): f is FormatStat => f !== null);
    return {
      ok: true,
      formats,
      tactics: s.tactics?.highest?.rating ?? null,
      puzzleRush: s.puzzle_rush?.best?.score ?? null,
    };
  } catch {
    return { ok: false, formats: [], tactics: null, puzzleRush: null };
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

export async function getLatestGame(): Promise<ChessGame | null> {
  try {
    const arch = await api<ArchivesPayload>(
      `https://api.chess.com/pub/player/${USER}/games/archives`,
    );
    const archiveUrl = arch.archives?.at(-1);
    if (!archiveUrl) return null;

    const month = await api<MonthPayload>(archiveUrl);
    const g = month.games?.at(-1);
    // Everything the card renders has to be there. A game missing a player or a
    // rating is reported as no game at all, rather than rendered with holes.
    const white = g?.white;
    const black = g?.black;
    if (!g?.pgn || !g.url || !g.time_class) return null;
    if (!white?.username || typeof white.rating !== "number") return null;
    if (!black?.username || typeof black.rating !== "number") return null;

    const youAre = white.username.toLowerCase() === USER ? "white" : "black";
    const youResult = youAre === "white" ? white.result : black.result;
    const oppResult = youAre === "white" ? black.result : white.result;
    const outcome =
      youResult === "win" ? "won" : oppResult === "win" ? "lost" : "drew";

    // Replay the PGN into a list of positions (server-side; keeps chess.js off the client).
    let fens: string[] = [];
    let sans: string[] = [];
    try {
      const parsed = new Chess();
      parsed.loadPgn(g.pgn);
      sans = parsed.history();
      const replay = new Chess();
      fens = [replay.fen()];
      for (const san of sans) {
        replay.move(san);
        fens.push(replay.fen());
      }
    } catch {
      fens = [];
      sans = [];
    }

    return {
      url: g.url,
      timeClass: g.time_class,
      white: { user: white.username, rating: white.rating },
      black: { user: black.username, rating: black.rating },
      youAre,
      outcome,
      fens,
      sans,
    };
  } catch {
    return null;
  }
}
