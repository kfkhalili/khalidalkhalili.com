"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/articles";

export type Chip = { key: string; label: string; count: number };

/**
 * The writing index holds two bodies of work on one shelf: current essays and
 * explorables, and the 2012-13 prose. One filtered list, rather than two nav
 * entries whose labels would both just mean "writing".
 *
 * Chips arrive already built and localized. Nothing here reaches into the
 * article libraries, which read from disk and must stay off the client.
 */
export function WritingList({
  lang,
  articles,
  chips,
  filterLabel,
}: {
  lang: string;
  articles: Article[];
  chips: Chip[];
  filterLabel: string;
}) {
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? articles : articles.filter((a) => a.collection === filter);

  return (
    <>
      {/* Only worth showing once there is more than one collection to choose. */}
      {chips.length > 2 && (
        <div
          role="group"
          aria-label={filterLabel}
          className="mt-8 flex flex-wrap items-center gap-2"
        >
          {chips.map((chip) => {
            const active = filter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key)}
                aria-pressed={active}
                className={
                  "rounded-full border px-3 py-1 text-sm transition-colors " +
                  (active
                    ? "border-accent/60 bg-accent/10 text-accent-strong"
                    : "border-border text-muted hover:border-accent/40 hover:text-foreground")
                }
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

      <div className="mt-6 grid gap-4">
        {shown.map((article) => (
          <ArticleCard key={article.slug} lang={lang} article={article} />
        ))}
      </div>
    </>
  );
}
