import type en from "@/dictionaries/en.json";

export const LOCALES = ["en", "de", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  { label: string; dir: "ltr" | "rtl"; dateLocale: string; ogLocale: string }
> = {
  // ogLocale is Open Graph's underscored `language_TERRITORY`, not BCP 47.
  en: { label: "English", dir: "ltr", dateLocale: "en-US", ogLocale: "en_US" },
  de: { label: "Deutsch", dir: "ltr", dateLocale: "de-DE", ogLocale: "de_DE" },
  ar: { label: "العربية", dir: "rtl", dateLocale: "ar", ogLocale: "ar_AR" },
};

/** The Open Graph locale tag for a locale, falling back to the default's. */
export function ogLocaleOf(locale: string): string {
  return LOCALE_META[isLocale(locale) ? locale : DEFAULT_LOCALE].ogLocale;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: string): "ltr" | "rtl" {
  return isLocale(locale) ? LOCALE_META[locale].dir : "ltr";
}

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  de: () => import("@/dictionaries/de.json").then((m) => m.default),
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  return dictionaries[isLocale(locale) ? locale : DEFAULT_LOCALE]();
}

export type ResolvedLocale = {
  lang: string;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  back: string; // arrow pointing "back" in this locale's reading direction
  forward: string; // arrow pointing "forward"
};

/** Everything a page needs about its locale, behind one interface. */
export async function resolveLocale(lang: string): Promise<ResolvedLocale> {
  const dir = dirOf(lang);
  return {
    lang,
    dir,
    dict: await getDictionary(lang),
    back: dir === "rtl" ? "→" : "←",
    forward: dir === "rtl" ? "←" : "→",
  };
}

/** Badge label for an article whose language differs from the page's, else null. */
export function languageBadge(
  articleLang: string,
  pageLang: string,
): string | null {
  if (articleLang === pageLang) return null;
  return LOCALE_META[articleLang as Locale]?.label ?? null;
}
