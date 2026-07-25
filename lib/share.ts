import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { site } from "@/lib/site";

/**
 * Where a page lives, and how a link to it is handed to someone else. One
 * module owns both, so the URL a reader copies, the URL in `og:url`, the
 * canonical tag, and the sitemap are the same string by construction.
 *
 * `…Path` returns a relative path, for metadata that resolves against
 * `metadataBase`. `…Url` returns an absolute one, for anywhere that doesn't:
 * the copy button, and the sitemap, which sits outside the `[lang]` tree and
 * so inherits no base.
 */

/** The path a page lives at in a locale. `sub` is "" or starts with "/". */
export function localePath(lang: string, sub = ""): string {
  return `/${lang}${sub}`;
}

export function localeUrl(lang: string, sub = ""): string {
  return `${site.url}${localePath(lang, sub)}`;
}

/**
 * One page's address in every locale, keyed for `hreflang`.
 *
 * The set is reciprocal: each locale lists every locale including itself, or
 * search engines drop the annotation. `x-default` names what the proxy already
 * serves a visitor whose Accept-Language matches nothing.
 */
function alternates(
  sub: string,
  href: (lang: string, sub: string) => string,
): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, href(l, sub)])),
    "x-default": href(DEFAULT_LOCALE, sub),
  };
}

/** For page metadata, which resolves relative hrefs against `metadataBase`. */
export function localeAlternates(sub = ""): Record<string, string> {
  return alternates(sub, localePath);
}

/** For the sitemap, which has no base to resolve against. Two named functions
 *  rather than one that takes the path builder: `articlePath` has the same
 *  shape as `localePath`, so a callback parameter would accept it and quietly
 *  emit nonsense. */
export function localeAlternateUrls(sub = ""): Record<string, string> {
  return alternates(sub, localeUrl);
}

/** The path an article lives at in a given locale. */
export function articlePath(lang: string, slug: string): string {
  return localePath(lang, `/writing/${slug}`);
}

/** The absolute URL to share: locale-qualified, so the link opens as read. */
export function articleUrl(lang: string, slug: string): string {
  return localeUrl(lang, `/writing/${slug}`);
}

/** Every locale's path for the same article, for `alternates.languages`. */
export function articleLanguages(slug: string): Record<string, string> {
  return localeAlternates(`/writing/${slug}`);
}

export const SHARE_TARGETS = ["linkedin", "x", "whatsapp"] as const;
export type ShareTarget = (typeof SHARE_TARGETS)[number];

/**
 * The intent URL for each network. LinkedIn takes the URL alone and scrapes the
 * page's Open Graph tags for everything else, which is why the per-article
 * metadata in the article route is the load-bearing half of sharing; X and
 * WhatsApp carry the title themselves.
 */
export function shareIntent(
  target: ShareTarget,
  { url, title }: { url: string; title: string },
): string {
  const u = encodeURIComponent(url);
  switch (target) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "x":
      return `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${u}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  }
}
