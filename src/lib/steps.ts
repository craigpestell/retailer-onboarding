import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Step = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  time?: string;
  cost?: string;
  linkLabel?: string;
  linkUrl?: string;
  checklist: string[];
  body: string;
};

const STEPS_DIR = path.join(process.cwd(), "content", "bc");

let cache: Step[] | null = null;

export function getSteps(): Step[] {
  if (cache) return cache;
  cache = fs
    .readdirSync(STEPS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file, index) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(STEPS_DIR, file), "utf8"),
      );
      return {
        slug: file.replace(/^\d+-/, "").replace(/\.md$/, ""),
        order: index + 1,
        title: data.title,
        summary: data.summary,
        time: data.time,
        cost: data.cost,
        linkLabel: data.linkLabel,
        linkUrl: data.linkUrl,
        checklist: data.checklist ?? [],
        body: content,
      };
    });
  return cache;
}

export function getStep(slug: string): Step | undefined {
  return getSteps().find((step) => step.slug === slug);
}
