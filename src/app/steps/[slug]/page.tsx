import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { Checklist } from "@/components/Checklist";
import { GuideShots } from "@/components/GuideShots";
import { getGuideShots } from "@/lib/guides";
import { getSection } from "@/lib/profile";
import { getStep, getSteps } from "@/lib/steps";

export function generateStaticParams() {
  return getSteps().map((step) => ({ slug: step.slug }));
}

export async function generateMetadata(
  props: PageProps<"/steps/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const step = getStep(slug);
  return { title: step ? `${step.title} · Start Your Store` : "Not found" };
}

export default async function StepPage(props: PageProps<"/steps/[slug]">) {
  const { slug } = await props.params;
  const step = getStep(slug);
  if (!step) notFound();

  const steps = getSteps();
  const index = steps.findIndex((s) => s.slug === slug);
  const section = getSection(step.slug);
  const prev = steps[index - 1];
  const next = steps[index + 1];

  return (
    <article>
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ← All steps
      </Link>
      <p className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-500">
        Step {step.order} of {steps.length}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{step.title}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        {step.summary}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
        {step.time && (
          <div>
            <dt className="text-neutral-500">Time</dt>
            <dd className="font-medium">{step.time}</dd>
          </div>
        )}
        {step.cost && (
          <div>
            <dt className="text-neutral-500">Cost</dt>
            <dd className="font-medium">{step.cost}</dd>
          </div>
        )}
      </dl>

      {step.linkUrl && (
        <a
          href={step.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {step.linkLabel ?? "Official site"} ↗
        </a>
      )}

      <GuideShots stepTitle={step.title} shots={getGuideShots(step.slug)} />

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <Markdown>{step.body}</Markdown>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Your checklist</h2>
        <Checklist slug={step.slug} items={step.checklist} />
        {section && (
          <p className="mt-4 text-sm">
            <Link
              href={`/details#${step.slug}`}
              className="text-neutral-500 hover:text-neutral-800 hover:underline dark:hover:text-neutral-200"
            >
              Save your {section.linkText} →
            </Link>
          </p>
        )}
      </section>

      <nav className="mt-12 flex justify-between gap-4 border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800">
        {prev ? (
          <Link href={`/steps/${prev.slug}`} className="hover:underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/steps/${next.slug}`}
            className="text-right font-medium hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <Link href="/" className="font-medium hover:underline">
            Back to overview
          </Link>
        )}
      </nav>
    </article>
  );
}
