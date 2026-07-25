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
export type Collection = (typeof COLLECTIONS)[number];

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
};

function toDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ? String(value) : "";
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
      date: toDate(data.date),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      lang: String(data.lang ?? DEFAULT_LOCALE),
      featured: Boolean(data.featured),
      kind: "essay",
      collection: toCollection(data.collection),
      readingTime: Math.max(1, Math.round(words / 200)),
    },
    body,
  };
}

function essayFiles(): string[] {
  if (!fs.existsSync(WRITING_DIR)) return [];
  return fs.readdirSync(WRITING_DIR).filter((f) => f.endsWith(".md"));
}

/**
 * All writing (file-based essays + registered explorables), localized, newest
 * first. Metadata only, so the result is safe to hand to a Client Component.
 */
export function getAllArticles(lang: string): Article[] {
  const essays = essayFiles().map((f) => parseEssay(f).article);
  return [...essays, ...getExplorableArticles(lang)].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}

export function getEssaySlugs(): string[] {
  return essayFiles().map((f) => f.replace(/\.md$/, ""));
}

/** An essay's metadata plus its body rendered to HTML: one interface for the page. */
export function getEssayContent(
  slug: string,
): { article: Article; html: string } | undefined {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(WRITING_DIR, file))) return undefined;
  const { article, body } = parseEssay(file);
  return { article, html: renderMarkdown(body) };
}

export function getExplorable(
  slug: string,
  lang: string,
): Explorable | undefined {
  return findExplorable(slug, lang);
}
