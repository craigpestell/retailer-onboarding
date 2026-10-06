"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { becomeAnonymous, useProgress } from "@/lib/progress";

export default function AccountPage() {
  const { status, email, done } = useProgress();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function call(method: "POST" | "DELETE", url: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error();
      becomeAnonymous();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  if (status === "anon") {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          You&apos;re not signed in.{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to save your progress across devices.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Signed in as <strong>{email}</strong>. {done.size} tasks saved.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/details"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Your business details
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => call("POST", "/api/logout")}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Sign out
        </button>
      </div>

      <section className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="font-semibold">Delete my account</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Permanently removes your email address and saved progress from our
          database. This can&apos;t be undone.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Delete your account and all saved progress? This can't be undone.",
              )
            )
              void call("DELETE", "/api/account");
          }}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete account
        </button>
      </section>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
