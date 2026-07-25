import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

const props = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...rest }: { children: React.ReactNode }) => {
    props.current = rest;
    return <div data-testid="next-themes">{children}</div>;
  },
}));

describe("ThemeProvider", () => {
  it("renders whatever the app puts inside it", () => {
    render(
      <ThemeProvider>
        <p>page</p>
      </ThemeProvider>,
    );
    expect(screen.getByText("page")).toBeInTheDocument();
  });

  it("themes by class, so Tailwind's dark: variants apply", () => {
    render(<ThemeProvider>x</ThemeProvider>);
    expect(props.current.attribute).toBe("class");
  });

  it("follows the operating system by default", () => {
    render(<ThemeProvider>x</ThemeProvider>);
    expect(props.current.defaultTheme).toBe("system");
    expect(props.current.enableSystem).toBe(true);
  });

  it("suppresses transitions on the switch, so nothing flashes", () => {
    render(<ThemeProvider>x</ThemeProvider>);
    expect(props.current.disableTransitionOnChange).toBe(true);
  });
});
