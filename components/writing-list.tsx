"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/articles";

export type Chip = { key: string; label: string; count: number };

/**
 * A tag chip is a chip that is a link, since a tag is a place: the same address
 * the tag on a card leads to. `active` says which one the URL is currently at.
 */
export type TagChip = Chip & { href: string; active: boolean };

/**
 * The writing index holds two bodies of work on one shelf: current essays and
 * explorables, and the 2012-13 prose. One filtered list, rather than two nav
 * entries whose labels would both just mean "writing".
 *
 * Two criteria narrow it, and they are held in different places on purpose. A
 * collection is a glance at the same shelf, so it lives in this component's
 * state. A tag is somewhere the reader was sent, from a card or from a piece's
 * own header, so it lives in the URL: `articles` arrives already narrowed to it
 * and the chips only say which tag that was.
 *
 * Both rows describe the whole index rather than the shelf in front of the
 * reader, so choosing a filter never adds or removes a row. The articles stay
 * where they are, and a second click lands where the reader aimed it.
 *
 * Chips arrive already built and localized. Nothing here reaches into the
 * article libraries, which read from disk and must stay off the client.
 */
export function WritingList({
  lang,
  articles,
  chips,
  tagChips,
  filterLabel,
  tagLabel,
  emptyLabel,
}: {
  lang: string;
  articles: Article[];
  chips: Chip[];
  tagChips: TagChip[];
  filterLabel: string;
  tagLabel: string;
  emptyLabel: string;
}) {
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? articles : articles.filter((a) => a.collection === filter);

  // Each row is only worth showing once it offers more than one thing to
  // choose: "all" plus a single tag, or a single collection, is not a choice.
  const showTags = tagChips.length > 2;
  const showCollections = chips.length > 2;

  const chipClass = (active: boolean) =>
    "rounded-full border px-3 py-1 text-sm transition-colors " +
    (active
      ? "border-accent/60 bg-accent/10 text-accent-strong"
      : "border-border text-muted hover:border-accent/40 hover:text-foreground");

  return (
    <>
      {(showTags || showCollections) && (
        <div className="mt-8 flex flex-col gap-3">
          {showTags && (
            <div
              role="group"
              aria-label={tagLabel}
              className="flex flex-wrap items-center gap-2"
            >
              {tagChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.href}
                  aria-current={chip.active ? "page" : undefined}
                  className={chipClass(chip.active)}
                >
                  {chip.label}
                  <span className="ms-1.5 font-mono text-xs text-faint">
                    {chip.count}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {showCollections && (
            <div
              role="group"
              aria-label={filterLabel}
              className="flex flex-wrap items-center gap-2"
            >
              {chips.map((chip) => {
                const active = filter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setFilter(chip.key)}
                    aria-pressed={active}
                    className={chipClass(active)}
                  >
                    {chip.label}
                    <span className="ms-1.5 font-mono text-xs text-faint">
                      {chip.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* The counts above are the whole index's, so a pair of filters can still
          meet on nothing, as can a tag typed into the URL by hand. Saying so
          beats a blank page under a row of chips that all look answerable. */}
      {shown.length === 0 ? (
        <p className="mt-6 text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {shown.map((article) => (
            <ArticleCard key={article.slug} lang={lang} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
