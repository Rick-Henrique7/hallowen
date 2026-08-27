import { eq, lt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { sessions } from "@/server/db/schema";
import { generateSessionToken } from "@/lib/id";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);
  await db.insert(sessions).values({ id: token, expiresAt });
  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  const rows = await db
    .select({ expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.id, token))
    .limit(1);
  const row = rows[0];
  if (!row) return false;
  return row.expiresAt > new Date();
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, token));
}

/**
 * Opportunistic cleanup. Called from `validateSession` occasionally
 * to keep the table small without a real cron.
 */
export async function cleanupExpired(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
