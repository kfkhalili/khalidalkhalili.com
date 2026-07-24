import type { Metadata } from "next";
import { Inter, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { site } from "@/lib/site";
import { LOCALES, resolveLocale } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { RubHizbBackdrop } from "@/components/geometry";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // No metric-adjusted local(Arial) fallback face: it carries no
  // unicode-range, so it would swallow Arabic glyphs before they can
  // fall through to Noto Sans Arabic.
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { dict } = await resolveLocale(lang);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: dict.site.title,
      template: `%s · ${dict.site.shortName}`,
    },
    description: dict.site.description,
    openGraph: {
      title: dict.site.title,
      description: dict.site.description,
      url: site.url,
      siteName: dict.site.title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.site.title,
      description: dict.site.description,
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const { dict, dir } = await resolveLocale(lang);

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${notoArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <RubHizbBackdrop />
          <SiteHeader lang={lang} dict={dict} />
          <main className="w-full flex-1">{children}</main>
          <SiteFooter lang={lang} dict={dict} />
        </ThemeProvider>
      </body>
    </html>
  );
}
