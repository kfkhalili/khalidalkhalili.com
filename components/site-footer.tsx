import Link from "next/link";
import { site } from "@/lib/site";
import { StarPattern } from "@/components/geometry";

export function SiteFooter() {
  const year = 2026;

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border">
      {/* Faint geometry band behind the footer text. */}
      <div className="pointer-events-none absolute inset-0 text-accent opacity-[0.06]">
        <StarPattern id="footer-khatam" className="h-full w-full" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-sm font-semibold text-foreground">
            {site.shortName.toLowerCase()}
            <span className="text-accent">.</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Built by hand. Made to be explored.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted sm:items-end">
          <div className="flex gap-4">
            <Link href="/writing" className="hover:text-foreground">
              Writing
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </div>
          <p className="text-faint">
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
