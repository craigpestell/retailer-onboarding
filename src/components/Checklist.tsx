"use client";

import { itemId, useProgress } from "@/lib/progress";

export function Checklist({ slug, items }: { slug: string; items: string[] }) {
  const { done, toggle } = useProgress();

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const id = itemId(slug, index);
        const checked = done.has(id);
        return (
          <li key={id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(id)}
                className="mt-1 h-4 w-4 accent-emerald-600"
              />
              <span className={checked ? "text-neutral-500 line-through" : ""}>
                {item}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
