import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { confirmLogin } from "./actions";

export const metadata: Metadata = {
  title: "Confirm sign-in · Start Your Store",
  robots: { index: false },
};

// The token is only consumed when the button is pressed (a POST), so email
// link scanners that prefetch the URL can't use it up.
export default async function VerifyPage(props: PageProps<"/auth/verify">) {
  const { token } = await props.searchParams;
  if (typeof token !== "string" || !token) redirect("/login?error=expired");

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold tracking-tight">Confirm sign-in</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Press the button to finish signing in on this device.
      </p>
      <form action={confirmLogin} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
