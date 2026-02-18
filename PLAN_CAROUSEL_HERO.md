# Hero Carousel Slider — Implementation Plan

## Overview

Hero section diubah dari 1 featured card statis menjadi carousel otomatis 5 slide di kolom kiri, dengan 2 side cards tetap di kolom kanan.

## Layout

```
┌───────────────────────┬─────────────────┐
│                       │   Side Card 1   │
│  CAROUSEL (5 slides)  ├─────────────────┤
│  (7 kolom)            │   Side Card 2   │
│  ● ○ ○ ○ ○  ‹ ›      │                 │
└───────────────────────┴─────────────────┘
```

## File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `apps/web/src/hooks/use-public-articles.ts` | Tambah `useHeroCarouselArticles(total?)` |
| `apps/web/src/components/public/home/hero-featured-card.tsx` | Diubah jadi carousel dengan auto-slide, dots, prev/next |
| `apps/web/src/components/public/home/hero-section.tsx` | Props diubah ke `{ carouselArticles, sideArticles }` |
| `apps/web/src/routes/_public/index.tsx` | Gunakan hook baru, slice articles |

## Behaviour Carousel

- **Auto-advance**: setiap 5000ms
- **Pause on hover**: `onMouseEnter` / `onMouseLeave`
- **Dot indicators**: klik untuk jump ke slide tertentu
- **Prev / Next buttons**: navigasi manual
- **Animasi**: cross-fade (`transition-opacity duration-700`)

## Data Flow

```
useHeroCarouselArticles(7)
  └─ GET /api/public/articles?limit=7&page=1
       ├─ articles[0..4]  → carouselArticles (5 slides)
       └─ articles[5..6]  → sideArticles (2 side cards)

excludeIds = all 7 article IDs (tidak muncul di category sections)
```

## Verifikasi

1. `pnpm dev:web` → buka homepage
2. Carousel auto-advance setiap 5 detik
3. Pause saat hover
4. Klik dot / prev / next → slide berpindah
5. Side cards menampilkan artikel ke-6 dan ke-7
6. Artikel carousel tidak muncul di category sections
7. Responsive mobile (carousel full-width, side cards di bawah)
8. Dark mode
