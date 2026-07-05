import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { getAllArticles } from "@/lib/articles";
import { resolveLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  return { title: dict.writing.title, description: dict.writing.subtitle };
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const articles = getAllArticles(lang);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.writing.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.writing.subtitle}</p>
      </header>

      <div className="mt-10 grid gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            lang={lang}
            dict={dict}
            article={article}
          />
        ))}
      </div>
    </div>
  );
}
