import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./article-card";
import type { Article } from "@/lib/articles";

const article: Article = {
  slug: "technical-debt",
  title: "Technical Debt",
  description: "A stock-and-flow model of entropy.",
  date: "2026-02-09",
  tags: ["Software Design", "Systems"],
  lang: "en",
  kind: "explorable",
  collection: "writing",
  readingTime: 6,
};

describe("ArticleCard", () => {
  it("links to the article inside the current locale", () => {
    render(<ArticleCard lang="en" article={article} />);
    expect(screen.getByRole("link", { name: /Technical Debt/ })).toHaveAttribute(
      "href",
      "/en/writing/technical-debt",
    );
  });

  it("shows the title and description", () => {
    render(<ArticleCard lang="en" article={article} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Technical Debt");
    expect(screen.getByText(article.description)).toBeInTheDocument();
  });

  it("lists every tag", () => {
    render(<ArticleCard lang="en" article={article} />);
    for (const tag of article.tags) expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it("sends each tag to the index narrowed to it, in the current locale", () => {
    render(<ArticleCard lang="de" article={article} />);
    expect(screen.getByRole("link", { name: "Software Design" })).toHaveAttribute(
      "href",
      "/de/writing?tag=Software%20Design",
    );
  });

  it("keeps the tag links out of the article link", () => {
    // An anchor inside an anchor is not renderable, so the card is a div with
    // two destinations rather than one link wrapping the badge row.
    const { container } = render(<ArticleCard lang="en" article={article} />);
    expect(container.querySelector("a a")).toBeNull();
  });

  it("renders a machine-readable date alongside the localized one", () => {
    const { container } = render(<ArticleCard lang="en" article={article} />);
    const time = container.querySelector("time")!;
    expect(time).toHaveAttribute("dateTime", "2026-02-09");
    expect(time).toHaveTextContent("February 9, 2026");
  });

  it("writes the byline in the article's language, not the page's", () => {
    // An English piece listed on the German index still dates itself in English:
    // the date belongs to the writing, and the badge below says the language
    // differs. Reading the page's locale here is what once had one essay dated
    // three different ways across the index, its own page and its share card.
    const { container } = render(<ArticleCard lang="de" article={article} />);
    expect(container.querySelector("time")).toHaveTextContent("February 9, 2026");
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });

  it("follows the article into Arabic, wherever it is listed", () => {
    const arabic = { ...article, lang: "ar" };
    const { container } = render(<ArticleCard lang="en" article={arabic} />);
    expect(container.querySelector("time")).toHaveTextContent("9 فبراير 2026");
    expect(screen.getByText("6 دقائق قراءة")).toBeInTheDocument();
  });

  it("flags an article written in another language", () => {
    render(<ArticleCard lang="de" article={article} />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("stays quiet when the article matches the page language", () => {
    render(<ArticleCard lang="en" article={article} />);
    expect(screen.queryByText("English")).not.toBeInTheDocument();
    expect(screen.getAllByText(/./, { selector: "span" }).length).toBeGreaterThan(0);
  });

  it("renders an untagged article without an empty badge row", () => {
    render(<ArticleCard lang="en" article={{ ...article, tags: [] }} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("Software Design")).not.toBeInTheDocument();
  });
});
