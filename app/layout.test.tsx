import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { metadata } from "./layout";
import { site } from "@/lib/site";
import { strings } from "@/lib/strings";

// next/font is compiled by the Next.js toolchain, and globals.css isn't CSS the
// test runner can parse; neither carries behaviour this test is about.
vi.mock("next/font/google", () => {
  const font = (variable: string) => () => ({ variable, className: variable });
  return {
    Inter: font("--font-inter"),
    Geist_Mono: font("--font-geist-mono"),
    Noto_Sans_Arabic: font("--font-arabic"),
  };
});
vi.mock("./globals.css", () => ({}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

/** The layout renders <html>/<body>, so render it to markup rather than mounting it. */
function markup() {
  return renderToStaticMarkup(RootLayout({ children: <p>page body</p> }));
}

describe("metadata", () => {
  it("titles the site, with a page template", () => {
    expect(metadata.title).toEqual({
      default: strings.site.title,
      template: `%s · ${strings.site.shortName}`,
    });
    expect(metadata.description).toBe(strings.site.description);
  });

  it("resolves relative metadata URLs against the canonical site", () => {
    expect(metadata.metadataBase).toEqual(new URL(site.url));
  });

  it("describes the site for social cards", () => {
    expect(metadata.openGraph).toMatchObject({
      title: strings.site.title,
      description: strings.site.description,
      type: "website",
    });
    // Deliberately no `url`: pages that set no Open Graph block of their own
    // inherit this one wholesale, and would all claim the bare origin.
    expect(metadata.openGraph).not.toHaveProperty("url");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: strings.site.title,
    });
  });
});

describe("RootLayout", () => {
  it("serves <html> tagged as English", () => {
    expect(markup()).toContain('lang="en"');
  });

  it("wires up the font variables, including the Arabic face for quoted ayat", () => {
    const html = markup();
    for (const variable of ["--font-inter", "--font-geist-mono", "--font-arabic"]) {
      expect(html).toContain(variable);
    }
  });

  it("renders the page inside the main landmark, between header and footer", () => {
    const html = markup();
    expect(html).toContain("<main");
    expect(html).toContain("page body");
    expect(html.indexOf("<header")).toBeLessThan(html.indexOf("page body"));
    expect(html.indexOf("page body")).toBeLessThan(html.indexOf("<footer"));
  });

  it("dresses the chrome in the site's copy", () => {
    const html = markup();
    expect(html).toContain(strings.nav.writing);
    expect(html).toContain(strings.footer.tagline);
  });

  it("lays the Rub el Hizb backdrop behind everything", () => {
    expect(markup()).toContain("rub-el-hizb");
  });

  it("lets the theme script rewrite <html> without a hydration warning", () => {
    // next-themes sets the theme class on <html> before React hydrates.
    expect(markup()).toMatch(/<html[^>]*class="/);
  });
});
