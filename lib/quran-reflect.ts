import { plainText } from "@/lib/prose";
import { toLocale, type Locale } from "@/lib/i18n";

/**
 * My reflections on QuranReflect, read through the Quran Foundation gateway,
 * together with the ayat they cite.
 *
 * Unlike the Goodreads and chess.com feeds, this one is authenticated: the
 * gateway wants an OAuth2 client-credentials token and the client id alongside
 * it on every call. The credentials are the site's, not a reader's, so they
 * stay in the environment and never reach the browser; this module is imported
 * only by server-rendered pages.
 *
 * Nothing is held between requests, deliberately: every page view buys its
 * tokens and fetches the posts, the surah names and the verse text live. A
 * token is bought once per scope per render and passed down, which is a
 * variable in one render rather than a cache across them.
 *
 * Two scopes are in play and they fail separately. `post.read` gets the
 * reflections and can fail the feed; `content` gets the surah names and the
 * quoted ayat, and a render that could not reach it still shows the
 * reflections, minus what it could not reach.
 */

export const QURAN_REFLECT_USER = "kfkhalili";
export const QURAN_REFLECT_PROFILE_URL = `https://quranreflect.com/${QURAN_REFLECT_USER}`;

/** The UUID QuranReflect knows me by. The posts endpoint takes no username. */
const AUTHOR_ID = "9dfc1e67-e21a-426a-a9cf-f647523a39f6";

/**
 * The gateway issues pre-live credentials before production ones, and the two
 * environments are different hosts with different client ids. Which pair is in
 * the environment decides which host they are spent against.
 */
const PRELIVE = process.env.QURAN_FOUNDATION_ENV === "prelive";
const OAUTH_URL = PRELIVE
  ? "https://prelive-oauth2.quran.foundation/oauth2/token"
  : "https://oauth2.quran.foundation/oauth2/token";
const API_URL = PRELIVE
  ? "https://apis-prelive.quran.foundation"
  : "https://apis.quran.foundation";

/* ------------------------------------------------------------------ auth ---- */

type TokenPayload = { access_token?: string };

function credentials(): { id: string; secret: string } {
  const id = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const secret = process.env.QURAN_FOUNDATION_CLIENT_SECRET;
  if (!id || !secret) throw new Error("quran.foundation credentials not set");
  return { id, secret };
}

async function requestToken(scope: string): Promise<string> {
  const { id, secret } = credentials();
  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      // The gateway takes the pair as HTTP Basic rather than in the body.
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`quran.foundation token ${scope} → ${res.status}`);

  const payload: TokenPayload = await res.json();
  if (!payload.access_token) throw new Error("quran.foundation token had none");
  return payload.access_token;
}

async function api<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "x-auth-token": token,
      "x-client-id": credentials().id,
      accept: "application/json",
    },
    cache: "no-store", // on-demand: the live feed each page load
  });
  if (!res.ok) throw new Error(`quran.foundation ${path} → ${res.status}`);
  return res.json();
}

/* -------------------------------------------------------------- payloads ---- */

/**
 * The slices of the gateway's payloads this module reads. Every field is
 * optional because it is someone else's JSON: the readers below decide what a
 * missing one means, rather than trusting the shape.
 */
type ReferencePayload = {
  from?: number;
  to?: number;
  chapterId?: number;
};

type TagPayload = { name?: string };

export type PostPayload = {
  id?: number;
  body?: string;
  publishedAt?: string;
  createdAt?: string;
  postTypeId?: number;
  postTypeName?: string;
  languageName?: string;
  likesCount?: number;
  commentsCount?: number;
  draft?: boolean;
  hidden?: boolean;
  removed?: boolean;
  moderationStatus?: number;
  references?: ReferencePayload[];
  tags?: TagPayload[];
};

export type UserPostsPayload = { total?: number; data?: PostPayload[] };

type ChapterPayload = { id?: number; name_simple?: string; name_arabic?: string };
export type ChaptersPayload = { chapters?: ChapterPayload[] };

export type UthmaniPayload = { verses?: { text_uthmani?: string }[] };

export type TranslationTextPayload = {
  translations?: { text?: string }[];
  meta?: { translation_name?: string };
};

/* ---------------------------------------------------------------- domain ---- */

/** A passage a reflection is about, as a citation and as somewhere to read it. */
export type VerseRef = {
  chapterId: number;
  /** The inclusive ayah range cited; both 0 when the whole surah is. */
  from: number;
  to: number;
  /** "48", "48-49", or "" when the whole surah is cited. */
  verses: string;
  url: string;
};

export type Reflection = {
  id: number;
  /** What QuranReflect calls it: a heart-response, or a point of understanding. */
  kind: "reflection" | "lesson";
  /** Plain text, paragraphs kept as blank lines. */
  body: string;
  /** The language I wrote it in, so it can date and read itself in that language. */
  lang: Locale;
  /** `YYYY-MM-DD`, or "" when the gateway gave no date. */
  date: string;
  refs: VerseRef[];
  tags: string[];
  likes: number;
  comments: number;
  url: string;
};

/** Surah id → name, in the two scripts the site cites them in. */
export type Chapters = Record<number, { simple: string; arabic: string }>;

/** An ayah as a page quotes it: the words themselves, then their rendering. */
export type Verse = {
  key: string; // "2:48"
  /** The ayah, Uthmani script. */
  arabic: string;
  /** In the reflection's own language; "" when the ayah stands alone. */
  translation: string;
  /** Who the rendering is by; "" when there is none to credit. */
  translator: string;
};

export type Reflections = {
  posts: Reflection[];
  total: number;
  chapters: Chapters;
  /** The quoted ayat, keyed per post language; read through `quotesFor`. */
  quotes: Record<string, Verse>;
  /** False when the gateway could not be reached; the page degrades to a link. */
  ok: boolean;
};

/**
 * `moderationStatus` values that mean the post is not mine to show here:
 * hidden, a private note, or awaiting review. A client-credentials caller is
 * given the public view already, so this is a second lock on the same door.
 */
const PRIVATE_STATUS = new Set([4, 5, 6, 30]);

const LANGUAGES: Record<string, Locale> = {
  english: "en",
  arabic: "ar",
  german: "de",
};

/**
 * The language a reflection was written in. QuranReflect names it in English
 * and in no consistent case ("English", "arabic"), and a language this site
 * does not publish reads as the default, exactly as `toLocale` decides it
 * everywhere else.
 */
function languageOf(name: string | undefined): Locale {
  return toLocale(LANGUAGES[(name ?? "").toLowerCase()] ?? "");
}

/**
 * A reference as it is cited and linked. `from`/`to` are 0 when the post is
 * about a whole surah rather than a passage, and a single ayah arrives as a
 * range of one, which reads as "2:48" rather than "2:48-48".
 */
function toRef(ref: ReferencePayload): VerseRef | null {
  const chapterId = ref.chapterId;
  if (!chapterId) return null;

  const from = ref.from ?? 0;
  if (!from) {
    return {
      chapterId,
      from: 0,
      to: 0,
      verses: "",
      url: `https://quran.com/${chapterId}`,
    };
  }

  // A payload whose range runs backwards is read as the single ayah it starts at.
  const to = Math.max(from, ref.to ?? 0);
  const verses = to > from ? `${from}-${to}` : `${from}`;
  return { chapterId, from, to, verses, url: `https://quran.com/${chapterId}/${verses}` };
}

/**
 * How a citation reads, given whatever the site knows of the surah's name. The
 * name is optional on purpose: the `content` scope may not be granted, and a
 * reflection is still worth showing over a bare "2:48".
 */
export function refLabel(ref: VerseRef, name?: string): string {
  const cite = ref.verses ? `${ref.chapterId}:${ref.verses}` : `${ref.chapterId}`;
  return name ? `${name} ${cite}` : cite;
}

/**
 * Whether a post is mine to show here. A type predicate rather than a plain
 * filter, so what it guarantees (there is an id, and there is a body) is
 * carried into the map below instead of being re-asserted with a fallback that
 * could never fire.
 */
function isPublic(p: PostPayload): p is PostPayload & { id: number; body: string } {
  return Boolean(
    p.id &&
      p.body?.trim() &&
      !p.draft &&
      !p.hidden &&
      !p.removed &&
      !PRIVATE_STATUS.has(p.moderationStatus ?? 0),
  );
}

/** Pure posts payload → Reflection[] transform. The test surface; no network. */
export function parseReflections(payload: UserPostsPayload): Reflection[] {
  return (payload.data ?? [])
    .filter(isPublic)
    .map((p) => ({
      id: p.id,
      // The name arrives capitalised or not; the id is the reliable half, and
      // anything that is not a lesson is a reflection.
      kind: p.postTypeId === 2 || p.postTypeName?.toLowerCase() === "lesson"
        ? ("lesson" as const)
        : ("reflection" as const),
      body: plainText(p.body),
      lang: languageOf(p.languageName),
      // Dated by the day it was published, so a reflection edited later does
      // not jump the list. `createdAt` stands in when it was never published
      // under its own timestamp.
      date: (p.publishedAt ?? p.createdAt ?? "").slice(0, 10),
      refs: (p.references ?? [])
        .map(toRef)
        .filter((r): r is VerseRef => r !== null),
      tags: (p.tags ?? [])
        .map((t) => t.name?.trim() ?? "")
        .filter((name) => name !== ""),
      likes: p.likesCount ?? 0,
      comments: p.commentsCount ?? 0,
      url: `https://quranreflect.com/posts/${p.id}`,
    }));
}

/** Pure chapters payload → Chapters transform. The test surface; no network. */
export function parseChapters(payload: ChaptersPayload): Chapters {
  const chapters: Chapters = {};
  for (const c of payload.chapters ?? []) {
    if (!c.id) continue;
    chapters[c.id] = {
      simple: c.name_simple ?? "",
      arabic: c.name_arabic ?? "",
    };
  }
  return chapters;
}

/* ---------------------------------------------------------------- quotes ---- */

/**
 * The translation quoted under an ayah follows the language the reflection was
 * written in, the same rule the byline follows: the quote belongs to the piece,
 * not to the page around it. An Arabic reflection quotes the ayah alone.
 *
 * The ids are the gateway's. It does not license every translation quran.com
 * shows (the Clear Quran is absent, for one), so these are chosen from what it
 * actually serves.
 */
const TRANSLATION_IDS: Partial<Record<Locale, number>> = {
  en: 20, // Saheeh International
  de: 27, // Frank Bubenheim and Nadeem Elyas
};

/** How much of a cited range is quoted. The chip still names the whole of it. */
const QUOTE_CAP = 5;

/**
 * The verse keys a set of references asks to have quoted, in citation order.
 * A whole-surah reference quotes nothing, because there is no quoting 286
 * ayat; a long range quotes its first few; an ayah cited twice is asked once.
 */
export function verseKeys(refs: VerseRef[]): string[] {
  const keys: string[] = [];
  for (const ref of refs) {
    if (!ref.from) continue;
    const last = Math.min(ref.to, ref.from + QUOTE_CAP - 1);
    for (let verse = ref.from; verse <= last; verse++) {
      const key = `${ref.chapterId}:${verse}`;
      if (!keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

/**
 * Where a post's quote lives in the quotes map. The ayah is the same in every
 * language, but the translation under it follows the post, so quotes are held
 * per language as well as per verse.
 */
export function quoteKey(lang: Locale, verseKey: string): string {
  return `${lang}:${verseKey}`;
}

/**
 * The sup elements are quran.com's footnote markers, stripped whole (marker
 * and all) because the footnotes they point at are not shown here. `plainText`
 * alone would keep the bare marker digit in the sentence.
 */
function stripFootnotes(html: string): string {
  return html.replace(/<sup[^>]*>.*?<\/sup>/gi, "");
}

/** Pure verse payloads → Verse transform. The test surface; no network. */
export function parseVerse(
  key: string,
  uthmani: UthmaniPayload,
  translation: TranslationTextPayload | null,
): Verse | null {
  // No ayah, no quote: a translation with nothing above it is not a citation.
  const arabic = uthmani.verses?.[0]?.text_uthmani?.trim() ?? "";
  if (!arabic) return null;

  const text = plainText(stripFootnotes(translation?.translations?.[0]?.text ?? ""));
  return {
    key,
    arabic,
    translation: text,
    // Credited only when there are words to credit.
    translator: text ? (translation?.meta?.translation_name ?? "") : "",
  };
}

/**
 * The quotes a reflection cites, in citation order, skipping whatever the
 * gateway could not produce: a missing ayah quiets its own quote, and the
 * citation chip above still names and links the passage.
 */
export function quotesFor(
  post: Pick<Reflection, "lang" | "refs">,
  quotes: Record<string, Verse>,
): Verse[] {
  return verseKeys(post.refs)
    .map((key) => quotes[quoteKey(post.lang, key)])
    .filter((v): v is Verse => v !== undefined);
}

/** Every quote the given posts cite, fetched with the render's content token. */
async function fetchQuotes(
  posts: Reflection[],
  token: string,
): Promise<Record<string, Verse>> {
  const wanted = new Map<string, { lang: Locale; key: string }>();
  for (const post of posts) {
    for (const key of verseKeys(post.refs)) {
      const qk = quoteKey(post.lang, key);
      if (!wanted.has(qk)) wanted.set(qk, { lang: post.lang, key });
    }
  }

  const entries = await Promise.all(
    [...wanted.entries()].map(async ([qk, { lang, key }]) => {
      try {
        const translationId = TRANSLATION_IDS[lang];
        const [uthmani, translation] = await Promise.all([
          api<UthmaniPayload>(
            `/content/api/v4/quran/verses/uthmani?verse_key=${key}`,
            token,
          ),
          translationId
            ? api<TranslationTextPayload>(
                `/content/api/v4/quran/translations/${translationId}?verse_key=${key}`,
                token,
                // The rendering is the optional half: losing it must not take
                // the ayah down with it, so the ayah stands alone instead.
              ).catch(() => null)
            : Promise.resolve(null),
        ]);
        return [qk, parseVerse(key, uthmani, translation)] as const;
      } catch {
        return [qk, null] as const; // no ayah, no quote; the chip remains
      }
    }),
  );

  const quotes: Record<string, Verse> = {};
  for (const [qk, verse] of entries) if (verse) quotes[qk] = verse;
  return quotes;
}

/**
 * Reads my public QuranReflect posts, and with `quoteVerses` the ayat they
 * cite. Never throws; degrades to a link.
 */
export async function getReflections(
  limit = 20,
  quoteVerses = false,
): Promise<Reflections> {
  try {
    const path =
      `/quran-reflect/v1/posts/user-posts/${AUTHOR_ID}` +
      `?sortBy=latest&limit=${limit}&page=1`;
    const postsPromise = requestToken("post.read").then((t) =>
      api<UserPostsPayload>(path, t),
    );
    // One content token serves the surah names and the quotes alike. Either
    // half failing quiets itself rather than the page: the names are a nicety,
    // the quotes degrade to their chips, and only the posts are the point.
    const contentToken = requestToken("content");
    const chaptersPromise = contentToken
      .then((t) => api<ChaptersPayload>("/content/api/v4/chapters", t))
      .then(parseChapters)
      .catch(() => ({}) as Chapters);

    const payload = await postsPromise;
    const posts = parseReflections(payload);
    const quotes = quoteVerses
      ? await contentToken.then((t) => fetchQuotes(posts, t)).catch(() => ({}))
      : {};

    return {
      posts,
      // What the gateway says I have written, which can exceed one page of it.
      total: payload.total ?? posts.length,
      chapters: await chaptersPromise,
      quotes,
      ok: true,
    };
  } catch {
    return { posts: [], total: 0, chapters: {}, quotes: {}, ok: false };
  }
}
