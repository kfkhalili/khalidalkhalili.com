import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageSwitcher } from "./language-switcher";
import { LOCALES } from "@/lib/i18n";

let pathname = "/en";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const hrefFor = (locale: string) =>
  screen.getByRole("link", { name: locale }).getAttribute("href");

beforeEach(() => {
  pathname = "/en";
});

describe("LanguageSwitcher", () => {
  it("offers every locale the site speaks", () => {
    render(<LanguageSwitcher lang="en" />);
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual([...LOCALES]);
  });

  it("swaps only the leading locale segment, keeping the reader in place", () => {
    pathname = "/en/writing/technical-debt";
    render(<LanguageSwitcher lang="en" />);
    expect(hrefFor("de")).toBe("/de/writing/technical-debt");
    expect(hrefFor("ar")).toBe("/ar/writing/technical-debt");
  });

  it("works from a locale root", () => {
    pathname = "/ar";
    render(<LanguageSwitcher lang="ar" />);
    expect(hrefFor("en")).toBe("/en");
  });

  it("falls back to the locale root when there is no path to keep", () => {
    pathname = "";
    render(<LanguageSwitcher lang="en" />);
    for (const locale of LOCALES) expect(hrefFor(locale)).toBe(`/${locale}`);
  });

  it("marks the current language for assistive tech", () => {
    render(<LanguageSwitcher lang="de" />);
    expect(screen.getByRole("link", { name: "de" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "en" })).not.toHaveAttribute("aria-current");
  });

  it("styles the current language as the active one", () => {
    render(<LanguageSwitcher lang="de" />);
    expect(screen.getByRole("link", { name: "de" }).className).toContain("text-foreground");
    expect(screen.getByRole("link", { name: "en" }).className).toContain("text-faint");
  });

  it("tags each link with the language it leads to", () => {
    render(<LanguageSwitcher lang="en" />);
    for (const locale of LOCALES) {
      expect(screen.getByRole("link", { name: locale })).toHaveAttribute("lang", locale);
    }
  });

  it("navigates with a full page load so the theme script re-runs", () => {
    // Plain <a>, never next/link: a soft navigation across [lang] would remount
    // the root layout on the client, where the inline theme script can't run.
    const { container } = render(<LanguageSwitcher lang="en" />);
    for (const anchor of container.querySelectorAll("a")) {
      expect(anchor).not.toHaveAttribute("data-prefetch");
    }
    expect(container.querySelectorAll("a")).toHaveLength(LOCALES.length);
  });
});
