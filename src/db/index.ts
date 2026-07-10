import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

// Klien dibuat lazy (bukan saat import) supaya `next build` tetap hijau
// tanpa DATABASE_URL, dan di-cache di globalThis agar hot-reload dev
// tidak membocorkan koneksi.
const globalForDb = globalThis as unknown as { __webcraftDb?: Db };

// Injeksi database non-postgres-js: dipakai test (PGlite in-memory) dan
// mode dev lokal PGlite (lihat src/instrumentation.ts).
export function setDb(db: Db) {
  globalForDb.__webcraftDb = db;
}

export function getDb(): Db {
  if (globalForDb.__webcraftDb) return globalForDb.__webcraftDb;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set!");

  // prepare:false wajib untuk Supabase transaction pooler (port 6543).
  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });
  globalForDb.__webcraftDb = db;
  return db;
}
