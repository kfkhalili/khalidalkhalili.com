import type { Metadata } from "next";
import { ogLocaleOf, type Dictionary } from "@/lib/i18n";
import { localePath, localeAlternates } from "@/lib/share";

/**
 * What a page needs in order to name itself: its own canonical address, the
 * reciprocal `hreflang` set, and an Open Graph block describing the page rather
 * than the site.
 *
 * It has to restate Open Graph in full. A page that sets `openGraph` at all
 * replaces the layout's block wholesale rather than merging into it, so a
 * partial one would drop the fields it didn't mention. A page that sets none
 * inherits the layout's, which is why the layout claims no `url`: it would have
 * every page report the same address.
 */
export function pageMetadata({
  lang,
  sub,
  title,
  description,
  dict,
  absoluteTitle = false,
}: {
  lang: string;
  /** "" for the locale home, otherwise "/writing", "/about", … */
  sub: string;
  title: string;
  description: string;
  dict: Dictionary;
  /** Skip the layout's `%s · Khalid` template, for a title that is already whole. */
  absoluteTitle?: boolean;
}): Metadata {
  const path = localePath(lang, sub);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, languages: localeAlternates(sub) },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      siteName: dict.site.title,
      locale: ogLocaleOf(lang),
    },
  };
}
