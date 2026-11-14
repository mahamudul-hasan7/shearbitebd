"use client";

import { useSyncExternalStore } from "react";

let timestamp: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timestamp = Date.now();
    timer = setInterval(() => { timestamp = Date.now(); listeners.forEach((notify) => notify()); }, 1000);
  }
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = undefined; } };
}
export function useClock() { return useSyncExternalStore(subscribe, () => timestamp, () => null); }
