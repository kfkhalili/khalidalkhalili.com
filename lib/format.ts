import type { Article } from "@/lib/articles";

/**
 * How a byline reads. Kept apart from lib/articles.ts, which loads content
 * from disk: these run in the browser too, and importing them must never pull
 * node:fs into a client bundle. Article above is imported as a type, so it is
 * erased and brings nothing with it.
 *
 * A date reads in the language the piece was written in, wherever the piece is
 * shown: the site's own writing is English, but a QuranReflect reflection can
 * be written in Arabic or German, and its date belongs to the writing rather
 * than to the page around it.
 */

const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  ar: "ar",
};

/** An ISO day, formatted in the given language ("" stays ""). */
export function formatDate(iso: string, lang = "en"): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    DATE_LOCALES[lang] ?? "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

/** The article's date. */
export function articleDate(article: Pick<Article, "date">): string {
  return formatDate(article.date);
}

/** The article's reading time. */
export function articleReadingTime(
  article: Pick<Article, "readingTime">,
): string {
  return `${article.readingTime} min read`;
}
