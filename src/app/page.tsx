import Link from "next/link";
import { getRegions, type Region } from "@/lib/regions";

const COUNTRIES: { code: Region["country"]; label: string; unit: string }[] = [
  { code: "CA", label: "Canada", unit: "provinces and territories" },
  { code: "US", label: "United States", unit: "states" },
];

export default function Home() {
  const regions = getRegions();
  const available = regions.filter((r) => r.available);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">
        Get your online store up and running
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        Step-by-step guides for registering and launching a retail business.
        Rules differ by province and state, so start by choosing where your
        business will be based.
      </p>

      <section className="mt-10" aria-labelledby="available-heading">
        <h2 id="available-heading" className="mb-3 text-lg font-semibold">
          Available now
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {available.map((region) => (
            <li key={region.slug}>
              <Link
                href={`/${region.slug}`}
                className="block rounded-xl border border-neutral-200 p-4 transition hover:border-emerald-600 dark:border-neutral-800"
              >
                <span className="block font-medium">{region.name}</span>
                <span className="block text-sm text-neutral-500">
                  {region.country === "CA" ? "Canada" : "United States"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="soon-heading">
        <h2 id="soon-heading" className="text-lg font-semibold">
          Coming soon
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          We are researching one region at a time from official government
          sources and adding each guide as it is ready.
        </p>
        {COUNTRIES.map((country) => {
          const soon = regions.filter(
            (r) => r.country === country.code && !r.available,
          );
          if (!soon.length) return null;
          return (
            <div key={country.code} className="mt-5">
              <h3 className="text-sm font-medium text-neutral-500">
                {country.label}: {country.unit}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {soon.map((region) => (
                  <li
                    key={region.slug}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                  >
                    {region.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </>
  );
}
