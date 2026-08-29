import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { getAllArticles } from "@/lib/articles";
import { readContent, renderInline } from "@/lib/content";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata(): Metadata {
  return pageMetadata({
    sub: "",
    title: strings.site.title,
    description: strings.site.description,
    // The site's own name, not a page within it: no "· Khalid" suffix.
    absoluteTitle: true,
  });
}

export default function Home() {
  const { meta } = readContent("home");
  const articles = getAllArticles();
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
                  href={`/writing/${featured.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
                >
                  {strings.home.ctaExplore}
                  <span aria-hidden>→</span>
                </Link>
              )}
              <Link
                href="/writing"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/25"
              >
                {strings.home.ctaRead}
              </Link>
            </div>
          </div>

          {/* In the photograph the gaze runs to the reader's right, which is
              off the page; flipping it turns it back towards the greeting. */}
          <Image
            src="/khalid.jpg"
            alt={strings.site.title}
            width={200}
            height={200}
            priority
            className="h-24 w-24 shrink-0 -scale-x-100 rounded-full object-cover ring-1 ring-border sm:h-36 sm:w-36"
          />
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="pb-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
              {strings.home.featured}
            </h2>
            <Link
              href="/writing"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {strings.home.allWriting} →
            </Link>
          </div>
          <ArticleCard article={featured} />
        </section>
      )}
    </div>
  );
}
