"use client";

import Script from "next/script";
import { useActionState } from "react";
import { requestLogin, type LoginState } from "./actions";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function LoginForm({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    requestLogin,
    { status: "idle" },
  );

  if (state.status === "sent") {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-sm">
          If that address is valid, a sign-in link is on its way. It works once
          and expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {expired && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          That link has expired or was already used. Request a new one.
        </p>
      )}
      <label className="block text-sm font-medium" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
      />
      {siteKey && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
          <div className="cf-turnstile" data-sitekey={siteKey} />
        </>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
