import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WritingList, type Chip } from "./writing-list";
import type { Article } from "@/lib/articles";

const article = (slug: string, collection: string, title = slug): Article => ({
  slug,
  title,
  description: `About ${title}.`,
  date: "2026-02-09",
  tags: ["Software"],
  lang: "en",
  kind: "essay",
  collection: collection as Article["collection"],
  readingTime: 6,
});

const articles: Article[] = [
  article("technical-debt", "writing", "Technical Debt"),
  article("the-third-thing", "writing", "The Third Thing"),
  article("a-quiet-room", "prose", "A Quiet Room"),
];

/** As the writing route builds them: "all" first, then one per collection. */
const chips: Chip[] = [
  { key: "all", label: "All", count: 3 },
  { key: "writing", label: "Writing", count: 2 },
  { key: "prose", label: "Prose", count: 1 },
];

const titles = () =>
  screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

const renderList = (over: Partial<Parameters<typeof WritingList>[0]> = {}) =>
  render(
    <WritingList
      lang="en"
      articles={articles}
      chips={chips}
      filterLabel="Filter by collection"
      {...over}
    />,
  );

describe("WritingList", () => {
  it("opens on every article, whichever collection it came from", () => {
    renderList();
    expect(titles()).toEqual(["Technical Debt", "The Third Thing", "A Quiet Room"]);
  });

  it("offers a chip per collection, each carrying its count", () => {
    renderList();
    const group = screen.getByRole("group", { name: "Filter by collection" });
    expect(group).toBeInTheDocument();
    for (const chip of chips) {
      expect(screen.getByRole("button", { name: new RegExp(chip.label) })).toBeInTheDocument();
    }
  });

  it("narrows the shelf to one collection", async () => {
    renderList();
    await userEvent.click(screen.getByRole("button", { name: /Prose/ }));
    expect(titles()).toEqual(["A Quiet Room"]);
  });

  it("goes back to everything", async () => {
    renderList();
    await userEvent.click(screen.getByRole("button", { name: /Prose/ }));
    await userEvent.click(screen.getByRole("button", { name: /All/ }));
    expect(titles()).toHaveLength(3);
  });

  it("marks only the chosen chip as pressed", async () => {
    renderList();
    const prose = screen.getByRole("button", { name: /Prose/ });
    const all = screen.getByRole("button", { name: /All/ });

    // "all" is the collection the list opens on.
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(prose).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(prose);
    expect(prose).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");
  });

  it("styles the chosen chip apart from the rest", async () => {
    renderList();
    const prose = screen.getByRole("button", { name: /Prose/ });
    expect(prose.className).toContain("border-border");

    await userEvent.click(prose);
    expect(prose.className).toContain("border-accent/60");
  });

  it("hides the chips when there is only one collection to choose", () => {
    // "all" plus a single collection is not a choice, so the row is not worth
    // the reader's attention.
    renderList({
      articles: articles.filter((a) => a.collection === "writing"),
      chips: [
        { key: "all", label: "All", count: 2 },
        { key: "writing", label: "Writing", count: 2 },
      ],
    });
    expect(screen.queryByRole("group", { name: "Filter by collection" })).not.toBeInTheDocument();
    expect(titles()).toHaveLength(2);
  });
});
