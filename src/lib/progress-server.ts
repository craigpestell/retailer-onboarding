import { getAvailableRegions } from "@/lib/regions";
import { getSteps } from "@/lib/steps";

export function validItemIds(): Set<string> {
  const ids = new Set<string>();
  for (const region of getAvailableRegions()) {
    const prefix = region.slug === "bc" ? "" : `${region.slug}:`;
    for (const step of getSteps(region.slug)) {
      step.checklist.forEach((_, i) => ids.add(`${prefix}${step.slug}:${i}`));
    }
  }
  return ids;
}
