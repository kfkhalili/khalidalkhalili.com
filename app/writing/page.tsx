import type { Metadata } from "next";
import {
  WritingList,
  type Chip,
  type TagChip,
} from "@/components/writing-list";
import { COLLECTIONS, getAllArticles } from "@/lib/articles";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/page-metadata";
import { TAG_PARAM, countTags, filterByTag, readTag, tagHref } from "@/lib/tags";

export function generateMetadata(): Metadata {
  return pageMetadata({
    sub: "/writing",
    title: strings.writing.title,
    description: strings.writing.subtitle,
  });
}

export default async function WritingPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // A tag is a shelf the reader arrived at, from a card here or from the piece
  // itself, so it is read from the URL rather than held in the list: the
  // narrowed index is a page you can link to and come back to. Filtering here
  // rather than in the client component keeps the shelf a reader (or a crawler)
  // is shown the one that ships in the HTML.
  const tag = readTag((await searchParams)?.[TAG_PARAM]);
  const all = getAllArticles();
  const articles = filterByTag(all, tag);

  // Both rows are built from the whole index, never from the tag-narrowed one:
  // a filter row that described the current shelf would shrink as it was used,
  // moving the articles under the reader's cursor mid-click. Chips are built
  // here so the client component never imports the article libraries, which
  // read from disk. An empty collection still gets no chip, since that depends
  // on what is written rather than on what the reader has chosen.
  const chips: Chip[] = [
    { key: "all", label: strings.writing.filters.all, count: all.length },
    ...COLLECTIONS.map((c) => ({
      key: c,
      label: strings.writing.filters[c],
      count: all.filter((a) => a.collection === c).length,
    })).filter((chip) => chip.count > 0),
  ];

  const tagChips: TagChip[] = [
    {
      key: "all",
      label: strings.writing.filters.all,
      count: all.length,
      href: "/writing",
      active: !tag,
    },
    ...countTags(all).map((t) => ({
      key: t.tag,
      label: t.tag,
      count: t.count,
      href: tagHref(t.tag),
      active: t.tag === tag,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {strings.writing.title}
        </h1>
        <p className="mt-3 max-w-xl text-muted">{strings.writing.subtitle}</p>
      </header>

      <WritingList
        articles={articles}
        chips={chips}
        tagChips={tagChips}
        filterLabel={strings.writing.filters.label}
        tagLabel={strings.writing.filters.tag}
        emptyLabel={strings.writing.filters.noMatch}
      />
    </div>
  );
}
