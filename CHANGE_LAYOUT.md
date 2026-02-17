# HOME PAGE LAYOUT REDESIGN

## GOAL
Redesign halaman home dari layout sederhana (single hero + grid) menjadi **editorial modern minimalist** dengan Bento Grid Hero (7:5) + Category Sections.

---

## EXISTING CODEBASE (Yang Sudah Ada)

### Files yang akan dimodifikasi
| File | Status | Aksi |
|---|---|---|
| `apps/api/src/routes/public.js` | Ada | Tambah 2 endpoint baru |
| `apps/web/src/hooks/use-public-articles.ts` | Ada | Tambah 2 hook baru + 2 interface baru |
| `apps/web/src/routes/_public/index.tsx` | Ada | Rewrite total |

### Files yang dibuat baru
| File | Deskripsi |
|---|---|
| `apps/web/src/components/public/home/hero-section.tsx` | Wrapper bento grid 7:5 |
| `apps/web/src/components/public/home/hero-featured-card.tsx` | Card featured besar (kiri) |
| `apps/web/src/components/public/home/hero-side-card.tsx` | Card side kecil (kanan, 2x) |
| `apps/web/src/components/public/home/category-section.tsx` | Section per kategori + header |
| `apps/web/src/components/public/home/article-card-compact.tsx` | Card compact untuk category grid |
| `apps/web/src/components/public/home/skeletons.tsx` | Loading skeletons |

### Existing components yang di-REUSE (jangan buat ulang)
| Component | Lokasi | Dipakai di |
|---|---|---|
| `ArticleImage` | `components/public/article/article-image.tsx` | Semua card (handle lazy/eager, error, placeholder) |
| `CategoryBadge` | `components/public/ui/category-badge.tsx` | Hero cards (colorful per-category) |
| `formatDate()` | `lib/utils.ts` | Hero cards (full date: "17 Februari 2025") |
| `formatDateShort()` | `lib/utils.ts` | Compact cards (short: "17 Feb 2025") |
| `calculateReadTime()` | `lib/utils.ts` | Hero featured card |

### Existing yang TIDAK dipakai lagi di home page
| Component | Alasan |
|---|---|
| `HeroArticle` | Diganti `HeroFeaturedCard` + `HeroSideCard` dalam bento grid |
| `ArticleGrid` | Diganti `CategorySection` dengan `ArticleCardCompact` |
| `ArticleCard` | Diganti `ArticleCardCompact` (title di bawah image, bukan overlay) |

> **Note**: Component lama TIDAK dihapus karena mungkin dipakai di halaman lain.

---

## CONTAINER WIDTH: `max-w-7xl`

Navbar dan footer sudah pakai `max-w-7xl`. Semua section di home page **HARUS** pakai `max-w-7xl` agar sejajar.

```
Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

---

## WIREFRAME

### 1. Hero Section (Bento Grid)
```
┌─────────────────────────────┬─────────────────┐
│                             │    Side #1       │
│      FEATURED (col-7)       │  (col-5 stack)   │
│     aspect-[4/3]            │ aspect-[16/9]    │
│     min-h-[500px]           ├─────────────────┤
│                             │    Side #2       │
│                             │  aspect-[16/9]   │
└─────────────────────────────┴─────────────────┘

Mobile: Stack vertically (featured di atas, side di bawah)
```

### 2. Category Section (berulang, maks 4 kategori)
```
KATEGORI NAMA                              more →
┌────────────┐ ┌────────────┐ ┌────────────┐
│   Image    │ │   Image    │ │   Image    │
│  4/3 ratio │ │  4/3 ratio │ │  4/3 ratio │
├────────────┤ ├────────────┤ ├────────────┤
│ Title      │ │ Title      │ │ Title      │
│ 17 Feb 2025│ │ 17 Feb 2025│ │ 17 Feb 2025│
└────────────┘ └────────────┘ └────────────┘

Mobile: Single column
```

---

## IMPLEMENTATION (5 Phase, urut)

### PHASE 1: API — Tambah 2 endpoint di `apps/api/src/routes/public.js`

#### 1A. `GET /api/public/hero`

Buat endpoint BARU (jangan modifikasi `/api/public/featured` yang existing).

```javascript
router.get('/hero', async (req, res) => {
  // 1. Cari artikel dengan isFeatured=true, status PUBLISHED
  //    Fallback: latest published article jika tidak ada featured
  // 2. Cari 2 artikel terbaru (PUBLISHED), exclude featured.id
  //
  // Response shape:
  // {
  //   featured: Article,         // 1 artikel
  //   sideArticles: Article[]    // 2 artikel
  // }
  //
  // Include: category: { select: { id, name, slug } }
  // OrderBy: publishedAt desc
})
```

#### 1B. `GET /api/public/categories/:slug/articles`

Endpoint baru untuk fetch artikel per kategori dengan exclude support.

```javascript
router.get('/categories/:slug/articles', async (req, res) => {
  // Query params:
  //   limit  — default 3, max 12
  //   page   — default 1
  //   exclude — comma-separated article IDs (e.g. "uuid1,uuid2,uuid3")
  //
  // Prisma where:
  //   category: { slug: req.params.slug }
  //   status: 'PUBLISHED'
  //   id: { notIn: excludeIds }   ← parsed dari query param exclude
  //
  // OrderBy: publishedAt desc
  //
  // Response shape:
  // {
  //   articles: Article[],
  //   pagination: { page, limit, total, totalPages }
  // }
})
```

---

### PHASE 2: Hooks — Tambah di `apps/web/src/hooks/use-public-articles.ts`

#### 2A. Tambah interfaces baru (di atas, setelah existing interfaces)

```typescript
interface HeroResponse {
  featured: Article
  sideArticles: Article[]
}

interface ArticlesByCategoryResponse {
  articles: Article[]
  pagination: Pagination   // ← reuse Pagination interface yang sudah ada
}
```

#### 2B. Hook `useHeroArticles()`

```typescript
export function useHeroArticles() {
  return useQuery<HeroResponse>({
    queryKey: ['public', 'hero'],
    queryFn: () => fetch(`${API_URL}/api/public/hero`).then(r => {
      if (!r.ok) throw new Error('Failed to fetch hero')
      return r.json()
    }),
    staleTime: 5 * 60 * 1000
  })
}
```

#### 2C. Hook `useArticlesByCategory()`

```typescript
export function useArticlesByCategory(params: {
  slug: string
  limit?: number
  page?: number
  excludeIds?: string[]
  enabled?: boolean
}) {
  const { slug, limit = 3, page = 1, excludeIds = [], enabled = true } = params

  const searchParams = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString()
  })
  if (excludeIds.length > 0) {
    searchParams.append('exclude', excludeIds.join(','))
  }

  return useQuery<ArticlesByCategoryResponse>({
    queryKey: ['public', 'articles', 'category', slug, { limit, page, excludeIds }],
    queryFn: () => fetch(
      `${API_URL}/api/public/categories/${slug}/articles?${searchParams}`
    ).then(r => {
      if (!r.ok) throw new Error('Failed to fetch')
      return r.json()
    }),
    enabled,
    staleTime: 5 * 60 * 1000
  })
}
```

> **Catatan**: `usePublicFeatured()` yang existing JANGAN dihapus (masih dipakai untuk backward compat jika perlu).

---

### PHASE 3: Components — Buat 6 file baru di `components/public/home/`

#### 3A. `hero-section.tsx` — Wrapper Bento Grid

```
Props: { featured: Article, sideArticles: Article[] }

Layout:
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
    <div className="col-span-12 md:col-span-7">
      <HeroFeaturedCard article={featured} />
    </div>
    <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
      {sideArticles.map(a => <HeroSideCard article={a} />)}
    </div>
  </div>
```

#### 3B. `hero-featured-card.tsx` — Card Besar (Kiri)

```
Props: { article: Article }
Reuse: ArticleImage (priority=true), CategoryBadge (size="md")
Reuse: formatDate(), calculateReadTime()

Structure:
  <Link to="/artikel/$slug">
    <div className="relative overflow-hidden rounded-2xl min-h-[500px] aspect-[4/3]">
      <ArticleImage src={coverImageUrl} priority aspectRatio="4/3" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-4 left-4">
        <CategoryBadge category={article.category} size="md" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight line-clamp-3">
        <div> author • date • readTime (text-neutral-300) </div>
      </div>
    </div>
  </Link>
```

#### 3C. `hero-side-card.tsx` — Card Kecil (Kanan, 2x)

```
Props: { article: Article }
Reuse: ArticleImage, CategoryBadge (size="sm")
Reuse: formatDate()

Structure: Sama seperti featured tapi:
  - min-h-[240px], aspect-[16/9], rounded-xl
  - Title: text-lg font-bold (bukan text-3xl)
  - Padding: p-4 (bukan p-6)
  - Tanpa readTime, hanya author + date
```

#### 3D. `category-section.tsx` — Section Per Kategori

```
Props: {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
}

Structure:
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <span className="text-sm uppercase tracking-wider font-bold text-neutral-500">
        {categoryName}
      </span>
      <Link to="/kategori/$slug" className="text-sm font-medium hover:text-poros-600">
        more →
      </Link>
    </div>

    {/* Grid 3 kolom */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map(a => <ArticleCardCompact article={a} />)}
    </div>
  </section>
```

#### 3E. `article-card-compact.tsx` — Card untuk Category Grid

```
Props: { article: Article }
Reuse: ArticleImage (lazy), formatDateShort()

PENTING — Title di BAWAH image (bukan overlay). Beda dari ArticleCard existing.

Structure:
  <Link to="/artikel/$slug">
    <div className="overflow-hidden rounded-xl">
      <div className="aspect-[4/3] overflow-hidden">
        <ArticleImage src={thumbnailUrl || coverImageUrl}
          className="group-hover:scale-105 transition-transform duration-500" />
      </div>
    </div>
    <div className="mt-3">
      <h3 className="font-semibold text-lg leading-snug line-clamp-2
                     text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <span className="mt-1 text-sm text-neutral-500">{formatDateShort(publishedAt)}</span>
    </div>
  </Link>

Tanpa: author, badge, excerpt, viewCount
```

#### 3F. `skeletons.tsx` — Loading States

```
Export: HeroSkeleton, CategorySkeleton

HeroSkeleton:
  Grid 12 cols sama seperti hero-section
  - Kiri: rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse min-h-[500px]
  - Kanan: 2x rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse min-h-[240px]

CategorySkeleton:
  - Header bar placeholder
  - 3x card placeholder (aspect-[4/3] + 2 text lines)
```

---

### PHASE 4: SKIP — Utilities Sudah Ada

`formatDate()`, `formatDateShort()`, `calculateReadTime()` sudah ada di `apps/web/src/lib/utils.ts`. Tidak perlu buat/modifikasi apa-apa.

---

### PHASE 5: Route — Rewrite `apps/web/src/routes/_public/index.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useHeroArticles } from '../../hooks/use-public-articles'
import { usePublicCategories } from '../../hooks/use-public-categories'
import { useArticlesByCategory } from '../../hooks/use-public-articles'
import { HeroSection } from '../../components/public/home/hero-section'
import { CategorySection } from '../../components/public/home/category-section'
import { HeroSkeleton, CategorySkeleton } from '../../components/public/home/skeletons'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  // 1. Fetch hero articles
  const { data: heroData, isLoading: isLoadingHero } = useHeroArticles()

  // 2. Fetch categories
  const { data: categoriesData } = usePublicCategories()
  const categories = categoriesData?.categories || []

  // 3. Hitung excludeIds dari hero (agar tidak duplicate di category sections)
  const heroIds: string[] = []
  if (heroData?.featured) heroIds.push(heroData.featured.id)
  if (heroData?.sideArticles) heroIds.push(...heroData.sideArticles.map(a => a.id))

  // 4. Ambil maks 4 kategori pertama yang punya artikel
  const activeCategories = categories.filter(c => c.articleCount > 0).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingHero ? (
          <HeroSkeleton />
        ) : heroData?.featured ? (
          <HeroSection
            featured={heroData.featured}
            sideArticles={heroData.sideArticles}
          />
        ) : null}
      </section>

      {/* Category Sections — masing-masing fetch sendiri */}
      {activeCategories.map(cat => (
        <CategorySectionWrapper
          key={cat.id}
          categoryName={cat.name}
          categorySlug={cat.slug}
          excludeIds={heroIds}
          enabled={heroIds.length > 0}
        />
      ))}
    </div>
  )
}

// Wrapper component — setiap kategori punya hook sendiri
function CategorySectionWrapper(props: {
  categoryName: string
  categorySlug: string
  excludeIds: string[]
  enabled: boolean
}) {
  const { data, isLoading } = useArticlesByCategory({
    slug: props.categorySlug,
    limit: 3,
    excludeIds: props.excludeIds,
    enabled: props.enabled
  })

  if (isLoading) return <CategorySkeleton />
  if (!data?.articles?.length) return null  // hide section tanpa artikel

  return (
    <CategorySection
      categoryName={props.categoryName}
      categorySlug={props.categorySlug}
      articles={data.articles}
      totalCount={data.pagination.total}
    />
  )
}
```

**Kenapa `CategorySectionWrapper` bukan `useQueries`?**
- Lebih mudah dibaca, setiap kategori punya lifecycle sendiri
- Conditional rendering (hide jika kosong) lebih natural
- Tidak perlu import `useQueries`
- Setiap section loading independent

---

## STYLING REFERENCE

```
COLORS (konsisten dengan existing):
  Background:    white / dark:bg-neutral-950
  Text Primary:  neutral-900 / dark:text-white
  Text Secondary: neutral-500
  Accent:        poros-600 (links, hover)
  Borders:       neutral-200 / dark:border-neutral-800

BADGE: Tetap pakai CategoryBadge existing (colorful per-category),
       BUKAN solid bg-poros-600. Konsisten dengan halaman lain.

SPACING:
  Container:     max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
  Hero gap:      gap-4
  Category gap:  gap-6
  Section gap:   py-12

RADIUS:
  Hero cards:     rounded-2xl (featured), rounded-xl (side)
  Category cards: rounded-xl

GRADIENT OVERLAY (hero cards):
  bg-gradient-to-t from-black/80 via-black/20 to-transparent

HOVER:
  Image scale:   group-hover:scale-105 transition-transform duration-500
  Title color:   group-hover:text-poros-600 (compact cards only)
```

---

## BUSINESS RULES

1. **No Duplicate Articles** — Hero articles (featured + 2 side = 3 IDs) di-exclude dari semua category sections via API `exclude` param.

2. **Cascade Loading** — Category sections TUNGGU hero data selesai (`enabled: heroIds.length > 0`) supaya excludeIds tersedia.

3. **Max 4 Kategori** — Hanya tampilkan 4 kategori pertama yang punya artikel (`articleCount > 0`).

4. **Max 3 Artikel per Kategori** — Limit 3 di API call.

5. **Hide Empty Sections** — Jika kategori tidak punya artikel setelah exclude, section tidak dirender.

6. **Image Loading** — `priority=true` hanya untuk featured hero card. Semua lain `lazy`.

7. **Mobile** — Hero stack vertically (featured di atas), category grid single column.

---

## CHECKLIST

- [ ] **Phase 1**: `apps/api/src/routes/public.js`
  - [ ] Tambah `GET /api/public/hero`
  - [ ] Tambah `GET /api/public/categories/:slug/articles`
- [ ] **Phase 2**: `apps/web/src/hooks/use-public-articles.ts`
  - [ ] Tambah `HeroResponse` & `ArticlesByCategoryResponse` interfaces
  - [ ] Tambah `useHeroArticles()` hook
  - [ ] Tambah `useArticlesByCategory()` hook
- [ ] **Phase 3**: `apps/web/src/components/public/home/`
  - [ ] `hero-section.tsx`
  - [ ] `hero-featured-card.tsx`
  - [ ] `hero-side-card.tsx`
  - [ ] `category-section.tsx`
  - [ ] `article-card-compact.tsx`
  - [ ] `skeletons.tsx`
- [ ] **Phase 4**: SKIP (utils sudah ada)
- [ ] **Phase 5**: Rewrite `apps/web/src/routes/_public/index.tsx`
