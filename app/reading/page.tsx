import type { Metadata } from "next";
import Image from "next/image";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/page-metadata";
import { excerpt, getBookshelf, type Book } from "@/lib/goodreads";
import { site } from "@/lib/site";

// Render on demand: pull the current Goodreads shelf each time the page loads.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  // Not in the sitemap, but still crawled from the site nav, so it still has
  // to say which URL it is.
  return pageMetadata({
    sub: "/reading",
    title: strings.reading.title,
    description: strings.reading.subtitle,
  });
}

/** A rating out of five. Unrated books say nothing rather than showing zero. */
function Stars({ rating }: { rating: number }) {
  if (rating <= 0) return null;
  return (
    <p className="mt-0.5 text-xs text-accent-strong" aria-label={`${rating}/5`}>
      {"★".repeat(rating)}
      <span className="text-border">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

function Cover({ book }: { book: Book }) {
  return (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-card-2 shadow-sm">
        {/* Covers arrive from Goodreads' CDN already small and compressed.
            Vercel's optimizer is metered, and re-encoding them once burned
            through the quota: every cover answered 402 for the rest of the
            month. `unoptimized` serves them as-is, on every cover here. */}
        <Image
          src={book.cover}
          alt={book.title}
          fill
          unoptimized
          sizes="(min-width: 768px) 120px, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-foreground">
        {book.title}
      </p>
      <p className="line-clamp-1 text-xs text-faint">{book.author}</p>
      <Stars rating={book.rating} />
    </a>
  );
}

function CurrentBook({ book }: { book: Book }) {
  return (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex max-w-sm gap-4"
    >
      {/* Same 2:3 crop the shelf covers use, so the two agree. */}
      <div className="relative h-28 w-[4.667rem] shrink-0 overflow-hidden rounded-md border border-border shadow-sm">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          unoptimized
          sizes="75px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 self-center">
        <p className="font-medium leading-snug text-foreground transition-colors group-hover:text-accent-strong">
          {book.title}
        </p>
        <p className="mt-1 text-sm text-muted">{book.author}</p>
      </div>
    </a>
  );
}

/**
 * The newest book I finished and wrote about. Only the opening of the review
 * lives here: the full text is Goodreads' copy, and one book's worth of opinion
 * should not outweigh the shelf it sits above.
 */
function LatestReview({ book }: { book: Book }) {
  const dict = strings.reading;
  return (
    <section className="mt-12">
      <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
        {dict.latestReview}
      </h2>
      <article className="mt-5 rounded-lg border border-border bg-card-2 p-5 sm:p-6">
        <div className="flex gap-4">
          {/* Same 2:3 crop the shelf covers use, so the three agree. */}
          <div className="relative h-28 w-[4.667rem] shrink-0 overflow-hidden rounded-md border border-border shadow-sm">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              unoptimized
              sizes="75px"
              className="object-cover"
            />
          </div>
          {/* A book names itself in its own script, so direction is inferred
              per line rather than inherited from the page: without it, an
              Arabic title hands its trailing punctuation to the wrong end. */}
          <div className="min-w-0 self-center" dir="auto">
            <p className="font-medium leading-snug text-foreground">
              {book.title}
            </p>
            <p className="mt-1 text-sm text-muted">{book.author}</p>
            <Stars rating={book.rating} />
          </div>
        </div>
        {/* The parse leaves paragraphs as blank lines; pre-line honours them. */}
        <p
          dir="auto"
          className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted"
        >
          {excerpt(book.review)}
        </p>
        <a
          href={book.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-accent transition-colors hover:text-accent-strong"
        >
          {dict.readFullReview} ↗
        </a>
      </article>
    </section>
  );
}

export default async function ReadingPage() {
  const shelf = await getBookshelf();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {strings.reading.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{strings.reading.subtitle}</p>
      </header>

      {shelf.latestReview && (
        <LatestReview book={shelf.latestReview} />
      )}

      {shelf.currentlyReading.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {strings.reading.currentlyReading}
          </h2>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-5">
            {shelf.currentlyReading.map((b) => (
              <CurrentBook key={b.link} book={b} />
            ))}
          </div>
        </section>
      )}

      {shelf.read.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {strings.reading.recentlyRead}
          </h2>
          <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {shelf.read.map((b) => (
              <Cover key={b.link} book={b} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 border-t border-border pt-6">
        <a
          href={site.goodreads}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent transition-colors hover:text-accent-strong"
        >
          {shelf.ok ? strings.reading.viewOnGoodreads : strings.reading.unavailable} ↗
        </a>
      </div>
    </div>
  );
}
