"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export function SignupBanner() {
  const { status, done } = useProgress();
  if (status !== "anon") return null;

  return (
    <aside className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
      <p>
        {done.size > 0
          ? "Your progress is saved in this browser only. "
          : "Progress is saved in this browser only. "}
        <Link href="/login" className="font-medium underline">
          Sign in to keep it across devices
        </Link>
        . It&apos;s optional.
      </p>
    </aside>
  );
}
