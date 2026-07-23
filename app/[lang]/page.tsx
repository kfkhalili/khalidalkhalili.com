import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getAllArticles } from "@/lib/articles";
import { readContent, renderInline } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict, forward } = await resolveLocale(lang);
  const { meta } = readContent(lang, "home");
  const articles = getAllArticles(lang);
  const featured = articles.find((a) => a.featured) ?? articles[0];

  return (
    <div className="mx-auto max-w-3xl px-5">
      {/* Hero */}
      <section className="relative isolate pt-20 pb-16 sm:pt-28">
        <p className="font-mono text-sm text-accent-strong">{meta.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {meta.heading}
        </h1>
        <p
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          dangerouslySetInnerHTML={{ __html: renderInline(meta.lead) }}
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {featured && (
            <Link
              href={`/${lang}/writing/${featured.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              {dict.home.ctaExplore}
              <span aria-hidden>{forward}</span>
            </Link>
          )}
          <Link
            href={`/${lang}/writing`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/25"
          >
            {dict.home.ctaRead}
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="pb-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
              {dict.home.featured}
            </h2>
            <Link
              href={`/${lang}/writing`}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {dict.home.allWriting} {forward}
            </Link>
          </div>
          <ArticleCard lang={lang} article={featured} />
        </section>
      )}
    </div>
  );
}
