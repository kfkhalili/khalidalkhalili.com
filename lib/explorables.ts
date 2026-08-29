import type { ComponentType } from "react";
import type { Article } from "@/lib/articles";
import { TechnicalDebtArticle } from "@/components/explorables/technical-debt";
import { TD_CONTENT } from "@/components/explorables/technical-debt.content";
import { ThirdThingArticle } from "@/components/explorables/the-third-thing";
import { TT_CONTENT } from "@/components/explorables/the-third-thing.content";

/** An explorable = article metadata + the component that renders its body. */
export type Explorable = Article & { Body: ComponentType };

// Registry facts live on the def; title/description/tags come from the
// explorable's own content module, next to the copy they describe. The typed
// Body↔registry link keeps this off slug strings.
type ExplorableDef = {
  slug: string;
  date: string;
  featured?: boolean;
  /** Kept in the registry but off the site. See `hidden` on Article. */
  hidden?: boolean;
  readingTime: number;
  Body: ComponentType;
  content: { title: string; description: string; tags: string[] };
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

/** The serializable half: everything but the Body component. */
function resolveMeta(def: ExplorableDef): Article {
  return {
    slug: def.slug,
    title: def.content.title,
    description: def.content.description,
    tags: def.content.tags,
    date: def.date,
    featured: def.featured,
    kind: "explorable",
    collection: "writing",
    readingTime: def.readingTime,
  };
}

function resolve(def: ExplorableDef): Explorable {
  return { ...resolveMeta(def), Body: def.Body };
}

/**
 * The registry as the site sees it. A hidden entry is dropped here, once, so
 * every reader below inherits it and none has to remember the rule.
 */
function visibleDefs(): ExplorableDef[] {
  return DEFS.filter((d) => !d.hidden);
}

/** All explorables, each carrying its Body. */
export function getExplorables(): Explorable[] {
  return visibleDefs().map(resolve);
}

/**
 * The same list as plain Articles: metadata only, so it can be handed to a
 * Client Component. A Body is a React component and cannot cross that boundary,
 * so anything assembling the writing index reads from here.
 */
export function getExplorableArticles(): Article[] {
  return visibleDefs().map(resolveMeta);
}

/** One explorable by slug, or undefined if absent or hidden. */
export function findExplorable(slug: string): Explorable | undefined {
  const def = visibleDefs().find((d) => d.slug === slug);
  return def ? resolve(def) : undefined;
}

/** Slugs for static param generation. */
export const EXPLORABLE_SLUGS = DEFS.filter((d) => !d.hidden).map((d) => d.slug);
