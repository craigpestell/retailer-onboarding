import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, gt, isNull, ne, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { checklistEvents, progress, users } from "@/db/schema";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { validItemIds } from "@/lib/progress-server";
import { getAvailableRegions } from "@/lib/regions";
import { getSteps } from "@/lib/steps";
import { purgeEvents } from "./actions";

/** "on:hst:1" → { region, step, item } for display. */
function itemLabels() {
  const labels = new Map<string, { region: string; step: string; item: string }>();
  for (const region of getAvailableRegions()) {
    const prefix = region.slug === "bc" ? "" : `${region.slug}:`;
    for (const step of getSteps(region.slug)) {
      step.checklist.forEach((item, i) =>
        labels.set(`${prefix}${step.slug}:${i}`, {
          region: region.name,
          step: step.title,
          item,
        }),
      );
    }
  }
  return labels;
}

export const metadata: Metadata = {
  title: "Admin · Start Your Store",
  robots: { index: false },
};

export default async function AdminPage(props: PageProps<"/admin">) {
  const admin = await getSessionUser();
  if (!admin || !isAdmin(admin)) notFound();

  const regions = getAvailableRegions();
  const params = await props.searchParams;
  const region = regions.find((r) => r.slug === params.region);
  const hideMine = params.mine === "hide";
  const purged = params.purged === "1";
  const filter = and(
    region ? eq(checklistEvents.region, region.slug) : undefined,
    hideMine
      ? or(isNull(checklistEvents.userId), ne(checklistEvents.userId, admin.id))
      : undefined,
  );
  /** /admin URL with the current filters, overridden by `changes`. */
  const adminHref = (changes: { region?: string; mine?: string }) => {
    const query = new URLSearchParams();
    const r = "region" in changes ? changes.region : region?.slug;
    const m = "mine" in changes ? changes.mine : hideMine ? "hide" : undefined;
    if (r) query.set("region", r);
    if (m) query.set("mine", m);
    const qs = query.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };
  const [{ eventCount }] = await getDb()
    .select({ eventCount: sql<number>`count(*)::int` })
    .from(checklistEvents);

  const total = validItemIds().size;
  const rows = await getDb()
    .select({
      email: users.email,
      createdAt: users.createdAt,
      done: sql<number>`count(${progress.itemId})::int`,
      lastActive: sql<Date | null>`max(${progress.doneAt})`,
    })
    .from(users)
    .leftJoin(progress, eq(progress.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  const itemStats = await getDb()
    .select({
      itemId: checklistEvents.itemId,
      ticks: sql<number>`count(*) filter (where ${checklistEvents.done})::int`,
      unticks: sql<number>`count(*) filter (where not ${checklistEvents.done})::int`,
      signedIn: sql<number>`count(*) filter (where ${checklistEvents.done} and ${checklistEvents.userId} is not null)::int`,
    })
    .from(checklistEvents)
    .where(
      and(gt(checklistEvents.createdAt, sql`now() - interval '30 days'`), filter),
    )
    .groupBy(checklistEvents.itemId)
    .orderBy(desc(sql`count(*) filter (where ${checklistEvents.done})`));
  const recent = await getDb()
    .select({
      id: checklistEvents.id,
      itemId: checklistEvents.itemId,
      done: checklistEvents.done,
      region: checklistEvents.region,
      createdAt: checklistEvents.createdAt,
      email: users.email,
    })
    .from(checklistEvents)
    .leftJoin(users, eq(users.id, checklistEvents.userId))
    .where(filter)
    .orderBy(desc(checklistEvents.createdAt))
    .limit(50);
  const labels = itemLabels();
  const label = (id: string) => labels.get(id) ?? { region: "", step: id, item: "(removed item)" };

  const fmt = (d: Date | string | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : "—";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Signed-up users</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {rows.length} accounts. Anonymous visitors aren&apos;t listed (their
        progress never leaves their browser).
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Joined</th>
              <th className="py-2 pr-4 font-medium">Progress</th>
              <th className="py-2 font-medium">Last active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.email}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="py-2 pr-4">{row.email}</td>
                <td className="py-2 pr-4">{fmt(row.createdAt)}</td>
                <td className="py-2 pr-4">
                  {row.done}/{total} ({Math.round((row.done / total) * 100)}%)
                </td>
                <td className="py-2">{fmt(row.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold tracking-tight">
        Checklist activity (last 30 days)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Every tick and untick, from signed-in users and anonymous visitors.
      </p>
      <nav aria-label="Filter by region" className="mt-4 flex flex-wrap gap-2 text-sm">
        {[{ slug: "", name: "All regions" }, ...regions].map((r) => {
          const active = (region?.slug ?? "") === r.slug;
          return (
            <Link
              key={r.slug || "all"}
              href={adminHref({ region: r.slug || undefined })}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              }`}
            >
              {r.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 text-sm">
        <Link
          href={adminHref({ mine: hideMine ? undefined : "hide" })}
          className="text-emerald-700 underline dark:text-emerald-400"
        >
          {hideMine
            ? `Showing everyone except ${admin.email}. Include my events`
            : `Exclude my events (${admin.email})`}
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Task</th>
              <th className="py-2 pr-4 font-medium">Ticked</th>
              <th className="py-2 pr-4 font-medium">Signed in</th>
              <th className="py-2 font-medium">Unticked</th>
            </tr>
          </thead>
          <tbody>
            {itemStats.map((row) => {
              const l = label(row.itemId);
              return (
                <tr
                  key={row.itemId}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <td className="py-2 pr-4">
                    <div>{l.item}</div>
                    <div className="text-xs text-neutral-500">
                      {[l.region, l.step].filter(Boolean).join(" · ")}
                    </div>
                  </td>
                  <td className="py-2 pr-4">{row.ticks}</td>
                  <td className="py-2 pr-4">{row.signedIn}</td>
                  <td className="py-2">{row.unticks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold tracking-tight">
        Latest events{region ? ` in ${region.name}` : ""}
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-500">
            <tr>
              <th className="py-2 pr-4 font-medium">When (UTC)</th>
              <th className="py-2 pr-4 font-medium">Who</th>
              <th className="py-2 pr-4 font-medium">Action</th>
              <th className="py-2 pr-4 font-medium">Region</th>
              <th className="py-2 font-medium">Task</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((row) => {
              const l = label(row.itemId);
              return (
                <tr
                  key={row.id}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(row.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="py-2 pr-4">{row.email ?? "anonymous"}</td>
                  <td className="py-2 pr-4">{row.done ? "ticked" : "unticked"}</td>
                  <td className="py-2 pr-4">
                    {regions.find((r) => r.slug === row.region)?.name ?? row.region}
                  </td>
                  <td className="py-2">
                    {l.item}
                    <span className="text-neutral-500"> · {l.step}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold tracking-tight">Purge events</h2>
      {purged ? (
        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
          All events were deleted.
        </p>
      ) : null}
      <form action={purgeEvents} className="mt-3 space-y-3 text-sm">
        <p className="text-neutral-500">
          Permanently deletes all {eventCount} recorded events, for every
          region and user. Ticked progress in accounts isn&apos;t affected.
        </p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="confirm"
            value="yes"
            required
            className="h-4 w-4 accent-red-600"
          />
          Yes, delete all {eventCount} events. This can&apos;t be undone.
        </label>
        <button
          type="submit"
          disabled={eventCount === 0}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Purge all events
        </button>
      </form>
    </div>
  );
}
