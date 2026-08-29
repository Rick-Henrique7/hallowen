import { pgTable, text, boolean, timestamp, serial, index } from "drizzle-orm/pg-core";

/**
 * Single-tenant: only one row ever. Created by /admin/setup on first visit.
 * Password is bcrypt-hashed (cost 10).
 */
export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Each row is one invited guest. `id` is a server-assigned auto-increment
 * integer (the unique identifier for the row + the public URL `?id=...`).
 * `name` is free-form text (duplicates are allowed — the URL id is what
 * disambiguates). `sent` and `confirmed` are organizer-toggled
 * (no backend write from the guest).
 */
export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sent: boolean("sent").notNull().default(false),
  confirmed: boolean("confirmed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Active admin sessions. The cookie carries `id` (32-char random token).
 * `expiresAt` is 30 days from creation. Stale rows are cleaned up on
 * every server-function call (opportunistic).
 */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("idx_sessions_expires").on(table.expiresAt)],
);
