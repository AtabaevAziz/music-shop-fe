# Music Shop Frontend

Music Shop is a Next.js admin demo for a musical instruments retailer. The app runs entirely on the client: catalog, inventory, orders, finance, and settings are backed by a local demo store and persisted in browser storage.

## Tech Stack

- Next.js 15 with App Router
- React 18 and TypeScript
- Client-side state via React Context
- Zod for form validation
- CSS in `src/app/globals.css`

## Quick Start

```bash
git clone <repository-url>
cd music-shop-fe
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm fix
pnpm typecheck
pnpm format
pnpm prepare
```

## Project Structure

High-level project map:

```text
music-shop-fe/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (protected)/     # Auth-protected music shop pages
│   │   │   └── login/           # Demo sign-in
│   │   ├── globals.css          # Global theme and layout styles
│   │   ├── layout.tsx           # Root HTML shell
│   │   └── page.tsx             # Redirect to default locale
│   ├── components/
│   │   ├── layout/              # App shell and auth guard
│   │   └── ui/                  # Shared UI primitives
│   ├── features/
│   │   ├── auth/                # Login experience
│   │   ├── dashboard/           # Dashboard view
│   │   ├── catalog/             # Product catalog CRUD
│   │   ├── inventory/           # Stock operations
│   │   ├── orders/              # Order queue
│   │   ├── finance/             # Revenue and payment visibility
│   │   ├── media/               # Product media workflow
│   │   ├── settings/            # Store settings
│   │   ├── brands/              # Brand management
│   │   ├── categories/          # Category management
│   │   ├── customers/           # Customer records
│   │   ├── employees/           # Staff records
│   │   └── shared/              # Reusable feature-level CRUD building blocks
│   ├── lib/
│   │   ├── i18n.ts              # Locale dictionary and helpers
│   │   └── utils.ts             # Formatting and small utilities
│   ├── store/
│   │   ├── music-store.tsx      # Demo store provider and actions
│   │   └── seed.ts              # Initial in-memory database
│   └── types/
│       └── music.ts             # Domain types
├── public/
│   └── products/                # Product media used by seeded catalog items
├── Dockerfile
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Application Model

- Locales: `ru` and `en`
- Default entry: `/ru/login`
- Protected routes are rendered inside the shared app shell
- Demo sessions are role-based: `admin`, `store_manager`, `catalog_manager`, `sales_operator`
- State persists in `localStorage` under music shop keys

## Main Modules

- Dashboard with revenue, low stock, order pipeline, and activity
- Catalog for products, brands, and categories
- Inventory for stock adjustments and thresholds
- Orders and customers for store operations
- Employees, finance, media, and settings for backoffice workflows

## Demo Assets

- Product media is served from `public/products/`
- Current seeded assets include `fender-player-stratocaster.jpg`, `yamaha-p125.jpg`, `roland-spd-sx.jpg`, and `shure-sm7b.jpg`

## Docker

```bash
docker build -t music-shop-fe .
docker run -p 3000:3000 music-shop-fe
```

## Notes

- This repository is a frontend demo and does not require a backend to run.
- The README should be updated together with future structural changes.
