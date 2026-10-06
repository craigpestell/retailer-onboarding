import fs from "node:fs";
import path from "node:path";

export type GuideShot = {
  region: string;
  step: string;
  file: string;
  url: string;
  alt: string;
  caption: string;
  capturedAt: string;
};

const MANIFEST = path.join(process.cwd(), "guides", "manifest.json");

function readManifest(): GuideShot[] {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return [];
  }
}

/** Screenshots for one region's step slug, in capture order. */
export function getGuideShots(region: string, slug: string): GuideShot[] {
  return readManifest().filter(
    (s) => s.region === region && s.step.replace(/^\d+-/, "") === slug,
  );
}
