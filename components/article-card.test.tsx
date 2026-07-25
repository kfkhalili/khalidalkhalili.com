import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./article-card";
import type { Article } from "@/lib/articles";

const article: Article = {
  slug: "technical-debt",
  title: "Technical Debt",
  description: "A stock-and-flow model of entropy.",
  date: "2026-02-09",
  tags: ["Explorable", "Software"],
  lang: "en",
  kind: "explorable",
  collection: "writing",
  readingTime: 6,
};

describe("ArticleCard", () => {
  it("links to the article inside the current locale", () => {
    render(<ArticleCard lang="en" article={article} />);
    expect(screen.getByRole("link")).toHaveAttribute(
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

  it("renders a machine-readable date alongside the localized one", () => {
    const { container } = render(<ArticleCard lang="en" article={article} />);
    const time = container.querySelector("time")!;
    expect(time).toHaveAttribute("dateTime", "2026-02-09");
    expect(time).toHaveTextContent("February 9, 2026");
  });

  it("writes the date and reading time in the page's language", () => {
    const { container } = render(<ArticleCard lang="de" article={article} />);
    expect(container.querySelector("time")).toHaveTextContent("9. Februar 2026");
    expect(screen.getByText("6 Min. Lesezeit")).toBeInTheDocument();
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
    expect(screen.queryByText("Explorable")).not.toBeInTheDocument();
  });
});
