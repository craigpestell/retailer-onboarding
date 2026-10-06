import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignupBanner } from "@/components/SignupBanner";
import { StepList } from "@/components/StepList";
import { getAvailableRegions, getRegion } from "@/lib/regions";
import { getSteps } from "@/lib/steps";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAvailableRegions().map((region) => ({ region: region.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[region]">,
): Promise<Metadata> {
  const { region } = await props.params;
  const found = getRegion(region);
  return {
    title: found
      ? `Start Your Store: ${found.name} Setup Guide`
      : "Not found",
  };
}

export default async function RegionPage(props: PageProps<"/[region]">) {
  const { region: slug } = await props.params;
  const region = getRegion(slug);
  if (!region?.available) notFound();

  const steps = getSteps(slug).map((step) => ({
    slug: step.slug,
    order: step.order,
    title: step.title,
    summary: step.summary,
    time: step.time,
    itemCount: step.checklist.length,
  }));

  return (
    <>
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ← Choose a different region
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Get your online store up and running in {region.name}
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Everything you need to register and launch a retail business in{" "}
        {region.name}, in order. Work through the steps at your own pace. Your
        progress is saved in this browser, or to your account if you sign in.
      </p>
      <div className="mt-10">
        <SignupBanner />
        <StepList region={slug} steps={steps} />
      </div>
    </>
  );
}
