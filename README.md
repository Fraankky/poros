# POROS - Monorepo Setup

Monorepo dengan React + TanStack Router + Express API

## 📁 Struktur

```
poros/
├── apps/
│   ├── web/          # Frontend (Vite + TanStack Router) - Port 5173
│   └── api/          # Backend (Express) - Port 3001
├── prisma/           # Database schema
├── package.json      # Workspace root
└── pnpm-workspace.yaml
```

## 🚀 Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Open Prisma Studio
pnpm db:studio
```

### 3. Setup environment variables

Buat file `.env` di root:

```env
# Database
DATABASE_URL="postgresql://..."

# API
API_PORT=3001

# Frontend
WEB_URL=http://localhost:5173

# R2 Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com/xxx
```

### 4. Jalankan development

```bash
# Jalankan semua (web + api)
pnpm dev

# Atau jalankan terpisah:
pnpm dev:api   # API only
pnpm dev:web   # Web only
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Jalankan web + api bersamaan |
| `pnpm dev:web` | Frontend only |
| `pnpm dev:api` | API only |
| `pnpm build` | Build production |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |

## 🔗 URLs

- **Web**: http://localhost:5173
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🛠 Tech Stack

### Frontend (apps/web)
- React 18
- TanStack Router (File-based routing)
- TanStack Query
- Tailwind CSS
- Vite

### Backend (apps/api)
- Express.js
- Prisma + PostgreSQL (Neon)
- Cloudflare R2 (Storage)
- bcrypt (Auth)
