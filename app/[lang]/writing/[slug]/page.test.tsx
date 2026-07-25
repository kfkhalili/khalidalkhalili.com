import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticlePage, { generateMetadata, generateStaticParams } from "./page";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { getExplorable } from "@/lib/articles";
import { LOCALES } from "@/lib/i18n";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";

const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("next/navigation", () => ({ notFound, usePathname: () => "/en" }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function renderArticle(lang: string, slug: string) {
  return render(await ArticlePage({ params: Promise.resolve({ lang, slug }) }));
}

describe("generateStaticParams", () => {
  it("builds a page for every explorable", () => {
    expect(generateStaticParams()).toEqual(EXPLORABLE_SLUGS.map((slug) => ({ slug })));
  });
});

describe("ArticlePage", () => {
  it.each(LOCALES)("renders an explorable in %s", async (lang) => {
    const article = getExplorable("technical-debt", lang)!;
    const { container } = await renderArticle(lang, "technical-debt");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(article.title);
    for (const tag of article.tags) expect(screen.getByText(tag)).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", article.date);
  });

  it("renders the explorable's own interactive body", async () => {
    await renderArticle("en", "the-third-thing");
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(screen.getAllByRole("radiogroup")).toHaveLength(4);
  });

  it("offers the way back to the writing index, in the reader's language", async () => {
    await renderArticle("ar", "technical-debt");
    const back = screen.getByRole("link", { name: new RegExp(ar.article.back) });
    expect(back).toHaveAttribute("href", "/ar/writing");
    // The arrow points back the way Arabic reads.
    expect(back.textContent).toContain("→");
  });

  it("points the back arrow the other way in a left-to-right locale", async () => {
    await renderArticle("en", "technical-debt");
    expect(
      screen.getByRole("link", { name: new RegExp(en.article.back) }).textContent,
    ).toContain("←");
  });

  it("sets the article's own language and direction on its body", async () => {
    const { container } = await renderArticle("ar", "technical-debt");
    const body = container.querySelector("[lang]")!;
    expect(body).toHaveAttribute("lang", "ar");
    expect(body).toHaveAttribute("dir", "rtl");
  });

  it("does not badge an article that matches the page language", async () => {
    await renderArticle("de", "technical-debt");
    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });

  it("404s on a slug that is neither essay nor explorable", async () => {
    await expect(renderArticle("en", "no-such-article")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  it("titles the page from the article, in the requested language", async () => {
    for (const lang of LOCALES) {
      const article = getExplorable("the-third-thing", lang)!;
      expect(
        await generateMetadata({ params: Promise.resolve({ lang, slug: "the-third-thing" }) }),
      ).toEqual({ title: article.title, description: article.description });
    }
  });

  it("is empty for an unknown slug, so the layout's defaults stand", async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lang: "en", slug: "nope" }) }),
    ).toEqual({});
  });
});
