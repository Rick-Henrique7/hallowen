// scripts/create-admin.ts
// One-shot script to (re)create an admin row with a known password,
// bypassing the /admin/setup UI. Uses the same bcrypt cost (10) the
// app's password.ts uses so the hash matches what login expects.
//
// Usage (PowerShell):
//   npx tsx scripts/create-admin.ts julia marshala
// or:
//   npm run create-admin -- julia marshala
//
// IMPORTANT: this script WIPES the admin table first so it always
// succeeds even when an admin already exists. Sessions are also
// cleared so any cookies in the browser stop working.

import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "../src/api/db/client";
import { admin, sessions } from "../src/api/db/schema";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: npx tsx scripts/create-admin.ts <username> <password>");
  console.error("  password must be >= 8 chars (validated by the same rule as /admin/setup)");
  process.exit(1);
}

if (password.length < 8) {
  console.error(`Password too short (${password.length} chars). Need >= 8.`);
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

await db.delete(sessions);
const existing = await db.delete(admin).where(eq(admin.username, username)).returning();
if (existing.length > 0) {
  console.log(`Removed existing admin "${username}".`);
}

await db.insert(admin).values({ username, passwordHash: hash });

const row = await db
  .select({ id: admin.id, username: admin.username, createdAt: admin.createdAt })
  .from(admin)
  .where(eq(admin.username, username))
  .limit(1);

console.log(`Created admin ${row[0]?.username ?? username} (id=${row[0]?.id ?? "?"})`);
console.log(`Sessions cleared — any existing browser cookies are invalidated.`);
console.log(`Now go to /admin/login and log in as "${username}".`);

process.exit(0);
