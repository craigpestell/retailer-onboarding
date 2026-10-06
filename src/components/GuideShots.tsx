import Image from "next/image";
import type { GuideShot } from "@/lib/guides";

const REPORT_EMAIL =
  process.env.NEXT_PUBLIC_REPORT_EMAIL ?? "report@bizrocket.ca";

function reportHref(stepTitle: string, shot: GuideShot) {
  const subject = `Guide problem: ${stepTitle}`;
  const body = [
    "What's different on the real site?",
    "",
    "",
    "---",
    `Step: ${stepTitle}`,
    `Screenshot: ${shot.caption}`,
    `Captured: ${shot.capturedAt}`,
    `Page: ${shot.url}`,
  ].join("\n");
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function GuideShots({
  stepTitle,
  shots,
}: {
  stepTitle: string;
  shots: GuideShot[];
}) {
  if (shots.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-semibold">What you&apos;ll see</h2>
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        Screenshots use a made-up example business. Official sites change, so
        yours may look slightly different.
      </p>
      <ol className="space-y-8">
        {shots.map((shot, i) => (
          <li key={shot.file}>
            <figure>
              <Image
                src={`/${shot.file}`}
                alt={shot.alt}
                width={1280}
                height={800}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800"
              />
              <figcaption className="mt-2 text-sm">
                <span className="font-medium">{i + 1}.</span> {shot.caption}
                <span className="block text-xs text-neutral-500">
                  Captured {shot.capturedAt}
                  {REPORT_EMAIL && (
                    <>
                      {" · "}
                      <a
                        href={reportHref(stepTitle, shot)}
                        className="underline hover:text-neutral-800 dark:hover:text-neutral-200"
                      >
                        Report a problem
                      </a>
                    </>
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  );
}
