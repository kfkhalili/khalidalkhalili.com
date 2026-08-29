import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteHeader } from "./site-header";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";
import type { Dictionary } from "@/lib/i18n";

let pathname = "/en";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

const dict = en as Dictionary;
const menuButton = () => screen.getByRole("button", { name: "Menu" });

beforeEach(() => {
  pathname = "/en";
});

describe("SiteHeader", () => {
  it("is a banner landmark pinned to the top", () => {
    const { container } = render(<SiteHeader lang="en" dict={dict} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain("sticky");
  });

  it("takes the wordmark home, inside the current locale", () => {
    render(<SiteHeader lang="de" dict={dict} />);
    const wordmark = screen.getByRole("link", { name: "khalid." });
    expect(wordmark).toHaveAttribute("href", "/de");
  });

  it("links every section inside the current locale", () => {
    render(<SiteHeader lang="ar" dict={dict} />);
    for (const [section, label] of Object.entries(en.nav)) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        `/ar/${section}`,
      );
    }
  });

  it("labels the sections in the page's language", () => {
    render(<SiteHeader lang="ar" dict={ar as unknown as Dictionary} />);
    expect(screen.getByRole("link", { name: ar.nav.writing })).toBeInTheDocument();
  });

  it("marks the section the reader is in", () => {
    pathname = "/en/writing";
    render(<SiteHeader lang="en" dict={dict} />);
    expect(screen.getByRole("link", { name: en.nav.writing }).className).toContain(
      "text-foreground",
    );
    expect(screen.getByRole("link", { name: en.nav.reading }).className).toContain(
      "text-muted",
    );
  });

  it("keeps the section marked while reading something inside it", () => {
    pathname = "/en/writing/technical-debt";
    render(<SiteHeader lang="en" dict={dict} />);
    expect(screen.getByRole("link", { name: en.nav.writing }).className).toContain(
      "text-foreground",
    );
  });

  it("does not mark a section whose path merely shares a prefix", () => {
    pathname = "/en/writings-elsewhere";
    render(<SiteHeader lang="en" dict={dict} />);
    expect(screen.getByRole("link", { name: en.nav.writing }).className).toContain("text-muted");
  });

  it("carries the language switcher and theme toggle", () => {
    render(<SiteHeader lang="en" dict={dict} />);
    expect(screen.getAllByRole("link", { name: "de" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /theme/i }).length).toBeGreaterThan(0);
  });

  it("keeps the mobile panel closed until asked", () => {
    render(<SiteHeader lang="en" dict={dict} />);
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: en.nav.writing })).toHaveLength(1);
  });

  it("opens the mobile panel, duplicating the nav and switcher", async () => {
    render(<SiteHeader lang="en" dict={dict} />);
    await userEvent.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: en.nav.writing })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "ar" })).toHaveLength(2);
  });

  it("closes the panel when the button is pressed again", async () => {
    render(<SiteHeader lang="en" dict={dict} />);
    await userEvent.click(menuButton());
    await userEvent.click(menuButton());
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: en.nav.writing })).toHaveLength(1);
  });

  it("closes the panel after the reader picks a section", async () => {
    render(<SiteHeader lang="en" dict={dict} />);
    await userEvent.click(menuButton());

    const panel = screen.getByRole("banner").lastElementChild as HTMLElement;
    await userEvent.click(within(panel).getByRole("link", { name: en.nav.projects }));

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current section in the mobile panel too", async () => {
    pathname = "/en/reading";
    render(<SiteHeader lang="en" dict={dict} />);
    await userEvent.click(menuButton());

    const panel = screen.getByRole("banner").lastElementChild as HTMLElement;
    expect(
      within(panel).getByRole("link", { name: en.nav.reading }).className,
    ).toContain("text-foreground");
    expect(
      within(panel).getByRole("link", { name: en.nav.writing }).className,
    ).toContain("text-muted");
  });

  it("closes the panel when the reader goes home from it", async () => {
    render(<SiteHeader lang="en" dict={dict} />);
    await userEvent.click(menuButton());
    await userEvent.click(screen.getByRole("link", { name: "khalid." }));
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("swaps the burger for a close icon while open", async () => {
    render(<SiteHeader lang="en" dict={dict} />);
    const burger = menuButton().querySelector("path")!.getAttribute("d");
    await userEvent.click(menuButton());
    expect(menuButton().querySelector("path")!.getAttribute("d")).not.toBe(burger);
  });
});
