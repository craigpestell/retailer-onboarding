import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { progress, users } from "@/db/schema";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { validItemIds } from "@/lib/progress-server";

export const metadata: Metadata = {
  title: "Admin · Start Your Store",
  robots: { index: false },
};

export default async function AdminPage() {
  if (!isAdmin(await getSessionUser())) notFound();

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
    </div>
  );
}
