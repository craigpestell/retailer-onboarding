import fs from "node:fs";
import path from "node:path";

export type Region = {
  /** URL slug and content folder name, e.g. "bc" or "on". */
  slug: string;
  country: "CA" | "US";
  name: string;
  /** True once content/<slug>/ has guide steps. */
  available: boolean;
};

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "research", "queue.json");

let cache: Region[] | null = null;

/** Every province, territory and state, with whether its guide exists yet. */
export function getRegions(): Region[] {
  if (cache) return cache;
  const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8")) as {
    country: "CA" | "US";
    code: string;
    name: string;
  }[];
  cache = queue.map((entry) => {
    const slug = entry.code.toLowerCase();
    return {
      slug,
      country: entry.country,
      name: entry.name,
      available: fs.existsSync(path.join(ROOT, "content", slug)),
    };
  });
  return cache;
}

export const getAvailableRegions = () => getRegions().filter((r) => r.available);

export const getRegion = (slug: string) =>
  getRegions().find((r) => r.slug === slug);
