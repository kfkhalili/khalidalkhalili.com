import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WritingList, type Chip, type TagChip } from "./writing-list";
import type { Article } from "@/lib/articles";

const article = (slug: string, collection: string, title = slug): Article => ({
  slug,
  title,
  description: `About ${title}.`,
  date: "2026-02-09",
  tags: ["Software"],
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

/**
 * As the writing route builds them: "all" first, then one per tag, counted over
 * the whole index. `active` is the only thing that moves as the URL changes.
 */
const tagChipsFor = (active: string): TagChip[] =>
  [
    { key: "all", label: "All", count: 3, href: "/en/writing" },
    { key: "Software", label: "Software", count: 2, href: "/en/writing?tag=Software" },
    { key: "Systems", label: "Systems", count: 1, href: "/en/writing?tag=Systems" },
  ].map((c) => ({ ...c, active: c.key === active }));

const titles = () =>
  screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

/** The tag row, which shares its "All" label with the collection row. */
const tagRow = () => within(screen.getByRole("group", { name: "Filter by tag" }));

const renderList = (over: Partial<Parameters<typeof WritingList>[0]> = {}) =>
  render(
    <WritingList
      articles={articles}
      chips={chips}
      tagChips={tagChipsFor("all")}
      filterLabel="Filter by collection"
      tagLabel="Filter by tag"
      emptyLabel="Nothing here matches that yet."
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

  it("offers a link per tag, each carrying its count", () => {
    renderList();
    for (const chip of tagChipsFor("all")) {
      expect(
        tagRow().getByRole("link", { name: new RegExp(`${chip.label}\\s*${chip.count}`) }),
      ).toHaveAttribute("href", chip.href);
    }
  });

  it("offers the same tags whichever one is in force", () => {
    // The row is the reason the articles below it do not move when a tag is
    // chosen: it describes the whole index, so it cannot shrink to the one tag
    // already chosen, or grow back when the reader leaves it.
    const unfiltered = renderList();
    const before = tagRow()
      .getAllByRole("link")
      .map((l) => l.textContent);
    unfiltered.unmount();

    renderList({
      articles: articles.slice(0, 2),
      tagChips: tagChipsFor("Software"),
    });
    expect(tagRow().getAllByRole("link").map((l) => l.textContent)).toEqual(before);
  });

  it("marks the tag the URL is at, and only that one", () => {
    renderList({ tagChips: tagChipsFor("Software") });
    const software = tagRow().getByRole("link", { name: /Software/ });
    const all = tagRow().getByRole("link", { name: /All/ });

    expect(software).toHaveAttribute("aria-current", "page");
    expect(software.className).toContain("border-accent/60");
    expect(all).not.toHaveAttribute("aria-current");
    expect(all.className).toContain("border-border");
  });

  it("opens on the 'all' tag chip when the URL names no tag", () => {
    renderList();
    expect(tagRow().getByRole("link", { name: /All/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("says so when the filters meet on nothing, rather than showing a blank shelf", () => {
    renderList({ articles: [], tagChips: tagChipsFor("Software") });
    expect(screen.getByText("Nothing here matches that yet.")).toBeInTheDocument();
    // The rows have to survive the empty shelf: they are the way back out.
    expect(tagRow().getByRole("link", { name: /All/ })).toBeInTheDocument();
  });

  it("hides the tag row when there is only one tag to choose", () => {
    renderList({
      tagChips: tagChipsFor("all").slice(0, 2),
    });
    expect(screen.queryByRole("group", { name: "Filter by tag" })).not.toBeInTheDocument();
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
