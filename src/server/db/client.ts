import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const url = process.env["DATABASE_URL"];
if (!url) {
  console.warn("[db] DATABASE_URL is not set; DB calls will fail at runtime");
}

const sql = neon(url ?? "postgresql://placeholder@localhost/db");

export const db = drizzle(sql, { schema });
export type DB = typeof db;
