import type { Article } from "@/lib/articles";
import { LOCALE_META } from "@/lib/i18n";

/**
 * How an article's byline reads. Kept apart from lib/articles.ts, which loads
 * content from disk: these run in the browser too, and importing them must never
 * pull node:fs into a client bundle. Article above is imported as a type, so it
 * is erased and brings nothing with it.
 *
 * A byline reads in the language the piece was written in, wherever the piece is
 * shown. An Arabic essay listed on the English index still dates itself in
 * Arabic, because the date belongs to the writing rather than to the page around
 * it, and `languageBadge` is what tells the reader the language differs. Neither
 * function below takes a locale of its own, so no caller can reach for the
 * page's: doing exactly that is how the index, the article and the share card
 * came to disagree about the same essay.
 */

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const dateLocale =
    LOCALE_META[lang as keyof typeof LOCALE_META]?.dateLocale ?? "en-US";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Arabic needs full number agreement for the counted noun
 * (دقيقة / دقيقتان / دقائق / دقيقة); en and de use an invariant unit.
 */
function formatReadingTime(minutes: number, lang: string): string {
  if (lang === "de") return `${minutes} Min. Lesezeit`;
  if (lang !== "ar") return `${minutes} min read`;

  switch (new Intl.PluralRules("ar").select(minutes)) {
    case "one":
      return "دقيقة قراءة";
    case "two":
      return "دقيقتان قراءة";
    case "few":
      return `${minutes} دقائق قراءة`;
    default:
      return `${minutes} دقيقة قراءة`; // many (11–99), other (0, 100+)
  }
}

/** The article's date, in the article's own language. */
export function articleDate(article: Pick<Article, "date" | "lang">): string {
  return formatDate(article.date, article.lang);
}

/** The article's reading time, in the article's own language. */
export function articleReadingTime(
  article: Pick<Article, "readingTime" | "lang">,
): string {
  return formatReadingTime(article.readingTime, article.lang);
}
