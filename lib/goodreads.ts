const USER_ID = "6598624";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export type Book = {
  title: string;
  author: string;
  cover: string;
  rating: number; // 0–5 (0 = unrated)
  link: string;
};

export type Bookshelf = {
  currentlyReading: Book[];
  read: Book[];
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

function parse(xml: string): Book[] {
  return xml
    .split("<item>")
    .slice(1)
    .map((chunk) => {
      const item = chunk.split("</item>")[0];
      return {
        title: field(item, "title"),
        author: field(item, "author_name"),
        cover:
          field(item, "book_large_image_url") ||
          field(item, "book_medium_image_url") ||
          field(item, "book_image_url"),
        rating: Number.parseInt(field(item, "user_rating") || "0", 10) || 0,
        link: field(item, "link"),
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
  return parse(await res.text());
}

/** Reads the public Goodreads shelves via RSS. Never throws — degrades to a link. */
export async function getBookshelf(readLimit = 30): Promise<Bookshelf> {
  try {
    const [currentlyReading, read] = await Promise.all([
      fetchShelf("currently-reading"),
      fetchShelf("read"),
    ]);
    return { currentlyReading, read: read.slice(0, readLimit), ok: true };
  } catch {
    return { currentlyReading: [], read: [], ok: false };
  }
}
