"use client";

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
          // Plain <a>, not <Link>: a soft navigation across [lang] remounts
          // the root layout on the client, where next-themes' inline theme
          // script can never execute (React warns). A full load re-runs it
          // and serves the correct <html lang/dir> from the server.
          <a
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
          </a>
        );
      })}
    </div>
  );
}
