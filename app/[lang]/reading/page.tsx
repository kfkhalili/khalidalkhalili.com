import type { Metadata } from "next";
import Image from "next/image";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { getBookshelf, type Book } from "@/lib/goodreads";
import { site } from "@/lib/site";

// Render on demand: pull the current Goodreads shelf each time the page loads.
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
    sub: "/reading",
    title: dict.reading.title,
    description: dict.reading.subtitle,
    dict,
  });
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
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(min-width: 768px) 120px, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug text-foreground">
        {book.title}
      </p>
      <p className="line-clamp-1 text-xs text-faint">{book.author}</p>
      {book.rating > 0 && (
        <p
          className="mt-0.5 text-xs text-accent-strong"
          aria-label={`${book.rating}/5`}
        >
          {"★".repeat(book.rating)}
          <span className="text-border">{"★".repeat(5 - book.rating)}</span>
        </p>
      )}
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

export default async function ReadingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const shelf = await getBookshelf();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.reading.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.reading.subtitle}</p>
      </header>

      {shelf.currentlyReading.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {dict.reading.currentlyReading}
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
            {dict.reading.recentlyRead}
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
          {shelf.ok ? dict.reading.viewOnGoodreads : dict.reading.unavailable} ↗
        </a>
      </div>
    </div>
  );
}
