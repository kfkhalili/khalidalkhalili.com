import fs from "node:fs";
import path from "node:path";
import { LOCALE_META, DEFAULT_LOCALE } from "@/lib/i18n";
import { EXPLORABLES } from "@/lib/explorables";
import { readMarkdown, renderMarkdown } from "@/lib/content";

const WRITING_DIR = path.join(process.cwd(), "content/writing");

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  tags: string[];
  lang: string;
  featured?: boolean;
  kind: "essay" | "explorable";
  readingTime: number; // minutes
};

function toDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ? String(value) : "";
}

function parseEssay(file: string): { article: Article; body: string } {
  const { meta: data, body } = readMarkdown(path.join(WRITING_DIR, file));
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    article: {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title ?? file),
      description: String(data.description ?? ""),
      date: toDate(data.date),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      lang: String(data.lang ?? DEFAULT_LOCALE),
      featured: Boolean(data.featured),
      kind: "essay",
      readingTime: Math.max(1, Math.round(words / 200)),
    },
    body,
  };
}

function essayFiles(): string[] {
  if (!fs.existsSync(WRITING_DIR)) return [];
  return fs.readdirSync(WRITING_DIR).filter((f) => f.endsWith(".md"));
}

/** All writing (file-based essays + registered explorables), newest first. */
export function getAllArticles(): Article[] {
  const essays = essayFiles().map((f) => parseEssay(f).article);
  return [...essays, ...EXPLORABLES].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}

export function getEssaySlugs(): string[] {
  return essayFiles().map((f) => f.replace(/\.md$/, ""));
}

/** An essay's metadata plus its body rendered to HTML — one interface for the page. */
export function getEssayContent(
  slug: string,
): { article: Article; html: string } | undefined {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(WRITING_DIR, file))) return undefined;
  const { article, body } = parseEssay(file);
  return { article, html: renderMarkdown(body) };
}

export function getExplorable(slug: string): Article | undefined {
  return EXPLORABLES.find((e) => e.slug === slug);
}

export function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const dateLocale =
    LOCALE_META[lang as keyof typeof LOCALE_META]?.dateLocale ?? "en-US";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
