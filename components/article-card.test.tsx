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
  kind: "explorable",
  collection: "writing",
  readingTime: 6,
};

describe("ArticleCard", () => {
  it("links to the article", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByRole("link", { name: /Technical Debt/ })).toHaveAttribute(
      "href",
      "/writing/technical-debt",
    );
  });

  it("shows the title and description", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Technical Debt");
    expect(screen.getByText(article.description)).toBeInTheDocument();
  });

  it("lists every tag", () => {
    render(<ArticleCard article={article} />);
    for (const tag of article.tags) expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it("sends each tag to the index narrowed to it", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByRole("link", { name: "Software Design" })).toHaveAttribute(
      "href",
      "/writing?tag=Software%20Design",
    );
  });

  it("keeps the tag links out of the article link", () => {
    // An anchor inside an anchor is not renderable, so the card is a div with
    // two destinations rather than one link wrapping the badge row.
    const { container } = render(<ArticleCard article={article} />);
    expect(container.querySelector("a a")).toBeNull();
  });

  it("renders a machine-readable date alongside the formatted one", () => {
    const { container } = render(<ArticleCard article={article} />);
    const time = container.querySelector("time")!;
    expect(time).toHaveAttribute("dateTime", "2026-02-09");
    expect(time).toHaveTextContent("February 9, 2026");
  });

  it("shows the reading time", () => {
    render(<ArticleCard article={article} />);
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });

  it("renders an untagged article without an empty badge row", () => {
    render(<ArticleCard article={{ ...article, tags: [] }} />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("Software Design")).not.toBeInTheDocument();
  });
});
