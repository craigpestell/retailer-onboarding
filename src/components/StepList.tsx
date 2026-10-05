"use client";

import Link from "next/link";
import { itemId, useProgress } from "@/lib/progress";

export type StepSummary = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  time?: string;
  itemCount: number;
};

export function StepList({ steps }: { steps: StepSummary[] }) {
  const { done, reset } = useProgress();

  const total = steps.reduce((sum, step) => sum + step.itemCount, 0);
  const completed = steps.reduce(
    (sum, step) =>
      sum +
      Array.from({ length: step.itemCount }, (_, i) =>
        done.has(itemId(step.slug, i)),
      ).filter(Boolean).length,
    0,
  );
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {completed} of {total} tasks done
          </span>
          <span className="text-neutral-500">{percent}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => {
          const stepDone = Array.from({ length: step.itemCount }, (_, i) =>
            done.has(itemId(step.slug, i)),
          ).filter(Boolean).length;
          const complete = stepDone === step.itemCount;
          return (
            <li key={step.slug}>
              <Link
                href={`/steps/${step.slug}`}
                className="flex items-start gap-4 rounded-xl border border-neutral-200 p-4 transition hover:border-emerald-600 dark:border-neutral-800"
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    complete
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                  aria-label={complete ? "Completed" : `Step ${step.order}`}
                >
                  {complete ? "✓" : step.order}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{step.title}</span>
                  <span className="block text-sm text-neutral-600 dark:text-neutral-400">
                    {step.summary}
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {stepDone}/{step.itemCount} tasks
                    {step.time ? ` · ${step.time}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {completed > 0 && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear all saved progress on this device?"))
              reset();
          }}
          className="mt-8 text-sm text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Reset progress
        </button>
      )}
    </div>
  );
}
