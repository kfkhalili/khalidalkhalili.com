import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Interactive explorables and essays on software, systems, and the people who build them.",
};

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Writing
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Interactive explorables and essays on software, systems, and the
          people who build them. More to come.
        </p>
      </header>

      <div className="mt-10 grid gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
