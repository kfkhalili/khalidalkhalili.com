import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";
import { site } from "@/lib/site";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";
import type { Dictionary } from "@/lib/i18n";

afterEach(() => {
  vi.useRealTimers();
});

describe("SiteFooter", () => {
  it("stamps the wordmark in lower case, with the accent dot", () => {
    const { container } = render(<SiteFooter dict={en as Dictionary} />);
    const wordmark = container.querySelector(".font-mono")!;
    expect(wordmark.textContent).toBe("khalid.");
    expect(wordmark.querySelector(".text-accent")!.textContent).toBe(".");
  });

  it("shows the tagline in the page's language", () => {
    const { rerender } = render(<SiteFooter dict={en as Dictionary} />);
    expect(screen.getByText(en.footer.tagline)).toBeInTheDocument();

    rerender(<SiteFooter dict={ar as unknown as Dictionary} />);
    expect(screen.getByText(ar.footer.tagline)).toBeInTheDocument();
  });

  it("links out to LinkedIn safely, with a label for screen readers", () => {
    render(<SiteFooter dict={en as Dictionary} />);
    const link = screen.getByRole("link", { name: "Khalid on LinkedIn" });
    expect(link).toHaveAttribute("href", site.linkedin);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the copyright year current on its own", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-03-04T12:00:00Z"));
    render(<SiteFooter dict={en as Dictionary} />);
    expect(screen.getByText(`© 2031 ${en.site.title}`)).toBeInTheDocument();
  });

  it("is a footer landmark", () => {
    render(<SiteFooter dict={en as Dictionary} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
