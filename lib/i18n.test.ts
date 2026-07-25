import { describe, it, expect } from "vitest";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_META,
  isLocale,
  dirOf,
  getDictionary,
  resolveLocale,
  languageBadge,
} from "./i18n";

describe("locale constants", () => {
  it("ships English, German, and Arabic, with English as the default", () => {
    expect(LOCALES).toEqual(["en", "de", "ar"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it("describes every locale exactly once", () => {
    expect(Object.keys(LOCALE_META).sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      const meta = LOCALE_META[locale];
      expect(meta.label).not.toBe("");
      expect(["ltr", "rtl"]).toContain(meta.dir);
      expect(meta.dateLocale).not.toBe("");
    }
  });

  it("marks Arabic as the only right-to-left locale", () => {
    expect(LOCALE_META.ar.dir).toBe("rtl");
    expect(LOCALE_META.en.dir).toBe("ltr");
    expect(LOCALE_META.de.dir).toBe("ltr");
  });
});

describe("isLocale", () => {
  it.each(LOCALES)("accepts %s", (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each(["fr", "EN", "en-US", "", "ar-EG"])("rejects %s", (value) => {
    expect(isLocale(value)).toBe(false);
  });
});

describe("dirOf", () => {
  it("returns the locale's direction", () => {
    expect(dirOf("ar")).toBe("rtl");
    expect(dirOf("de")).toBe("ltr");
  });

  it("falls back to ltr for an unknown locale", () => {
    expect(dirOf("fr")).toBe("ltr");
  });
});

describe("getDictionary", () => {
  it.each(LOCALES)("loads the %s dictionary", async (locale) => {
    const dict = await getDictionary(locale);
    expect(dict.site.title).not.toBe("");
    expect(dict.nav.writing).not.toBe("");
  });

  it("falls back to the default locale's dictionary", async () => {
    expect(await getDictionary("fr")).toEqual(await getDictionary("en"));
  });

  it("returns distinct copy per locale", async () => {
    const [en, de] = await Promise.all([
      getDictionary("en"),
      getDictionary("de"),
    ]);
    expect(de.nav.writing).not.toBe(en.nav.writing);
  });
});

describe("resolveLocale", () => {
  it("points the arrows with the reading direction in ltr", async () => {
    const resolved = await resolveLocale("de");
    expect(resolved).toMatchObject({ lang: "de", dir: "ltr", back: "←", forward: "→" });
    expect(resolved.dict.site.title).not.toBe("");
  });

  it("mirrors the arrows in rtl", async () => {
    const resolved = await resolveLocale("ar");
    expect(resolved).toMatchObject({ lang: "ar", dir: "rtl", back: "→", forward: "←" });
  });

  it("keeps the requested lang but falls back to default copy", async () => {
    const resolved = await resolveLocale("fr");
    expect(resolved.lang).toBe("fr");
    expect(resolved.dir).toBe("ltr");
    expect(resolved.dict).toEqual(await getDictionary("en"));
  });
});

describe("languageBadge", () => {
  it("is absent when the article matches the page language", () => {
    expect(languageBadge("en", "en")).toBeNull();
  });

  it("names the article's language when it differs", () => {
    expect(languageBadge("ar", "en")).toBe("العربية");
    expect(languageBadge("de", "ar")).toBe("Deutsch");
  });

  it("is absent for a language the site doesn't know", () => {
    expect(languageBadge("fr", "en")).toBeNull();
  });
});
