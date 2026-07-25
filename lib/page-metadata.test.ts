import { describe, it, expect } from "vitest";
import { pageMetadata } from "./page-metadata";
import { LOCALES } from "./i18n";
import en from "@/dictionaries/en.json";

const SUBS = ["", "/writing", "/projects", "/about"];

describe("pageMetadata", () => {
  it("makes every page name its own address, not the site's", () => {
    // The defect this guards: a page inheriting the layout's Open Graph block
    // and reporting the bare origin, which redirects and isn't in the sitemap.
    for (const lang of LOCALES) {
      for (const sub of SUBS) {
        const meta = pageMetadata({
          lang,
          sub,
          title: "T",
          description: "D",
          dict: en,
        });
        const own = `/${lang}${sub}`;
        expect(meta.alternates?.canonical).toBe(own);
        expect(meta.openGraph?.url).toBe(own);
      }
    }
  });

  it("includes the page itself in its own hreflang set", () => {
    for (const lang of LOCALES) {
      const meta = pageMetadata({
        lang,
        sub: "/about",
        title: "T",
        description: "D",
        dict: en,
      });
      const languages = meta.alternates?.languages ?? {};
      expect(Object.keys(languages)).toEqual([...LOCALES, "x-default"]);
      // Each locale key points at that locale's URL, not merely somewhere.
      for (const other of LOCALES) {
        expect(languages[other]).toBe(`/${other}/about`);
      }
      expect(languages["x-default"]).toBe("/en/about");
    }
  });

  it("carries the locale into Open Graph in its underscored form", () => {
    const meta = pageMetadata({
      lang: "ar",
      sub: "",
      title: "T",
      description: "D",
      dict: en,
    });
    expect(meta.openGraph?.locale).toBe("ar_AR");
  });

  it("lets a whole title skip the layout's suffix template", () => {
    const templated = pageMetadata({
      lang: "en",
      sub: "/about",
      title: "About",
      description: "D",
      dict: en,
    });
    expect(templated.title).toBe("About");

    const whole = pageMetadata({
      lang: "en",
      sub: "",
      title: "Khalid Alkhalili",
      description: "D",
      dict: en,
      absoluteTitle: true,
    });
    expect(whole.title).toEqual({ absolute: "Khalid Alkhalili" });
  });
});
