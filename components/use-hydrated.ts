"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {}; // nothing ever changes it
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and through hydration, true afterwards.
 *
 * For anything the server cannot know: the resolved theme, whether the OS has a
 * share sheet. Reading it as an external snapshot rather than setting state in
 * an effect keeps the first client render identical to the server's, which is
 * what avoids the hydration mismatch, without the extra render pass.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
