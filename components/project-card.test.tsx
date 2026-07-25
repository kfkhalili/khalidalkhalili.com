import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./project-card";
import type { Project } from "@/lib/projects";
import en from "@/dictionaries/en.json";
import de from "@/dictionaries/de.json";
import type { Dictionary } from "@/lib/i18n";

const project: Project = {
  slug: "zallija",
  name: "Zallija",
  url: "https://www.zallija.com",
  status: "live",
  date: "2026-07-04",
  description: "Hand-drafted girih and zellige geometric art.",
  tags: ["Geometric art", "Prints"],
  icon: "/projects/zallija.png",
  iconBg: "#f6f1e7",
};

const dict = en as Dictionary;

describe("ProjectCard", () => {
  it("links out to the project safely", () => {
    render(<ProjectCard project={project} dict={dict} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", project.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the name, blurb, and tags", () => {
    render(<ProjectCard project={project} dict={dict} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Zallija");
    expect(screen.getByText(project.description)).toBeInTheDocument();
    for (const tag of project.tags) expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it("shows the bare host, forced left-to-right so it reads correctly in Arabic", () => {
    const { container } = render(<ProjectCard project={project} dict={dict} />);
    const host = container.querySelector('[dir="ltr"]')!;
    expect(host).toHaveTextContent("www.zallija.com");
  });

  it("strips a trailing slash from the displayed host", () => {
    const { container } = render(
      <ProjectCard
        project={{ ...project, url: "https://gcp-icons-showcase.vercel.app/" }}
        dict={dict}
      />,
    );
    expect(container.querySelector('[dir="ltr"]')).toHaveTextContent(
      "gcp-icons-showcase.vercel.app",
    );
  });

  it("labels the status in the page's language", () => {
    const { rerender } = render(<ProjectCard project={project} dict={dict} />);
    expect(screen.getByText(en.projects.status.live)).toBeInTheDocument();

    rerender(<ProjectCard project={project} dict={de as Dictionary} />);
    expect(screen.getByText(de.projects.status.live)).toBeInTheDocument();
  });

  it.each(["live", "beta", "building"] as const)("styles the %s status distinctly", (status) => {
    render(<ProjectCard project={{ ...project, status }} dict={dict} />);
    const badge = screen.getByText(en.projects.status[status]);
    expect(badge.className).toMatch(/border-accent\/50|border-accent\/30|border-border/);
  });

  it("gives the icon an empty alt: the name right beside it already says it", () => {
    const { container } = render(<ProjectCard project={project} dict={dict} />);
    const icon = container.querySelector("img")!;
    expect(icon).toHaveAttribute("alt", "");
    expect(icon.getAttribute("src")).toContain("zallija.png");
    // An empty alt takes the image out of the accessibility tree entirely.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("paints the icon's own backdrop when one is set", () => {
    const { container } = render(<ProjectCard project={project} dict={dict} />);
    const frame = container.querySelector("span[style]")!;
    expect(frame).toHaveStyle({ backgroundColor: "#f6f1e7" });
    expect(frame.className).toContain("p-1.5");
  });

  it("falls back to the card surface when no backdrop is set", () => {
    const { container } = render(
      <ProjectCard project={{ ...project, iconBg: undefined }} dict={dict} />,
    );
    const frame = container.querySelector("span.rounded-lg")!;
    expect(frame.className).toContain("bg-card-2");
    expect(frame).not.toHaveAttribute("style");
  });

  it("renders an icon-less project without an empty frame", () => {
    const { container } = render(
      <ProjectCard
        project={{ ...project, icon: undefined, iconBg: undefined }}
        dict={dict}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Zallija");
  });
});
