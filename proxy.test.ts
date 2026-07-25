// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "./proxy";
import { LOCALES } from "@/lib/i18n";

function request(pathname: string, acceptLanguage?: string) {
  return new NextRequest(new URL(pathname, "https://khalidalkhalili.com"), {
    headers: acceptLanguage ? { "accept-language": acceptLanguage } : {},
  });
}

/** The path a request is redirected to, or null when it's let through. */
function redirectPath(pathname: string, acceptLanguage?: string): string | null {
  const response = proxy(request(pathname, acceptLanguage));
  if (!response) return null;
  expect(response.status).toBe(307);
  return new URL(response.headers.get("location")!).pathname;
}

describe("proxy", () => {
  it.each(LOCALES)("lets a /%s path through untouched", (locale) => {
    expect(redirectPath(`/${locale}`)).toBeNull();
    expect(redirectPath(`/${locale}/writing/technical-debt`)).toBeNull();
  });

  it("does not mistake a path that merely starts with a locale's letters", () => {
    expect(redirectPath("/entertainment")).toBe("/en/entertainment");
    expect(redirectPath("/deutschland")).toBe("/en/deutschland");
  });

  it("sends the bare root to the default locale, with no trailing slash", () => {
    expect(redirectPath("/")).toBe("/en");
  });

  it("keeps the rest of the path when adding the locale", () => {
    expect(redirectPath("/writing/technical-debt")).toBe("/en/writing/technical-debt");
  });

  it("preserves the query string", () => {
    const response = proxy(request("/writing?tag=systems"));
    expect(new URL(response!.headers.get("location")!).search).toBe("?tag=systems");
  });

  it("honours the reader's preferred language", () => {
    expect(redirectPath("/", "de-DE,de;q=0.9,en;q=0.8")).toBe("/de");
    expect(redirectPath("/", "ar")).toBe("/ar");
  });

  it("takes the first language it actually speaks", () => {
    expect(redirectPath("/", "fr-FR,fr;q=0.9,ar;q=0.8,en;q=0.7")).toBe("/ar");
  });

  it("matches a region-tagged or oddly-cased language to its base", () => {
    expect(redirectPath("/", "AR-EG")).toBe("/ar");
    expect(redirectPath("/", " de-CH ")).toBe("/de");
  });

  it("falls back to the default locale for an unspoken or absent language", () => {
    expect(redirectPath("/", "fr-FR,es;q=0.9")).toBe("/en");
    expect(redirectPath("/")).toBe("/en");
    expect(redirectPath("/", "")).toBe("/en");
  });
});

describe("config.matcher", () => {
  const matches = (pathname: string) =>
    new RegExp(`^${config.matcher[0]}$`).test(pathname);

  it("runs on the pages readers navigate to", () => {
    expect(matches("/")).toBe(true);
    expect(matches("/writing")).toBe(true);
    expect(matches("/en/writing/technical-debt")).toBe(true);
  });

  it("skips Next internals, the API, and anything with a file extension", () => {
    expect(matches("/_next/static/chunk.js")).toBe(false);
    expect(matches("/api/thing")).toBe(false);
    expect(matches("/icon.svg")).toBe(false);
    expect(matches("/favicon.ico")).toBe(false);
    expect(matches("/projects/zallija.png")).toBe(false);
  });
});
