import { LOCALE_META } from "@/lib/i18n";

/**
 * How an article's date and reading time read in each language. Kept apart from
 * lib/articles.ts, which loads content from disk: these run in the browser too,
 * and importing them must never pull node:fs into a client bundle.
 */

export function formatDate(iso: string, lang: string): string {
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
export function formatReadingTime(minutes: number, lang: string): string {
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
