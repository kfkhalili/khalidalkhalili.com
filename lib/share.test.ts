import { describe, it, expect } from "vitest";
import {
  articleUrl,
  articleLanguages,
  localeUrl,
  localeAlternates,
  localeAlternateUrls,
  shareIntent,
} from "./share";

describe("articleUrl", () => {
  it("is absolute and locale-qualified", () => {
    expect(articleUrl("de", "the-third-thing")).toBe(
      "https://khalidalkhalili.com/de/writing/the-third-thing",
    );
  });
});

describe("localeUrl", () => {
  it("addresses a locale home without a trailing slash", () => {
    expect(localeUrl("ar")).toBe("https://khalidalkhalili.com/ar");
  });

  it("addresses a page under a locale", () => {
    expect(localeUrl("en", "/about")).toBe(
      "https://khalidalkhalili.com/en/about",
    );
  });
});

describe("localeAlternates", () => {
  it("is reciprocal: every locale lists itself alongside the others", () => {
    // Stated as literals. Comparing the set against itself would pass however
    // wrong the pairing was.
    expect(localeAlternates("/about")).toEqual({
      en: "/en/about",
      de: "/de/about",
      ar: "/ar/about",
      "x-default": "/en/about",
    });
  });

  it("points x-default at the locale the proxy falls back to", () => {
    expect(localeAlternates("/about")["x-default"]).toBe("/en/about");
  });

  it("can build the absolute set the sitemap needs", () => {
    expect(localeAlternateUrls("")).toEqual({
      en: "https://khalidalkhalili.com/en",
      de: "https://khalidalkhalili.com/de",
      ar: "https://khalidalkhalili.com/ar",
      "x-default": "https://khalidalkhalili.com/en",
    });
  });
});

describe("articleLanguages", () => {
  it("offers the same slug in every locale", () => {
    expect(articleLanguages("technical-debt")).toEqual({
      en: "/en/writing/technical-debt",
      de: "/de/writing/technical-debt",
      ar: "/ar/writing/technical-debt",
      "x-default": "/en/writing/technical-debt",
    });
  });
});

describe("shareIntent", () => {
  const article = {
    url: "https://khalidalkhalili.com/ar/writing/the-third-thing",
    title: "الشيء الثالث",
  };

  it("hands LinkedIn the URL alone, encoded", () => {
    expect(shareIntent("linkedin", article)).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fkhalidalkhalili.com%2Far%2Fwriting%2Fthe-third-thing",
    );
  });

  it("encodes a non-Latin title for X", () => {
    const href = shareIntent("x", article);
    expect(href).toContain("text=%D8%A7%D9%84%D8%B4%D9%8A%D8%A1");
    expect(href).not.toContain("الشيء");
  });

  it("puts title and URL in one WhatsApp message", () => {
    expect(shareIntent("whatsapp", { url: "https://x.test/a", title: "A B" }))
      .toBe("https://wa.me/?text=A%20B%20https%3A%2F%2Fx.test%2Fa");
  });
});
