# Plan: Deploy Static ke Cloudflare Pages (Data dari JSON)

## Konteks

Infrastruktur dual-mode sudah tersedia di codebase:
- `VITE_DATA_SOURCE=static` → baca dari `/public/data/*.json`
- `VITE_DATA_SOURCE` tidak di-set → fetch dari backend API

Langkah ini: generate semua data artikel dari Neon DB ke JSON, build static, deploy ke Cloudflare Pages.

---

## Langkah-Langkah

### 1. Generate Static JSON dari Neon DB

Jalankan script yang sudah ada:

```bash
pnpm generate:static
```

Script (`apps/api/scripts/generate-static.js`) akan:
- Connect ke Neon DB via Prisma
- Query semua artikel `PUBLISHED` urut `publishedAt desc`
- Output ke `apps/web/public/data/`:
  - `articles.json` — summary semua artikel (tanpa content)
  - `articles/{slug}.json` — full artikel per slug (dengan content + related)
  - `categories/{slug}.json` — daftar artikel per kategori

**Verifikasi output:**
```bash
ls apps/web/public/data/
ls apps/web/public/data/articles/ | wc -l    # jumlah artikel
ls apps/web/public/data/categories/           # per kategori
```

---

### 2. Fix: TanStack Router SPA di Cloudflare Pages

Cloudflare Pages perlu file `_redirects` agar semua route (`/artikel/xxx`, `/kategori/xxx`, dll.) diarahkan ke `index.html` (SPA routing).

Buat file `apps/web/public/_redirects`:
```
/* /index.html 200
```

File ini akan otomatis tercopy ke `dist/` saat build karena ada di `public/`.

---

### 3. Build Static

```bash
pnpm build:static
```

Equivalen dengan:
```bash
VITE_DATA_SOURCE=static pnpm --filter web build
```

Output: `apps/web/dist/`

---

### 4. Deploy ke Cloudflare Pages (via Dashboard — GitHub/GitLab)

1. Buka Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
2. Pilih repo ini
3. Set konfigurasi build:
   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | `pnpm build:static` |
   | Build output directory | `apps/web/dist` |
   | Root directory | `/` (root monorepo) |
4. **Environment variables** — wajib semua:
   | Key | Value | Keterangan |
   |---|---|---|
   | `VITE_DATA_SOURCE` | `static` | Aktifkan mode static |
   | `NODE_VERSION` | `20` | Node.js versi |
   | `PNPM_VERSION` | `9` | **Kritis** — tanpa ini build gagal, Cloudflare default pnpm lama |
5. Save & Deploy

---

### 5. Custom Domain

Setelah deploy berhasil, di Cloudflare Pages project:

1. Tab **Custom Domains** → **Set up a custom domain**
2. Masukkan domain (misal: `poros.example.com`)
3. Karena domain di Cloudflare, DNS CNAME akan otomatis dikonfigurasi
4. Tunggu propagasi SSL (biasanya < 5 menit)

---

### 6. Update Data (Saat Ada Artikel Baru)

Setiap kali ada artikel baru di DB, ulangi:
```bash
pnpm generate:static   # pull ulang dari Neon
git add apps/web/public/data/
git commit -m "chore: refresh static article data"
git push
# → Cloudflare Pages otomatis rebuild & deploy
```

---

## Keterbatasan Mode Static (Sementara)

| Fitur | Status | Catatan |
|---|---|---|
| Homepage & listing | ✅ Berfungsi | Dari JSON |
| Detail artikel | ✅ Berfungsi | Dari `articles/{slug}.json` |
| Kategori | ✅ Berfungsi | Dari `categories/{slug}.json` |
| Search | ⚠️ Terbatas | Client-side, hanya cari di `title` + `excerpt` |
| View count | ❌ Tidak update | Tidak ada backend |
| Admin panel | ❌ Tidak bisa | Butuh backend |

---

## File yang Perlu Dibuat/Diubah

| File | Aksi | Alasan |
|---|---|---|
| `apps/web/public/_redirects` | **Buat baru** | SPA routing di Cloudflare Pages |
| `wrangler.toml` | **Buat baru** (opsional) | Deploy via Wrangler CLI |
| `apps/web/public/data/` | **Generate ulang** | Data terbaru dari DB |

---

## Migrasi ke VPS + Backend (Nanti)

Saat backend sudah jalan di VPS:

1. Set environment variable di Cloudflare Pages:
   - Hapus `VITE_DATA_SOURCE=static`
   - Tambah `VITE_API_URL=https://api.yourdomain.com`

2. Ganti build command kembali ke: `pnpm build:web`

3. Redeploy — semua data fetch otomatis beralih ke BE.

Tidak perlu ubah kode apapun, `data-source.ts` sudah handle kedua mode.

---

## Urutan Eksekusi

```
1. pnpm generate:static                  ← pull data dari Neon DB
2. Buat apps/web/public/_redirects       ← SPA routing fix
3. git add & commit public/data/         ← JSON masuk ke repo
4. git push                              ← trigger Cloudflare Pages build
5. Set env vars di Cloudflare Dashboard  ← VITE_DATA_SOURCE, NODE_VERSION, PNPM_VERSION
6. Tunggu build selesai, verifikasi      ← cek semua halaman & routing
7. Custom domain setup                   ← Custom Domains di Cloudflare Pages
```
