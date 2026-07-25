import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { generateMetadata, generateStaticParams } from "./layout";
import { site } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";

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
vi.mock("../globals.css", () => ({}));
vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

/** The layout renders <html>/<body>, so render it to markup rather than mounting it. */
async function markup(lang: string) {
  return renderToStaticMarkup(
    await RootLayout({ children: <p>page body</p>, params: Promise.resolve({ lang }) }),
  );
}

describe("generateStaticParams", () => {
  it("builds one tree per locale", () => {
    expect(generateStaticParams()).toEqual(LOCALES.map((lang) => ({ lang })));
  });
});

describe("generateMetadata", () => {
  it("titles the site from the locale's dictionary, with a page template", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "ar" }) });
    expect(metadata.title).toEqual({
      default: ar.site.title,
      template: `%s · ${ar.site.shortName}`,
    });
    expect(metadata.description).toBe(ar.site.description);
  });

  it("resolves relative metadata URLs against the canonical site", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata.metadataBase).toEqual(new URL(site.url));
  });

  it("describes the site for social cards", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }) });
    expect(metadata.openGraph).toMatchObject({
      title: en.site.title,
      description: en.site.description,
      type: "website",
    });
    // Deliberately no `url`: pages that set no Open Graph block of their own
    // inherit this one wholesale, and would all claim the bare origin.
    expect(metadata.openGraph).not.toHaveProperty("url");
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: en.site.title,
    });
  });

  it("falls back to the default locale for an unknown language", async () => {
    const unknown = await generateMetadata({ params: Promise.resolve({ lang: "fr" }) });
    expect(unknown).toEqual(await generateMetadata({ params: Promise.resolve({ lang: "en" }) }));
  });
});

describe("RootLayout", () => {
  it.each(LOCALES)("serves <html> tagged with %s and its direction", async (lang) => {
    const html = await markup(lang);
    expect(html).toContain(`lang="${lang}"`);
    expect(html).toContain(`dir="${lang === "ar" ? "rtl" : "ltr"}"`);
  });

  it("falls back to ltr for a language it doesn't know", async () => {
    const html = await markup("fr");
    expect(html).toContain('lang="fr"');
    expect(html).toContain('dir="ltr"');
  });

  it("wires up the font variables, including the Arabic face", async () => {
    const html = await markup("ar");
    for (const variable of ["--font-inter", "--font-geist-mono", "--font-arabic"]) {
      expect(html).toContain(variable);
    }
  });

  it("renders the page inside the main landmark, between header and footer", async () => {
    const html = await markup("en");
    expect(html).toContain("<main");
    expect(html).toContain("page body");
    expect(html.indexOf("<header")).toBeLessThan(html.indexOf("page body"));
    expect(html.indexOf("page body")).toBeLessThan(html.indexOf("<footer"));
  });

  it("dresses the chrome in the reader's language", async () => {
    const html = await markup("ar");
    expect(html).toContain(ar.nav.writing);
    expect(html).toContain(ar.footer.tagline);
  });

  it("lays the Rub el Hizb backdrop behind everything", async () => {
    expect(await markup("en")).toContain("rub-el-hizb");
  });

  it("lets the theme script rewrite <html> without a hydration warning", async () => {
    // next-themes sets the theme class on <html> before React hydrates.
    const html = await markup("en");
    expect(html).toMatch(/<html[^>]*class="/);
  });
});
