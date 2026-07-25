import type { Metadata } from "next";
import { WritingList, type Chip } from "@/components/writing-list";
import { COLLECTIONS, getAllArticles } from "@/lib/articles";
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
    sub: "/writing",
    title: dict.writing.title,
    description: dict.writing.subtitle,
    dict,
  });
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);
  const articles = getAllArticles(lang);

  // Built here so the client component never imports the article libraries,
  // which read from disk. An empty collection gets no chip, so every choice
  // the reader is offered leads somewhere.
  const chips: Chip[] = [
    { key: "all", label: dict.writing.filters.all, count: articles.length },
    ...COLLECTIONS.map((c) => ({
      key: c,
      label: dict.writing.filters[c],
      count: articles.filter((a) => a.collection === c).length,
    })).filter((chip) => chip.count > 0),
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {dict.writing.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{dict.writing.subtitle}</p>
      </header>

      <WritingList
        lang={lang}
        articles={articles}
        chips={chips}
        filterLabel={dict.writing.filters.label}
      />
    </div>
  );
}
