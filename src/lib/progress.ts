"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "onboarding:bc:v1";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string): Set<string> {
  try {
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function write(ids: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Storage can be blocked (private window); progress just won't persist.
  }
  listeners.forEach((listener) => listener());
}

export const itemId = (slug: string, index: number) => `${slug}:${index}`;

export function useProgress() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const done = useMemo(() => parse(raw), [raw]);

  const toggle = useCallback((id: string) => {
    const next = parse(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(next);
  }, []);

  const reset = useCallback(() => write(new Set()), []);

  return { done, toggle, reset };
}
