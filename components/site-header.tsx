"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { strings } from "@/lib/strings";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Every section names itself: a feed behind a label like "Elsewhere" is a
  // feed nobody visits. `about` stays in the footer, where the home hero has
  // already done its job.
  const nav = [
    { href: "/projects", label: strings.nav.projects },
    { href: "/writing", label: strings.nav.writing },
    { href: "/reading", label: strings.nav.reading },
    { href: "/islam", label: strings.nav.islam },
    { href: "/chess", label: strings.nav.chess },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-mono text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {strings.site.shortName.toLowerCase()}
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
          </nav>
        </div>
      )}
    </header>
  );
}
