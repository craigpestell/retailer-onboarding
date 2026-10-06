import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfirmForm } from "./ConfirmForm";

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
      <ConfirmForm token={token} />
    </div>
  );
}
