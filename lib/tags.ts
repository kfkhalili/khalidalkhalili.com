import type { Article } from "@/lib/articles";

/**
 * A tag as a place rather than a label: the writing index narrowed to the
 * pieces carrying it. One module so the tag on an article's own page, the tag
 * on its card, and the index that answers them all name the same query key and
 * agree on what an ambiguous one means.
 *
 * Type-only import of Article, so this stays free of the article libraries and
 * can be reached from a Client Component.
 */
export const TAG_PARAM = "tag";

/** Where a tag leads, inside the reader's locale. */
export function tagHref(lang: string, tag: string): string {
  return `/${lang}/writing?${TAG_PARAM}=${encodeURIComponent(tag)}`;
}

/**
 * The tag a request asks for, or "" for no tag at all.
 *
 * `?tag=a&tag=b` arrives as an array, which asks for two shelves at once. That
 * is refused rather than resolved to the first, so the reader gets the whole
 * index back with no chip claiming to have filtered it.
 */
export function readTag(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

/** The articles carrying `tag`, or all of them when no tag is asked for. */
export function filterByTag<T extends Pick<Article, "tags">>(
  articles: T[],
  tag: string,
): T[] {
  return tag ? articles.filter((a) => a.tags.includes(tag)) : articles;
}

/**
 * Every tag the index holds, with how many pieces carry it, in the order the
 * index itself reads.
 *
 * Counted over the whole index rather than the shelf currently on screen, so
 * the row of tags is the same row whichever one is chosen: it neither
 * rearranges itself nor collapses to the one tag already in force, which is
 * what would move the articles under the reader's cursor.
 */
export function countTags<T extends Pick<Article, "tags">>(
  articles: T[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].map(([tag, count]) => ({ tag, count }));
}
