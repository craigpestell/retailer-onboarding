// Checks every region's guide content and screenshot manifest for the house
// rules in .claude/agents/guide-editor.md. Prints each problem and exits 1 if
// any are found. Usage: npm run content:check [-- <code> ...]
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const queue = JSON.parse(
  fs.readFileSync(path.join(ROOT, "research", "queue.json"), "utf8"),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "guides", "manifest.json"), "utf8"),
);

const only = process.argv.slice(2).map((c) => c.toLowerCase());
const regions = fs
  .readdirSync(CONTENT)
  .filter((d) => fs.statSync(path.join(CONTENT, d)).isDirectory())
  .filter((d) => only.length === 0 || only.includes(d));

const problems = [];
const report = (where, msg) => problems.push(`${where}: ${msg}`);

const REQUIRED = ["title", "summary", "time", "cost", "checklist"];
const ALLOWED = new Set([...REQUIRED, "linkLabel", "linkUrl"]);

for (const region of regions) {
  const entry = queue.find((q) => q.code.toLowerCase() === region);
  if (!entry) report(`content/${region}`, "no matching entry in research/queue.json");
  else if (entry.status !== "done")
    report(`content/${region}`, `queue status is "${entry.status}", expected "done"`);

  const files = fs
    .readdirSync(path.join(CONTENT, region))
    .filter((f) => f.endsWith(".md"))
    .sort();
  const slugs = new Set();

  files.forEach((file, i) => {
    const where = `content/${region}/${file}`;
    const m = file.match(/^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/);
    if (!m) {
      report(where, "filename must be NN-kebab-slug.md");
      return;
    }
    if (Number(m[1]) !== i + 1)
      report(where, `numbered ${m[1]}, expected ${String(i + 1).padStart(2, "0")} (no gaps)`);
    slugs.add(m[2]);

    const { data, content } = matter(fs.readFileSync(path.join(CONTENT, region, file), "utf8"));

    for (const key of REQUIRED) if (data[key] === undefined) report(where, `missing ${key}`);
    for (const key of Object.keys(data))
      if (!ALLOWED.has(key)) report(where, `unknown frontmatter key ${key}`);
    if (Boolean(data.linkLabel) !== Boolean(data.linkUrl))
      report(where, "linkLabel and linkUrl go together");
    if (data.linkUrl && !/^https:\/\//.test(data.linkUrl))
      report(where, "linkUrl must be https");

    if (typeof data.title === "string" && /[.!?]$/.test(data.title))
      report(where, "title should not end with punctuation");
    if (typeof data.summary === "string" && !/[.!?]$/.test(data.summary))
      report(where, "summary should be a sentence ending with a full stop");
    for (const key of ["time", "cost"])
      if (typeof data[key] === "string" && /\d-\d/.test(data[key]))
        report(where, `${key}: use an en dash for ranges (1–2, not 1-2)`);

    if (!Array.isArray(data.checklist) || data.checklist.length === 0)
      report(where, "checklist must be a non-empty list");
    else {
      const seen = new Set();
      data.checklist.forEach((item, n) => {
        const at = `${where} checklist ${n + 1}`;
        if (typeof item !== "string") return report(at, "must be plain text");
        if (!/^[A-Z]/.test(item)) report(at, "start with a capitalised verb");
        if (/[.;:]$/.test(item)) report(at, "no trailing punctuation");
        if (item.length > 110) report(at, "too long (keep under 110 characters)");
        if (seen.has(item)) report(at, "duplicate item");
        seen.add(item);
      });
    }

    if (/^# /m.test(content)) report(where, "body uses an H1; start sections at ##");
    if (!/^## /m.test(content)) report(where, "body needs at least one ## section");
    if (content.includes("—")) report(where, "body uses an em dash; rewrite as two sentences or use a comma");
    for (const [, n] of content.matchAll(/\bstep (\d+)\b/gi))
      if (Number(n) < 1 || Number(n) > files.length)
        report(where, `refers to step ${n}, but the guide has ${files.length} steps`);
  });

  const stepNames = new Set(files.map((f) => f.replace(/\.md$/, "")));
  for (const shot of manifest.filter((s) => s.region === region)) {
    const where = `guides/manifest.json ${shot.file}`;
    if (!stepNames.has(shot.step)) report(where, `step ${shot.step} has no content file`);
    if (!fs.existsSync(path.join(ROOT, "public", shot.file))) report(where, "image file missing");
    if (!/[.!?]$/.test(shot.caption)) report(where, "caption should end with a full stop");
    if (!shot.alt || shot.alt.length < 20) report(where, "alt text missing or too short");
  }
}

if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`\n${problems.length} problem(s) in ${regions.join(", ")}`);
  process.exit(1);
}
console.log(`Content OK: ${regions.join(", ")}`);
