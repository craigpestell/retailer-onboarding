"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export function AuthNav() {
  const { status, email } = useProgress();

  if (status === "loading") return <span className="h-5" aria-hidden />;
  if (status === "user") {
    return (
      <Link
        href="/account"
        className="max-w-[12rem] truncate text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        {email}
      </Link>
    );
  }
  return (
    <Link href="/login" className="text-sm font-medium hover:underline">
      Sign in
    </Link>
  );
}
