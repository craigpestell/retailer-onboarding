"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Checklist progress with two backends behind one interface:
 *  - anonymous visitors: localStorage only, nothing is sent to a server
 *  - signed-in users: the account (database) via /api/progress
 * On first load after sign-in, ticks held in the browser are merged into the
 * account and then cleared locally, so the account is the single source of truth.
 */

const KEY = "onboarding:bc:v1";

type Status = "loading" | "anon" | "user";
type State = { status: Status; email: string | null; ids: ReadonlySet<string> };

const LOADING: State = { status: "loading", email: null, ids: new Set() };
let state: State = LOADING;
let started = false;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function readLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function writeLocal(ids: ReadonlySet<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Storage can be blocked (private window); progress just won't persist.
  }
}

function clearLocal() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

const postJson = (url: string, body: unknown) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

async function init() {
  if (started) return;
  started = true;

  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (res.ok) {
      const { email, ids } = (await res.json()) as {
        email: string;
        ids: string[];
      };
      let all = new Set(ids);
      const local = readLocal();
      if (local.size) {
        const merged = await postJson("/api/progress/merge", {
          ids: [...local],
        });
        if (merged.ok) {
          all = new Set(((await merged.json()) as { ids: string[] }).ids);
          clearLocal();
        }
      }
      setState({ status: "user", email, ids: all });
      return;
    }
  } catch {
    // Offline or server error: fall back to anonymous local mode.
  }
  setState({ status: "anon", email: null, ids: readLocal() });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export const itemId = (slug: string, index: number) => `${slug}:${index}`;

export function useProgress() {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );

  useEffect(() => {
    void init();
  }, []);

  const toggle = useCallback(async (id: string) => {
    const before = state;
    const next = new Set(before.ids);
    const done = !next.has(id);
    if (done) next.add(id);
    else next.delete(id);

    if (before.status === "user") {
      setState({ ...before, ids: next });
      try {
        const res = await postJson("/api/progress", { id, done });
        if (res.status === 401) {
          // Session expired: keep working locally instead of losing the tick.
          writeLocal(next);
          setState({ status: "anon", email: null, ids: next });
        } else if (!res.ok) {
          setState({ ...state, ids: before.ids });
        }
      } catch {
        setState({ ...state, ids: before.ids });
      }
      return;
    }

    writeLocal(next);
    setState({ ...before, ids: next });
  }, []);

  const reset = useCallback(() => {
    if (state.status !== "anon") return;
    clearLocal();
    setState({ ...state, ids: new Set() });
  }, []);

  return {
    done: current.ids,
    status: current.status,
    email: current.email,
    toggle,
    reset,
  };
}

/** Call after the server has ended the session or deleted the account. */
export function becomeAnonymous() {
  clearLocal();
  setState({ status: "anon", email: null, ids: new Set() });
}
