import type { Metadata } from "next";
import {
  WritingList,
  type Chip,
  type TagChip,
} from "@/components/writing-list";
import { COLLECTIONS, getAllArticles } from "@/lib/articles";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { TAG_PARAM, countTags, filterByTag, readTag, tagHref } from "@/lib/tags";

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
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);

  // A tag is a shelf the reader arrived at, from a card here or from the piece
  // itself, so it is read from the URL rather than held in the list: the
  // narrowed index is a page you can link to and come back to. Filtering here
  // rather than in the client component keeps the shelf a reader (or a crawler)
  // is shown the one that ships in the HTML.
  const tag = readTag((await searchParams)?.[TAG_PARAM]);
  const all = getAllArticles(lang);
  const articles = filterByTag(all, tag);

  // Both rows are built from the whole index, never from the tag-narrowed one:
  // a filter row that described the current shelf would shrink as it was used,
  // moving the articles under the reader's cursor mid-click. Chips are built
  // here so the client component never imports the article libraries, which
  // read from disk. An empty collection still gets no chip, since that depends
  // on what is written rather than on what the reader has chosen.
  const chips: Chip[] = [
    { key: "all", label: dict.writing.filters.all, count: all.length },
    ...COLLECTIONS.map((c) => ({
      key: c,
      label: dict.writing.filters[c],
      count: all.filter((a) => a.collection === c).length,
    })).filter((chip) => chip.count > 0),
  ];

  const tagChips: TagChip[] = [
    {
      key: "all",
      label: dict.writing.filters.all,
      count: all.length,
      href: `/${lang}/writing`,
      active: !tag,
    },
    ...countTags(all).map((t) => ({
      key: t.tag,
      label: t.tag,
      count: t.count,
      href: tagHref(lang, t.tag),
      active: t.tag === tag,
    })),
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
        tagChips={tagChips}
        filterLabel={dict.writing.filters.label}
        tagLabel={dict.writing.filters.tag}
        emptyLabel={dict.writing.filters.noMatch}
      />
    </div>
  );
}
