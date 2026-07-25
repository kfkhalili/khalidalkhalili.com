import { describe, it, expect } from "vitest";
import robots from "./robots";
import { site } from "@/lib/site";

describe("robots", () => {
  it("points every crawler at the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${site.url}/sitemap.xml`,
    });
  });

  it("keeps the whole site crawlable, /_next included", () => {
    // Disallowing /_next/ blocks the CSS and JS a renderer needs, which is how
    // a page ends up indexed looking like unstyled markup.
    const { rules } = robots();
    expect(rules).not.toHaveProperty("disallow");
  });

  it("gives the sitemap an absolute URL, as the spec requires", () => {
    expect(new URL(robots().sitemap as string).origin).toBe(site.url);
  });
});
