import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getAllArticles } from "@/lib/articles";
import { readContent, renderInline } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  return pageMetadata({
    lang,
    sub: "",
    title: dict.site.title,
    description: dict.site.description,
    dict,
    // The site's own name, not a page within it: no "· Khalid" suffix.
    absoluteTitle: true,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict, dir, forward } = await resolveLocale(lang);
  const { meta } = readContent(lang, "home");
  const articles = getAllArticles(lang);
  const featured = articles.find((a) => a.featured) ?? articles[0];

  return (
    <div className="mx-auto max-w-3xl px-5">
      {/* Hero */}
      <section className="relative isolate pt-20 pb-16 sm:pt-28">
        <div className="flex flex-col-reverse items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-accent-strong">
              {meta.eyebrow}
            </p>
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
          </div>

          {/* The portrait sits at the inline end, so it lands opposite the
              greeting in either direction. In the photograph the gaze runs to
              the reader's right, which is off the page in a left-to-right
              layout; flipping it there turns it back towards the greeting.
              Right-to-left already reads that way, so it keeps the original. */}
          <Image
            src="/khalid.jpg"
            alt={dict.site.title}
            width={200}
            height={200}
            priority
            className={`h-24 w-24 shrink-0 rounded-full object-cover ring-1 ring-border sm:h-36 sm:w-36 ${
              dir === "rtl" ? "" : "-scale-x-100"
            }`}
          />
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
