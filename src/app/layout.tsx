import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Start Your Store: BC Setup Guide",
  description:
    "A step-by-step checklist for registering and launching an online retail business in British Columbia.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-2xl items-center px-4 py-4">
            <Link href="/" className="font-semibold">
              Start Your Store
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800">
          General guidance, not legal or accounting advice. Rules and fees
          change, so confirm details on each official site.
        </footer>
      </body>
    </html>
  );
}
