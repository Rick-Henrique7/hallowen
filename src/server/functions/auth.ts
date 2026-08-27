import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { admin } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, deleteSession, validateSession } from "@/server/auth/session";
import { clearSessionCookie, getSessionCookie, setSessionCookie } from "@/server/auth/cookie";

const credentialsSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(8).max(256),
});

export const getCurrentAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const token = getSessionCookie();
  if (!token) return null;
  const ok = await validateSession(token);
  if (!ok) {
    clearSessionCookie();
    return null;
  }
  const rows = await db.select({ id: admin.id, username: admin.username }).from(admin).limit(1);
  return rows[0] ?? null;
});

export const hasAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await db.select({ id: admin.id }).from(admin).limit(1);
  return rows.length > 0;
});

export const setupAdmin = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const existing = await db.select({ id: admin.id }).from(admin).limit(1);
    if (existing.length > 0) {
      throw new Error("Admin já existe");
    }
    const passwordHash = await hashPassword(data.password);
    await db.insert(admin).values({
      username: data.username,
      passwordHash,
    });
    return { ok: true as const };
  });

export const login = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const rows = await db.select().from(admin).where(eq(admin.username, data.username)).limit(1);
    const row = rows[0];
    if (!row) {
      throw new Error("Credenciais inválidas");
    }
    const ok = await verifyPassword(data.password, row.passwordHash);
    if (!ok) {
      throw new Error("Credenciais inválidas");
    }
    const token = await createSession();
    setSessionCookie(token);
    return { ok: true as const };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const token = getSessionCookie();
  if (token) {
    await deleteSession(token);
  }
  clearSessionCookie();
  return { ok: true as const };
});
