import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { progress } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { validItemIds } from "@/lib/progress-server";
import { isSameOrigin } from "@/lib/request-guard";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const rows = await getDb()
    .select({ itemId: progress.itemId })
    .from(progress)
    .where(eq(progress.userId, user.id));
  return Response.json(
    { email: user.email, ids: rows.map((r) => r.itemId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    done?: unknown;
  } | null;
  if (
    !body ||
    typeof body.id !== "string" ||
    typeof body.done !== "boolean" ||
    !validItemIds().has(body.id)
  ) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const db = getDb();
  if (body.done) {
    await db
      .insert(progress)
      .values({ userId: user.id, itemId: body.id })
      .onConflictDoNothing();
  } else {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.itemId, body.id)));
  }
  return Response.json({ ok: true });
}
