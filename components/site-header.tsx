"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Dictionary } from "@/lib/i18n";

export function SiteHeader({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const nav = [
    { href: `/${lang}/writing`, label: dict.nav.writing },
    { href: `/${lang}/about`, label: dict.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link
          href={`/${lang}`}
          className="font-mono text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {site.shortName.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "text-foreground"
                    : "text-muted hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <LanguageSwitcher lang={lang} />
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
