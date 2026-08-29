import { describe, it, expect } from "vitest";
import { getProjects } from "./projects";

describe("getProjects", () => {
  it("resolves every project", () => {
    const projects = getProjects();
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
    const dates = getProjects().map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("gives every project a unique slug", () => {
    const slugs = getProjects().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("points icons at public asset paths, and only sets a backdrop where there is an icon", () => {
    for (const p of getProjects()) {
      if (p.icon) expect(p.icon).toMatch(/^\/projects\/.+\.(png|svg)$/);
      if (p.iconBg) {
        expect(p.iconBg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(p.icon).toBeTruthy();
      }
    }
  });
});
