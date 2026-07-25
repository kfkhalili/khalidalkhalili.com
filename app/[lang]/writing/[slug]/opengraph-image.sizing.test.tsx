import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Article } from "@/lib/articles";

/**
 * How the card fits text it was not designed around: the title steps down a
 * size rather than wrapping into the description, and both are clamped. The
 * registered explorables are all comfortably short, so the articles here are
 * built to the lengths those rules turn on.
 */
const captured = vi.hoisted(() => ({ element: null as ReactElement | null }));
const getExplorable = vi.hoisted(() => vi.fn<() => Article | undefined>());

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(element: ReactElement) {
      captured.element = element;
    }
  },
}));

vi.mock("@/lib/articles", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/articles")>()),
  getEssayContent: () => undefined,
  getExplorable,
}));

const Image = (await import("./opengraph-image")).default;

const article = (over: Partial<Article> = {}): Article => ({
  slug: "a",
  title: "Short Title",
  description: "A description.",
  date: "2026-02-09",
  tags: [],
  lang: "en",
  kind: "explorable",
  collection: "writing",
  readingTime: 6,
  ...over,
});

async function card(over: Partial<Article> = {}, lang = "en") {
  getExplorable.mockReturnValue(article(over));
  await Image({ params: Promise.resolve({ lang, slug: "a" }) });
  return renderToStaticMarkup(captured.element!);
}

/** The title's font size, read off the element that carries the title text. */
function titleSize(html: string, title: string): number {
  const at = html.indexOf(title.slice(0, 20));
  const before = html.slice(0, at);
  const sizes = [...before.matchAll(/font-size:(\d+)px/g)];
  return Number(sizes.at(-1)![1]);
}

beforeEach(() => {
  captured.element = null;
  getExplorable.mockReset();
});

describe("title sizing", () => {
  it("sets a short title at full size", async () => {
    const title = "The Third Thing"; // 15
    expect(titleSize(await card({ title }), title)).toBe(68);
  });

  it("steps down once for a title that would not fit", async () => {
    const title = "A Title That Runs Past Thirty Eight Characters"; // 45
    expect(title.length).toBeGreaterThan(38);
    expect(titleSize(await card({ title }), title)).toBe(56);
  });

  it("steps down again for a title longer still", async () => {
    const title =
      "A Title So Long That It Runs Well Past Seventy Two Characters And Then Some More";
    expect(title.length).toBeGreaterThan(72);
    expect(titleSize(await card({ title }), title)).toBe(46);
  });
});

describe("clamping", () => {
  it("leaves text that already fits alone", async () => {
    const description = "Short enough.";
    const html = await card({ description });
    expect(html).toContain(description);
    expect(html).not.toContain("…");
  });

  it("cuts a long description back to a word boundary", async () => {
    const description = `${"word ".repeat(40)}end`;
    const html = await card({ description });

    expect(html).toContain("…");
    // Nothing is cut mid-word: the ellipsis follows a whole word.
    expect(html).not.toMatch(/wor…/);
  });

  it("cuts mid-word only when there is no boundary late enough to use", async () => {
    // One unbroken run: a word boundary near the start would throw most of the
    // line away, so the hard cut is the better of two bad options.
    const description = "x".repeat(200);
    const html = await card({ description });
    expect(html).toContain(`${"x".repeat(129)}…`);
  });

  it("clamps an over-long title too", async () => {
    const title = `${"Title ".repeat(30)}end`;
    const html = await card({ title });
    expect(html).toContain("…");
  });
});
