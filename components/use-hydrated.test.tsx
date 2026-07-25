import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useHydrated } from "./use-hydrated";

function Probe() {
  return <span>{useHydrated() ? "client" : "server"}</span>;
}

describe("useHydrated", () => {
  it("is false while rendering on the server", () => {
    expect(renderToStaticMarkup(<Probe />)).toContain("server");
  });

  it("is true once running on the client", () => {
    render(<Probe />);
    expect(screen.getByText("client")).toBeInTheDocument();
  });

  it("never flips back, so nothing subscribes to it in vain", () => {
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    expect(screen.getByText("client")).toBeInTheDocument();
  });
});
