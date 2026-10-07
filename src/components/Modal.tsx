"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// A route shown as a modal over the page the user came from. Closing goes back
// in history, so the user lands where they were.
export function Modal({
  path,
  labelledBy,
  closeLabel,
  children,
}: {
  path: string;
  labelledBy: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const open = pathname === path;

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  // The slot keeps its last page when the user follows a link out of the
  // modal (to sign in, say), so hide it once the URL has moved on.
  if (!open) return null;

  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      // Esc, the close button and backdrop clicks all end up here.
      onClose={() => {
        if (window.location.pathname === path) router.back();
      }}
      // Clicks on the backdrop target the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto max-h-[90dvh] w-[min(42rem,calc(100vw-2rem))] overscroll-contain rounded-xl border border-neutral-200 bg-background p-0 text-foreground backdrop:bg-black/60 dark:border-neutral-800"
    >
      <div className="sticky top-0 z-10 flex justify-end bg-background px-3 pt-3">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={closeLabel}
          className="rounded-md px-2 py-1 text-xl leading-none text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ×
        </button>
      </div>
      <div className="px-6 pb-6">{children}</div>
      <div className="sticky bottom-0 flex justify-end border-t border-neutral-200 bg-background px-6 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {closeLabel}
        </button>
      </div>
    </dialog>
  );
}
