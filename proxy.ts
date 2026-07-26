import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

// Pick the best locale from the Accept-Language header (hand-rolled to avoid deps).
function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const base = part.split(";")[0].trim().toLowerCase().split("-")[0];
      if ((LOCALES as readonly string[]).includes(base)) return base;
    }
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the icons, and anything with a file extension.
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
