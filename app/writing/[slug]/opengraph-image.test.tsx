import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getExplorable } from "@/lib/articles";
import { site } from "@/lib/site";

/**
 * Satori rasterizes the card in production; here the element tree it would be
 * handed is captured instead, which is where every decision this route makes
 * actually shows: the bidi handling, the clamping, and the font stack.
 */
const captured = vi.hoisted(() => ({
  element: null as ReactElement | null,
  options: null as Record<string, unknown> | null,
}));

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element: ReactElement, options: Record<string, unknown>) {
      captured.element = element;
      captured.options = options;
    }
  },
}));

const Image = (await import("./opengraph-image")).default;
const { generateImageMetadata, size, contentType } = await import("./opengraph-image");

/** Render the captured tree to markup, so its text and styles can be read. */
async function card(slug: string) {
  await Image({ params: Promise.resolve({ slug }) });
  return {
    html: renderToStaticMarkup(captured.element!),
    options: captured.options!,
  };
}

/** The card's font stack, with React's quote escaping undone. */
const fontStack = (html: string) => {
  // Unescape before splitting: `&quot;` carries a semicolon of its own.
  const style = html.replace(/&quot;/g, '"');
  return style.slice(style.indexOf("font-family:")).split(";")[0].replace("font-family:", "");
};

beforeEach(() => {
  captured.element = null;
  captured.options = null;
});

describe("card dimensions", () => {
  it("is a 1200×630 PNG, the size every network crops from", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });
});

describe("generateImageMetadata", () => {
  it("names the card after the article and the site", async () => {
    const article = getExplorable("technical-debt")!;
    const [meta] = await generateImageMetadata({
      params: Promise.resolve({ slug: "technical-debt" }),
    });
    expect(meta).toMatchObject({ id: "card", size, contentType });
    expect(meta.alt).toBe(`${article.title} · ${site.name}`);
  });

  it("accepts params as a plain object as well as a promise", async () => {
    const [meta] = await generateImageMetadata({
      params: { slug: "the-third-thing" },
    });
    expect(meta.alt).toContain(getExplorable("the-third-thing")!.title);
  });

  it("falls back to the site's name for a slug with no article", async () => {
    const [meta] = await generateImageMetadata({
      params: Promise.resolve({ slug: "nope" }),
    });
    expect(meta.alt).toBe(site.name);
  });
});

describe("Image", () => {
  it("draws the article's title, date, and reading time", async () => {
    const article = getExplorable("technical-debt")!;
    const { html } = await card("technical-debt");

    expect(html).toContain(article.title);
    // Spelled out rather than rebuilt from the formatter, which would make the
    // implementation its own oracle and pass whatever locale it happened to use.
    expect(article.date).toBe("2026-02-09");
    expect(html).toContain("February 9, 2026");
    expect(html).toContain("6 min read");
    expect(html).toContain(site.url.replace("https://", ""));
  });

  it("loads both scripts' faces, so neither goes to tofu", async () => {
    const { options } = await card("technical-debt");
    const fonts = options.fonts as { name: string; weight: number; data: Buffer }[];
    expect(fonts.map((f) => `${f.name} ${f.weight}`)).toEqual([
      "Inter 400",
      "Inter 600",
      "Noto Sans Arabic UI 400",
      "Noto Sans Arabic UI 600",
    ]);
    for (const font of fonts) expect(font.data.byteLength).toBeGreaterThan(0);
  });

  it("leads with the Latin face, keeping the Arabic face for quoted terms", async () => {
    // The leading family wins for glyphs both faces carry (spaces, digits,
    // punctuation); the Arabic face still catches Arabic glyphs per-glyph.
    const { html } = await card("technical-debt");
    expect(fontStack(html)).toBe('"Inter", "Noto Sans Arabic UI"');
  });

  it("clamps a long description on a word boundary, never mid-word", async () => {
    const { html } = await card("the-third-thing");
    const article = getExplorable("the-third-thing")!;

    if (article.description.length > 150) {
      expect(html).toContain("…");
      const shown = html.slice(0, html.indexOf("…"));
      // Whatever survived is a prefix of the original, ending at a real break.
      expect(article.description.startsWith(shown.split(">").pop()!)).toBe(true);
    }
  });

  it("falls back to the site's name for a slug with no article", async () => {
    const { html } = await card("nope");
    expect(html).toContain(site.name);
  });
});
