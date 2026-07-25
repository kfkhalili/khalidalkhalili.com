import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RubHizbBackdrop } from "./geometry";

describe("RubHizbBackdrop", () => {
  it("is decorative: hidden from assistive tech and untouchable", () => {
    const { container } = render(<RubHizbBackdrop />);
    const backdrop = container.firstElementChild!;
    expect(backdrop).toHaveAttribute("aria-hidden");
    expect(backdrop.className).toContain("pointer-events-none");
  });

  it("sits fixed behind all content", () => {
    const { container } = render(<RubHizbBackdrop />);
    const className = container.firstElementChild!.className;
    expect(className).toContain("fixed");
    expect(className).toContain("inset-0");
    expect(className).toContain("-z-10");
  });

  it("tiles the Rub el Hizb: two squares and the center circle", () => {
    const { container } = render(<RubHizbBackdrop />);
    const pattern = container.querySelector("pattern#rub-el-hizb")!;
    expect(pattern).toHaveAttribute("patternUnits", "userSpaceOnUse");
    expect(pattern.querySelectorAll("polygon")).toHaveLength(2);
    expect(pattern.querySelectorAll("circle")).toHaveLength(1);
  });

  it("fills the whole page with that tile", () => {
    const { container } = render(<RubHizbBackdrop />);
    const rect = container.querySelector("svg > rect")!;
    expect(rect).toHaveAttribute("fill", "url(#rub-el-hizb)");
    expect(rect).toHaveAttribute("width", "100%");
    expect(rect).toHaveAttribute("height", "100%");
  });

  it("draws in the accent colour, fainter in dark mode", () => {
    const { container } = render(<RubHizbBackdrop />);
    const className = container.firstElementChild!.className;
    expect(className).toContain("text-accent");
    expect(className).toContain("opacity-[0.08]");
    expect(className).toContain("dark:opacity-[0.05]");
  });
});
