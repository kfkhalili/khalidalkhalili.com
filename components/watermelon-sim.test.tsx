import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { WatermelonSim } from "./watermelon-sim";
import type { WatermelonStrings } from "./explorables/the-third-thing.content";
import { TT_CONTENT } from "./explorables/the-third-thing.content";

const strings: WatermelonStrings = {
  pressure: "Blame pressure",
  pressureAria: "Blame pressure",
  presets: ["Blameless", "Normal", "Watermelon", "Terror"],
  bars: ["Actual health", "Reported health"],
  badgeLabel: "Dashboard says",
  badges: { green: "GREEN", yellow: "YELLOW", red: "RED" },
  sprint: "Sprint",
  running: "running",
  paused: "paused",
  log: {
    honest: "The report matches reality.",
    drifting: "The report is drifting.",
    watermelon: "Green outside, red inside.",
    collapse: "The project has collapsed.",
    recovery: "Climbing back out.",
  },
};

/** The rounded number in each bar, in order: actual health, reported health. */
function bars(): [number, number] {
  const [actual, reported] = strings.bars.map((label) =>
    Number(screen.getByText(label).parentElement!.querySelector(".tabular-nums")!.textContent),
  );
  return [actual, reported];
}

const slider = () => screen.getByRole("slider", { name: strings.pressureAria });
/** The pressure readout above the slider, as opposed to the preset labels. */
const readout = () =>
  screen.getByText(strings.pressure).parentElement!.querySelector(".tabular-nums")!.textContent;
const setPressure = (value: number) =>
  fireEvent.change(slider(), { target: { value: String(value) } });
const tick = (sprints: number) => act(() => vi.advanceTimersByTime(sprints * 1000));
const badge = () => screen.getByText(strings.badgeLabel).nextElementSibling as HTMLElement;

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

describe("WatermelonSim", () => {
  it("opens on the normal pressure, at rest", () => {
    render(<WatermelonSim strings={strings} />);
    expect(slider()).toHaveValue("30");
    expect(readout()).toBe("30%");
    expect(screen.getByText(`${strings.sprint} 0`)).toBeInTheDocument();
    expect(screen.getByText(strings.running)).toBeInTheDocument();
  });

  it("opens at equilibrium, so the bars hold flat until the slider moves", () => {
    render(<WatermelonSim strings={strings} />);
    const opening = bars();
    tick(20);
    expect(bars()).toEqual(opening);
    expect(screen.getByText(`${strings.sprint} 20`)).toBeInTheDocument();
  });

  it("counts a sprint per tick", () => {
    render(<WatermelonSim strings={strings} />);
    tick(4);
    expect(screen.getByText(`${strings.sprint} 4`)).toBeInTheDocument();
  });

  it("reports the truth when nobody is punished for it", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(0);
    tick(80);

    const [actual, reported] = bars();
    expect(reported).toBe(actual);
    expect(badge()).toHaveTextContent(strings.badges.green);
  });

  it("reports honestly at the opening pressure", () => {
    render(<WatermelonSim strings={strings} />);
    expect(screen.getByText(strings.log.honest)).toBeInTheDocument();
  });

  it("calls a healthy project honest even under pressure, while the gap is still small", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(0);
    tick(80);

    // Pressure jumps before the problems do: for one sprint the report is still
    // nearly true, and the sim says so rather than crying watermelon early.
    setPressure(55);
    const [actual, reported] = bars();
    expect(actual).toBeGreaterThan(70);
    expect(reported - actual).toBeLessThanOrEqual(5);
    expect(screen.getByText(strings.log.honest)).toBeInTheDocument();
  });

  it("calls the report drifting once the gap opens but the bars are still green", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(50);
    tick(80);

    const [actual, reported] = bars();
    expect(reported - actual).toBeGreaterThanOrEqual(5);
    expect(screen.getByText(strings.log.drifting)).toBeInTheDocument();
  });

  it("keeps to drifting when the bars aren't literally green outside and red inside", () => {
    const { container } = render(<WatermelonSim strings={strings} />);
    setPressure(64);
    tick(200);

    const [actual, reported] = bars();
    expect(reported - actual).toBeGreaterThanOrEqual(25);
    const [actualBar, reportedBar] = container.querySelectorAll<HTMLElement>(".rounded-t-md");
    // Amber inside, green outside: the watermelon line would overclaim here.
    expect(actualBar.style.backgroundColor).toBe("var(--sim-warn)");
    expect(reportedBar.style.backgroundColor).toBe("var(--sim-good)");
    expect(screen.getByText(strings.log.drifting)).toBeInTheDocument();
  });

  it("turns the badge amber when even the report admits to trouble", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(80);
    tick(200);

    const [, reported] = bars();
    expect(reported).toBeGreaterThan(40);
    expect(reported).toBeLessThanOrEqual(70);
    expect(badge()).toHaveTextContent(strings.badges.yellow);
    expect(badge().style.backgroundColor).toBe("var(--sim-warn)");
  });

  it("opens a gap between the report and reality as pressure rises", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(70);
    tick(80);

    const [actual, reported] = bars();
    expect(reported).toBeGreaterThan(actual);
  });

  it("shows the whole joke at the watermelon pressure: green badge, red inside", () => {
    const { container } = render(<WatermelonSim strings={strings} />);
    setPressure(70);
    tick(80);

    const [actualBar, reportedBar] = container.querySelectorAll<HTMLElement>(".rounded-t-md");
    expect(actualBar.style.backgroundColor).toBe("var(--sim-bad)");
    expect(reportedBar.style.backgroundColor).toBe("var(--sim-good)");
    expect(badge()).toHaveTextContent(strings.badges.green);
    expect(screen.getByText(strings.log.watermelon)).toBeInTheDocument();
  });

  it("lets the truth leak back out near total collapse", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(100);
    tick(120);

    const [actual, reported] = bars();
    expect(actual).toBeLessThan(15);
    // Past the collapse threshold reality forces itself into the report.
    expect(reported - actual).toBeLessThan(25);
    expect(screen.getByText(strings.log.collapse)).toBeInTheDocument();
  });

  it("lets a collapsed project climb back out once the blame stops", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(100);
    tick(120);
    const [collapsed] = bars();

    setPressure(0);
    tick(5);
    expect(screen.getByText(strings.log.recovery)).toBeInTheDocument();

    // Still climbing: honest reports, but nowhere near healthy yet.
    tick(5);
    const [climbing] = bars();
    expect(climbing).toBeGreaterThan(15);
    expect(climbing).toBeLessThan(70);
    expect(screen.getByText(strings.log.recovery)).toBeInTheDocument();

    tick(110);
    const [recovered] = bars();
    expect(recovered).toBeGreaterThan(collapsed);
    expect(recovered).toBeGreaterThan(70);
  });

  it("jumps to an archetype pressure and marks it as the one in play", () => {
    render(<WatermelonSim strings={strings} />);
    const terror = screen.getByRole("button", { name: /Terror/ });
    fireEvent.click(terror);

    expect(slider()).toHaveValue("100");
    expect(readout()).toBe("100%");
    expect(terror.className).toContain("border-accent");
    expect(screen.getByRole("button", { name: /Blameless/ }).className).toContain("border-border");
  });

  it("marks the normal preset as active on open", () => {
    render(<WatermelonSim strings={strings} />);
    expect(screen.getByRole("button", { name: /Normal/ }).className).toContain("border-accent");
  });

  it("labels every preset with its pressure", () => {
    render(<WatermelonSim strings={strings} />);
    for (const [label, value] of [
      ["Blameless", "0%"],
      ["Normal", "30%"],
      ["Watermelon", "70%"],
      ["Terror", "100%"],
    ]) {
      expect(screen.getByRole("button", { name: `${label} ${value}` })).toBeInTheDocument();
    }
  });

  it("follows the reported bar with the badge, not the real one", () => {
    render(<WatermelonSim strings={strings} />);
    setPressure(100);
    tick(120);
    const [actual, reported] = bars();

    expect(actual).toBeLessThan(15);
    expect(reported).toBeLessThan(40);
    expect(badge()).toHaveTextContent(strings.badges.red);
  });

  it("keeps an empty bar visible rather than collapsing it to nothing", () => {
    const { container } = render(<WatermelonSim strings={strings} />);
    setPressure(100);
    tick(200);
    const actualBar = container.querySelector<HTMLElement>(".rounded-t-md")!;
    expect(Number.parseFloat(actualBar.style.height)).toBeGreaterThanOrEqual(12);
  });

  it("pauses when scrolled off screen, and resumes when scrolled back", () => {
    render(<WatermelonSim strings={strings} />);
    tick(2);

    act(() => observers[0](false));
    expect(screen.getByText(strings.paused)).toBeInTheDocument();
    tick(10);
    expect(screen.getByText(`${strings.sprint} 2`)).toBeInTheDocument();

    act(() => observers[0](true));
    expect(screen.getByText(strings.running)).toBeInTheDocument();
    tick(3);
    expect(screen.getByText(`${strings.sprint} 5`)).toBeInTheDocument();
  });

  it("pauses when the tab is hidden, and resumes when it comes back", () => {
    render(<WatermelonSim strings={strings} />);
    tick(2);

    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByText(strings.paused)).toBeInTheDocument();
    tick(10);
    expect(screen.getByText(`${strings.sprint} 2`)).toBeInTheDocument();

    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    tick(1);
    expect(screen.getByText(`${strings.sprint} 3`)).toBeInTheDocument();
  });

  it("runs without an IntersectionObserver to lean on", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<WatermelonSim strings={strings} />);
    tick(2);
    expect(screen.getByText(`${strings.sprint} 2`)).toBeInTheDocument();
  });

  it("stops ticking once it leaves the page", () => {
    const { unmount } = render(<WatermelonSim strings={strings} />);
    unmount();
    expect(() => tick(5)).not.toThrow();
  });

  it("renders the real article copy, in every locale", () => {
    for (const locale of ["en", "de", "ar"] as const) {
      const sim = TT_CONTENT[locale].sim;
      const { unmount } = render(<WatermelonSim strings={sim} />);
      expect(screen.getByRole("slider", { name: sim.pressureAria })).toBeInTheDocument();
      for (const label of sim.bars) expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
