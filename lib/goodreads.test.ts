import { describe, it, expect, afterEach, vi } from "vitest";
import { parseShelf, getBookshelf } from "./goodreads";

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

/** A renderable cover, i.e. one on a host next.config.ts allows. */
const cover = (name: string) => `https://i.gr-assets.com/x/${name}.jpg`;

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

  // next/image throws on a host next.config.ts doesn't list, which on this
  // render-per-request page is a 500 for the whole shelf, not one broken cover.
  it("keeps covers from any Goodreads asset subdomain", () => {
    const item = (cover: string) =>
      `<rss><channel><item><title>T</title><author_name>A</author_name><book_large_image_url>${cover}</book_large_image_url><user_rating>0</user_rating><link>L</link></item></channel></rss>`;

    for (const host of ["i.gr-assets.com", "s.gr-assets.com", "gr-assets.com"]) {
      const url = `https://${host}/x/c.jpg`;
      expect(parseShelf(item(url))[0]?.cover).toBe(url);
    }
  });

  it("drops a cover this site is not configured to render", () => {
    const item = (cover: string) =>
      `<rss><channel><item><title>T</title><author_name>A</author_name><book_large_image_url>${cover}</book_large_image_url><user_rating>0</user_rating><link>L</link></item></channel></rss>`;

    for (const bad of [
      "https://images-na.ssl-images-amazon.com/x/c.jpg",
      "https://evil.example.com/x/c.jpg",
      "https://gr-assets.com.evil.example/x/c.jpg", // suffix must not be enough
      "not-a-url",
    ]) {
      expect(parseShelf(item(bad))).toEqual([]);
    }
  });

  it("falls back through the cover sizes Goodreads offers", () => {
    const item = (tags: string) =>
      `<item><title>T</title>${tags}<user_rating>1</user_rating></item>`;
    expect(
      parseShelf(item(`<book_medium_image_url>${cover("m")}</book_medium_image_url>`))[0].cover,
    ).toBe(cover("m"));
    expect(
      parseShelf(item(`<book_image_url>${cover("s")}</book_image_url>`))[0].cover,
    ).toBe(cover("s"));
    expect(
      parseShelf(
        item(
          `<book_large_image_url>${cover("l")}</book_large_image_url>` +
            `<book_medium_image_url>${cover("m")}</book_medium_image_url>`,
        ),
      )[0].cover,
    ).toBe(cover("l"));
  });

  it("decodes the rest of the entities Goodreads escapes", () => {
    const books = parseShelf(
      "<item><title>&lt;Tag&gt; &quot;Quoted&quot; &#39;s &apos;s</title>" +
        `<book_image_url>${cover("c")}</book_image_url></item>`,
    );
    expect(books[0].title).toBe(`<Tag> "Quoted" 's 's`);
  });

  it("treats an absent or unparsable rating as unrated", () => {
    const books = parseShelf(
      `<item><title>T</title><book_image_url>${cover("c")}</book_image_url>` +
        "<user_rating>none</user_rating></item>" +
        `<item><title>U</title><book_image_url>${cover("c")}</book_image_url></item>`,
    );
    expect(books.map((b) => b.rating)).toEqual([0, 0]);
  });

  it("drops items with a cover but no title", () => {
    expect(
      parseShelf(`<item><book_image_url>${cover("c")}</book_image_url></item>`),
    ).toEqual([]);
  });
});

describe("getBookshelf", () => {
  const shelfXml = (title: string) =>
    `<item><title>${title}</title><book_image_url>${cover(title)}</book_image_url>` +
    `<link>https://www.goodreads.com/book/show/${title}</link></item>`;

  function mockShelves(current: string, read: string) {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      void init;
      return {
        ok: true,
        status: 200,
        text: async () => (url.includes("currently-reading") ? current : read),
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads both shelves and marks the fetch as ok", async () => {
    mockShelves(shelfXml("Now"), shelfXml("Done"));
    const shelf = await getBookshelf();
    expect(shelf.ok).toBe(true);
    expect(shelf.currentlyReading.map((b) => b.title)).toEqual(["Now"]);
    expect(shelf.read.map((b) => b.title)).toEqual(["Done"]);
  });

  it("caps the read shelf at 30 books by default", async () => {
    mockShelves("", Array.from({ length: 40 }, (_, i) => shelfXml(`B${i}`)).join(""));
    const shelf = await getBookshelf();
    expect(shelf.read).toHaveLength(30);
    expect(shelf.read[0].title).toBe("B0");
  });

  it("honours a caller-supplied limit", async () => {
    mockShelves("", Array.from({ length: 10 }, (_, i) => shelfXml(`B${i}`)).join(""));
    expect((await getBookshelf(3)).read).toHaveLength(3);
  });

  it("asks Goodreads for the live shelf, identifying itself", async () => {
    const fetchMock = mockShelves("", "");
    await getBookshelf();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [url, init] of fetchMock.mock.calls) {
      expect(url).toContain("/review/list_rss/6598624");
      expect(init).toMatchObject({ cache: "no-store" });
      expect((init as { headers: Record<string, string> }).headers["user-agent"]).toBeTruthy();
    }
  });

  it("degrades to an empty, not-ok shelf when Goodreads errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, text: async () => "" })),
    );
    expect(await getBookshelf()).toEqual({ currentlyReading: [], read: [], ok: false });
  });

  it("degrades to an empty, not-ok shelf when the request fails outright", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline");
    }));
    expect((await getBookshelf()).ok).toBe(false);
  });
});
