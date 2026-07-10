// Berjalan sekali saat server start. Mode dev lokal tanpa install Postgres:
// set DATABASE_URL=pglite://./.pglite → Postgres in-process (PGlite) dengan
// migrasi drizzle/ diterapkan otomatis. Produksi tetap Supabase (postgres://).
export async function register() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("pglite://")) return;

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const schema = await import("./db/schema");
  const dbModule = await import("./db");

  const dataDir = url.slice("pglite://".length) || "./.pglite";
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  dbModule.setDb(db as unknown as import("./db").Db);
  console.log(`[webcraft] PGlite dev database aktif di ${dataDir}`);
}
