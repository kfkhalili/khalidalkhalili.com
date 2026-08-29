import Link from "next/link";
import type { Article } from "@/lib/articles";
import { articleDate, articleReadingTime } from "@/lib/format";
import { tagHref } from "@/lib/tags";

/**
 * The card is two destinations, not one: the tags lead to the shelf they name,
 * the rest leads to the piece. So the article link stops short of the badge row
 * rather than wrapping it, since an anchor inside an anchor is not a thing a
 * browser can render. The border still answers to the article link alone, which
 * is what keeps a hovered tag from claiming the whole card.
 */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors has-[[data-article-link]:hover]:border-accent/60">
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
      <Link
        data-article-link
        href={`/writing/${article.slug}`}
        className="group block"
      >
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent-strong">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {article.description}
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-xs text-faint">
          <time dateTime={article.date}>{articleDate(article)}</time>
          <span aria-hidden>·</span>
          <span>{articleReadingTime(article)}</span>
        </div>
      </Link>
    </div>
  );
}
