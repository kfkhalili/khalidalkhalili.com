import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeToggle } from "./theme-toggle";

const setTheme = vi.fn();
let resolvedTheme: string | undefined;

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

beforeEach(() => {
  setTheme.mockClear();
  resolvedTheme = "light";
});

describe("ThemeToggle", () => {
  it("offers the opposite theme in its label", async () => {
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("offers light once dark is resolved", async () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("switches to dark from light", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches back to light from dark", async () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("shows a sun in dark mode and a moon in light mode", async () => {
    resolvedTheme = "dark";
    const { container, rerender } = render(<ThemeToggle />);
    await screen.findByRole("button", { name: "Switch to light theme" });
    // The sun: a disc plus its rays.
    expect(container.querySelector("svg circle")).toBeInTheDocument();

    resolvedTheme = "light";
    rerender(<ThemeToggle />);
    expect(container.querySelector("svg circle")).not.toBeInTheDocument();
    expect(container.querySelector("svg path")).toBeInTheDocument();
  });

  it("is a button that never submits a form", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders neutrally on the server, so hydration can't mismatch", () => {
    resolvedTheme = "dark";
    const html = renderToStaticMarkup(<ThemeToggle />);
    expect(html).toContain('aria-label="Toggle theme"');
    expect(html).not.toContain("<svg");
  });

  it("treats an unknown theme as light", async () => {
    resolvedTheme = undefined;
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
