import { describe, it, expect } from "vitest";
import { getProjects } from "./projects";
import { LOCALES } from "./i18n";

describe("getProjects", () => {
  it.each(LOCALES)("resolves every project in %s", (locale) => {
    const projects = getProjects(locale);
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.name).toBeTruthy();
      expect(new URL(p.url).protocol).toBe("https:");
      expect(["live", "beta", "building"]).toContain(p.status);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.description).toBeTruthy();
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it("orders by last-commit date, newest first", () => {
    const dates = getProjects("en").map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("gives every project a unique slug", () => {
    const slugs = getProjects("en").map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("localizes the blurb and tags", () => {
    const en = getProjects("en");
    const de = getProjects("de");
    const ar = getProjects("ar");
    expect(de[0].description).not.toBe(en[0].description);
    expect(ar[0].description).not.toBe(en[0].description);
    expect(de.map((p) => p.tags)).not.toEqual(en.map((p) => p.tags));
  });

  it("keeps locale-independent facts identical across locales", () => {
    const en = getProjects("en");
    const ar = getProjects("ar");
    expect(ar.map((p) => [p.slug, p.name, p.url, p.status, p.date, p.icon, p.iconBg])).toEqual(
      en.map((p) => [p.slug, p.name, p.url, p.status, p.date, p.icon, p.iconBg]),
    );
  });

  it("falls back to the default locale for an unknown language", () => {
    expect(getProjects("fr")).toEqual(getProjects("en"));
  });

  it("points icons at public asset paths, and only sets a backdrop where there is an icon", () => {
    for (const p of getProjects("en")) {
      if (p.icon) expect(p.icon).toMatch(/^\/projects\/.+\.(png|svg)$/);
      if (p.iconBg) {
        expect(p.iconBg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(p.icon).toBeTruthy();
      }
    }
  });
});
