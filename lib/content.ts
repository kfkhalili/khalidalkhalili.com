import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ContentMeta = Record<string, string>;

/** The one primitive: read a markdown file → frontmatter + trimmed body. */
export function readMarkdown(absPath: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const { data, content } = matter(fs.readFileSync(absPath, "utf8"));
  return { meta: data, body: content.trim() };
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

/**
 * Page copy: content/<slug>.md. Returns frontmatter, the raw body, and the
 * body rendered to HTML.
 */
export function readContent(slug: string): {
  meta: ContentMeta;
  body: string;
  html: string;
} {
  const { meta, body } = readMarkdown(path.join(CONTENT_DIR, `${slug}.md`));
  return { meta: meta as ContentMeta, body, html: renderMarkdown(body) };
}
