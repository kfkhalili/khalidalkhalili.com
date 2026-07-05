import Link from "next/link";
import { StarPattern } from "@/components/geometry";
import { ArticleCard } from "@/components/article-card";
import { articles } from "@/lib/articles";
import { readContent, renderInline } from "@/lib/content";

export default function Home() {
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const { meta } = readContent("home");

  return (
    <div className="mx-auto max-w-3xl px-5">
      {/* Hero */}
      <section className="relative isolate pt-20 pb-16 sm:pt-28">
        <div className="pointer-events-none absolute -inset-x-24 -top-24 -z-10 h-[380px] text-accent opacity-[0.05]">
          <StarPattern id="hero-khatam" className="h-full w-full" />
        </div>

        <p className="font-mono text-sm text-accent-strong">{meta.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {meta.heading}
        </h1>
        <p
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          dangerouslySetInnerHTML={{ __html: renderInline(meta.lead) }}
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/writing/${featured.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            Explore the technical-debt sim
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/writing"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/25"
          >
            Read the writing
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="pb-8">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wider text-faint">
            Featured explorable
          </h2>
          <Link
            href="/writing"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            All writing →
          </Link>
        </div>
        <ArticleCard article={featured} />
      </section>
    </div>
  );
}
