import { Chess } from "chess.js";

const USER = "ibnalkhalili";
const UA = "khalidalkhalili.com personal site (contact kfkhalili)";
export const CHESS_PROFILE_URL = `https://www.chess.com/member/${USER}`;

async function api(url: string): Promise<Record<string, unknown>> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFormat(key: string, label: string, s: any): FormatStat | null {
  if (!s?.last?.rating) return null;
  return {
    key,
    label,
    rating: s.last.rating,
    best: s.best?.rating ?? null,
    win: s.record?.win ?? 0,
    loss: s.record?.loss ?? 0,
    draw: s.record?.draw ?? 0,
  };
}

export async function getChessStats(): Promise<ChessStats> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = (await api(
      `https://api.chess.com/pub/player/${USER}/stats`,
    )) as any;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arch = (await api(
      `https://api.chess.com/pub/player/${USER}/games/archives`,
    )) as any;
    const archiveUrl: string | undefined =
      arch.archives?.[arch.archives.length - 1];
    if (!archiveUrl) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const month = (await api(archiveUrl)) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = month.games?.[month.games.length - 1] as any;
    if (!g?.pgn) return null;

    const youAre =
      String(g.white.username).toLowerCase() === USER ? "white" : "black";
    const youResult = youAre === "white" ? g.white.result : g.black.result;
    const oppResult = youAre === "white" ? g.black.result : g.white.result;
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
      white: { user: g.white.username, rating: g.white.rating },
      black: { user: g.black.username, rating: g.black.rating },
      youAre,
      outcome,
      fens,
      sans,
    };
  } catch {
    return null;
  }
}
