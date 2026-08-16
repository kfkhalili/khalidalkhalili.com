import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { resolveLocale, toLocale, type Dictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { excerpt } from "@/lib/prose";
import { getBookshelf } from "@/lib/goodreads";
import { getReflections, refLabel } from "@/lib/quran-reflect";
import { getChessStats, getLatestGame, ratingForGame } from "@/lib/chess";

// Render on demand: every card on it is a live feed.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  // Not in the sitemap, for the same reason its three children aren't: the whole
  // page is live third-party data. Still crawled from the nav, so it still has
  // to say which URL it is and which locales it exists in.
  return pageMetadata({
    lang,
    sub: "/elsewhere",
    title: dict.elsewhere.title,
    description: dict.elsewhere.subtitle,
    dict,
  });
}

/**
 * One feed, as a way in rather than as a summary. The card carries the least
 * that answers "what is he doing over there" and links to the page that holds
 * the rest; the three feeds are fetched together but read separately, so a
 * platform that is down quiets its own card and leaves the other two alone.
 */
function Card({
  href,
  title,
  label,
  children,
  forward,
}: {
  href: string;
  title: string;
  label: string;
  children: ReactNode;
  forward: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-border bg-card-2 p-5 transition-colors hover:border-accent/40"
    >
      <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
        {title}
      </h2>
      <p className="mt-3 text-xs uppercase tracking-wide text-faint">{label}</p>
      {/* Each teaser line marks its own direction below: a card can carry an
          Arabic citation over a Latin excerpt at once, and one dir for the
          whole card would hand the second line's punctuation to the wrong
          end. */}
      <div className="mt-1 grow text-sm leading-snug text-muted">
        {children}
      </div>
      <span className="mt-4 text-sm text-accent transition-colors group-hover:text-accent-strong">
        {forward}
      </span>
    </Link>
  );
}

/** A feed that answered with nothing to say, told plainly rather than left blank. */
function Quiet({ dict }: { dict: Dictionary["elsewhere"] }) {
  return <span className="text-faint">{dict.quiet}</span>;
}

export default async function ElsewherePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict, forward } = await resolveLocale(lang);

  const [shelf, reflections, stats, game] = await Promise.all([
    getBookshelf(),
    getReflections(3),
    getChessStats(),
    getLatestGame(),
  ]);

  const copy = dict.elsewhere;
  // What I'm in the middle of, or failing that the last thing I finished and
  // wrote about: the card wants the freshest thing the shelf can offer.
  const book = shelf.currentlyReading[0] ?? shelf.latestReview;
  const reflection = reflections.posts[0];
  const rating = ratingForGame(stats, game);
  const surah = reflection?.refs[0];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{copy.subtitle}</p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        <Card
          href={`/${lang}/reading`}
          title={dict.reading.title}
          label={copy.readingTeaser}
          forward={forward}
        >
          {book ? (
            <>
              <span dir="auto" className="font-medium text-foreground">
                {book.title}
              </span>
              <br />
              <span dir="auto">{book.author}</span>
            </>
          ) : (
            <Quiet dict={copy} />
          )}
        </Card>

        <Card
          href={`/${lang}/islam`}
          title={dict.islam.title}
          label={copy.islamTeaser}
          forward={forward}
        >
          {reflection ? (
            <>
              {surah && (
                <span dir="auto" className="font-mono text-xs text-accent">
                  {refLabel(
                    surah,
                    toLocale(lang) === "ar"
                      ? reflections.chapters[surah.chapterId]?.arabic
                      : reflections.chapters[surah.chapterId]?.simple,
                  )}
                </span>
              )}
              <p dir="auto" className="mt-1">
                {excerpt(reflection.body, 90)}
              </p>
            </>
          ) : (
            <Quiet dict={copy} />
          )}
        </Card>

        <Card
          href={`/${lang}/chess`}
          title={dict.chess.title}
          label={copy.chessTeaser}
          forward={forward}
        >
          {rating ? (
            <>
              <span className="font-medium text-foreground">{rating.rating}</span>{" "}
              {rating.label}
              {game && (
                <>
                  <br />
                  {dict.chess[game.outcome]}
                </>
              )}
            </>
          ) : (
            <Quiet dict={copy} />
          )}
        </Card>
      </div>
    </div>
  );
}
