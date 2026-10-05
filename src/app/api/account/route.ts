import { deleteAccount, getSessionUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/request-guard";

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  await deleteAccount(user.id);
  return Response.json({ ok: true });
}
