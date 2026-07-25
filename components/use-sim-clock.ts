"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

const TICK_MS = 1000;

/**
 * The clock a running sim keeps: step on an interval, but only while the sim is
 * both on screen and in a visible tab.
 *
 * Pausing is not a refinement. A sim left in a background tab would otherwise
 * step its model forever, and an Explorable can carry more than one, so the cost
 * is per sim on the page. Keeping the rule here rather than in each sim means a
 * new sim cannot open with a clock that never stops; it gets the discipline by
 * calling this at all.
 *
 * `onTick` is read as an effect event, so a sim can reach the latest slider
 * value inside it without that value becoming a dependency that would restart
 * the clock mid-run every time the reader drags the slider.
 *
 * Returns the ref to attach to the sim's own element (the thing observed for
 * visibility) and whether the clock is currently running, which sims show as a
 * running / paused label.
 */
export function useSimClock(onTick: () => void, intervalMs: number = TICK_MS) {
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  const tick = useEffectEvent(onTick);

  // Pause when scrolled off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = onScreen && tabVisible;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [running, intervalMs]);

  return { ref, running };
}
