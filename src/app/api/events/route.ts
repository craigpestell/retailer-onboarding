import { getDb } from "@/db";
import { checklistEvents } from "@/db/schema";
import { validItemIds } from "@/lib/progress-server";
import { isSameOrigin } from "@/lib/request-guard";

/**
 * Records a tick or untick from a visitor who isn't signed in. Only the item
 * and the time are stored; no user, IP or device identifier. Signed-in ticks
 * are recorded by /api/progress instead.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
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

  await getDb()
    .insert(checklistEvents)
    .values({ itemId: body.id, done: body.done });
  return Response.json({ ok: true });
}
