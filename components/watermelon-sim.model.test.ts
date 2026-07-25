import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRESSURE,
  healthTone,
  honesty,
  initialState,
  logKey,
  nextState,
  readings,
  reportedProblems,
  settle,
} from "@/components/watermelon-sim.model";

/** The archetype pressures, by the names the article gives them. */
const HONEST = 0;
const WATERMELON = 70;
const BLAME = 100;

describe("the Watermelon calibration", () => {
  // The metaphor the preset exists to demonstrate, and the reason
  // HIDDEN_COMPOUND is set where it is. Asserted rather than trusted.
  it("settles green outside and red inside", () => {
    const s = settle(WATERMELON);
    const { actualHealth, reportedHealth } = readings(s, WATERMELON);
    expect(healthTone(actualHealth)).toBe("bad");
    expect(healthTone(reportedHealth)).toBe("good");
  });

  it("keeps actual health below the crisis floor it is calibrated against", () => {
    const { actualHealth } = readings(settle(WATERMELON), WATERMELON);
    expect(actualHealth).toBeLessThan(40);
  });

  it("reports the watermelon line at that equilibrium", () => {
    const s = settle(WATERMELON);
    const { actualHealth, reportedHealth } = readings(s, WATERMELON);
    expect(logKey(actualHealth, reportedHealth, WATERMELON)).toBe("watermelon");
  });
});

describe("honesty under pressure", () => {
  it("is total when nobody is blamed", () => {
    expect(honesty(50, HONEST)).toBeCloseTo(1, 6);
    expect(reportedProblems(50, HONEST)).toBeCloseTo(50, 6);
  });

  it("collapses as pressure rises", () => {
    expect(honesty(50, BLAME)).toBeLessThan(honesty(50, WATERMELON));
    expect(honesty(50, WATERMELON)).toBeLessThan(honesty(50, HONEST));
  });

  it("leaks the truth back out near collapse", () => {
    // Past p = 80 reality forces itself into the report, whatever the pressure.
    expect(honesty(95, BLAME)).toBeGreaterThan(honesty(50, BLAME));
    expect(honesty(100, BLAME)).toBeCloseTo(1, 6);
  });
});

describe("recovery exists", () => {
  // RESIDUAL_CAPACITY must exceed INFLOW / (FIX_RATE * 100) = 0.086 or a
  // collapsed project could never climb out. This is that claim.
  it("lets an honest team climb out of a collapse", () => {
    let s = { p: 100, tick: 0 };
    for (let i = 0; i < 400; i++) s = nextState(s, HONEST);
    expect(s.p).toBeLessThan(100);
    expect(readings(s, HONEST).actualHealth).toBeGreaterThan(50);
  });

  it("keeps a collapsed project down while blame is high", () => {
    let s = { p: 100, tick: 0 };
    for (let i = 0; i < 400; i++) s = nextState(s, BLAME);
    expect(readings(s, BLAME).actualHealth).toBeLessThan(15);
  });
});

describe("the default holds flat", () => {
  it("opens on its own equilibrium", () => {
    const opened = initialState();
    expect(nextState(opened, DEFAULT_PRESSURE).p).toBeCloseTo(opened.p, 6);
  });

  it("opens honest", () => {
    const { actualHealth, reportedHealth } = readings(
      initialState(),
      DEFAULT_PRESSURE,
    );
    expect(Math.abs(reportedHealth - actualHealth)).toBeLessThan(25);
  });

  it("counts a sprint per step", () => {
    expect(nextState({ p: 30, tick: 0 }, DEFAULT_PRESSURE).tick).toBe(1);
  });
});

describe("logKey", () => {
  it("calls collapse when health is gone and blame is high", () => {
    expect(logKey(10, 10, BLAME)).toBe("collapse");
  });

  it("calls the same numbers recovery when blame is low", () => {
    expect(logKey(10, 10, HONEST)).toBe("recovery");
  });

  it("calls a matching report honest when health is high", () => {
    expect(logKey(90, 92, HONEST)).toBe("honest");
  });

  it("calls a small gap drifting", () => {
    expect(logKey(60, 75, WATERMELON)).toBe("drifting");
  });

  it("stays drifting on a wide gap the bars do not show as green over red", () => {
    // Amber over amber: the watermelon line would make a false colour claim.
    expect(logKey(45, 71, WATERMELON)).toBe("drifting");
  });
});

describe("healthTone", () => {
  it("bands health", () => {
    expect(healthTone(71)).toBe("good");
    expect(healthTone(41)).toBe("warn");
    expect(healthTone(40)).toBe("bad");
  });
});
