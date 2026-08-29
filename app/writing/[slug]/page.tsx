import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEssaySlugs,
  getEssayContent,
  getExplorable,
} from "@/lib/articles";
import { articleDate, articleReadingTime } from "@/lib/format";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { strings } from "@/lib/strings";
import { articlePath, articleUrl } from "@/lib/share";
import { tagHref } from "@/lib/tags";
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getEssayContent(slug)?.article ?? getExplorable(slug);
  if (!article) return {};

  // A shared link is only as good as its card, so every article overrides the
  // layout's site-level Open Graph block with its own. The image comes from the
  // sibling opengraph-image route; Next fills in the tags for it.
  // `articlePath` is relative; metadataBase makes it absolute.
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: articlePath(slug),
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: articlePath(slug),
      siteName: site.name,
      locale: "en_US",
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // One render seam, two adapters: markdown (essays) or a component (explorables).
  const essay = getEssayContent(slug);
  const explorable = getExplorable(slug);
  const article = essay?.article ?? explorable;
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <Link
        href="/writing"
        className="font-mono text-sm text-muted transition-colors hover:text-foreground"
      >
        ← {strings.article.back}
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-1.5">
          {article.tags.map((t) => (
            <Link
              key={t}
              href={tagHref(t)}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-faint transition-colors hover:border-accent/40 hover:text-accent-strong"
            >
              {t}
            </Link>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 font-mono text-sm text-faint">
          <time dateTime={article.date}>{articleDate(article)}</time>
          <span aria-hidden>·</span>
          <span>{articleReadingTime(article)}</span>
        </div>
      </header>

      {essay ? (
        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: essay.html }}
        />
      ) : (
        <div className="prose mt-10">
          {explorable && <explorable.Body />}
        </div>
      )}

      <ShareRow url={articleUrl(slug)} title={article.title} />
    </article>
  );
}
