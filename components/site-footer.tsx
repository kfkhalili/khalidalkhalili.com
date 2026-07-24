import Link from "next/link";
import { site } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border">
      <div className="relative mx-auto flex max-w-3xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-sm font-semibold text-foreground">
            {dict.site.shortName.toLowerCase()}
            <span className="text-accent">.</span>
          </div>
          <p className="mt-1 text-sm text-muted">{dict.footer.tagline}</p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted sm:items-end">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/projects`} className="hover:text-foreground">
              {dict.nav.projects}
            </Link>
            <Link href={`/${lang}/writing`} className="hover:text-foreground">
              {dict.nav.writing}
            </Link>
            <Link href={`/${lang}/reading`} className="hover:text-foreground">
              {dict.nav.reading}
            </Link>
            <Link href={`/${lang}/chess`} className="hover:text-foreground">
              {dict.nav.chess}
            </Link>
            <Link href={`/${lang}/about`} className="hover:text-foreground">
              {dict.nav.about}
            </Link>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Khalid on LinkedIn"
              className="transition-colors hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
              </svg>
            </a>
          </div>
          <p className="text-faint">
            © {year} {dict.site.title}
          </p>
        </div>
      </div>
    </footer>
  );
}
