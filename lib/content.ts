import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ContentMeta = Record<string, string>;

/**
 * Read content/<locale>/<slug>.md, falling back to the default locale when a
 * translation for this locale doesn't exist yet.
 */
export function readContent(
  locale: string,
  slug: string,
): { meta: ContentMeta; body: string } {
  let file = path.join(CONTENT_DIR, locale, `${slug}.md`);
  if (!fs.existsSync(file)) {
    file = path.join(CONTENT_DIR, DEFAULT_LOCALE, `${slug}.md`);
  }
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { meta: data as ContentMeta, body: content.trim() };
}

// Content is our own trusted files, so rendering straight to HTML is safe.
function withExternalLinks(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  );
}

/** Block markdown → HTML (paragraphs, lists, links, emphasis). */
export function renderMarkdown(md: string): string {
  return withExternalLinks(marked.parse(md) as string);
}

/** Inline markdown → HTML with no wrapping <p>, for a single styled line. */
export function renderInline(md: string): string {
  return withExternalLinks(marked.parseInline(md) as string);
}
