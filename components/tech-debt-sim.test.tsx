import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { TechDebtSim } from "./tech-debt-sim";
import type { SimStrings } from "./explorables/technical-debt.content";
import { TD_CONTENT } from "./explorables/technical-debt.content";

const strings: SimStrings = {
  allocation: "Refactoring allocation",
  allocationAria: "Refactoring allocation",
  presets: ["Ship it", "Sustainable", "Balanced", "Rewrite"],
  bars: ["Velocity", "Tech debt", "Morale"],
  week: "Week",
  running: "running",
  paused: "paused",
  log: {
    critical: "The codebase is on fire.",
    warning: "Debt is starting to bite.",
    stalled: "Nothing is shipping.",
    healthy: "Healthy and shipping.",
    normal: "Steady.",
  },
};

/** The rounded number rendered inside each bar, in order: velocity, debt, morale. */
function bars(): [number, number, number] {
  const [velocity, debt, morale] = strings.bars.map((label) =>
    Number(screen.getByText(label).parentElement!.querySelector(".tabular-nums")!.textContent),
  );
  return [velocity, debt, morale];
}

const slider = () => screen.getByRole("slider", { name: strings.allocationAria });
/** The allocation readout above the slider, as opposed to the preset labels. */
const readout = () =>
  screen.getByText(strings.allocation).parentElement!.querySelector(".tabular-nums")!.textContent;
const setRate = (value: number) => fireEvent.change(slider(), { target: { value: String(value) } });
const tick = (weeks: number) => act(() => vi.advanceTimersByTime(weeks * 1000));

let observers: Array<(isIntersecting: boolean) => void>;

beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        observers.push((isIntersecting) => callback([{ isIntersecting }]));
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("TechDebtSim", () => {
  it("opens on the sustainable allocation", () => {
    render(<TechDebtSim strings={strings} />);
    expect(slider()).toHaveValue("30");
    expect(readout()).toBe("30%");
    expect(screen.getByText(`${strings.week} 0`)).toBeInTheDocument();
    expect(screen.getByText(strings.running)).toBeInTheDocument();
  });

  it("opens at equilibrium, so the sustainable allocation holds flat", () => {
    render(<TechDebtSim strings={strings} />);
    const opening = bars();
    tick(20);
    expect(bars()).toEqual(opening);
    expect(screen.getByText(`${strings.week} 20`)).toBeInTheDocument();
  });

  it("opens healthy: shipping fast, low debt, good morale", () => {
    render(<TechDebtSim strings={strings} />);
    const [velocity, debt, morale] = bars();
    expect(velocity).toBeGreaterThan(60);
    expect(debt).toBeLessThan(20);
    expect(morale).toBeGreaterThan(70);
  });

  it("counts a week per tick", () => {
    render(<TechDebtSim strings={strings} />);
    tick(3);
    expect(screen.getByText(`${strings.week} 3`)).toBeInTheDocument();
  });

  it("lets debt compound into a crisis when nothing is refactored", () => {
    render(<TechDebtSim strings={strings} />);
    setRate(0);
    tick(60);

    const [velocity, debt, morale] = bars();
    expect(debt).toBe(100);
    // Debt's drag alone costs 80 points of velocity, and morale follows it down.
    expect(velocity).toBe(20);
    expect(morale).toBe(12);
    expect(screen.getByText(strings.log.critical)).toBeInTheDocument();
  });

  it("turns the debt bar amber before it turns red", () => {
    const { container } = render(<TechDebtSim strings={strings} />);
    setRate(0);
    tick(8);

    const [, debt] = bars();
    expect(debt).toBeGreaterThanOrEqual(20);
    expect(debt).toBeLessThan(50);
    const debtBar = container.querySelectorAll<HTMLElement>(".rounded-t-md")[1];
    expect(debtBar.style.backgroundColor).toBe("var(--sim-warn)");
  });

  it("warns while debt is on the way up", () => {
    render(<TechDebtSim strings={strings} />);
    setRate(0);
    tick(16);
    const [, debt] = bars();
    expect(debt).toBeGreaterThanOrEqual(40);
    expect(debt).toBeLessThan(80);
    expect(screen.getByText(strings.log.warning)).toBeInTheDocument();
  });

  it("stalls when the whole team refactors and nothing ships", () => {
    render(<TechDebtSim strings={strings} />);
    setRate(100);
    tick(5);

    const [velocity, debt] = bars();
    expect(velocity).toBeLessThan(20);
    expect(debt).toBeLessThan(40);
    expect(screen.getByText(strings.log.stalled)).toBeInTheDocument();
  });

  it("turns a bar amber while it is merely middling", () => {
    const { container } = render(<TechDebtSim strings={strings} />);
    setRate(50);
    tick(40);

    const [velocity] = bars();
    expect(velocity).toBeGreaterThan(30);
    expect(velocity).toBeLessThanOrEqual(60);
    const velocityBar = container.querySelector<HTMLElement>(".rounded-t-md")!;
    expect(velocityBar.style.backgroundColor).toBe("var(--sim-warn)");
    // Amber is light enough to need dark text on it.
    expect(velocityBar.style.color).toBe("rgb(27, 27, 25)");
  });

  it("pays debt back down when the allocation is raised again", () => {
    render(<TechDebtSim strings={strings} />);
    setRate(0);
    tick(20);
    const [, indebted] = bars();

    setRate(60);
    tick(20);
    const [, recovered] = bars();
    expect(recovered).toBeLessThan(indebted);
  });

  it("jumps to an archetype allocation and marks it as the one in play", () => {
    render(<TechDebtSim strings={strings} />);
    const rewrite = screen.getByRole("button", { name: /Rewrite/ });
    fireEvent.click(rewrite);

    expect(slider()).toHaveValue("80");
    expect(readout()).toBe("80%");
    expect(rewrite.className).toContain("border-accent");
    expect(screen.getByRole("button", { name: /Ship it/ }).className).toContain("border-border");
  });

  it("marks the sustainable preset as active on open", () => {
    render(<TechDebtSim strings={strings} />);
    expect(screen.getByRole("button", { name: /Sustainable/ }).className).toContain(
      "border-accent",
    );
  });

  it("labels every preset with its allocation", () => {
    render(<TechDebtSim strings={strings} />);
    for (const [label, value] of [
      ["Ship it", "10%"],
      ["Sustainable", "30%"],
      ["Balanced", "50%"],
      ["Rewrite", "80%"],
    ]) {
      expect(screen.getByRole("button", { name: `${label} ${value}` })).toBeInTheDocument();
    }
  });

  it("colours the bars by how bad each number is", () => {
    const { container } = render(<TechDebtSim strings={strings} />);
    const colours = () =>
      [...container.querySelectorAll<HTMLElement>(".rounded-t-md")].map(
        (bar) => bar.style.backgroundColor,
      );
    expect(colours()).toEqual(["var(--sim-good)", "var(--sim-good)", "var(--sim-good)"]);

    setRate(0);
    tick(60);
    expect(colours()).toEqual(["var(--sim-bad)", "var(--sim-bad)", "var(--sim-bad)"]);
  });

  it("keeps an empty bar visible rather than collapsing it to nothing", () => {
    const { container } = render(<TechDebtSim strings={strings} />);
    setRate(100);
    tick(5);
    const velocityBar = container.querySelector<HTMLElement>(".rounded-t-md")!;
    expect(velocityBar.textContent).toBe("0");
    expect(velocityBar.style.height).toBe("12%");
  });

  it("pauses when scrolled off screen, and resumes when scrolled back", () => {
    render(<TechDebtSim strings={strings} />);
    tick(2);

    act(() => observers[0](false));
    expect(screen.getByText(strings.paused)).toBeInTheDocument();
    tick(10);
    expect(screen.getByText(`${strings.week} 2`)).toBeInTheDocument();

    act(() => observers[0](true));
    expect(screen.getByText(strings.running)).toBeInTheDocument();
    tick(3);
    expect(screen.getByText(`${strings.week} 5`)).toBeInTheDocument();
  });

  it("pauses when the tab is hidden, and resumes when it comes back", () => {
    render(<TechDebtSim strings={strings} />);
    tick(2);

    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByText(strings.paused)).toBeInTheDocument();
    tick(10);
    expect(screen.getByText(`${strings.week} 2`)).toBeInTheDocument();

    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    tick(1);
    expect(screen.getByText(`${strings.week} 3`)).toBeInTheDocument();
  });

  it("runs without an IntersectionObserver to lean on", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<TechDebtSim strings={strings} />);
    tick(2);
    expect(screen.getByText(`${strings.week} 2`)).toBeInTheDocument();
    expect(screen.getByText(strings.running)).toBeInTheDocument();
  });

  it("stops ticking once it leaves the page", () => {
    const { unmount } = render(<TechDebtSim strings={strings} />);
    unmount();
    expect(() => tick(5)).not.toThrow();
  });

  it("renders the real article copy, in every locale", () => {
    for (const locale of ["en", "de", "ar"] as const) {
      const sim = TD_CONTENT[locale].sim;
      const { unmount } = render(<TechDebtSim strings={sim} />);
      expect(screen.getByRole("slider", { name: sim.allocationAria })).toBeInTheDocument();
      for (const label of sim.bars) expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
