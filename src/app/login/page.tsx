import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Start Your Store" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Save your progress</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Sign in with your email to keep your checklist across devices. No
        password. We email you a one-time link. Any ticks already saved in this
        browser are added to your account.
      </p>
      <div className="mt-6">
        <LoginForm expired={error === "expired"} />
      </div>
      <p className="mt-6 text-sm text-neutral-500">
        You don&apos;t need an account. The guide works without one and saves
        progress in this browser only.{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </p>
    </div>
  );
}
