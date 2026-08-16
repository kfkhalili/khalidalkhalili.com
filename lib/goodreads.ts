import { excerpt, plainText } from "@/lib/prose";

// Re-exported because a Goodreads review is the reason this site has an
// excerpt at all, and the reading page has always reached for it here.
export { excerpt };

const USER_ID = "6598624";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export type Book = {
  title: string;
  author: string;
  cover: string;
  rating: number; // 0–5 (0 = unrated)
  link: string;
  review: string; // my own review, as plain text; "" when I didn't write one
};

export type Bookshelf = {
  currentlyReading: Book[];
  read: Book[];
  /** The newest finished book I actually wrote about. Null if none did. */
  latestReview: Book | null;
  ok: boolean; // false if Goodreads couldn't be reached
};

function decode(value: string): string {
  return value
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#3?9;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function field(item: string, name: string): string {
  const match = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return match ? decode(match[1]) : "";
}

/**
 * The image hosts `next.config.ts` allows `next/image` to load. It refuses any
 * other host by throwing, which on a page rendered per request means a 500. So
 * a cover this site could not render is treated as no cover at all, and the
 * book drops out the same way a cover-less one always has.
 */
const COVER_HOST = /^([a-z0-9-]+\.)*gr-assets\.com$/;

function renderableCover(url: string): string {
  try {
    return COVER_HOST.test(new URL(url).hostname) ? url : "";
  } catch {
    return ""; // not a URL at all
  }
}

/**
 * Goodreads stores a review as a fragment of HTML: paragraphs, line breaks and
 * the odd `<em>`. `field` above has already decoded the entities by the time
 * `plainText` sees it, so a review that spelled out `&lt;b&gt;` is stripped
 * rather than shown.
 */

/** Pure RSS → Book[] transform. Exposed as the test surface; no network. */
export function parseShelf(xml: string): Book[] {
  return xml
    .split("<item>")
    .slice(1)
    .map((chunk) => {
      const item = chunk.split("</item>")[0];
      return {
        title: field(item, "title"),
        author: field(item, "author_name"),
        cover: renderableCover(
          field(item, "book_large_image_url") ||
            field(item, "book_medium_image_url") ||
            field(item, "book_image_url"),
        ),
        rating: Number.parseInt(field(item, "user_rating") || "0", 10) || 0,
        link: field(item, "link"),
        review: plainText(field(item, "user_review")),
      };
    })
    .filter((b) => b.title && b.cover);
}

async function fetchShelf(shelf: string): Promise<Book[]> {
  const url = `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${shelf}&sort=date_read`;
  const res = await fetch(url, {
    headers: { "user-agent": UA },
    cache: "no-store", // fetch the live shelf on every request
  });
  if (!res.ok) throw new Error(`Goodreads ${shelf} → ${res.status}`);
  return parseShelf(await res.text());
}

/** Reads the public Goodreads shelves via RSS. Never throws; degrades to a link. */
export async function getBookshelf(readLimit = 30): Promise<Bookshelf> {
  try {
    const [currentlyReading, read] = await Promise.all([
      fetchShelf("currently-reading"),
      fetchShelf("read"),
    ]);
    // The shelf arrives newest-finished-first, so the first reviewed book on it
    // is the latest review. Searched before the slice: I read a good deal more
    // than I write about, and the newest review can sit well past `readLimit`.
    return {
      currentlyReading,
      read: read.slice(0, readLimit),
      latestReview: read.find((b) => b.review) ?? null,
      ok: true,
    };
  } catch {
    return { currentlyReading: [], read: [], latestReview: null, ok: false };
  }
}
