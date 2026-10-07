"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROFILE_SECTIONS, toExport, type Profile } from "@/lib/profile";
import { useProgress } from "@/lib/progress";

type Saved = "idle" | "saving" | "saved" | "error";

export function DetailsForm() {
  const { status } = useProgress();
  const [profile, setProfile] = useState<Profile>({});
  const [loaded, setLoaded] = useState(false);
  const [fieldStatus, setFieldStatus] = useState<Record<string, Saved>>({});
  const dirty = useRef(new Set<string>());
  const latest = useRef<Profile | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Don't lose a pending edit if the user navigates away within the debounce window.
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      if (latest.current) {
        void fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: latest.current }),
          keepalive: true,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "user") return;
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { profile: {} }))
      .then((data: { profile: Profile }) => {
        if (cancelled) return;
        setProfile(data.profile);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    if (loaded && window.location.hash) {
      document
        .getElementById(window.location.hash.slice(1))
        ?.scrollIntoView({ block: "start" });
    }
  }, [loaded]);

  if (status === "loading") return null;

  if (status === "anon") {
    return (
      <div>
        <h1 id="details-heading" className="text-2xl font-bold tracking-tight">
          Your business details
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Keep the names and numbers you collect in one place, ready to carry
          into your store later. Saving needs an account so your details stay
          private to you.{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to get started.
        </p>
      </div>
    );
  }

  function mark(keys: Iterable<string>, value: Saved) {
    setFieldStatus((prev) => {
      const next = { ...prev };
      for (const k of keys) next[k] = value;
      return next;
    });
  }

  async function save(next: Profile, keys: string[]) {
    mark(keys, "saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: next }),
        keepalive: true,
      });
      mark(keys, res.ok ? "saved" : "error");
    } catch {
      mark(keys, "error");
    }
  }

  // Saves shortly after the user stops typing, and straight away when a field loses focus.
  function change(key: string, value: string) {
    const next = { ...profile, [key]: value };
    setProfile(next);
    mark([key], "idle");
    latest.current = next;
    dirty.current.add(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 800);
  }

  function flush() {
    clearTimeout(timer.current);
    const next = latest.current;
    const keys = [...dirty.current];
    latest.current = null;
    dirty.current.clear();
    if (next) void save(next, keys);
  }

  function download() {
    const blob = new Blob([JSON.stringify(toExport(profile), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business-profile.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 id="details-heading" className="text-2xl font-bold tracking-tight">
        Your business details
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Fill in each part as you finish its step. Everything is optional, and
        only you can see it.
      </p>

      <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-10">
        {PROFILE_SECTIONS.map((section) => (
          <section key={section.step} id={section.step} className="scroll-mt-16">
            <h2 className="font-semibold">{section.title}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {section.fields.map((f) => (
                <label key={f.key} className="block text-sm">
                  <span className="font-medium">{f.label}</span>
                  <input
                    type="text"
                    value={profile[f.key] ?? ""}
                    maxLength={200}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    onChange={(e) => change(f.key, e.target.value)}
                    onBlur={flush}
                    disabled={!loaded}
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
                  />
                  {f.hint && (
                    <span className="mt-1 block text-neutral-500">{f.hint}</span>
                  )}
                  <span
                    role="status"
                    className={`mt-1 block min-h-5 ${
                      fieldStatus[f.key] === "error"
                        ? "text-red-600"
                        : fieldStatus[f.key] === "saved"
                          ? "text-emerald-700 dark:text-emerald-500"
                          : "text-neutral-500"
                    }`}
                  >
                    {fieldStatus[f.key] === "saving" && "Saving…"}
                    {fieldStatus[f.key] === "saved" && "✓ Saved"}
                    {fieldStatus[f.key] === "error" &&
                      "Couldn't save. Check your connection and try again."}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={download}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Download JSON
          </button>
        </div>
      </form>
    </div>
  );
}
