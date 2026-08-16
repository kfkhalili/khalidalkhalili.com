import type { Metadata } from "next";
import { resolveLocale, languageBadge, toLocale, type Dictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { articleDate } from "@/lib/format";
import {
  getReflections,
  refLabel,
  quotesFor,
  QURAN_REFLECT_PROFILE_URL,
  type Chapters,
  type Reflection,
  type Verse,
} from "@/lib/quran-reflect";

// Render on demand: pull what I've written on QuranReflect each time the page
// loads, the same way the reading and chess pages read their feeds.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  // Not in the sitemap, but still crawled from the site nav, so it still has to
  // say which URL it is and which locales it exists in.
  return pageMetadata({
    lang,
    sub: "/islam",
    title: dict.islam.title,
    description: dict.islam.subtitle,
    dict,
  });
}

/**
 * A surah names itself in Arabic on the Arabic page and by its transliteration
 * elsewhere, which is how it is cited in English and German alike. A name the
 * `content` scope could not reach is no name, and `refLabel` cites the number
 * on its own rather than showing a gap.
 */
function surahName(chapters: Chapters, chapterId: number, lang: string): string {
  const chapter = chapters[chapterId];
  if (!chapter) return "";
  return toLocale(lang) === "ar" ? chapter.arabic : chapter.simple;
}

/** The passages a reflection is about, each linking to the ayah on Quran.com. */
function Verses({
  refs,
  chapters,
  lang,
}: {
  refs: Reflection["refs"];
  chapters: Chapters;
  lang: string;
}) {
  if (refs.length === 0) return null;
  return (
    // Citations are Latin-numbered wherever they appear, so they are laid out
    // left-to-right even on the Arabic page, where only the surah name flips.
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {refs.map((ref) => (
        <a
          key={`${ref.chapterId}:${ref.verses}`}
          href={ref.url}
          target="_blank"
          rel="noopener noreferrer"
          dir="auto"
          className="rounded-md border border-border bg-card-2 px-2 py-0.5 font-mono text-xs text-accent transition-colors hover:text-accent-strong"
        >
          {refLabel(ref, surahName(chapters, ref.chapterId, lang))}
        </a>
      ))}
    </div>
  );
}

/**
 * An ayah quoted in full: the words themselves, then their rendering in the
 * language the reflection was written in. The Arabic is the citation; the
 * rendering under it is credited because it is someone's work.
 */
function VerseQuote({
  verse,
  postLang,
  chapters,
  lang,
}: {
  verse: Verse;
  /** The rendering is in the reflection's language, and says so to machines. */
  postLang: Reflection["lang"];
  chapters: Chapters;
  lang: string;
}) {
  const chapterId = Number(verse.key.split(":")[0]);
  const name = surahName(chapters, chapterId, lang);
  return (
    <blockquote className="mt-4 border-s-2 border-accent/30 ps-4">
      <p dir="rtl" lang="ar" className="text-lg leading-loose text-foreground">
        {verse.arabic}
      </p>
      {verse.translation && (
        <p dir="auto" lang={postLang} className="mt-2 text-sm leading-relaxed text-muted">
          {verse.translation}
        </p>
      )}
      <footer dir="auto" className="mt-2 font-mono text-xs text-faint">
        {name ? `${name} ${verse.key}` : verse.key}
        {verse.translator && ` · ${verse.translator}`}
      </footer>
    </blockquote>
  );
}

/**
 * One reflection, whole: the text is mine, so nothing is held back, and the
 * ayat it cites are quoted under it, the way QuranReflect itself lays a post
 * out. What still lives there is the conversation underneath, which is what
 * the link at the foot is for.
 */
function ReflectionCard({
  post,
  quotes,
  chapters,
  lang,
  dict,
}: {
  post: Reflection;
  quotes: Verse[];
  chapters: Chapters;
  lang: string;
  dict: Dictionary["islam"];
}) {
  // A reflection dates itself in the language I wrote it in, wherever it is
  // shown, and the badge is what tells the reader the two differ.
  const badge = languageBadge(post.lang, toLocale(lang));

  return (
    <article className="rounded-lg border border-border bg-card-2 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs uppercase tracking-wider text-faint">
          {post.kind === "lesson" ? dict.lesson : dict.reflection}
        </span>
        <Verses refs={post.refs} chapters={chapters} lang={lang} />
      </div>

      {/* Written in its own language and script, and saying so: dir keeps the
          text flowing the right way, lang keeps a screen reader from voicing
          an English reflection with the Arabic page's voice. */}
      <p
        dir="auto"
        lang={post.lang}
        className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted"
      >
        {post.body}
      </p>

      {quotes.map((verse) => (
        <VerseQuote
          key={verse.key}
          verse={verse}
          postLang={post.lang}
          chapters={chapters}
          lang={lang}
        />
      ))}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-faint">
        {post.date && (
          <span dir="auto" lang={post.lang}>
            {articleDate(post)}
          </span>
        )}
        {badge && (
          <span className="rounded-md border border-border px-1.5 py-0.5">{badge}</span>
        )}
        {post.tags.map((tag) => (
          <span key={tag} dir="auto" className="font-mono">
            #{tag}
          </span>
        ))}
      </div>

      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm text-accent transition-colors hover:text-accent-strong"
      >
        {dict.readOn} ↗
      </a>
    </article>
  );
}

export default async function IslamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const feed = await getReflections(20, true);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.islam.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.islam.subtitle}</p>
      </header>

      {feed.posts.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            {dict.islam.reflections}
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            {feed.posts.map((post) => (
              <ReflectionCard
                key={post.id}
                post={post}
                quotes={quotesFor(post, feed.quotes)}
                chapters={feed.chapters}
                lang={lang}
                dict={dict.islam}
              />
            ))}
          </div>
        </section>
      ) : (
        // Only when QuranReflect answered and had nothing. A feed that could not
        // be reached says so through the link below instead of claiming I have
        // written nothing.
        feed.ok && <p className="mt-12 text-sm text-muted">{dict.islam.empty}</p>
      )}

      <div className="mt-12 border-t border-border pt-6">
        <a
          href={QURAN_REFLECT_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent transition-colors hover:text-accent-strong"
        >
          {feed.ok ? dict.islam.viewProfile : dict.islam.unavailable} ↗
        </a>
      </div>
    </div>
  );
}
