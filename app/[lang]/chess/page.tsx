import type { Metadata } from "next";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import {
  getChessStats,
  getLatestGame,
  isReplayable,
  ratingForGame,
  CHESS_PROFILE_URL,
  CHESS_CHALLENGE_URL,
  CHESS_USER,
} from "@/lib/chess";
import { ChessBoard } from "@/components/chess-board";

// On demand: pull live ratings + the latest game each page load.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  // Not in the sitemap, but still crawled from the site nav, so it still has to
  // say which URL it is and which locales it exists in.
  return pageMetadata({
    lang,
    sub: "/chess",
    title: dict.chess.title,
    description: dict.chess.subtitle,
    dict,
  });
}

const OUTCOME_CLASS: Record<string, string> = {
  won: "border-accent/40 text-accent-strong",
  lost: "border-border text-muted",
  drew: "border-border text-faint",
};

export default async function ChessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const [stats, game] = await Promise.all([getChessStats(), getLatestGame()]);

  // Asked once, so the fallback below is exactly the case where neither section
  // drew anything, rather than a second guess at the same question.
  const rating = ratingForGame(stats, game);
  const showGame = isReplayable(game);

  const player = (name: string, rating: number) => (
    <span
      className={
        name.toLowerCase() === CHESS_USER
          ? "font-semibold text-foreground"
          : "text-muted"
      }
    >
      {name}{" "}
      <span className="font-mono text-xs text-faint">{rating}</span>
    </span>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.chess.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.chess.subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <a
            href={CHESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.chess.viewProfile}
            title={dict.chess.viewProfile}
            className="inline-flex items-center gap-2 rounded-full border border-border py-1.5 pe-3 ps-2.5 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden className="text-accent">
              <rect x="0.5" y="0.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" />
              <rect x="1" y="1" width="5" height="5" fill="currentColor" opacity="0.6" />
              <rect x="6" y="6" width="5" height="5" fill="currentColor" opacity="0.6" />
            </svg>
            {CHESS_USER}
            <span className="text-faint">↗</span>
          </a>
          {/* chess.com asks for the login, so this is a link and not a form. */}
          <a
            href={CHESS_CHALLENGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-3 py-1.5 font-mono text-sm text-accent-strong transition-colors hover:border-accent hover:bg-accent/10"
          >
            {dict.chess.challenge}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </header>

      {rating && (
        <section className="mt-12">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {dict.chess.rating}
          </h2>
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{rating.label}</span>
              <span className="font-mono tabular-nums text-foreground">
                {rating.rating}
                {rating.best && (
                  <span className="text-faint"> · best {rating.best}</span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-card-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.min(100, (rating.rating / 2000) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 font-mono text-xs text-faint">
              {rating.win} W · {rating.loss} L · {rating.draw} D
            </p>
          </div>
        </section>
      )}

      {showGame && (
        <section className="mt-14">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {dict.chess.lastGame}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {player(game.white.user, game.white.rating)}
            <span className="text-faint">vs</span>
            {player(game.black.user, game.black.rating)}
            <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-faint">
              {game.timeClass}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${OUTCOME_CLASS[game.outcome]}`}
            >
              {dict.chess[game.outcome]}
            </span>
          </div>
          <div className="mt-5">
            <ChessBoard
              fens={game.fens}
              sans={game.sans}
              orientation={game.youAre}
            />
          </div>
          <div className="mx-auto mt-6 flex max-w-sm justify-center">
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:bg-card-2"
            >
              {dict.chess.reviewGame}
              <span className="text-accent">↗</span>
            </a>
          </div>
        </section>
      )}

      {/* Nothing above drew anything, whether because chess.com is down, the
          profile is empty, or the one game could not be replayed. Hand over the
          link the way the reading page does, rather than leave a bare heading. */}
      {!rating && !showGame && (
        <div className="mt-12 border-t border-border pt-6">
          <a
            href={CHESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent transition-colors hover:text-accent-strong"
          >
            {dict.chess.unavailable} ↗
          </a>
        </div>
      )}
    </div>
  );
}
