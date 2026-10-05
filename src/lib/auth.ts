import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { getDb } from "@/db";
import { loginTokens, sessions, users } from "@/db/schema";
import { sendLoginEmail } from "@/lib/email";

const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;
const LOGIN_TOKEN_MINUTES = 15;
const MAX_LINKS_PER_EMAIL = 3; // per 15 minutes
const MAX_LINKS_PER_IP = 10; // per hour

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const newToken = () => randomBytes(32).toString("base64url");

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (email.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function getAppUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export type LinkResult = "sent" | "rate_limited";

export async function requestLoginLink(
  email: string,
  ip: string,
): Promise<LinkResult> {
  const db = getDb();

  const [byEmail] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(loginTokens)
    .where(
      and(
        eq(loginTokens.email, email),
        gt(loginTokens.createdAt, sql`now() - interval '15 minutes'`),
      ),
    );
  const [byIp] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(loginTokens)
    .where(
      and(
        eq(loginTokens.ip, ip),
        gt(loginTokens.createdAt, sql`now() - interval '1 hour'`),
      ),
    );
  if (byEmail.n >= MAX_LINKS_PER_EMAIL || byIp.n >= MAX_LINKS_PER_IP) {
    return "rate_limited";
  }

  // Opportunistic cleanup keeps these tables small without a cron job.
  await db
    .delete(loginTokens)
    .where(sql`${loginTokens.expiresAt} < now() - interval '1 day'`);
  await db.delete(sessions).where(sql`${sessions.expiresAt} < now()`);

  const token = newToken();
  await db.insert(loginTokens).values({
    tokenHash: sha256(token),
    email,
    ip,
    expiresAt: new Date(Date.now() + LOGIN_TOKEN_MINUTES * 60_000),
  });

  const link = `${await getAppUrl()}/auth/verify?token=${token}`;
  await sendLoginEmail(email, link);
  return "sent";
}

/** Consumes a sign-in token (single use) and starts a session. */
export async function consumeLoginToken(token: string): Promise<boolean> {
  const db = getDb();

  // Atomic claim: only one request can flip usedAt from null.
  const [claimed] = await db
    .update(loginTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(loginTokens.tokenHash, sha256(token)),
        isNull(loginTokens.usedAt),
        gt(loginTokens.expiresAt, new Date()),
      ),
    )
    .returning({ email: loginTokens.email });
  if (!claimed) return false;

  const [user] = await db
    .insert(users)
    .values({ email: claimed.email })
    .onConflictDoUpdate({
      target: users.email,
      set: { email: claimed.email },
    })
    .returning({ id: users.id });

  const sessionToken = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({
    tokenHash: sha256(sessionToken),
    userId: user.id,
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return true;
}

export type SessionUser = { id: string; email: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await getDb()
    .select({ id: users.id, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, sha256(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    );
  return row ?? null;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb()
      .delete(sessions)
      .where(eq(sessions.tokenHash, sha256(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Deletes the user and, via cascade, their sessions and progress. */
export async function deleteAccount(userId: string): Promise<void> {
  await getDb().delete(users).where(eq(users.id, userId));
  (await cookies()).delete(SESSION_COOKIE);
}

export function isAdmin(user: SessionUser | null): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!user && !!admin && user.email === admin;
}
