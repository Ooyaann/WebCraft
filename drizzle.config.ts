import { defineConfig } from "drizzle-kit";

// drizzle-kit tidak memuat .env.local sendiri — muat manual (Node 20+).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file tidak ada — lanjut
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
