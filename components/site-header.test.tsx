import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./site-header";
import { strings } from "@/lib/strings";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

const nav = strings.nav;
const menuButton = () => screen.getByRole("button", { name: "Menu" });

beforeEach(() => {
  pathname = "/";
});

describe("SiteHeader", () => {
  it("is a banner landmark pinned to the top", () => {
    const { container } = render(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain("sticky");
  });

  it("takes the wordmark home", () => {
    render(<SiteHeader />);
    const wordmark = screen.getByRole("link", { name: "khalid." });
    expect(wordmark).toHaveAttribute("href", "/");
  });

  it("links every section", () => {
    render(<SiteHeader />);
    for (const [section, label] of Object.entries(nav)) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        `/${section}`,
      );
    }
  });

  it("marks the section the reader is in", () => {
    pathname = "/writing";
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: nav.writing }).className).toContain(
      "text-foreground",
    );
    expect(screen.getByRole("link", { name: nav.reading }).className).toContain(
      "text-muted",
    );
  });

  it("keeps the section marked while reading something inside it", () => {
    pathname = "/writing/technical-debt";
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: nav.writing }).className).toContain(
      "text-foreground",
    );
  });

  it("does not mark a section whose path merely shares a prefix", () => {
    pathname = "/writings-elsewhere";
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: nav.writing }).className).toContain("text-muted");
  });

  it("carries the theme toggle", () => {
    render(<SiteHeader />);
    expect(screen.getAllByRole("button", { name: /theme/i }).length).toBeGreaterThan(0);
  });

  it("keeps the mobile panel closed until asked", () => {
    render(<SiteHeader />);
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: nav.writing })).toHaveLength(1);
  });

  it("opens the mobile panel, duplicating the nav", async () => {
    render(<SiteHeader />);
    await userEvent.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: nav.writing })).toHaveLength(2);
  });

  it("closes the panel when the button is pressed again", async () => {
    render(<SiteHeader />);
    await userEvent.click(menuButton());
    await userEvent.click(menuButton());
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: nav.writing })).toHaveLength(1);
  });

  it("closes the panel when the wordmark takes the reader home", async () => {
    render(<SiteHeader />);
    await userEvent.click(menuButton());
    await userEvent.click(screen.getByRole("link", { name: "khalid." }));
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the panel after the reader picks a section", async () => {
    render(<SiteHeader />);
    await userEvent.click(menuButton());

    const panel = screen.getByRole("banner").lastElementChild as HTMLElement;
    await userEvent.click(within(panel).getByRole("link", { name: nav.projects }));

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current section in the mobile panel too", async () => {
    pathname = "/reading";
    render(<SiteHeader />);
    await userEvent.click(menuButton());

    const panel = screen.getByRole("banner").lastElementChild as HTMLElement;
    expect(
      within(panel).getByRole("link", { name: nav.reading }).className,
    ).toContain("text-foreground");
  });
});
