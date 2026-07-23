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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

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
