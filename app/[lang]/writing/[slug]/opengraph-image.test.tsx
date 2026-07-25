import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getExplorable, formatDate, formatReadingTime } from "@/lib/articles";
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
async function card(lang: string, slug: string) {
  await Image({ params: Promise.resolve({ lang, slug }) });
  return {
    html: renderToStaticMarkup(captured.element!),
    options: captured.options!,
  };
}

/** Satori is handed no-break spaces inside a reversed run; read past them. */
const words = (html: string) => html.replace(/ /g, " ");

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
    const article = getExplorable("technical-debt", "en")!;
    const [meta] = await generateImageMetadata({
      params: Promise.resolve({ lang: "en", slug: "technical-debt" }),
    });
    expect(meta).toMatchObject({ id: "card", size, contentType });
    expect(meta.alt).toBe(`${article.title} · ${site.name}`);
  });

  it("accepts params as a plain object as well as a promise", async () => {
    const [meta] = await generateImageMetadata({
      params: { lang: "de", slug: "the-third-thing" },
    });
    expect(meta.alt).toContain(getExplorable("the-third-thing", "de")!.title);
  });

  it("falls back to the site's name for a slug with no article", async () => {
    const [meta] = await generateImageMetadata({
      params: Promise.resolve({ lang: "en", slug: "nope" }),
    });
    expect(meta.alt).toBe(site.name);
  });
});

describe("Image", () => {
  it("draws the article's title, date, and reading time", async () => {
    const article = getExplorable("technical-debt", "en")!;
    const { html } = await card("en", "technical-debt");

    expect(html).toContain(article.title);
    expect(html).toContain(formatDate(article.date, "en"));
    expect(html).toContain(formatReadingTime(article.readingTime, "en"));
    expect(html).toContain(site.url.replace("https://", ""));
  });

  it("loads both scripts' faces, so neither goes to tofu", async () => {
    const { options } = await card("en", "technical-debt");
    const fonts = options.fonts as { name: string; weight: number; data: Buffer }[];
    expect(fonts.map((f) => `${f.name} ${f.weight}`)).toEqual([
      "Inter 400",
      "Inter 600",
      "Noto Sans Arabic UI 400",
      "Noto Sans Arabic UI 600",
    ]);
    for (const font of fonts) expect(font.data.byteLength).toBeGreaterThan(0);
  });

  it("leads with the face the card's own script belongs to", async () => {
    // The leading family wins for glyphs both faces carry (spaces, digits,
    // punctuation), so the order is what sets each card in its own script.
    const ltr = await card("en", "technical-debt");
    expect(fontStack(ltr.html)).toBe('"Inter", "Noto Sans Arabic UI"');

    const rtl = await card("ar", "technical-debt");
    expect(fontStack(rtl.html)).toBe('"Noto Sans Arabic UI", "Inter"');
  });

  it("lays an Arabic card out right to left", async () => {
    const { html } = await card("ar", "technical-debt");
    expect(html).toContain("align-items:flex-end");
    expect(html).toContain("flex-direction:column");
  });

  it("reverses Arabic word order, because satori has no bidi engine", async () => {
    const article = getExplorable("technical-debt", "ar")!;
    const { html } = await card("ar", "technical-debt");

    // The title's words appear, but not in the order they are written.
    const written = article.title.split(/\s+/).filter(Boolean);
    for (const word of written) expect(words(html)).toContain(word);
    if (written.length > 1) expect(html).not.toContain(article.title);
  });

  it("joins a reversed run with no-break spaces, so nothing re-breaks it", async () => {
    const { html } = await card("ar", "technical-debt");
    expect(html).toContain(" ");
  });

  it("leaves a left-to-right card's words alone", async () => {
    const article = getExplorable("technical-debt", "en")!;
    const { html } = await card("en", "technical-debt");
    expect(html).toContain(article.title);
    expect(html).not.toContain(" ");
  });

  it("clamps a long description on a word boundary, never mid-word", async () => {
    const { html } = await card("en", "the-third-thing");
    const article = getExplorable("the-third-thing", "en")!;

    if (article.description.length > 150) {
      expect(html).toContain("…");
      const shown = html.slice(0, html.indexOf("…"));
      // Whatever survived is a prefix of the original, ending at a real break.
      expect(article.description.startsWith(shown.split(">").pop()!)).toBe(true);
    }
  });

  it("falls back to the site's name for a slug with no article", async () => {
    const { html } = await card("en", "nope");
    expect(html).toContain(site.name);
  });

  it("draws a card for an unknown language rather than failing", async () => {
    const { html } = await card("fr", "technical-debt");
    expect(html).toContain(getExplorable("technical-debt", "en")!.title);
  });
});
