"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Dictionary } from "@/lib/i18n";

export function SiteHeader({ lang, dict }: { lang: string; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Three sections, because the site has three. The live feeds (reading, islam,
  // chess) are one kind of page and sit behind `elsewhere` rather than each
  // taking a slot; `about` is in the footer, where the home hero has already
  // done its job. A six-item bar collided with the wordmark in German.
  const nav = [
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/writing`, label: dict.nav.writing },
    { href: `/${lang}/elsewhere`, label: dict.nav.elsewhere },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link
          href={`/${lang}`}
          onClick={() => setOpen(false)}
          className="font-mono text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {dict.site.shortName.toLowerCase()}
          <span className="text-accent">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-md px-3 py-1.5 text-sm transition-colors " +
                (isActive(item.href)
                  ? "text-foreground"
                  : "text-muted hover:text-foreground")
              }
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <LanguageSwitcher lang={lang} />
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-border bg-background sm:hidden">
          <nav className="mx-auto flex max-w-3xl flex-col px-5 py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded-md px-2 py-2.5 text-sm transition-colors " +
                  (isActive(item.href)
                    ? "text-foreground"
                    : "text-muted hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-border/70 px-2 pt-3">
              <LanguageSwitcher lang={lang} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
