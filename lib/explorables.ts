import type { ComponentType } from "react";
import type { Article } from "@/lib/articles";
import { TechnicalDebtArticle } from "@/components/explorables/technical-debt";
import { TD_CONTENT } from "@/components/explorables/technical-debt.content";
import { ThirdThingArticle } from "@/components/explorables/the-third-thing";
import { TT_CONTENT } from "@/components/explorables/the-third-thing.content";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

/** An explorable = article metadata + the component that renders its body (in a locale). */
export type Explorable = Article & { Body: ComponentType<{ lang: string }> };

type LocalizedMeta = { title: string; description: string; tags: string[] };

// Locale-independent facts live on the def; title/description/tags come from the
// explorable's own content module, so one registry entry yields a localized
// Article per request. The typed Body↔registry link keeps this off slug strings.
type ExplorableDef = {
  slug: string;
  date: string;
  featured?: boolean;
  readingTime: number;
  Body: ComponentType<{ lang: string }>;
  content: Record<Locale, LocalizedMeta>;
};

const DEFS: ExplorableDef[] = [
  {
    slug: "the-third-thing",
    date: "2026-07-23",
    featured: true,
    readingTime: 10,
    Body: ThirdThingArticle,
    content: TT_CONTENT,
  },
  {
    slug: "technical-debt",
    date: "2026-02-09",
    featured: true,
    readingTime: 6,
    Body: TechnicalDebtArticle,
    content: TD_CONTENT,
  },
];

function resolve(def: ExplorableDef, lang: string): Explorable {
  const loc: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const meta = def.content[loc];
  return {
    slug: def.slug,
    title: meta.title,
    description: meta.description,
    tags: meta.tags,
    date: def.date,
    lang: loc,
    featured: def.featured,
    kind: "explorable",
    readingTime: def.readingTime,
    Body: def.Body,
  };
}

/** All explorables as Articles localized to `lang`. */
export function getExplorables(lang: string): Explorable[] {
  return DEFS.map((def) => resolve(def, lang));
}

/** One explorable (localized to `lang`) by slug, or undefined. */
export function findExplorable(slug: string, lang: string): Explorable | undefined {
  const def = DEFS.find((d) => d.slug === slug);
  return def ? resolve(def, lang) : undefined;
}

/** Slugs for static param generation (locale-independent). */
export const EXPLORABLE_SLUGS = DEFS.map((d) => d.slug);
