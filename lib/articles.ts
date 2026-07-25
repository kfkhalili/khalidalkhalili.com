import fs from "node:fs";
import path from "node:path";
import { LOCALE_META, DEFAULT_LOCALE } from "@/lib/i18n";
import {
  getExplorables,
  findExplorable,
  type Explorable,
} from "@/lib/explorables";
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

function parseEssay(file: string): { article: Article; body: string } {
  const { meta: data, body } = readMarkdown(path.join(WRITING_DIR, file));
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    article: {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title ?? file),
      description: String(data.description ?? ""),
      date: toIsoDay(data.date),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      lang: String(data.lang ?? DEFAULT_LOCALE),
      featured: Boolean(data.featured),
      kind: "essay",
      readingTime: Math.max(1, Math.round(words / 200)),
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

/** All writing (file-based essays + registered explorables), localized. */
export function getAllArticles(lang: string): Article[] {
  return mergeWriting(
    essayFiles().map((f) => parseEssay(f).article),
    getExplorables(lang),
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

/**
 * Reading time as a localized phrase. Arabic needs full number agreement for the
 * counted noun (دقيقة / دقيقتا / دقائق / دقيقة); en and de use an invariant unit.
 * One place owns how a reading time reads in each language.
 */
export function formatReadingTime(minutes: number, lang: string): string {
  if (lang === "de") return `${minutes} Min. Lesezeit`;
  if (lang !== "ar") return `${minutes} min read`;

  switch (new Intl.PluralRules("ar").select(minutes)) {
    case "one":
      return "دقيقة قراءة";
    case "two":
      return "دقيقتان قراءة";
    case "few":
      return `${minutes} دقائق قراءة`;
    default:
      return `${minutes} دقيقة قراءة`; // many (11–99), other (0, 100+)
  }
}
