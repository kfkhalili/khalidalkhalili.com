import { describe, it, expect } from "vitest";
import { site } from "./site";

describe("site", () => {
  it("names the site and its author", () => {
    expect(site.name).toBe("Khalid Alkhalili");
    expect(site.title).toBe(site.name);
    expect(site.author).toBe(site.name);
    expect(site.shortName).toBe("Khalid");
  });

  it("has a canonical https url with no trailing slash", () => {
    expect(site.url).toBe("https://khalidalkhalili.com");
    expect(() => new URL(site.url)).not.toThrow();
    expect(site.url.endsWith("/")).toBe(false);
  });

  it("links out over https", () => {
    for (const url of [site.linkedin, site.goodreads]) {
      expect(new URL(url).protocol).toBe("https:");
    }
  });

  it("carries a description for metadata", () => {
    expect(site.description.length).toBeGreaterThan(40);
  });
});
