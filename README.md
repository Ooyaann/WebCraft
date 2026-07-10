# WebCraft

Platform pembelajaran web interaktif berbasis **Challenge-Based Learning (CBL)** dan
**Computational Thinking (CT)** untuk siswa SMP. Siswa merakit halaman web secara
visual (blok → AST) dengan pendampingan AI, sementara guru mengelola kelas,
pertemuan, aturan validasi misi, konten CT Journey, dan penilaian.

## Arsitektur (v3)

Satu aplikasi **Next.js 16 full-stack TypeScript**, satu deploy ke **Vercel**:

- **UI** — React 19 + Tailwind v4 (`src/app`, `src/views`, `src/components`),
  gaya neo-brutalist, font & ikon self-hosted (offline-ready).
- **API** — Route Handlers di `src/app/api/*` (port 1:1 dari FastAPI lama;
  path & bentuk respons identik).
- **Database** — Postgres (Supabase) via **Drizzle ORM** (`src/db`).
  Migrasi SQL di `drizzle/`.
- **AI** — Gemini (`@google/genai`) dengan fallback offline (`src/lib/ai.ts`);
  tanpa `GEMINI_API_KEY` aplikasi tetap berfungsi penuh dalam mode offline.

## Menjalankan secara lokal

Tanpa install Postgres apa pun — pakai mode PGlite (Postgres in-process):

```bash
npm install
cp .env.example .env.local
# isi .env.local:
#   DATABASE_URL=pglite://./.pglite
#   JWT_SECRET=<bebas untuk dev>
npm run dev            # http://localhost:3000
```

Skema dibuat otomatis saat server start (mode PGlite). Untuk Postgres/Supabase:
`npm run db:push` (buat skema) lalu `npm run seed` (akun demo budi/andi + kelas contoh).

Akun demo hasil seed: guru `budi@guru.com` / `guru123`, siswa `andi@siswa.com` / `siswa123`.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `start` | Build & serve produksi |
| `npm test` | Vitest (33 test: auth, integrasi API via PGlite, astUtils, store) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Terapkan skema Drizzle ke DATABASE_URL |
| `npm run db:generate` / `db:migrate` | Buat / jalankan migrasi SQL |
| `npm run seed` | Isi data demo (menghapus data lama!) |

## Deploy

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel + Supabase, variabel lingkungan,
dan checklist verifikasi.
