import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEssaySlugs, getEssayContent, formatDate } from "@/lib/articles";
import { renderMarkdown } from "@/lib/content";
import { getDictionary, dirOf, LOCALE_META } from "@/lib/i18n";

export function generateStaticParams() {
  return getEssaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = getEssayContent(slug);
  return found
    ? { title: found.article.title, description: found.article.description }
    : {};
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const found = getEssayContent(slug);
  if (!found) notFound();

  const { article, body } = found;
  const dict = await getDictionary(lang);
  const back = dirOf(lang) === "rtl" ? "→" : "←";
  const langMeta = LOCALE_META[article.lang as keyof typeof LOCALE_META];

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <Link
        href={`/${lang}/writing`}
        className="font-mono text-sm text-muted transition-colors hover:text-foreground"
      >
        {back} {dict.article.back}
      </Link>

      <div lang={article.lang} dir={langMeta?.dir ?? "ltr"}>
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
            {article.lang !== "en" && langMeta && (
              <span className="rounded-full border border-accent/40 px-2 py-0.5 text-xs text-accent-strong">
                {langMeta.label}
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
            <span>
              {article.readingTime} {dict.article.minRead}
            </span>
          </div>
        </header>

        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      </div>
    </article>
  );
}
