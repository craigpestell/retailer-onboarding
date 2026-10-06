import { chromium, type Locator, type Page } from "playwright";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/guides");
const MANIFEST = path.resolve("guides/manifest.json");

export type Shot = {
  step: string;
  file: string; // path under public/, e.g. guides/02-register-business/01.webp
  url: string;
  alt: string;
  caption: string;
  capturedAt: string; // ISO date
};

export type Capture = {
  /** 1-based, used for the filename. */
  n: number;
  alt: string;
  caption: string;
  /** Elements to outline with a numbered badge before the shot, in order. */
  highlight?: (page: Page) => Locator[];
  /** Run before the shot: navigate, fill fields, etc. */
  setup: (page: Page) => Promise<void>;
};

async function annotate(page: Page, targets: Locator[]) {
  for (const [i, t] of targets.entries()) {
    const box = await t.first().boundingBox();
    if (!box) throw new Error(`highlight ${i + 1} not visible`);
    await page.evaluate(
      ({ box, label }) => {
        const outline = document.createElement("div");
        outline.dataset.guideAnnotation = "";
        Object.assign(outline.style, {
          position: "absolute",
          left: `${box.x + window.scrollX - 4}px`,
          top: `${box.y + window.scrollY - 4}px`,
          width: `${box.width + 8}px`,
          height: `${box.height + 8}px`,
          border: "3px solid #e11d48",
          borderRadius: "6px",
          zIndex: "2147483647",
          pointerEvents: "none",
        });
        const badge = document.createElement("div");
        badge.textContent = label;
        Object.assign(badge.style, {
          position: "absolute",
          // Keep the badge on screen when the target touches an edge.
          left: box.x < 24 ? "2px" : "-14px",
          top: box.y < 24 ? "2px" : "-14px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#e11d48",
          color: "#fff",
          font: "700 14px/24px system-ui, sans-serif",
          textAlign: "center",
        });
        outline.append(badge);
        document.body.append(outline);
      },
      { box, label: String(i + 1) },
    );
  }
}

/** Capture every shot for one step, write images, and merge into the manifest. */
export async function captureStep(step: string, captures: Capture[]) {
  const dir = path.join(OUT_DIR, step);
  await mkdir(dir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    locale: "en-CA",
  });
  const shots: Shot[] = [];

  try {
    for (const c of captures) {
      await c.setup(page);
      await page.waitForLoadState("networkidle");
      if (c.highlight) await annotate(page, c.highlight(page));
      const png = await page.screenshot();
      const name = `${String(c.n).padStart(2, "0")}.webp`;
      await sharp(png).webp({ quality: 85 }).toFile(path.join(dir, name));
      shots.push({
        step,
        file: `guides/${step}/${name}`,
        url: page.url(),
        alt: c.alt,
        caption: c.caption,
        capturedAt: new Date().toISOString().slice(0, 10),
      });
      console.log(`captured ${step}/${name}  ${page.url()}`);
    }
  } finally {
    await browser.close();
  }

  let existing: Shot[] = [];
  try {
    existing = JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {}
  const merged = [...existing.filter((s) => s.step !== step), ...shots].sort(
    (a, b) => a.file.localeCompare(b.file),
  );
  await writeFile(MANIFEST, JSON.stringify(merged, null, 2) + "\n");
}
