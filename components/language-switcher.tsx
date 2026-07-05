"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/i18n";

/** Swaps the leading /<locale> segment of the current path to switch languages. */
export function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/");

  return (
    <div className="flex items-center gap-0.5 font-mono text-xs">
      {LOCALES.map((locale) => {
        const parts = [...segments];
        parts[1] = locale; // parts[0] is "" (leading slash)
        const href = parts.join("/") || `/${locale}`;
        const active = locale === lang;
        return (
          <Link
            key={locale}
            href={href}
            lang={locale}
            aria-current={active ? "true" : undefined}
            className={
              "rounded px-1.5 py-0.5 uppercase transition-colors " +
              (active ? "text-foreground" : "text-faint hover:text-foreground")
            }
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
