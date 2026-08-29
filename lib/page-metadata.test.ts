import { describe, it, expect } from "vitest";
import { pageMetadata } from "./page-metadata";

const SUBS = ["", "/writing", "/projects", "/about"];

describe("pageMetadata", () => {
  it("makes every page name its own address, not the site's", () => {
    // The defect this guards: a page inheriting the layout's Open Graph block
    // and reporting the bare origin.
    for (const sub of SUBS) {
      const meta = pageMetadata({ sub, title: "T", description: "D" });
      const own = sub || "/";
      expect(meta.alternates?.canonical).toBe(own);
      expect(meta.openGraph?.url).toBe(own);
    }
  });

  it("names the site's language in Open Graph, in its underscored form", () => {
    const meta = pageMetadata({ sub: "", title: "T", description: "D" });
    expect(meta.openGraph?.locale).toBe("en_US");
  });

  it("lets a whole title skip the layout's suffix template", () => {
    const templated = pageMetadata({
      sub: "/about",
      title: "About",
      description: "D",
    });
    expect(templated.title).toBe("About");

    const whole = pageMetadata({
      sub: "",
      title: "Khalid Alkhalili",
      description: "D",
      absoluteTitle: true,
    });
    expect(whole.title).toEqual({ absolute: "Khalid Alkhalili" });
  });
});
