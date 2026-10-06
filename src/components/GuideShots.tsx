"use client";

import Image from "next/image";
import { useRef } from "react";
import type { GuideShot } from "@/lib/guides";

const REPORT_EMAIL =
  process.env.NEXT_PUBLIC_REPORT_EMAIL ?? "report@bizrocket.ca";

function reportHref(stepTitle: string, shot: GuideShot) {
  const subject = `Guide problem: ${stepTitle}`;
  const body = [
    "What's different on the real site?",
    "",
    "",
    "---",
    `Step: ${stepTitle}`,
    `Screenshot: ${shot.caption}`,
    `Captured: ${shot.capturedAt}`,
    `Page: ${shot.url}`,
  ].join("\n");
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function GuideShots({
  stepTitle,
  shots,
}: {
  stepTitle: string;
  shots: GuideShot[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (shots.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="mt-4 ml-2 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Step-by-step guide
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="guide-title"
        // Clicks on the backdrop target the dialog element itself.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto max-h-[90dvh] w-[min(56rem,calc(100vw-2rem))] overscroll-contain rounded-xl border border-neutral-200 bg-background p-0 text-foreground backdrop:bg-black/60 dark:border-neutral-800"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-neutral-200 bg-background px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 id="guide-title" className="text-lg font-semibold">
              {stepTitle}: step-by-step guide
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Screenshots use a made-up example business. Official sites
              change, so yours may look slightly different.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close guide"
            className="rounded-md px-2 py-1 text-xl leading-none text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ×
          </button>
        </div>

        <ol className="space-y-8 px-5 py-6">
          {shots.map((shot, i) => (
            <li key={shot.file}>
              <figure>
                <Image
                  src={`/${shot.file}`}
                  alt={shot.alt}
                  width={1280}
                  height={800}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800"
                />
                <figcaption className="mt-2 text-sm">
                  <span className="font-medium">{i + 1}.</span> {shot.caption}
                  <span className="block text-xs text-neutral-500">
                    Captured {shot.capturedAt}
                    {" · "}
                    <a
                      href={reportHref(stepTitle, shot)}
                      className="underline hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      Report a problem
                    </a>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </dialog>
    </>
  );
}
