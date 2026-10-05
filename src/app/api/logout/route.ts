import { endSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/request-guard";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  await endSession();
  return Response.json({ ok: true });
}
