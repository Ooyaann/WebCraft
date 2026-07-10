# Deployment Guide — WebCraft v3

Arsitektur: **satu project Vercel** (Next.js full-stack) + **Supabase Postgres**.
Tidak ada lagi Hugging Face Spaces, Docker, atau CORS antar-domain.

---

## 0. Prasyarat (WAJIB sebelum publik)

- [ ] **Rotasi kunci** yang pernah bocor di repo lama:
  - `JWT_SECRET` baru: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
  - `GEMINI_API_KEY` baru dari Google AI Studio.
- [ ] Pastikan `.env.local` **tidak** ter-commit (sudah di `.gitignore`).
- [ ] Repo lama `Ooyaann/webcraft-education` dijadikan **private** / dihapus.

---

## 1. Supabase (database)

1. Buat project di [supabase.com](https://supabase.com) (region terdekat, mis. Singapore).
2. Dashboard → **Connect** → tab **Transaction pooler** → salin URI (port **6543**):
   ```
   postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
3. Buat skema + data demo dari mesin lokal:
   ```bash
   # isi DATABASE_URL produksi sementara di .env.local, lalu:
   npm run db:push     # buat semua tabel
   npm run seed        # akun demo budi/andi + kelas contoh (OPSIONAL)
   ```
   > ⚠️ `npm run seed` menghapus seluruh data lebih dulu — jangan jalankan pada
   > database yang sudah berisi data asli.

---

## 2. Vercel (aplikasi)

1. Vercel → **New Project** → import repo GitHub ini.
2. Root Directory: **root repo** (default). Framework: **Next.js** (otomatis).
3. Environment Variables:

   | Nama | Nilai |
   |------|-------|
   | `DATABASE_URL` | URI transaction pooler Supabase (port 6543) |
   | `JWT_SECRET` | hasil rotasi (base64url 48 byte) |
   | `GEMINI_API_KEY` | API key Gemini baru (kosongkan = mode AI offline) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` (opsional) |
   | `REFRESH_TOKEN_EXPIRE_DAYS` | `7` (opsional) |

4. Deploy. UI dan API berada di origin yang sama (`/api/*`) — tidak perlu
   konfigurasi CORS ataupun `VITE_API_URL`.

---

## 3. Checklist verifikasi pasca-deploy

- [ ] Buka domain Vercel → halaman beranda tampil, font & ikon muncul.
- [ ] `https://<domain>/api/health` → `{"status":"online",...}`.
- [ ] Login `andi@siswa.com` / `siswa123` berhasil (berarti DB OK).
- [ ] Buat/lihat kelas, kerjakan misi, cek Rekap & Penilaian guru.
- [ ] Token refresh: hapus `webcraft_token` di localStorage → aksi berikutnya
      auto-refresh mulus.

---

## Ringkasan variabel lingkungan

**Vercel:** `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`,
(opsional) `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`.

**Dev lokal (`.env.local`):** `DATABASE_URL=pglite://./.pglite` + `JWT_SECRET`
(+ `GEMINI_API_KEY` bila ingin AI online).
