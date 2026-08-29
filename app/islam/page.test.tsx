import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import IslamPage, { generateMetadata } from "./page";
import { quoteKey, type Reflections, type Reflection, type Verse } from "@/lib/quran-reflect";
import { strings } from "@/lib/strings";

const getReflections = vi.hoisted(() => vi.fn());

// Only the network half is stubbed: `refLabel`, `quotesFor` and `quoteKey` are
// pure, so the page is tested against the real citation and quote plumbing.
vi.mock("@/lib/quran-reflect", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/quran-reflect")>()),
  getReflections,
}));

const reflection = (over: Partial<Reflection> = {}): Reflection => ({
  id: 1,
  kind: "reflection",
  body: "A thought worth keeping.",
  lang: "en",
  date: "2026-08-16",
  refs: [
    { chapterId: 2, from: 48, to: 48, verses: "48", url: "https://quran.com/2/48" },
  ],
  tags: [],
  likes: 0,
  comments: 0,
  url: "https://quranreflect.com/posts/1",
  ...over,
});

const verse = (over: Partial<Verse> = {}): Verse => ({
  key: "2:48",
  arabic: "وَٱتَّقُوا۟ يَوْمًا لَّا تَجْزِى نَفْسٌ عَن نَّفْسٍ شَيْـًٔا",
  translation: "And fear a Day when no soul will suffice for another soul.",
  translator: "Saheeh International",
  ...over,
});

const feed = (over: Partial<Reflections> = {}): Reflections => ({
  posts: [],
  total: 0,
  chapters: { 2: { simple: "Al-Baqarah", arabic: "البقرة" } },
  quotes: {},
  ok: true,
  ...over,
});

const renderPage = async () => render(await IslamPage());

beforeEach(() => {
  getReflections.mockReset();
  getReflections.mockResolvedValue(feed());
});

describe("IslamPage", () => {
  it("heads the page", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(strings.islam.title);
    expect(screen.getByText(strings.islam.subtitle)).toBeInTheDocument();
  });

  it("asks the feed for quoted ayat", async () => {
    await renderPage();
    expect(getReflections).toHaveBeenCalledWith(20, true);
  });

  it("shows a reflection whole and links to the conversation", async () => {
    getReflections.mockResolvedValue(feed({ posts: [reflection()], total: 1 }));
    await renderPage();

    expect(
      screen.getByRole("heading", { name: strings.islam.reflections }),
    ).toBeInTheDocument();
    // The body says which language it is in, so a screen reader on the Arabic
    // page does not voice an English reflection with the Arabic voice.
    expect(screen.getByText("A thought worth keeping.")).toHaveAttribute(
      "lang",
      "en",
    );
    expect(screen.getByRole("link", { name: /Read it on QuranReflect/ })).toHaveAttribute(
      "href",
      "https://quranreflect.com/posts/1",
    );
  });

  // The text is mine; the page holds nothing back. Only the conversation
  // under it stays on QuranReflect.
  it("shows a long reflection in full, not an opening", async () => {
    const body = ("لفظ ".repeat(400) + "\n\nAnd the closing thought.").trim();
    getReflections.mockResolvedValue(feed({ posts: [reflection({ body })] }));
    const { container } = await renderPage();

    expect(container.textContent).toContain("And the closing thought.");
    expect(container.textContent).not.toContain("…");
  });

  it("names the kind of piece each one is", async () => {
    getReflections.mockResolvedValue(
      feed({
        posts: [reflection({ id: 1 }), reflection({ id: 2, kind: "lesson" })],
      }),
    );
    await renderPage();

    expect(screen.getByText(strings.islam.reflection)).toBeInTheDocument();
    expect(screen.getByText(strings.islam.lesson)).toBeInTheDocument();
  });

  describe("the quoted ayah", () => {
    const quoted = () =>
      feed({
        posts: [reflection()],
        quotes: { [quoteKey("en", "2:48")]: verse() },
      });

    it("quotes the ayah itself, right-to-left, in Arabic", async () => {
      getReflections.mockResolvedValue(quoted());
      await renderPage();

      const ayah = screen.getByText(verse().arabic);
      expect(ayah).toHaveAttribute("dir", "rtl");
      expect(ayah).toHaveAttribute("lang", "ar");
    });

    // The reflection reads first and the ayat sit under it, the way
    // QuranReflect itself lays a post out.
    it("sits under the reflection, not above it", async () => {
      getReflections.mockResolvedValue(quoted());
      await renderPage();

      const body = screen.getByText("A thought worth keeping.");
      const quote = screen.getByText(verse().arabic).closest("blockquote")!;
      expect(
        body.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("renders the ayah in the reflection's language, crediting the translator", async () => {
      getReflections.mockResolvedValue(quoted());
      await renderPage();

      expect(screen.getByText(verse().translation)).toHaveAttribute("lang", "en");
      expect(screen.getByText("Al-Baqarah 2:48 · Saheeh International")).toBeInTheDocument();
    });

    it("lets the ayah stand alone when there is no rendering", async () => {
      getReflections.mockResolvedValue(
        feed({
          posts: [reflection()],
          quotes: {
            [quoteKey("en", "2:48")]: verse({ translation: "", translator: "" }),
          },
        }),
      );
      const { container } = await renderPage();

      expect(screen.getByText(verse().arabic)).toBeInTheDocument();
      expect(screen.queryByText(verse().translation)).not.toBeInTheDocument();
      // The chip above carries the same label, so the quote's own is read
      // from inside the blockquote rather than from the page at large.
      expect(container.querySelector("blockquote footer")).toHaveTextContent(
        "Al-Baqarah 2:48",
      );
    });

    it("labels the quote bare when the surah names are out of reach", async () => {
      getReflections.mockResolvedValue(
        feed({
          posts: [reflection()],
          quotes: { [quoteKey("en", "2:48")]: verse({ translator: "" }) },
          chapters: {},
        }),
      );
      const { container } = await renderPage();
      expect(container.querySelector("blockquote footer")).toHaveTextContent("2:48");
    });

    it("quotes nothing it was not given: the chip still cites the passage", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      const { container } = await renderPage();

      expect(container.querySelector("blockquote")).toBeNull();
      expect(screen.getByRole("link", { name: "Al-Baqarah 2:48" })).toHaveAttribute(
        "href",
        "https://quran.com/2/48",
      );
    });

    it("quotes every ayah of a cited passage, in order", async () => {
      getReflections.mockResolvedValue(
        feed({
          posts: [
            reflection({
              refs: [
                {
                  chapterId: 17,
                  from: 68,
                  to: 69,
                  verses: "68-69",
                  url: "https://quran.com/17/68-69",
                },
              ],
            }),
          ],
          quotes: {
            [quoteKey("en", "17:68")]: verse({ key: "17:68", arabic: "الأولى" }),
            [quoteKey("en", "17:69")]: verse({ key: "17:69", arabic: "الثانية" }),
          },
        }),
      );
      const { container } = await renderPage();

      const ayat = [...container.querySelectorAll("blockquote p[lang='ar']")].map(
        (p) => p.textContent,
      );
      expect(ayat).toEqual(["الأولى", "الثانية"]);
    });
  });

  describe("the citation chips", () => {
    it("name the surah and link to the ayah on Quran.com", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      await renderPage();

      expect(screen.getByRole("link", { name: "Al-Baqarah 2:48" })).toHaveAttribute(
        "href",
        "https://quran.com/2/48",
      );
    });

    it("fall back to the bare citation when the surah names are out of reach", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()], chapters: {} }));
      await renderPage();
      expect(screen.getByRole("link", { name: "2:48" })).toBeInTheDocument();
    });

    it("cope with a reflection that cites nothing", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection({ refs: [] })] }));
      await renderPage();
      expect(screen.getByText("A thought worth keeping.")).toBeInTheDocument();
    });
  });

  describe("the byline", () => {
    // The site's rule: a piece dates itself in the language it was written in,
    // and the badge is what tells the reader the page's language differs.
    it("dates an Arabic reflection in Arabic on the English page, and flags it", async () => {
      getReflections.mockResolvedValue(
        feed({ posts: [reflection({ lang: "ar", date: "2026-01-13" })] }),
      );
      const { container } = await renderPage();

      expect(container.textContent).toContain("يناير"); // not "January"
      expect(screen.getByText(/يناير/)).toHaveAttribute("lang", "ar");
      expect(screen.getByText("العربية")).toBeInTheDocument();
    });

    it("leaves an English reflection unflagged", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection()] }));
      await renderPage();
      expect(screen.queryByText("English")).not.toBeInTheDocument();
    });

    it("shows the tags I filed it under", async () => {
      getReflections.mockResolvedValue(
        feed({ posts: [reflection({ tags: ["Tadabbur", "تدبر"] })] }),
      );
      await renderPage();
      expect(screen.getByText("#Tadabbur")).toBeInTheDocument();
      expect(screen.getByText("#تدبر")).toBeInTheDocument();
    });

    it("says nothing rather than nothing-shaped when there is no date", async () => {
      getReflections.mockResolvedValue(feed({ posts: [reflection({ date: "" })] }));
      const { container } = await renderPage();
      expect(container.textContent).not.toContain("Invalid Date");
    });
  });

  describe("when there is nothing to show", () => {
    it("says so when QuranReflect answered and I have written nothing", async () => {
      getReflections.mockResolvedValue(feed());
      await renderPage();

      expect(screen.getByText(strings.islam.empty)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /All my reflections on QuranReflect/ }),
      ).toBeInTheDocument();
    });

    // Claiming I have written nothing because the gateway was down is a lie.
    it("does not claim an empty shelf when the feed could not be reached", async () => {
      getReflections.mockResolvedValue(feed({ ok: false }));
      await renderPage();

      expect(screen.queryByText(strings.islam.empty)).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /My QuranReflect profile/ }),
      ).toHaveAttribute("href", "https://quranreflect.com/kfkhalili");
    });
  });

  describe("generateMetadata", () => {
    it("describes the page at its own URL", () => {
      const meta = generateMetadata();
      expect(meta.title).toBe(strings.islam.title);
      expect(meta.alternates?.canonical).toBe("/islam");
    });
  });
});
