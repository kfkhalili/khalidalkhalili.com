import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  parseReflections,
  parseChapters,
  parseVerse,
  refLabel,
  verseKeys,
  quoteKey,
  quotesFor,
  getReflections,
  type PostPayload,
  type UserPostsPayload,
  type VerseRef,
  type Verse,
} from "./quran-reflect";

/** What `fetch` was handed, as the assertions below need to read it. */
type Call = [url: string, init?: RequestInit];

/** A post payload with only what a test cares about spelled out. */
const post = (over: PostPayload = {}): PostPayload => ({
  id: 1,
  body: "A thought.",
  publishedAt: "2026-08-16T11:21:10.000Z",
  postTypeId: 1,
  postTypeName: "Reflection",
  languageName: "English",
  ...over,
});

const page = (...data: PostPayload[]): UserPostsPayload => ({
  total: data.length,
  data,
});

/** A parsed reference, as toRef reports one. */
const ref = (over: Partial<VerseRef> = {}): VerseRef => ({
  chapterId: 2,
  from: 48,
  to: 48,
  verses: "48",
  url: "https://quran.com/2/48",
  ...over,
});

describe("parseReflections", () => {
  it("reads a post into the fields the page renders", () => {
    const [r] = parseReflections(
      page(
        post({
          id: 1786879269691278,
          body: "When I first memorized 2:48…",
          likesCount: 5,
          commentsCount: 2,
          references: [{ from: 48, to: 48, chapterId: 2 }],
          tags: [{ name: "Tadabbur" }],
        }),
      ),
    );

    expect(r).toEqual({
      id: 1786879269691278,
      kind: "reflection",
      body: "When I first memorized 2:48…",
      lang: "en",
      date: "2026-08-16",
      refs: [
        { chapterId: 2, from: 48, to: 48, verses: "48", url: "https://quran.com/2/48" },
      ],
      tags: ["Tadabbur"],
      likes: 5,
      comments: 2,
      url: "https://quranreflect.com/posts/1786879269691278",
    });
  });

  it("returns [] for a page with nothing on it", () => {
    expect(parseReflections({})).toEqual([]);
    expect(parseReflections({ data: [] })).toEqual([]);
  });

  describe("what it refuses to show", () => {
    it.each([
      ["a draft", { draft: true }],
      ["a hidden post", { hidden: true }],
      ["a removed post", { removed: true }],
      ["a post held for review", { moderationStatus: 6 }],
      ["a private note", { moderationStatus: 5 }],
      ["a moderator-hidden post", { moderationStatus: 4 }],
      ["a deleted post", { moderationStatus: 30 }],
      ["a post with no body", { body: "   " }],
      ["a post with no id", { id: undefined }],
    ])("drops %s", (_name, over) => {
      expect(parseReflections(page(post(over)))).toEqual([]);
    });

    it("keeps the moderation statuses that mean public", () => {
      for (const moderationStatus of [1, 2, 3]) {
        expect(parseReflections(page(post({ moderationStatus })))).toHaveLength(1);
      }
    });
  });

  describe("the kind", () => {
    it("reads a lesson from its type id, whatever the name's case", () => {
      expect(parseReflections(page(post({ postTypeId: 2 })))[0].kind).toBe("lesson");
      expect(
        parseReflections(page(post({ postTypeId: undefined, postTypeName: "lesson" })))[0]
          .kind,
      ).toBe("lesson");
    });

    it("treats anything that is not a lesson as a reflection", () => {
      expect(
        parseReflections(page(post({ postTypeId: undefined, postTypeName: undefined })))[0]
          .kind,
      ).toBe("reflection");
    });
  });

  describe("the language", () => {
    it.each([
      ["English", "en"],
      ["english", "en"],
      ["Arabic", "ar"],
      ["German", "de"],
    ])("maps %s to %s", (languageName, lang) => {
      expect(parseReflections(page(post({ languageName })))[0].lang).toBe(lang);
    });

    // Same rule `toLocale` applies everywhere else: a language this site does
    // not publish is read as the default rather than leaking through.
    it("falls back to the default for a language the site does not publish", () => {
      expect(parseReflections(page(post({ languageName: "Urdu" })))[0].lang).toBe("en");
      expect(parseReflections(page(post({ languageName: undefined })))[0].lang).toBe("en");
    });
  });

  describe("the date", () => {
    it("keeps the published day, not the edited one", () => {
      const r = parseReflections(
        page(
          post({
            publishedAt: "2026-01-13T00:00:00.000Z",
            createdAt: "2020-01-01T00:00:00.000Z",
          }),
        ),
      );
      expect(r[0].date).toBe("2026-01-13");
    });

    it("stands in with createdAt, and is empty when there is neither", () => {
      expect(
        parseReflections(
          page(post({ publishedAt: undefined, createdAt: "2022-03-08T11:10:06.000Z" })),
        )[0].date,
      ).toBe("2022-03-08");
      expect(
        parseReflections(page(post({ publishedAt: undefined, createdAt: undefined })))[0]
          .date,
      ).toBe("");
    });
  });

  describe("the references", () => {
    const refs = (references: PostPayload["references"]) =>
      parseReflections(page(post({ references })))[0].refs;

    it("cites a single ayah as one verse, not a range of one", () => {
      expect(refs([{ from: 48, to: 48, chapterId: 2 }])).toEqual([
        { chapterId: 2, from: 48, to: 48, verses: "48", url: "https://quran.com/2/48" },
      ]);
    });

    it("cites a passage as a range", () => {
      expect(refs([{ from: 68, to: 69, chapterId: 17 }])).toEqual([
        {
          chapterId: 17,
          from: 68,
          to: 69,
          verses: "68-69",
          url: "https://quran.com/17/68-69",
        },
      ]);
    });

    // A whole-surah reference arrives as 0:0 rather than as no range at all.
    it("cites a whole surah with no verses", () => {
      expect(refs([{ from: 0, to: 0, chapterId: 10 }])).toEqual([
        { chapterId: 10, from: 0, to: 0, verses: "", url: "https://quran.com/10" },
      ]);
    });

    it("keeps every reference on a post, in the order given", () => {
      expect(
        refs([
          { from: 68, to: 69, chapterId: 17 },
          { from: 22, to: 22, chapterId: 10 },
        ]).map((r) => r.chapterId),
      ).toEqual([17, 10]);
    });

    it("drops a reference naming no surah, and copes with none at all", () => {
      expect(refs([{ from: 1, to: 2 }])).toEqual([]);
      expect(refs(undefined)).toEqual([]);
    });

    // A reference carrying a surah and no range at all reads the same as one
    // that spelled the whole surah out as 0:0.
    it("cites a surah given without any range as the whole surah", () => {
      expect(refs([{ chapterId: 36 }])).toEqual([
        { chapterId: 36, from: 0, to: 0, verses: "", url: "https://quran.com/36" },
      ]);
    });

    it("reads a start with no end, or a range running backwards, as one ayah", () => {
      expect(refs([{ chapterId: 7, from: 3 }])[0]).toMatchObject({
        from: 3,
        to: 3,
        verses: "3",
      });
      expect(refs([{ chapterId: 3, from: 5, to: 2 }])[0]).toMatchObject({
        from: 5,
        to: 5,
        verses: "5",
      });
    });
  });

  describe("the body", () => {
    const body = (raw: string) => parseReflections(page(post({ body: raw })))[0].body;

    it("keeps the paragraph breaks I wrote", () => {
      expect(body("First thought.\n\nSecond thought.")).toBe(
        "First thought.\n\nSecond thought.",
      );
    });

    it("keeps the Arabic I quote inline", () => {
      expect(body("the noun Intercession (شَفَـٰعَةٌ) is feminine")).toBe(
        "the noun Intercession (شَفَـٰعَةٌ) is feminine",
      );
    });

    it("flattens markup if the feed ever sends any", () => {
      expect(body("<p>A thought.</p><p>And another.</p>")).toBe(
        "A thought.\n\nAnd another.",
      );
    });
  });

  it("drops a tag with no name and copes with none at all", () => {
    expect(parseReflections(page(post({ tags: [{ name: " " }, {}] })))[0].tags).toEqual(
      [],
    );
    expect(parseReflections(page(post({ tags: undefined })))[0].tags).toEqual([]);
  });

  it("reads absent engagement counts as none", () => {
    const [r] = parseReflections(page(post()));
    expect([r.likes, r.comments]).toEqual([0, 0]);
  });
});

describe("parseChapters", () => {
  it("keys the names by surah id", () => {
    expect(
      parseChapters({
        chapters: [
          { id: 1, name_simple: "Al-Fatihah", name_arabic: "الفاتحة" },
          { id: 2, name_simple: "Al-Baqarah", name_arabic: "البقرة" },
        ],
      }),
    ).toEqual({
      1: { simple: "Al-Fatihah", arabic: "الفاتحة" },
      2: { simple: "Al-Baqarah", arabic: "البقرة" },
    });
  });

  it("copes with an empty or absent list", () => {
    expect(parseChapters({})).toEqual({});
    expect(parseChapters({ chapters: [{ name_simple: "No id" }] })).toEqual({});
  });

  // `refLabel` treats an empty name as no name, so a chapter the gateway named
  // in only one script cites bare rather than half-labelled.
  it("reads a name it was not given as no name", () => {
    expect(parseChapters({ chapters: [{ id: 9 }] })).toEqual({
      9: { simple: "", arabic: "" },
    });
  });
});

describe("refLabel", () => {
  const ayah = ref();
  const surah = ref({ chapterId: 10, from: 0, to: 0, verses: "" });

  it("names the surah before the citation when the name is known", () => {
    expect(refLabel(ayah, "Al-Baqarah")).toBe("Al-Baqarah 2:48");
    expect(refLabel(ayah, "البقرة")).toBe("البقرة 2:48");
  });

  // The `content` scope may not be granted; a bare citation still cites.
  it("falls back to the bare citation when the name is not", () => {
    expect(refLabel(ayah)).toBe("2:48");
    expect(refLabel(ayah, "")).toBe("2:48");
  });

  it("cites a whole surah by its number alone", () => {
    expect(refLabel(surah)).toBe("10");
    expect(refLabel(surah, "Yunus")).toBe("Yunus 10");
  });
});

describe("verseKeys", () => {
  it("asks for a single cited ayah", () => {
    expect(verseKeys([ref()])).toEqual(["2:48"]);
  });

  it("asks for every ayah of a short range, in order", () => {
    expect(verseKeys([ref({ chapterId: 17, from: 68, to: 69, verses: "68-69" })])).toEqual(
      ["17:68", "17:69"],
    );
  });

  // The chip still names and links the whole range; the page just does not
  // quote a whole juz' into a card.
  it("caps a long range at its opening ayat", () => {
    expect(verseKeys([ref({ from: 1, to: 99, verses: "1-99" })])).toEqual([
      "2:1",
      "2:2",
      "2:3",
      "2:4",
      "2:5",
    ]);
  });

  it("asks nothing for a whole-surah citation", () => {
    expect(verseKeys([ref({ from: 0, to: 0, verses: "" })])).toEqual([]);
  });

  it("asks once for an ayah cited twice", () => {
    expect(verseKeys([ref(), ref()])).toEqual(["2:48"]);
  });

  it("keeps citation order across references", () => {
    expect(
      verseKeys([
        ref({ chapterId: 17, from: 68, to: 68, verses: "68" }),
        ref({ chapterId: 2, from: 48, to: 48, verses: "48" }),
      ]),
    ).toEqual(["17:68", "2:48"]);
  });
});

describe("parseVerse", () => {
  const UTHMANI = { verses: [{ text_uthmani: "وَٱتَّقُوا۟ يَوْمًا" }] };

  it("reads the ayah, its rendering, and who rendered it", () => {
    expect(
      parseVerse("2:48", UTHMANI, {
        translations: [{ text: "And fear a Day when no soul will suffice." }],
        meta: { translation_name: "Saheeh International" },
      }),
    ).toEqual({
      key: "2:48",
      arabic: "وَٱتَّقُوا۟ يَوْمًا",
      translation: "And fear a Day when no soul will suffice.",
      translator: "Saheeh International",
    });
  });

  // The sup elements carry quran.com's footnote markers. Stripped whole,
  // marker and all: `plainText` alone would leave a bare digit mid-sentence.
  it("strips footnote markers out of the rendering", () => {
    expect(
      parseVerse("2:48", UTHMANI, {
        translations: [
          { text: "And fear a Day<sup foot_note=227163>1</sup> when no soul." },
        ],
      })!.translation,
    ).toBe("And fear a Day when no soul.");
  });

  it("is no quote at all without the ayah itself", () => {
    for (const empty of [{}, { verses: [] }, { verses: [{}] }, { verses: [{ text_uthmani: "  " }] }]) {
      expect(parseVerse("2:48", empty, null)).toBeNull();
    }
  });

  it("lets the ayah stand alone when no rendering was asked for", () => {
    expect(parseVerse("2:48", UTHMANI, null)).toMatchObject({
      translation: "",
      translator: "",
    });
  });

  it("reads an absent or empty rendering as none", () => {
    for (const payload of [{}, { translations: [] }, { translations: [{}] }]) {
      expect(parseVerse("2:48", UTHMANI, payload)).toMatchObject({ translation: "" });
    }
  });

  // Credit belongs to words. A payload naming a translator over an empty text
  // credits no one, and words with no name go uncredited rather than invented.
  it("credits a translator only when there are words to credit", () => {
    expect(
      parseVerse("2:48", UTHMANI, {
        translations: [{ text: "" }],
        meta: { translation_name: "Saheeh International" },
      }),
    ).toMatchObject({ translator: "" });
    expect(
      parseVerse("2:48", UTHMANI, { translations: [{ text: "Words." }] }),
    ).toMatchObject({ translation: "Words.", translator: "" });
  });
});

describe("quotesFor", () => {
  const verse = (key: string): Verse => ({
    key,
    arabic: `آية ${key}`,
    translation: "",
    translator: "",
  });

  it("returns a post's quotes in citation order", () => {
    const post = {
      lang: "en" as const,
      refs: [
        ref({ chapterId: 17, from: 68, to: 68, verses: "68" }),
        ref(),
      ],
    };
    const quotes = {
      [quoteKey("en", "2:48")]: verse("2:48"),
      [quoteKey("en", "17:68")]: verse("17:68"),
    };
    expect(quotesFor(post, quotes).map((q) => q.key)).toEqual(["17:68", "2:48"]);
  });

  it("skips an ayah the gateway could not produce", () => {
    const post = { lang: "en" as const, refs: [ref(), ref({ from: 123, to: 123, verses: "123" })] };
    const quotes = { [quoteKey("en", "2:123")]: verse("2:123") };
    expect(quotesFor(post, quotes).map((q) => q.key)).toEqual(["2:123"]);
  });

  // The rendering under an ayah follows the post's language, so a quote
  // fetched for one language is not another language's to show.
  it("reads only quotes held for the post's own language", () => {
    const post = { lang: "ar" as const, refs: [ref()] };
    const quotes = { [quoteKey("en", "2:48")]: verse("2:48") };
    expect(quotesFor(post, quotes)).toEqual([]);
  });
});

describe("getReflections", () => {
  const TOKEN = { access_token: "tok" };
  const POSTS = page(post({ id: 7, references: [{ from: 48, to: 48, chapterId: 2 }] }));
  const CHAPTERS = {
    chapters: [{ id: 2, name_simple: "Al-Baqarah", name_arabic: "البقرة" }],
  };
  const UTHMANI = { verses: [{ text_uthmani: "وَٱتَّقُوا۟ يَوْمًا" }] };
  const TRANSLATION = {
    translations: [{ text: "And fear a Day<sup foot_note=1>1</sup> when no soul." }],
    meta: { translation_name: "Saheeh International" },
  };

  const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
  const refused = { ok: false, status: 403, json: async () => ({}) };

  /** Answers every gateway endpoint; `fail` forces a refusal on one of them. */
  function mockGateway(
    fail?: "token" | "posts" | "chapters" | "uthmani" | "translation",
    posts: UserPostsPayload = POSTS,
  ) {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const kind = url.includes("/oauth2/token")
        ? "token"
        : url.includes("/quran-reflect/")
          ? "posts"
          : url.includes("/verses/uthmani")
            ? "uthmani"
            : url.includes("/quran/translations/")
              ? "translation"
              : "chapters";
      if (kind === fail) return refused;
      if (kind === "token") {
        // Scope-specific, as the real gateway's are: a call that spends the
        // wrong scope's token on an endpoint has to be visible to a test.
        const scope = /scope=([\w.]+)/.exec(String(init?.body))?.[1] ?? "none";
        return ok({ access_token: `tok-${scope}` });
      }
      const body =
        kind === "posts"
          ? posts
          : kind === "uthmani"
            ? UTHMANI
            : kind === "translation"
              ? TRANSLATION
              : CHAPTERS;
      return ok(body);
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  beforeEach(() => {
    vi.stubEnv("QURAN_FOUNDATION_CLIENT_ID", "client");
    vi.stubEnv("QURAN_FOUNDATION_CLIENT_SECRET", "secret");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reads the posts and the surah names, and marks the fetch ok", async () => {
    mockGateway();
    const feed = await getReflections();

    expect(feed.ok).toBe(true);
    expect(feed.posts.map((p) => p.id)).toEqual([7]);
    expect(feed.total).toBe(1);
    expect(feed.chapters[2].simple).toBe("Al-Baqarah");
  });

  it("asks for the two scopes separately", async () => {
    const fetchMock = mockGateway();
    await getReflections();

    const scopes = (fetchMock.mock.calls as Call[])
      .filter(([url]) => url.includes("/oauth2/token"))
      .map(([, init]) => String(init?.body));
    expect(scopes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("scope=post.read"),
        expect.stringContaining("scope=content"),
      ]),
    );
    for (const body of scopes) expect(body).toContain("grant_type=client_credentials");
  });

  it("sends the credentials as Basic auth, never in the query", async () => {
    const fetchMock = mockGateway();
    await getReflections();

    const [url, init] = (fetchMock.mock.calls as Call[]).find(([u]) =>
      u.includes("/oauth2/token"),
    )!;
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization).toBe(
      `Basic ${Buffer.from("client:secret").toString("base64")}`,
    );
    expect(url).not.toContain("secret");
  });

  it("carries the token and the client id on every API call, live each time", async () => {
    const fetchMock = mockGateway();
    await getReflections(20, true);

    const apiCalls = (fetchMock.mock.calls as Call[]).filter(
      ([url]) => !url.includes("/oauth2/token"),
    );
    expect(apiCalls.length).toBeGreaterThanOrEqual(4); // posts, chapters, ayah, rendering
    for (const [url, init] of apiCalls) {
      const headers = init?.headers as Record<string, string>;
      // Each endpoint spends its own scope's token: the posts are post.read,
      // everything under /content is content.
      expect(headers["x-auth-token"]).toBe(
        url.includes("/quran-reflect/") ? "tok-post.read" : "tok-content",
      );
      expect(headers["x-client-id"]).toBe("client");
      expect(init?.cache).toBe("no-store");
    }
  });

  it("asks for my posts, newest first", async () => {
    const fetchMock = mockGateway();
    await getReflections(5);

    const [url] = (fetchMock.mock.calls as Call[]).find(([u]) =>
      u.includes("/quran-reflect/"),
    )!;
    // The whole address, pinned: a substring check would bless a drifted host
    // or read limit=5 into limit=50.
    expect(url).toBe(
      "https://apis.quran.foundation/quran-reflect/v1/posts/user-posts/" +
        "9dfc1e67-e21a-426a-a9cf-f647523a39f6?sortBy=latest&limit=5&page=1",
    );
  });

  // Nothing is cached, on purpose: a page view shows the feed as it is, and a
  // token is a variable inside one render rather than state across them.
  it("holds nothing between calls: each one buys its tokens and names afresh", async () => {
    const fetchMock = mockGateway();
    await getReflections();
    await getReflections();

    const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
    expect(urls.filter((u) => u.includes("/oauth2/token"))).toHaveLength(4);
    expect(
      urls.filter(
        (u) => u === "https://apis.quran.foundation/content/api/v4/chapters",
      ),
    ).toHaveLength(2);
  });

  it("counts what it was handed when the gateway states no total", async () => {
    mockGateway(undefined, { data: [post({ id: 7 })] });
    expect((await getReflections()).total).toBe(1);
  });

  it("treats a 200 that carries no token as no token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ok({})),
    );
    expect((await getReflections()).ok).toBe(false);
  });

  it("spends prelive credentials against the prelive hosts", async () => {
    vi.stubEnv("QURAN_FOUNDATION_ENV", "prelive");
    vi.resetModules();
    const { getReflections: get } = await import("./quran-reflect");
    const fetchMock = mockGateway();
    await get();

    for (const [url] of fetchMock.mock.calls as Call[]) {
      expect(url).toMatch(/prelive/);
    }
  });

  describe("the quoted ayat", () => {
    it("quotes the ayah and its rendering for an English reflection", async () => {
      const fetchMock = mockGateway();
      const feed = await getReflections(20, true);

      const quotes = quotesFor(feed.posts[0], feed.quotes);
      expect(quotes).toEqual([
        {
          key: "2:48",
          arabic: "وَٱتَّقُوا۟ يَوْمًا",
          translation: "And fear a Day when no soul.",
          translator: "Saheeh International",
        },
      ]);

      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls).toContain(
        "https://apis.quran.foundation/content/api/v4/quran/verses/uthmani?verse_key=2:48",
      );
      expect(urls).toContain(
        "https://apis.quran.foundation/content/api/v4/quran/translations/20?verse_key=2:48",
      );
    });

    // The ayah is the citation; the rendering under it is the optional half,
    // and losing it must not take the ayah down with it.
    it("lets the ayah stand alone when only its rendering failed", async () => {
      mockGateway("translation");
      const feed = await getReflections(20, true);

      expect(feed.ok).toBe(true);
      expect(quotesFor(feed.posts[0], feed.quotes)).toEqual([
        { key: "2:48", arabic: "وَٱتَّقُوا۟ يَوْمًا", translation: "", translator: "" },
      ]);
    });

    it("quotes the ayah alone for an Arabic reflection", async () => {
      const fetchMock = mockGateway(
        undefined,
        page(post({ id: 8, languageName: "Arabic", references: [{ from: 84, to: 84, chapterId: 43 }] })),
      );
      const feed = await getReflections(20, true);

      expect(quotesFor(feed.posts[0], feed.quotes)).toEqual([
        { key: "43:84", arabic: "وَٱتَّقُوا۟ يَوْمًا", translation: "", translator: "" },
      ]);
      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls.some((u) => u.includes("/quran/translations/"))).toBe(false);
    });

    it("renders a German reflection through the German translation", async () => {
      const fetchMock = mockGateway(
        undefined,
        page(post({ id: 9, languageName: "German", references: [{ from: 48, to: 48, chapterId: 2 }] })),
      );
      await getReflections(20, true);

      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls).toContain(
        "https://apis.quran.foundation/content/api/v4/quran/translations/27?verse_key=2:48",
      );
    });

    it("fetches no ayat when quotes are not asked for", async () => {
      const fetchMock = mockGateway();
      const feed = await getReflections();

      expect(feed.quotes).toEqual({});
      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls.some((u) => u.includes("/quran/"))).toBe(false);
    });

    it("asks once for an ayah two posts share", async () => {
      const fetchMock = mockGateway(
        undefined,
        page(
          post({ id: 7, references: [{ from: 48, to: 48, chapterId: 2 }] }),
          post({ id: 8, references: [{ from: 48, to: 48, chapterId: 2 }] }),
        ),
      );
      await getReflections(20, true);

      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls.filter((u) => u.includes("/verses/uthmani"))).toHaveLength(1);
    });

    it("quotes each ayah of a cited passage", async () => {
      const fetchMock = mockGateway(
        undefined,
        page(post({ id: 7, references: [{ from: 68, to: 69, chapterId: 17 }] })),
      );
      const feed = await getReflections(20, true);

      const urls = (fetchMock.mock.calls as Call[]).map(([u]) => u);
      expect(urls).toContainEqual(expect.stringContaining("verse_key=17:68"));
      expect(urls).toContainEqual(expect.stringContaining("verse_key=17:69"));
      expect(quotesFor(feed.posts[0], feed.quotes).map((q) => q.key)).toEqual([
        "17:68",
        "17:69",
      ]);
    });

    it("quiets only the ayah it could not fetch", async () => {
      const posts = page(
        post({
          id: 7,
          references: [
            { from: 48, to: 48, chapterId: 2 },
            { from: 123, to: 123, chapterId: 2 },
          ],
        }),
      );
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.includes("/oauth2/token")) return ok(TOKEN);
          if (url.includes("/quran-reflect/")) return ok(posts);
          if (url.includes("/verses/uthmani"))
            return url.includes("2:123") ? refused : ok(UTHMANI);
          if (url.includes("/quran/translations/")) return ok(TRANSLATION);
          return ok(CHAPTERS);
        }),
      );

      const feed = await getReflections(20, true);
      expect(feed.ok).toBe(true);
      expect(quotesFor(feed.posts[0], feed.quotes).map((q) => q.key)).toEqual(["2:48"]);
    });

    it("still shows the reflections when the content scope is refused", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string, init?: RequestInit) => {
          if (url.includes("/oauth2/token")) {
            return String(init?.body).includes("scope=content") ? refused : ok(TOKEN);
          }
          if (url.includes("/quran-reflect/")) return ok(POSTS);
          // With no content token there is nothing to spend on content calls.
          throw new Error(`unexpected call: ${url}`);
        }),
      );

      const feed = await getReflections(20, true);
      expect(feed.ok).toBe(true);
      expect(feed.posts.map((p) => p.id)).toEqual([7]);
      expect(feed.chapters).toEqual({});
      expect(feed.quotes).toEqual({});
    });
  });

  describe("degradation", () => {
    it("still shows the reflections when the surah names are out of reach", async () => {
      mockGateway("chapters");
      const feed = await getReflections();

      expect(feed.ok).toBe(true);
      expect(feed.posts.map((p) => p.id)).toEqual([7]);
      expect(feed.chapters).toEqual({});
    });

    // No failure is remembered, because nothing at all is: the next view asks
    // the gateway again rather than staying bare until a redeploy.
    it("asks for the surah names afresh after a failure", async () => {
      let chapterCalls = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url.includes("/oauth2/token")) return ok(TOKEN);
          if (url.includes("/quran-reflect/")) return ok(POSTS);
          chapterCalls += 1;
          return chapterCalls === 1 ? refused : ok(CHAPTERS);
        }),
      );

      expect((await getReflections()).chapters).toEqual({});
      expect((await getReflections()).chapters[2].simple).toBe("Al-Baqarah");
    });

    it("degrades to an empty, not-ok feed when the posts call is refused", async () => {
      mockGateway("posts");
      expect(await getReflections()).toEqual({
        posts: [],
        total: 0,
        chapters: {},
        quotes: {},
        ok: false,
      });
    });

    it("degrades to an empty, not-ok feed when the token is refused", async () => {
      mockGateway("token");
      expect((await getReflections()).ok).toBe(false);
    });

    it("degrades rather than throwing when the credentials are not configured", async () => {
      vi.stubEnv("QURAN_FOUNDATION_CLIENT_ID", "");
      vi.stubEnv("QURAN_FOUNDATION_CLIENT_SECRET", "");
      const fetchMock = mockGateway();

      expect((await getReflections()).ok).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled(); // nothing is asked without them
    });

    it("degrades when the request fails outright", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new Error("offline");
        }),
      );
      expect((await getReflections()).ok).toBe(false);
    });
  });
});
