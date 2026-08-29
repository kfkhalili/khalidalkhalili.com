import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticlePage, { generateMetadata, generateStaticParams } from "./page";
import { EXPLORABLE_SLUGS } from "@/lib/explorables";
import { getEssaySlugs, getExplorable } from "@/lib/articles";
import { strings } from "@/lib/strings";

const notFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("next/navigation", () => ({ notFound, usePathname: () => "/" }));

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

async function renderArticle(slug: string) {
  return render(await ArticlePage({ params: Promise.resolve({ slug }) }));
}

describe("generateStaticParams", () => {
  it("builds a page for every essay and every explorable", () => {
    expect(generateStaticParams()).toEqual(
      [...getEssaySlugs(), ...EXPLORABLE_SLUGS].map((slug) => ({ slug })),
    );
  });
});

describe("ArticlePage", () => {
  it("renders an explorable", async () => {
    const article = getExplorable("technical-debt")!;
    const { container } = await renderArticle("technical-debt");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(article.title);
    for (const tag of article.tags) expect(screen.getByText(tag)).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", article.date);
  });

  it("renders the explorable's own interactive body", async () => {
    await renderArticle("the-third-thing");
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(screen.getAllByRole("radiogroup")).toHaveLength(4);
  });

  it("offers the way back to the writing index", async () => {
    await renderArticle("technical-debt");
    const back = screen.getByRole("link", { name: new RegExp(strings.article.back) });
    expect(back).toHaveAttribute("href", "/writing");
    expect(back.textContent).toContain("←");
  });

  it("404s on a slug that is neither essay nor explorable", async () => {
    await expect(renderArticle("no-such-article")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  it("titles the page from the article", async () => {
    const article = getExplorable("the-third-thing")!;
    expect(
      await generateMetadata({ params: Promise.resolve({ slug: "the-third-thing" }) }),
    ).toMatchObject({ title: article.title, description: article.description });
  });

  it("names the article's own address as its canonical", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "the-third-thing" }),
    });
    expect(metadata.alternates).toEqual({
      canonical: "/writing/the-third-thing",
    });
  });

  it("describes the article, not the site, for the share card", async () => {
    const article = getExplorable("technical-debt")!;
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "technical-debt" }),
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: article.title,
      url: "/writing/technical-debt",
      locale: "en_US",
      publishedTime: article.date,
      tags: article.tags,
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("is empty for an unknown slug, so the layout's defaults stand", async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ slug: "nope" }) }),
    ).toEqual({});
  });
});
