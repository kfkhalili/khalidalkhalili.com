import { describe, expect, it } from "vitest";
import {
  BASELINE_TDR,
  DEFAULT_RATE,
  PRESETS,
  initialState,
  logKey,
  moraleTone,
  nextState,
  settle,
  tdrTone,
  velocityTone,
  type SimState,
} from "@/components/tech-debt-sim.model";

const at = (tdr: number, velocity = 100, morale = 100): SimState => ({
  tdr,
  velocity,
  morale,
  tick: 0,
});

describe("the Sustainable calibration", () => {
  // The claim REFACTOR_EFFICIENCY is derived to make true, and the reason the
  // article can call 30% sustainable. Asserted here rather than trusted.
  it("holds debt flat at the baseline", () => {
    const stepped = nextState(at(BASELINE_TDR), DEFAULT_RATE);
    expect(stepped.tdr).toBeCloseTo(BASELINE_TDR, 6);
  });

  it("opens on its own equilibrium, so nothing drifts untouched", () => {
    const opened = initialState();
    const stepped = nextState(opened, DEFAULT_RATE);
    expect(stepped.tdr).toBeCloseTo(opened.tdr, 6);
    expect(stepped.velocity).toBeCloseTo(opened.velocity, 6);
    expect(stepped.morale).toBeCloseTo(opened.morale, 6);
  });

  it("settles green: the default reads healthy on every bar", () => {
    const s = initialState();
    expect(tdrTone(s.tdr)).toBe("good");
    expect(velocityTone(s.velocity)).toBe("good");
    expect(moraleTone(s.morale)).toBe("good");
  });

  it("opens at the baseline debt level", () => {
    expect(initialState().tdr).toBeCloseTo(BASELINE_TDR, 6);
  });
});

describe("neglect compounds", () => {
  it("drives debt up when refactoring stops", () => {
    let s = at(BASELINE_TDR);
    for (let i = 0; i < 50; i++) s = nextState(s, 0);
    expect(s.tdr).toBeGreaterThan(BASELINE_TDR);
    expect(s.velocity).toBeLessThan(100);
  });

  it("reaches a worse equilibrium the less is invested", () => {
    const rates = [...PRESETS].sort((a, b) => a - b);
    const debts = rates.map((r) => settle(r).tdr);
    // Lower allocation settles at higher debt, across the archetypes.
    expect(debts[0]).toBeGreaterThan(debts[1]);
  });

  it("clamps rather than running away", () => {
    let s = at(95);
    for (let i = 0; i < 500; i++) s = nextState(s, 0);
    expect(s.tdr).toBeLessThanOrEqual(100);
    expect(s.velocity).toBeGreaterThanOrEqual(0);
    expect(s.morale).toBeGreaterThanOrEqual(0);
  });

  it("counts a week per step", () => {
    expect(nextState(at(10), DEFAULT_RATE).tick).toBe(1);
  });
});

describe("over-investment stalls delivery", () => {
  it("costs velocity even though the code stays clean", () => {
    const s = settle(80);
    expect(tdrTone(s.tdr)).toBe("good");
    expect(s.velocity).toBeLessThan(30);
  });
});

describe("logKey", () => {
  it("calls critical debt before anything else", () => {
    expect(logKey(at(80, 5))).toBe("critical");
  });

  it("warns before critical", () => {
    expect(logKey(at(40, 90))).toBe("warning");
  });

  it("reports a stall only once debt is not the headline", () => {
    expect(logKey(at(5, 10))).toBe("stalled");
  });

  it("reports health when debt is low and delivery is fast", () => {
    expect(logKey(at(5, 80))).toBe("healthy");
  });

  it("falls through to normal", () => {
    expect(logKey(at(25, 50))).toBe("normal");
  });
});

describe("tone thresholds", () => {
  it("bands velocity", () => {
    expect(velocityTone(61)).toBe("good");
    expect(velocityTone(31)).toBe("warn");
    expect(velocityTone(30)).toBe("bad");
  });

  it("bands debt, where lower is better", () => {
    expect(tdrTone(19)).toBe("good");
    expect(tdrTone(20)).toBe("warn");
    expect(tdrTone(50)).toBe("bad");
  });

  it("bands morale", () => {
    expect(moraleTone(71)).toBe("good");
    expect(moraleTone(41)).toBe("warn");
    expect(moraleTone(40)).toBe("bad");
  });
});
