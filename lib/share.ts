import { site } from "@/lib/site";

/**
 * Where a page lives, and how a link to it is handed to someone else. One
 * module owns both, so the URL a reader copies, the URL in `og:url`, the
 * canonical tag, and the sitemap are the same string by construction.
 *
 * `…Path` returns a relative path, for metadata that resolves against
 * `metadataBase`. `…Url` returns an absolute one, for anywhere that doesn't:
 * the copy button, and the sitemap, which sits outside the app tree and so
 * inherits no base.
 */

/** The path a page lives at. `sub` is "" for the home page or starts with "/". */
export function pagePath(sub = ""): string {
  return sub || "/";
}

export function pageUrl(sub = ""): string {
  return `${site.url}${sub}`;
}

/** The path an article lives at. */
export function articlePath(slug: string): string {
  return `/writing/${slug}`;
}

/** The absolute URL to share. */
export function articleUrl(slug: string): string {
  return pageUrl(articlePath(slug));
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
