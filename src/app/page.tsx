import { StepList } from "@/components/StepList";
import { getSteps } from "@/lib/steps";

export default function Home() {
  const steps = getSteps().map((step) => ({
    slug: step.slug,
    order: step.order,
    title: step.title,
    summary: step.summary,
    time: step.time,
    itemCount: step.checklist.length,
  }));

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">
        Get your online store up and running
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Everything you need to register and launch a retail business in British
        Columbia, in order. Work through the steps at your own pace. Your
        progress is saved on this device.
      </p>
      <div className="mt-10">
        <StepList steps={steps} />
      </div>
    </>
  );
}
