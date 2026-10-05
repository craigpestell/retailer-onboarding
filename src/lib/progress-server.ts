import { getSteps } from "@/lib/steps";

export function validItemIds(): Set<string> {
  const ids = new Set<string>();
  for (const step of getSteps()) {
    step.checklist.forEach((_, i) => ids.add(`${step.slug}:${i}`));
  }
  return ids;
}
