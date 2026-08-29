import type { Metadata } from "next";
import { strings } from "@/lib/strings";
import { pagePath } from "@/lib/share";

/**
 * What a page needs in order to name itself: its own canonical address and an
 * Open Graph block describing the page rather than the site.
 *
 * It has to restate Open Graph in full. A page that sets `openGraph` at all
 * replaces the layout's block wholesale rather than merging into it, so a
 * partial one would drop the fields it didn't mention. A page that sets none
 * inherits the layout's, which is why the layout claims no `url`: it would have
 * every page report the same address.
 */
export function pageMetadata({
  sub,
  title,
  description,
  absoluteTitle = false,
}: {
  /** "" for the home page, otherwise "/writing", "/about", … */
  sub: string;
  title: string;
  description: string;
  /** Skip the layout's `%s · Khalid` template, for a title that is already whole. */
  absoluteTitle?: boolean;
}): Metadata {
  const path = pagePath(sub);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      siteName: strings.site.title,
      locale: "en_US",
    },
  };
}
