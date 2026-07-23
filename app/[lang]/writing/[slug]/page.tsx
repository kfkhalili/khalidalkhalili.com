import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StarPattern } from "@/components/geometry";
import {
  getEssaySlugs,
  getEssayContent,
  getExplorable,
  formatDate,
  formatReadingTime,
} from "@/lib/articles";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { resolveLocale, dirOf, languageBadge } from "@/lib/i18n";

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
  return article
    ? { title: article.title, description: article.description }
    : {};
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
    <article className="relative isolate mx-auto max-w-3xl px-5 py-16 sm:py-20">
      {/* Faint geometry band behind the header; light mode only, like the hero. */}
      <div className="pointer-events-none absolute -inset-x-24 -top-24 -z-10 h-[380px] text-accent opacity-[0.08] dark:hidden">
        <StarPattern id="article-khatam" className="h-full w-full" />
      </div>

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
    </article>
  );
}
