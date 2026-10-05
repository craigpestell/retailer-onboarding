"use client";

import { useState } from "react";
import { confirmLogin } from "./actions";

export function ConfirmForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const ok = await confirmLogin(formData);
    // Full page load (not a client-side redirect) so the progress store
    // re-reads the new session instead of staying in anonymous mode.
    window.location.assign(ok ? "/" : "/login?error=expired");
  }

  return (
    <form action={onSubmit} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
