import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";
import { site } from "@/lib/site";
import { strings } from "@/lib/strings";

afterEach(() => {
  vi.useRealTimers();
});

describe("SiteFooter", () => {
  it("stamps the wordmark in lower case, with the accent dot", () => {
    const { container } = render(<SiteFooter />);
    const wordmark = container.querySelector(".font-mono")!;
    expect(wordmark.textContent).toBe("khalid.");
    expect(wordmark.querySelector(".text-accent")!.textContent).toBe(".");
  });

  it("shows the tagline", () => {
    render(<SiteFooter />);
    expect(screen.getByText(strings.footer.tagline)).toBeInTheDocument();
  });

  // About left the nav when the bar grew to six items; the footer is where it
  // went, so this is now the only chrome that points at it.
  it("carries the About link", () => {
    render(<SiteFooter />);
    expect(
      screen.getByRole("link", { name: strings.footer.about }),
    ).toHaveAttribute("href", "/about");
  });

  it("links out to LinkedIn safely, with a label for screen readers", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: "Khalid on LinkedIn" });
    expect(link).toHaveAttribute("href", site.linkedin);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the copyright year current on its own", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-03-04T12:00:00Z"));
    render(<SiteFooter />);
    expect(
      screen.getByText(`© 2031 ${strings.site.title}`),
    ).toBeInTheDocument();
  });

  it("is a footer landmark", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
