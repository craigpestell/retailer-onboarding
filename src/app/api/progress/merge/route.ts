import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { progress } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { validItemIds } from "@/lib/progress-server";
import { isSameOrigin } from "@/lib/request-guard";

/** Adds ticks from the browser to the account (union; never removes anything). */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    ids?: unknown;
  } | null;
  if (!body || !Array.isArray(body.ids)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const valid = validItemIds();
  const ids = [
    ...new Set(
      body.ids.filter((id): id is string => typeof id === "string" && valid.has(id)),
    ),
  ];

  const db = getDb();
  if (ids.length) {
    await db
      .insert(progress)
      .values(ids.map((itemId) => ({ userId: user.id, itemId })))
      .onConflictDoNothing();
  }
  const rows = await db
    .select({ itemId: progress.itemId })
    .from(progress)
    .where(eq(progress.userId, user.id));
  return Response.json({ ids: rows.map((r) => r.itemId) });
}
