import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { businessProfiles } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { parseProfile } from "@/lib/profile";
import { isSameOrigin } from "@/lib/request-guard";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const [row] = await getDb()
    .select({ data: businessProfiles.data })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, user.id));
  return Response.json(
    { profile: row?.data ?? {} },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    profile?: unknown;
  } | null;
  const profile = parseProfile(body?.profile);
  if (!profile) return Response.json({ error: "bad request" }, { status: 400 });

  await getDb()
    .insert(businessProfiles)
    .values({ userId: user.id, data: profile })
    .onConflictDoUpdate({
      target: businessProfiles.userId,
      set: { data: profile, updatedAt: new Date() },
    });
  return Response.json({ ok: true });
}
