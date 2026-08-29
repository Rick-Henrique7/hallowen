import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/api/db/client";
import { invites } from "@/api/db/schema";

const createSchema = z.object({
  name: z.string().min(1).max(120),
});

const idSchema = z.number().int().positive();

const updateSchema = z.object({
  id: idSchema,
  sent: z.boolean().optional(),
  confirmed: z.boolean().optional(),
});

const deleteSchema = z.object({
  id: idSchema,
});

export const listInvites = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await db.select().from(invites).orderBy(desc(invites.createdAt));
  return rows;
});

export const createInvite = createServerFn({ method: "POST" })
  .validator(createSchema)
  .handler(async ({ data }) => {
    // id is auto-assigned by Postgres (serial PK). Just insert the name.
    const inserted = await db.insert(invites).values({ name: data.name.trim() }).returning();
    const row = inserted[0];
    if (!row) {
      throw new Error("Falha ao criar convite");
    }
    return row;
  });

export const updateInvite = createServerFn({ method: "POST" })
  .validator(updateSchema)
  .handler(async ({ data }) => {
    const patch: { sent?: boolean; confirmed?: boolean } = {};
    if (typeof data.sent === "boolean") patch.sent = data.sent;
    if (typeof data.confirmed === "boolean") patch.confirmed = data.confirmed;
    const updated = await db.update(invites).set(patch).where(eq(invites.id, data.id)).returning();
    const row = updated[0];
    if (!row) {
      throw new Error("Convite não encontrado");
    }
    return row;
  });

export const deleteInvite = createServerFn({ method: "POST" })
  .validator(deleteSchema)
  .handler(async ({ data }) => {
    await db.delete(invites).where(eq(invites.id, data.id));
    return { ok: true as const };
  });
