import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEssaySlugs,
  getEssayContent,
  getExplorable,
} from "@/lib/articles";
import { formatDate, formatReadingTime } from "@/lib/format";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import {
  resolveLocale,
  dirOf,
  languageBadge,
  ogLocaleOf,
  isLocale,
  DEFAULT_LOCALE,
} from "@/lib/i18n";
import { articlePath, articleUrl, articleLanguages } from "@/lib/share";
import { site } from "@/lib/site";
import { ShareRow } from "@/components/share-row";

export function generateStaticParams() {
  return [...getEssaySlugs(), ...EXPLORABLE_SLUGS].map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getEssayContent(slug)?.article ?? getExplorable(slug, lang);
  if (!article) return {};

  // An explorable is genuinely translated, so each locale is its own canonical
  // and the three point at each other. An essay is one document: it renders
  // under any locale, but that is the same prose with translated chrome, so all
  // three URLs canonicalise to the language it was written in and claim no
  // translations. `articlePath` is relative; metadataBase makes it absolute.
  const translated = article.kind === "explorable";
  const home = isLocale(article.lang) ? article.lang : DEFAULT_LOCALE;

  // A shared link is only as good as its card, so every article overrides the
  // layout's site-level Open Graph block with its own. The image comes from the
  // sibling opengraph-image route; Next fills in the tags for it.
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: articlePath(translated ? lang : home, slug),
      ...(translated ? { languages: articleLanguages(slug) } : {}),
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: articlePath(translated ? lang : home, slug),
      siteName: site.name,
      locale: ogLocaleOf(translated ? lang : home),
      publishedTime: article.date,
      authors: [site.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  // One render seam, two adapters: markdown (essays) or a component (explorables).
  const essay = getEssayContent(slug);
  const explorable = getExplorable(slug, lang);
  const article = essay?.article ?? explorable;
  if (!article) notFound();

  const { dict, back } = await resolveLocale(lang);
  const badge = languageBadge(article.lang, lang);

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <Link
        href={`/${lang}/writing`}
        className="font-mono text-sm text-muted transition-colors hover:text-foreground"
      >
        {back} {dict.article.back}
      </Link>

      <div lang={article.lang} dir={dirOf(article.lang)}>
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-1.5">
            {article.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-faint"
              >
                {t}
              </span>
            ))}
            {badge && (
              <span className="rounded-full border border-accent/40 px-2 py-0.5 text-xs text-accent-strong">
                {badge}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 font-mono text-sm text-faint">
            <time dateTime={article.date}>
              {formatDate(article.date, article.lang)}
            </time>
            <span aria-hidden>·</span>
            <span>{formatReadingTime(article.readingTime, article.lang)}</span>
          </div>
        </header>

        {essay ? (
          <div
            className="prose mt-10"
            dangerouslySetInnerHTML={{ __html: essay.html }}
          />
        ) : (
          <div className="prose mt-10">
            {explorable && <explorable.Body lang={lang} />}
          </div>
        )}
      </div>

      {/* Chrome, not content: reads in the page's language like the back link. */}
      <ShareRow
        url={articleUrl(lang, slug)}
        title={article.title}
        labels={dict.share}
      />
    </article>
  );
}
