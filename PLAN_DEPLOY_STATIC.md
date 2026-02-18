# PLAN: Static-First Deploy (Cloudflare Pages MVP)

## Konteks & Tujuan

**Masalah saat ini:**
- Semua data bergantung pada Express API + Neon PostgreSQL yang harus selalu running
- Cloudflare Pages hanya host static file — tidak bisa jalankan Express/Node server
- Ada beberapa fetch yang seharusnya tidak perlu (kategori statis, dsb)
- Homepage punya inline `queryFn` yang bypass abstraksi hook — tidak best practice

**Tujuan Plan ini:**
1. Minimalisir fetch yang tidak perlu (data statis tidak perlu hit API)
2. Buat script untuk generate JSON dari DB → commit ke repo → Cloudflare Pages cukup `vite build`
3. Deploy MVP ke Cloudflare Pages tanpa API server
4. Tetap compatible untuk deploy VPS + DB di masa depan (mode API)
5. Refactor homepage agar tidak ada inline fetch — semua lewat data-source abstraction

## Keputusan Desain

| # | Topik | Keputusan |
|---|-------|-----------|
| 1 | `articles.json` | **Summary only** (no `content`). Full content hanya di `articles/[slug].json` |
| 2 | Generate workflow | **Commit ke repo** — generate lokal, push JSON, Cloudflare Pages cukup `vite build` |
| 3 | `category.description` | **Diabaikan** — pakai hardcoded config saja |
| 4 | Homepage inline fetch | **Refactor** — pindahkan ke data-source, best practice |
| 5 | Admin panel | **Exclude** via route guard di static mode, VPS-only |

---

## Arsitektur Dua Mode

```
                    ┌──────────────────────────────────┐
                    │         VITE_DATA_SOURCE          │
                    │   'static'      │     'api'       │
                    ├─────────────────┼─────────────────┤
  Homepage          │  /data/*.json   │  /api/public/*  │
  Category page     │  /data/*.json   │  /api/public/*  │
  Article detail    │  /data/*.json   │  /api/public/*  │
  Search            │  client-side    │  /api/public/*  │
  View count        │  skip           │  cookie+incr    │
  Admin panel       │  redirect → /   │  fully working  │
                    └─────────────────┴─────────────────┘
```

**Build modes:**
- **Static (Cloudflare Pages):** `VITE_DATA_SOURCE=static pnpm build:web`
- **API (VPS/Dev):** `VITE_DATA_SOURCE=api pnpm build:web` ← default

---

## Phase 1 — Hapus Fetch yang Tidak Perlu

### 1.1 — Konsolidasi Categories ke Satu Config File

**Problem:** Definisi kategori duplikat di 2 tempat:
- `apps/web/src/hooks/use-categories.ts` (HARDCODED_CATEGORIES)
- `apps/web/src/components/public/layout/navbar.tsx` (BERITA_CATEGORIES, OTHER_CATEGORIES)

**Solusi:** Buat single source of truth:

**File baru:** `apps/web/src/config/categories.ts`
```ts
export const CATEGORIES = {
  berita: [
    { name: 'Berita Jogja',    slug: 'berita-jogja'    },
    { name: 'Berita Kampus',   slug: 'berita-kampus'   },
    { name: 'Berita Nasional', slug: 'berita-nasional' },
  ],
  others: [
    { name: 'Opini',   slug: 'opini'   },
    { name: 'Resensi', slug: 'resensi' },
    { name: 'Riset',   slug: 'riset'   },
    { name: 'Sastra',  slug: 'sastra'  },
    { name: 'Komik',   slug: 'komik'   },
  ],
} as const

export const ALL_CATEGORIES = [...CATEGORIES.berita, ...CATEGORIES.others]

export type CategorySlug = typeof ALL_CATEGORIES[number]['slug']
```

**Update:** `navbar.tsx` dan `use-categories.ts` → import dari `config/categories`

### 1.2 — Hapus `usePublicCategories()` dari Homepage

**File:** `apps/web/src/routes/_public/index.tsx`

```tsx
// BEFORE — 1 extra API call hanya untuk map slug→name
const { data: categoriesData } = usePublicCategories()
const allCategories = categoriesData?.categories || []
const categoriesToShow = CATEGORY_CONFIG.map(config =>
  allCategories.find(cat => cat.slug === config.slug)
).filter(Boolean)

// AFTER — pakai config, 0 API call
import { ALL_CATEGORIES } from '../../config/categories'

const categoriesToShow = CATEGORY_CONFIG.map(config => ({
  slug: config.slug,
  id: config.slug,
  name: ALL_CATEGORIES.find(c => c.slug === config.slug)?.name ?? config.slug,
}))
```

### 1.3 — Hapus `usePublicCategories()` dari Category Page

**File:** `apps/web/src/routes/_public/kategori/$slug.tsx`

```tsx
// BEFORE
const { data: categoriesData } = usePublicCategories()
const category = categoriesData?.categories.find(c => c.slug === slug)

// AFTER — lookup dari config, sync (no loading state)
import { ALL_CATEGORIES } from '../../../config/categories'

const category = ALL_CATEGORIES.find(c => c.slug === slug)
// category.description diabaikan — tidak ada di config
```

**Hasil Phase 1:** -2 API calls per navigasi (homepage + category page).

---

## Phase 2 — Script Generate Static JSON

### 2.1 — Struktur JSON Files

```
apps/web/public/data/
  articles.json              ← summary semua artikel (NO content field)
  articles/
    [slug].json              ← full article (WITH content) + related[]
  categories/
    [slug].json              ← summary artikel per kategori (NO content)
```

**Format `articles.json`** (summary — untuk hero, homepage, search):
```json
{
  "articles": [
    {
      "id": "...",
      "title": "...",
      "slug": "...",
      "excerpt": "...",
      "coverImageUrl": "...",
      "thumbnailUrl": "...",
      "author": "...",
      "viewCount": 0,
      "status": "PUBLISHED",
      "publishedAt": "2025-01-01T00:00:00.000Z",
      "createdAt": "...",
      "category": { "id": "...", "name": "...", "slug": "..." }
    }
  ],
  "generatedAt": "2025-01-01T00:00:00.000Z"
}
```
> **Tidak ada field `content`** — file tetap kecil meski ratusan artikel.

**Format `articles/[slug].json`** (full — hanya dimuat saat buka artikel):
```json
{
  "article": { ...semua field TERMASUK content },
  "related": [ ...4 artikel summary (tanpa content) ]
}
```

**Format `categories/[slug].json`** (summary per kategori):
```json
{
  "articles": [ ...semua artikel di kategori ini, summary only ],
  "total": 42
}
```

### 2.2 — Script Generator

**File baru:** `apps/api/scripts/generate-static.js`

```js
import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const OUT_DIR = join(__dirname, '../../../apps/web/public/data')

// Summary — tanpa content, untuk listing & homepage
function toSummary(a) {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImageUrl: a.coverImageUrl,
    thumbnailUrl: a.thumbnailUrl,
    author: a.author,
    viewCount: a.viewCount,
    status: a.status,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    category: { id: a.category.id, name: a.category.name, slug: a.category.slug },
  }
}

// Full — termasuk content, untuk halaman detail artikel
function toFull(a) {
  return { ...toSummary(a), content: a.content }
}

async function main() {
  mkdirSync(`${OUT_DIR}/articles`, { recursive: true })
  mkdirSync(`${OUT_DIR}/categories`, { recursive: true })

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
  })

  const categories = await prisma.category.findMany()

  // 1. articles.json — summary semua artikel
  writeFileSync(`${OUT_DIR}/articles.json`, JSON.stringify({
    articles: articles.map(toSummary),
    generatedAt: new Date().toISOString(),
  }, null, 2))

  // 2. articles/[slug].json — full per artikel
  for (const article of articles) {
    const related = articles
      .filter(a => a.categoryId === article.categoryId && a.id !== article.id)
      .slice(0, 4)
      .map(toSummary)
    writeFileSync(
      `${OUT_DIR}/articles/${article.slug}.json`,
      JSON.stringify({ article: toFull(article), related }, null, 2)
    )
  }

  // 3. categories/[slug].json — summary artikel per kategori
  for (const category of categories) {
    const catArticles = articles.filter(a => a.categoryId === category.id)
    writeFileSync(
      `${OUT_DIR}/categories/${category.slug}.json`,
      JSON.stringify({ articles: catArticles.map(toSummary), total: catArticles.length }, null, 2)
    )
  }

  console.log(`✓ ${articles.length} articles, ${categories.length} categories → ${OUT_DIR}`)
  console.log('→ Commit public/data/ ke git, lalu push untuk deploy ke Cloudflare Pages.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

**Update `apps/api/package.json`:**
```json
{
  "scripts": {
    "generate:static": "node --experimental-vm-modules scripts/generate-static.js"
  }
}
```

**Update root `package.json`:**
```json
{
  "scripts": {
    "generate:static": "pnpm --filter api run generate:static",
    "build:static": "VITE_DATA_SOURCE=static pnpm build:web"
  }
}
```

### 2.3 — Git Setup untuk JSON Files

Pastikan `apps/web/public/data/` **tidak** di-gitignore (perlu di-commit):

**`.gitignore`** — pastikan tidak ada rule yang exclude `/apps/web/public/data`:
```gitignore
# Jangan tambahkan apps/web/public/data ke sini
# JSON files harus di-commit untuk Cloudflare Pages
```

**Workflow update konten:**
```bash
# Setiap kali ada artikel baru di DB yang ingin dipublikasi ke Cloudflare Pages:
pnpm generate:static   # generate ulang JSON
git add apps/web/public/data/
git commit -m "chore: refresh static article data"
git push              # Cloudflare Pages auto-deploy
```

---

## Phase 3 — Data Source Abstraction Layer

### 3.1 — Buat `lib/data-source.ts`

**File baru:** `apps/web/src/lib/data-source.ts`

```ts
const IS_STATIC = import.meta.env.VITE_DATA_SOURCE === 'static'
const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ArticleSummary = {
  id: string; title: string; slug: string; excerpt: string | null
  coverImageUrl: string | null; thumbnailUrl: string | null
  author: string; viewCount: number; status: string
  publishedAt: string; createdAt: string
  category: { id: string; name: string; slug: string }
}

// ── Hero / Homepage ───────────────────────────────────────────────────────────

export async function fetchHeroArticles(limit = 7): Promise<{ articles: ArticleSummary[] }> {
  if (IS_STATIC) {
    const res = await fetch('/data/articles.json')
    const { articles } = await res.json()
    return { articles: articles.slice(0, limit) }
  }
  const res = await fetch(`${BASE_API}/api/public/articles?limit=${limit}&page=1`)
  if (!res.ok) throw new Error('Failed to fetch hero articles')
  return res.json()
}

// ── Category sections di homepage ────────────────────────────────────────────

export async function fetchCategoryArticles(
  slug: string,
  opts: { limit?: number; page?: number; excludeIds?: string[] } = {}
) {
  const { limit = 3, page = 1, excludeIds = [] } = opts

  if (IS_STATIC) {
    const res = await fetch(`/data/categories/${slug}.json`)
    if (!res.ok) return { articles: [], pagination: { page, limit, total: 0, totalPages: 0 } }
    const { articles: all } = await res.json()
    const filtered = excludeIds.length
      ? all.filter((a: ArticleSummary) => !excludeIds.includes(a.id))
      : all
    const start = (page - 1) * limit
    return {
      articles: filtered.slice(start, start + limit),
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    }
  }
  const qp = new URLSearchParams({ limit: String(limit), page: String(page) })
  if (excludeIds.length) qp.append('exclude', excludeIds.join(','))
  const res = await fetch(`${BASE_API}/api/public/categories/${slug}/articles?${qp}`)
  if (!res.ok) throw new Error(`Failed to fetch articles for ${slug}`)
  return res.json()
}

// ── Article listing (category page) ─────────────────────────────────────────

export async function fetchArticlesByCategory(
  slug: string,
  opts: { limit?: number; page?: number } = {}
) {
  const { limit = 12, page = 1 } = opts

  if (IS_STATIC) {
    const res = await fetch(`/data/categories/${slug}.json`)
    if (!res.ok) return { articles: [], pagination: { page, limit, total: 0, totalPages: 0 } }
    const { articles: all } = await res.json()
    const start = (page - 1) * limit
    return {
      articles: all.slice(start, start + limit),
      pagination: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    }
  }
  const qp = new URLSearchParams({ limit: String(limit), page: String(page) })
  const res = await fetch(`${BASE_API}/api/public/articles?category=${slug}&${qp}`)
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

// ── Article detail ────────────────────────────────────────────────────────────

export async function fetchArticleDetail(slug: string) {
  if (IS_STATIC) {
    const res = await fetch(`/data/articles/${slug}.json`)
    if (!res.ok) throw new Error('Article not found')
    return res.json() // { article, related }
  }
  const [articleRes, relatedRes] = await Promise.all([
    fetch(`${BASE_API}/api/public/articles/${slug}`),
    fetch(`${BASE_API}/api/public/articles/${slug}/related`),
  ])
  if (!articleRes.ok) throw new Error('Article not found')
  const { article } = await articleRes.json()
  const { articles: related } = await relatedRes.json()
  return { article, related }
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fetchSearch(query: string, page = 1, limit = 12) {
  if (IS_STATIC) {
    const res = await fetch('/data/articles.json')
    const { articles } = await res.json()
    const q = query.toLowerCase().trim()
    const filtered = articles.filter((a: ArticleSummary) =>
      a.title.toLowerCase().includes(q) ||
      (a.excerpt?.toLowerCase().includes(q) ?? false)
    )
    // NOTE: search hanya pada title + excerpt (content tidak ada di articles.json)
    const start = (page - 1) * limit
    return {
      articles: filtered.slice(start, start + limit),
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      query,
    }
  }
  const res = await fetch(
    `${BASE_API}/api/public/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  )
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}
```

### 3.2 — Refactor `use-public-articles.ts`

Setiap `queryFn` diganti memanggil fungsi dari `data-source.ts`:

```ts
import {
  fetchHeroArticles, fetchCategoryArticles,
  fetchArticlesByCategory, fetchArticleDetail, fetchSearch
} from '../lib/data-source'

export function useHeroCarouselArticles(total = 7) {
  return useQuery({
    queryKey: ['public', 'hero-carousel', { total }],
    queryFn: () => fetchHeroArticles(total),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicArticle(slug: string) {
  return useQuery({
    queryKey: ['public', 'article', slug],
    queryFn: () => fetchArticleDetail(slug),
    enabled: !!slug,
  })
}

export function usePublicSearch(query: string, page = 1, limit = 12) {
  return useQuery({
    queryKey: ['public', 'search', { query, page, limit }],
    queryFn: () => fetchSearch(query, page, limit),
    enabled: query.trim().length > 0,
  })
}
```

### 3.3 — Refactor Homepage Inline Fetch → Hook

**Problem:** `index.tsx` punya `useQueries` dengan inline `queryFn` yang langsung fetch API — bypass data-source.

**Solusi:** Tambah hook baru `useCategoryArticles`:

```ts
// use-public-articles.ts — hook baru
interface UseCategoryArticlesParams {
  slug: string
  limit?: number
  page?: number
  excludeIds?: string[]
  enabled?: boolean
}

export function useCategoryArticles(params: UseCategoryArticlesParams) {
  const { slug, limit = 3, page = 1, excludeIds = [], enabled = true } = params
  return useQuery({
    queryKey: ['public', 'articles', 'category', slug, { limit, page, excludeIds }],
    queryFn: () => fetchCategoryArticles(slug, { limit, page, excludeIds }),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  })
}
```

**Refactor `index.tsx`:**

```tsx
// BEFORE — inline queryFn langsung fetch
const categoryQueries = useQueries({
  queries: categoriesToShow.map((cat) => ({
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/categories/${cat.slug}/articles?...`)
      ...
    }
  }))
})

// AFTER — gunakan hook yang sudah abstracted
// Tiap kategori punya hook sendiri, clean dan testable
const beritaNasionalQ = useCategoryArticles({ slug: 'berita-nasional', limit: 3, excludeIds })
const opiniQ          = useCategoryArticles({ slug: 'opini',           limit: 6, excludeIds })
const resensiQ        = useCategoryArticles({ slug: 'resensi',         limit: 4, excludeIds })
const risetQ          = useCategoryArticles({ slug: 'riset',           limit: 4, excludeIds })
const sastraQ         = useCategoryArticles({ slug: 'sastra',          limit: 3, excludeIds })

const categoryQueries = [beritaNasionalQ, opiniQ, resensiQ, risetQ, sastraQ]
```

> Ini juga menghapus ketergantungan pada `API_URL` yang di-hardcode ulang di `index.tsx`.

---

## Phase 4 — View Count (Skip di Static Mode)

**File:** `apps/web/src/routes/_public/artikel/$slug.tsx`

```ts
// Hanya increment view count kalau mode API
if (import.meta.env.VITE_DATA_SOURCE !== 'static') {
  // logic view count
}
```

Karena `fetchArticleDetail` di static mode tidak hit API, view count otomatis tidak naik. Ini acceptable untuk MVP.

---

## Phase 5 — Exclude Admin Panel di Static Mode

### 5.1 — Route Guard di Admin Layout

**File:** `apps/web/src/routes/admin.tsx`

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    // Admin tidak tersedia di static/Cloudflare Pages build
    if (import.meta.env.VITE_DATA_SOURCE === 'static') {
      throw redirect({ to: '/' })
    }
    // ... existing auth check
  },
  component: AdminLayout,
})
```

Saat `VITE_DATA_SOURCE=static`, semua route `/admin/*` langsung redirect ke `/`. Bundle tetap mengandung kode admin (acceptable untuk MVP), tapi tidak accessible.

---

## Phase 6 — Cloudflare Pages Config

**File baru:** `apps/web/public/_redirects`
```
/* /index.html 200
```

Agar TanStack Router (SPA) bisa handle routing — semua path dikembalikan ke `index.html`.

---

## Ringkasan File yang Dimodifikasi / Dibuat

| File | Aksi | Phase |
|------|------|-------|
| `apps/web/src/config/categories.ts` | **Buat** | 1 |
| `apps/web/src/components/public/layout/navbar.tsx` | **Refactor** — import dari config | 1 |
| `apps/web/src/hooks/use-categories.ts` | **Refactor** — import dari config | 1 |
| `apps/web/src/routes/_public/index.tsx` | **Refactor** — hapus usePublicCategories, hapus inline fetch | 1 + 3 |
| `apps/web/src/routes/_public/kategori/$slug.tsx` | **Refactor** — hapus usePublicCategories | 1 |
| `apps/web/src/lib/data-source.ts` | **Buat** | 3 |
| `apps/web/src/hooks/use-public-articles.ts` | **Refactor** — queryFn → data-source, tambah useCategoryArticles | 3 |
| `apps/web/src/routes/admin.tsx` | **Update** — tambah static guard | 5 |
| `apps/api/scripts/generate-static.js` | **Buat** | 2 |
| `apps/api/package.json` | **Update** — tambah generate:static script | 2 |
| `package.json` (root) | **Update** — tambah generate:static & build:static | 2 |
| `apps/web/public/_redirects` | **Buat** | 6 |
| `apps/web/public/data/**` | **Di-commit ke git** | 2 |

---

## Alur Kerja Deploy ke Cloudflare Pages

```bash
# Step 1 — Generate JSON dari DB (jalankan lokal, butuh DATABASE_URL)
pnpm generate:static

# Step 2 — Commit JSON
git add apps/web/public/data/
git commit -m "chore: refresh static article data"

# Step 3 — Push → Cloudflare Pages auto-trigger build
# Build command di Cloudflare: VITE_DATA_SOURCE=static pnpm build:web
# Output dir: apps/web/dist
git push
```

**Setiap ada artikel baru yang ingin tayang:** ulangi Step 1-3.

---

## Alur Kerja Deploy VPS + DB (Target Akhir — Nanti)

```bash
# Tidak ada perubahan dari kondisi saat ini
VITE_DATA_SOURCE=api pnpm build:web
# Jalankan Express API + PostgreSQL seperti biasa
# Admin panel aktif normal
```

---

## Batasan Static Mode (MVP)

| Fitur | Static | API |
|-------|--------|-----|
| Homepage | ✅ | ✅ |
| Article detail | ✅ | ✅ |
| Category page | ✅ client-side pagination | ✅ server-side |
| Search | ✅ title + excerpt only | ✅ title + excerpt + content |
| View count | ⏭ skip | ✅ |
| Admin panel | ❌ redirect ke home | ✅ |
| Artikel baru real-time | ❌ perlu rebuild & commit | ✅ |

---

## Urutan Implementasi

```
Phase 1 — Konsolidasi categories (no breaking change, aman)
  ├─ 1.1 Buat config/categories.ts
  ├─ 1.2 Update navbar.tsx
  ├─ 1.3 Update use-categories.ts
  ├─ 1.4 Hapus usePublicCategories() dari index.tsx
  └─ 1.5 Hapus usePublicCategories() dari $slug.tsx

Phase 2 — Script generator
  ├─ 2.1 Buat apps/api/scripts/generate-static.js
  ├─ 2.2 Update package.json (api + root)
  └─ 2.3 Jalankan & commit public/data/

Phase 3 — Data source abstraction
  ├─ 3.1 Buat lib/data-source.ts
  ├─ 3.2 Refactor use-public-articles.ts (queryFn → data-source)
  └─ 3.3 Tambah useCategoryArticles hook, refactor inline fetch di index.tsx

Phase 4 — View count skip (minor, 1 baris)

Phase 5 — Admin guard (minor, 3 baris di admin.tsx)

Phase 6 — Cloudflare config (_redirects)
```
