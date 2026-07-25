import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import {
  getExplorableArticles,
  findExplorable,
  type Explorable,
} from "@/lib/explorables";
import { readMarkdown, renderMarkdown } from "@/lib/content";

const WRITING_DIR = path.join(process.cwd(), "content/writing");

/**
 * Which body of work a piece belongs to. `kind` says how a piece is rendered;
 * `collection` says where it came from, which is what the reader is choosing
 * between on the writing index.
 */
export const COLLECTIONS = ["writing", "prose"] as const;
type Collection = (typeof COLLECTIONS)[number];

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  tags: string[];
  lang: string;
  featured?: boolean;
  kind: "essay" | "explorable";
  collection: Collection;
  readingTime: number; // minutes
  /**
   * Kept in the repo but off the site: absent from the index, the home page,
   * the sitemap, and the share card, and its URL is not built at all, so it
   * 404s rather than staying quietly reachable. Filtered at the registries
   * below, so a hidden piece never reaches a page to be filtered out again.
   */
  hidden?: boolean;
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Frontmatter to an ISO day, or "" for anything else.
 *
 * YAML hands back a Date for an unquoted `2026-07-05` and a string when it's
 * quoted, so both are accepted. Everything else is refused rather than passed
 * through: an undated article is a case every reader of this field already
 * handles, whereas `July 5, 2026` would sort wrongly in the sitemap, and a date
 * containing `&` would make the sitemap XML unparseable in its entirety, since
 * Next interpolates it raw.
 */
export function toIsoDay(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  }
  const text = value ? String(value) : "";
  if (!ISO_DAY.test(text)) return "";
  // Shape is not enough: "2026-99-99" is four-two-two digits and not a day.
  // Round-tripping through Date proves it names one.
  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10) === text ? text : "";
}

/**
 * A piece's opening, for when no description is written. Short prose is often
 * too short to summarize without giving away its turn, and its first line is
 * already the invitation, so the piece introduces itself in the author's voice.
 *
 * Takes whole sentences from the first paragraph up to roughly a meta
 * description's worth, always keeping at least one.
 */
const DESCRIPTION_BUDGET = 160;

function openingLine(body: string): string {
  const first = body.split(/\n\s*\n/)[0] ?? "";
  const plain = first
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";

  const sentences = plain.match(/[^.!?]+(?:[.!?]+["”’)]*|$)/g) ?? [plain];
  let out = sentences[0].trim();
  for (const s of sentences.slice(1)) {
    if (out.length + s.trim().length + 1 > DESCRIPTION_BUDGET) break;
    out = `${out} ${s.trim()}`;
  }

  if (out.length > DESCRIPTION_BUDGET * 1.25) {
    const cut = out.slice(0, DESCRIPTION_BUDGET);
    out = `${cut.slice(0, cut.lastIndexOf(" "))}…`;
  }
  return trimDanglingQuote(out);
}

/**
 * A piece that opens mid-quotation (a monologue, a remembered line) leaves its
 * opening mark stranded once the excerpt ends before the close. Balanced quotes
 * are left alone.
 */
function trimDanglingQuote(s: string): string {
  if (s.startsWith('"')) return (s.split('"').length - 1) % 2 ? s.slice(1) : s;
  if (s.startsWith("“")) return s.includes("”") ? s : s.slice(1);
  return s;
}

function toCollection(value: unknown): Collection {
  const v = String(value ?? "");
  return (COLLECTIONS as readonly string[]).includes(v)
    ? (v as Collection)
    : "writing";
}

function parseEssay(file: string): { article: Article; body: string } {
  const { meta: data, body } = readMarkdown(path.join(WRITING_DIR, file));
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    article: {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title ?? file),
      description: String(data.description ?? "") || openingLine(body),
      date: toIsoDay(data.date),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      lang: String(data.lang ?? DEFAULT_LOCALE),
      featured: Boolean(data.featured),
      kind: "essay",
      collection: toCollection(data.collection),
      readingTime: Math.max(1, Math.round(words / 200)),
      hidden: data.hidden === true,
    },
    body,
  };
}

// A filename becomes a slug, and a slug becomes a URL in the sitemap, which
// Next writes without escaping. So `speed & correctness.md` would not merely
// break its own entry, it would make the whole sitemap unparseable. Refusing
// the filename at the build is louder and easier to fix than that.
const ESSAY_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

/** Is this filename safe to become a slug, and therefore a sitemap URL? */
export function isEssayFile(name: string): boolean {
  return ESSAY_FILE.test(name);
}

function essayFiles(): string[] {
  if (!fs.existsSync(WRITING_DIR)) return [];
  return fs
    .readdirSync(WRITING_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      if (!isEssayFile(f)) {
        throw new Error(
          `content/writing/${f}: essay filenames must be kebab-case, e.g. my-essay.md`,
        );
      }
      return f;
    });
}

/**
 * The writing index in the order it is read: newest first, and an essay
 * shadowing an explorable that shares its slug.
 *
 * Shadowing is the rule the article route already follows when it renders one
 * (`essay ?? explorable`). Stating it here, on the pure transform, means the
 * index, the sitemap, and the page cannot disagree about which article a URL is.
 */
export function mergeWriting(
  essays: Article[],
  explorables: Article[],
): Article[] {
  const shadowed = new Set(essays.map((a) => a.slug));
  return [...essays, ...explorables.filter((e) => !shadowed.has(e.slug))].sort(
    (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
  );
}

/** Every essay the site shows: parsed from disk, hidden ones dropped. */
function visibleEssays(): Article[] {
  return essayFiles()
    .map((f) => parseEssay(f).article)
    .filter((a) => !a.hidden);
}

/**
 * All writing (file-based essays + registered explorables), localized. Metadata
 * only, so the result is safe to hand to a Client Component.
 */
export function getAllArticles(lang: string): Article[] {
  return mergeWriting(visibleEssays(), getExplorableArticles(lang));
}

/** Slugs to build pages for. A hidden essay gets none, so its URL 404s. */
export function getEssaySlugs(): string[] {
  return visibleEssays().map((a) => a.slug);
}

/**
 * An essay's metadata plus its body rendered to HTML: one interface for the
 * page. A hidden essay reads as absent, which is what makes its route 404 and
 * keeps it out of the metadata and the share card.
 */
export function getEssayContent(
  slug: string,
): { article: Article; html: string } | undefined {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(WRITING_DIR, file))) return undefined;
  const { article, body } = parseEssay(file);
  if (article.hidden) return undefined;
  return { article, html: renderMarkdown(body) };
}

export function getExplorable(
  slug: string,
  lang: string,
): Explorable | undefined {
  return findExplorable(slug, lang);
}
