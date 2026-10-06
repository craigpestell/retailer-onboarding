import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy · Start Your Store" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>Privacy</h1>
      <p>
        This guide helps new retailers set up a business in Canada and the United States.
        We collect as little as we can. This page explains exactly what.
      </p>

      <h2>If you don&apos;t sign in</h2>
      <p>
        Your checklist progress is saved in your browser&apos;s local storage on
        your own device. It is never sent to us. Clearing your browser data
        removes it.
      </p>

      <h2>If you sign in</h2>
      <p>We store:</p>
      <ul>
        <li>your email address</li>
        <li>which checklist tasks you have ticked, and when</li>
        <li>
          only if you choose to fill in the &quot;Your business details&quot;
          page: the business name, address and registration or tax numbers you
          enter there. This is optional, and only you can see it.
        </li>
        <li>
          a session so you stay signed in (30 days), and short-lived sign-in
          links (valid 15 minutes, single use)
        </li>
      </ul>
      <p>
        Your email is used only to send sign-in links. We don&apos;t send
        marketing email, and we don&apos;t share or sell your data. You can
        delete your account and all of this data at any time from the{" "}
        <a href="/account">account page</a>.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics, which is cookieless. It records aggregate
        page views and anonymous events such as &ldquo;a task in step X was
        ticked&rdquo;. These events aren&apos;t linked to your email or
        account.
      </p>

      <h2>Services we use</h2>
      <ul>
        <li>Vercel: hosting and analytics</li>
        <li>A managed Postgres database: stores account data</li>
        <li>Resend: delivers sign-in emails</li>
        <li>
          Cloudflare Turnstile: a human check on the sign-in form, to prevent
          abuse
        </li>
      </ul>

      <h2>General guidance only</h2>
      <p>
        The content here is general information, not legal or accounting
        advice. Rules and fees change, so confirm details on each official
        site.
      </p>
    </article>
  );
}
