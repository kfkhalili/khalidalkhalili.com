import Link from "next/link";
import { formatDate, type Article } from "@/lib/articles";
import { languageBadge, type Dictionary } from "@/lib/i18n";

export function ArticleCard({
  lang,
  dict,
  article,
}: {
  lang: string;
  dict: Dictionary;
  article: Article;
}) {
  const badge = languageBadge(article.lang, lang);

  return (
    <Link
      href={`/${lang}/writing/${article.slug}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/60"
    >
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
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent-strong">
        {article.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {article.description}
      </p>
      <div className="mt-3 flex items-center gap-2 font-mono text-xs text-faint">
        <time dateTime={article.date}>{formatDate(article.date, lang)}</time>
        <span aria-hidden>·</span>
        <span>
          {article.readingTime} {dict.article.minRead}
        </span>
      </div>
    </Link>
  );
}
