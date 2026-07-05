import { describe, it, expect } from "vitest";
import { parseShelf } from "./goodreads";

// A trimmed Goodreads shelf feed: covers CDATA, an HTML entity, an Arabic title,
// an unrated book, and a cover-less item that should be dropped.
const FIXTURE = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>White Fang &amp; Other Stories</title>
    <author_name><![CDATA[Jack London]]></author_name>
    <book_large_image_url><![CDATA[https://i.gr-assets.com/x/wf.jpg]]></book_large_image_url>
    <user_rating>5</user_rating>
    <link><![CDATA[https://www.goodreads.com/book/show/1]]></link>
  </item>
  <item>
    <title>مسرحية الباب</title>
    <author_name><![CDATA[غسان كنفاني]]></author_name>
    <book_large_image_url><![CDATA[https://i.gr-assets.com/x/door.jpg]]></book_large_image_url>
    <user_rating>0</user_rating>
    <link><![CDATA[https://www.goodreads.com/book/show/2]]></link>
  </item>
  <item>
    <title>No Cover Book</title>
    <author_name><![CDATA[Nobody]]></author_name>
    <book_large_image_url></book_large_image_url>
    <user_rating>3</user_rating>
    <link><![CDATA[https://www.goodreads.com/book/show/3]]></link>
  </item>
</channel></rss>`;

describe("parseShelf", () => {
  const books = parseShelf(FIXTURE);

  it("extracts each field, decoding CDATA and entities", () => {
    expect(books[0]).toEqual({
      title: "White Fang & Other Stories",
      author: "Jack London",
      cover: "https://i.gr-assets.com/x/wf.jpg",
      rating: 5,
      link: "https://www.goodreads.com/book/show/1",
    });
  });

  it("keeps Arabic titles and unrated (0) books", () => {
    expect(books[1].title).toBe("مسرحية الباب");
    expect(books[1].author).toBe("غسان كنفاني");
    expect(books[1].rating).toBe(0);
  });

  it("drops items with no cover", () => {
    expect(books).toHaveLength(2);
    expect(books.some((b) => b.title === "No Cover Book")).toBe(false);
  });

  it("returns [] for an empty feed", () => {
    expect(parseShelf("<rss><channel></channel></rss>")).toEqual([]);
  });
});
