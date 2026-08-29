import type { Metadata } from "next";
import { Inter, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { strings } from "@/lib/strings";
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

// The site reads in English, but Arabic still appears as content: the ayat the
// islam page quotes, and the Arabic terms inside the explorables.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: strings.site.title,
    template: `%s · ${strings.site.shortName}`,
  },
  description: strings.site.description,
  openGraph: {
    title: strings.site.title,
    description: strings.site.description,
    // No `url` here. Every page that doesn't set its own Open Graph block
    // inherits this one wholesale, so a URL here would have each of them
    // claim to live at the bare origin. Absent, a consumer uses the URL it
    // actually fetched, which is the truthful one.
    siteName: strings.site.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: strings.site.title,
    description: strings.site.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${notoArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <RubHizbBackdrop />
          <SiteHeader />
          <main className="w-full flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
